import 'package:graphql/client.dart';

import 'auth_service.dart';

/// Hasura GraphQL URL injected at build time via --dart-define.
/// Defaults to the local Hasura instance on the shared backend.
const _kGraphqlUrl = String.fromEnvironment(
  'HASURA_GRAPHQL_URL',
  defaultValue: 'http://127.0.0.1:8087/v1/graphql',
);

/// Centralized GraphQL client for Hasura.
///
/// Provides two modes:
/// - [publicClient]: unauthenticated, for anonymous queries.
/// - [authenticatedClient]: includes the user's JWT in the Authorization header.
///
/// Both clients use an in-memory cache with normalized IDs.
class GraphQLService {
  GraphQLService._();
  static final instance = GraphQLService._();

  GraphQLClient? _publicClient;
  GraphQLClient? _authenticatedClient;
  String? _lastToken;

  /// Unauthenticated client for public queries.
  GraphQLClient get publicClient {
    _publicClient ??= GraphQLClient(
      link: HttpLink(_kGraphqlUrl),
      cache: GraphQLCache(store: InMemoryStore()),
    );
    return _publicClient!;
  }

  /// Authenticated client that injects the current JWT.
  ///
  /// Rebuilds the client if the token has changed (e.g., after a refresh).
  /// Falls back to [publicClient] if no token is available.
  GraphQLClient get authenticatedClient {
    final token = AuthService.instance.accessToken;
    if (token == null) return publicClient;

    if (_authenticatedClient == null || _lastToken != token) {
      _lastToken = token;
      _authenticatedClient = GraphQLClient(
        link: AuthLink(
          getToken: () => 'Bearer $token',
        ).concat(HttpLink(_kGraphqlUrl)),
        cache: GraphQLCache(store: InMemoryStore()),
      );
    }
    return _authenticatedClient!;
  }

  /// Execute a query (read).
  Future<QueryResult> query(
    String document, {
    Map<String, dynamic>? variables,
    bool authenticated = true,
    FetchPolicy? fetchPolicy,
  }) async {
    final client = authenticated ? authenticatedClient : publicClient;
    final options = QueryOptions(
      document: gql(document),
      variables: variables ?? const {},
      fetchPolicy: fetchPolicy ?? FetchPolicy.networkOnly,
    );

    final result = await client.query(options);
    if (result.hasException) {
      _handleException(result.exception!);
    }
    return result;
  }

  /// Execute a mutation (write).
  Future<QueryResult> mutate(
    String document, {
    Map<String, dynamic>? variables,
    bool authenticated = true,
  }) async {
    final client = authenticated ? authenticatedClient : publicClient;
    final options = MutationOptions(
      document: gql(document),
      variables: variables ?? const {},
    );

    final result = await client.mutate(options);
    if (result.hasException) {
      _handleException(result.exception!);
    }
    return result;
  }

  /// Reset all caches (e.g., on sign out).
  void clearCache() {
    _publicClient?.cache.store.reset();
    _authenticatedClient?.cache.store.reset();
    _authenticatedClient = null;
    _lastToken = null;
  }

  void _handleException(OperationException exception) {
    // Check for auth errors that indicate the token is invalid.
    final graphqlErrors = exception.graphqlErrors;
    for (final error in graphqlErrors) {
      final code = error.extensions?['code'];
      if (code == 'access-denied' || code == 'invalid-jwt') {
        // Token is invalid. Attempt a refresh in the background.
        AuthService.instance.refreshSession().catchError((_) {});
      }
    }
    throw GraphQLServiceException(
      message: graphqlErrors.isNotEmpty
          ? graphqlErrors.first.message
          : exception.linkException?.toString() ?? 'GraphQL request failed',
      exception: exception,
    );
  }
}

/// Exception thrown by [GraphQLService] operations.
class GraphQLServiceException implements Exception {
  final String message;
  final OperationException? exception;

  const GraphQLServiceException({
    required this.message,
    this.exception,
  });

  @override
  String toString() => 'GraphQLServiceException: $message';
}
