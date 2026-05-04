// Ambient declarations for ask-sdk-core (Alexa Skills Kit).
// ask-sdk-core is used in smarthome/alexa/lambda/ which is checked transitively
// by the web tsconfig via the dynamic import in app/api/actions/alexa/route.ts.
// The actual package lives with the Lambda deployment, not the web bundle.

declare module 'ask-sdk-core' {
  export interface DeviceAddressServiceClient {
    getFullAddress(deviceId: string): Promise<{ city?: string | null }>;
  }
  export interface ServiceClientFactory {
    getDeviceAddressServiceClient(): DeviceAddressServiceClient;
  }
  export interface ResponseBuilder {
    speak(ssml: string): this;
    reprompt(ssml: string): this;
    withSimpleCard(title: string, text: string): this;
    withShouldEndSession(flag: boolean): this;
    addElicitSlotDirective(slot: string): this;
    getResponse(): unknown;
  }
  export interface HandlerInput {
    requestEnvelope: {
      request: { type: string; timestamp?: string };
      context: {
        System: {
          application: { applicationId: string };
          user: { userId: string };
          device: { deviceId: string };
        };
      };
    };
    responseBuilder: ResponseBuilder;
    serviceClientFactory?: ServiceClientFactory;
    attributesManager: {
      getSessionAttributes(): Record<string, unknown>;
      setSessionAttributes(attrs: Record<string, unknown>): void;
    };
  }
  export interface RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean | Promise<boolean>;
    handle(handlerInput: HandlerInput): unknown | Promise<unknown>;
  }
  export interface ErrorHandler {
    canHandle(handlerInput: HandlerInput, error: Error): boolean | Promise<boolean>;
    handle(handlerInput: HandlerInput, error: Error): unknown | Promise<unknown>;
  }
  export interface RequestInterceptor {
    process(handlerInput: HandlerInput): void | Promise<void>;
  }
  interface CustomSkillBuilder {
    addRequestHandlers(...handlers: RequestHandler[]): this;
    addErrorHandlers(...handlers: ErrorHandler[]): this;
    addRequestInterceptors(...interceptors: RequestInterceptor[]): this;
    withApiClient(client: unknown): this;
    lambda(): (
      event: unknown,
      context: unknown,
      callback: (err: Error | null, result: unknown) => void,
    ) => void;
  }
  const Alexa: {
    SkillBuilders: { custom(): CustomSkillBuilder };
    DefaultApiClient: new () => unknown;
  };
  export default Alexa;
}
