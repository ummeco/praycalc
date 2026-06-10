import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import 'adhkar_data.dart';

/// Tab showing selected duas organized by category, with bookmarking.
class DuasTab extends StatefulWidget {
  const DuasTab({super.key});

  @override
  State<DuasTab> createState() => _DuasTabState();
}

class _DuasTabState extends State<DuasTab> with AutomaticKeepAliveClientMixin {
  final Set<String> _bookmarked = {};
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getStringList('dua_bookmarks');
    if (stored != null) {
      setState(() => _bookmarked.addAll(stored));
    }
  }

  Future<void> _toggleBookmark(String title) async {
    setState(() {
      if (_bookmarked.contains(title)) {
        _bookmarked.remove(title);
      } else {
        _bookmarked.add(title);
      }
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('dua_bookmarks', _bookmarked.toList());
  }

  List<DuaEntry> get _filteredDuas {
    var list = selectedDuas.toList();

    if (_selectedCategory == 'Bookmarks') {
      list = list.where((d) => _bookmarked.contains(d.title)).toList();
    } else if (_selectedCategory != 'All') {
      list = list.where((d) => d.category == _selectedCategory).toList();
    }

    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list
          .where((d) =>
              d.title.toLowerCase().contains(q) ||
              d.translation.toLowerCase().contains(q) ||
              d.transliteration.toLowerCase().contains(q))
          .toList();
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final theme = Theme.of(context);
    final filtered = _filteredDuas;

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search duas...',
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              isDense: true,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: theme.dividerColor),
              ),
            ),
            style: const TextStyle(fontSize: 14),
          ),
        ),
        // Category chips
        SizedBox(
          height: 42,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: [
              _CategoryChip(
                label: 'All',
                selected: _selectedCategory == 'All',
                onTap: () => setState(() => _selectedCategory = 'All'),
              ),
              _CategoryChip(
                label: 'Bookmarks',
                selected: _selectedCategory == 'Bookmarks',
                onTap: () => setState(() => _selectedCategory = 'Bookmarks'),
                icon: Icons.bookmark,
              ),
              for (final cat in duaCategories)
                _CategoryChip(
                  label: cat,
                  selected: _selectedCategory == cat,
                  onTap: () => setState(() => _selectedCategory = cat),
                ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        // Duas list
        Expanded(
          child: filtered.isEmpty
              ? Center(
                  child: Text(
                    _selectedCategory == 'Bookmarks'
                        ? 'No bookmarked duas yet.\nTap the bookmark icon to save duas.'
                        : 'No duas found.',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(120),
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.only(bottom: 16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final dua = filtered[index];
                    return _DuaCard(
                      dua: dua,
                      isBookmarked: _bookmarked.contains(dua.title),
                      onBookmark: () => _toggleBookmark(dua.title),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14),
              const SizedBox(width: 4),
            ],
            Text(label, style: const TextStyle(fontSize: 12)),
          ],
        ),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: PrayCalcColors.mid.withAlpha(50),
        showCheckmark: false,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}

class _DuaCard extends StatefulWidget {
  const _DuaCard({
    required this.dua,
    required this.isBookmarked,
    required this.onBookmark,
  });

  final DuaEntry dua;
  final bool isBookmarked;
  final VoidCallback onBookmark;

  @override
  State<_DuaCard> createState() => _DuaCardState();
}

class _DuaCardState extends State<_DuaCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dua = widget.dua;

    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.dividerColor.withAlpha(40)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title row
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: PrayCalcColors.mid.withAlpha(25),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    dua.category,
                    style: TextStyle(
                      fontSize: 10,
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    dua.title,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: widget.onBookmark,
                  child: Icon(
                    widget.isBookmarked
                        ? Icons.bookmark
                        : Icons.bookmark_border,
                    size: 20,
                    color: widget.isBookmarked
                        ? PrayCalcColors.mid
                        : theme.colorScheme.onSurface.withAlpha(100),
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  _expanded
                      ? Icons.keyboard_arrow_up
                      : Icons.keyboard_arrow_down,
                  size: 20,
                  color: theme.colorScheme.onSurface.withAlpha(100),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Arabic text (always visible)
            Text(
              dua.arabic,
              style: TextStyle(
                fontSize: 18,
                fontFamily: 'serif',
                height: 1.8,
                color: theme.colorScheme.onSurface,
              ),
              textDirection: TextDirection.rtl,
              textAlign: TextAlign.right,
            ),
            // Expanded content
            if (_expanded) ...[
              const SizedBox(height: 10),
              Text(
                dua.transliteration,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontStyle: FontStyle.italic,
                  color: theme.colorScheme.onSurface.withAlpha(160),
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                dua.translation,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withAlpha(140),
                  fontSize: 12,
                ),
              ),
              if (dua.reference != null) ...[
                const SizedBox(height: 6),
                Text(
                  dua.reference!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: PrayCalcColors.mid.withAlpha(180),
                    fontSize: 11,
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
