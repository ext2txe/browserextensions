# CLAUDE.MD - List Navigator Browser Extension

## Project Overview

List Navigator is a cross-browser extension (Firefox & Chrome/Chromium) that enables universal search and navigation through webpage elements using CSS selectors. It provides a draggable search panel with keyboard shortcuts and visual highlighting to find and navigate content on any website.

## Architecture

### Extension Type
- Cross-browser WebExtension (Manifest V3)
- Compatible with Firefox, Chrome, Edge, and other Chromium browsers
- Content Script-based architecture
- No backend/server required (fully client-side)

### Core Components

1. **manifest.json** - Extension configuration (Manifest V3)
   - Defines permissions, host permissions, and action
   - Runs on all URLs (`<all_urls>`)
   - Injects content script at `document_idle`
   - Service worker-based background script

2. **background.js** - Background service worker
   - Cross-browser compatible (uses polyfill for Firefox/Chrome APIs)
   - Handles action/browserAction (toolbar icon) clicks
   - Toggles the search panel via message passing

3. **content.js** - Main application logic
   - Creates and manages the search UI panel
   - Implements CSS selector-based element matching
   - Handles keyboard shortcuts and navigation
   - Manages highlighting and auto-scrolling
   - Stores user preferences in localStorage

4. **styles.css** - UI styling
   - Panel appearance and positioning
   - Highlight styles for matched elements

## Key Features

### Search Functionality
- CSS selector-based element targeting (e.g., `div.card`, `article`, `section.air3-card-section`)
- Text-based filtering within matched elements (case-insensitive)
- Auto-refresh on panel reopen to account for dynamic content
- Real-time result counting
- Background color-based filtering (ignore matches by background color)

### Navigation
- Up/down navigation through matches
- Wraparound behavior (last → first, first → last)
- Auto-scroll to center current match
- Visual highlighting (blue for all matches, orange for current)

### User Experience
- Draggable panel positioning
- Keyboard shortcuts:
  - `Ctrl+Shift+F` - Toggle panel
  - `Enter` - Next match
  - `Shift+Enter` - Previous match
  - `Escape` - Close panel
- Persistent selector storage (remembers last used selector)
- Persistent ignore filter settings (checkbox state and color)
- Status display showing current position and ignored count (e.g., "Match 2 of 15 (3 ignored)")

## Technical Implementation Details

### Storage
- Uses browser localStorage for persistence
- Stores last used CSS selector (`list-navigator-selector`)
- Stores CSS selector checkbox state (`list-navigator-use-selector`)
- Stores search text (`list-navigator-search-text`)
- Stores ignore feature enabled state (`list-navigator-ignore-enabled`)
- Stores ignore color value (`list-navigator-ignore-color`)

### Element Selection
- Uses `document.querySelectorAll()` for CSS selector matching
- Filters results by text content (case-insensitive)
- Dynamically re-queries elements on each panel open
- Background color filtering using `window.getComputedStyle()`
- Exact RGB color matching (content.js:207-249)

### Highlighting
- Applies inline styles to matched elements
- Cleanup mechanism to remove highlights when panel closes
- Distinctive styling for current vs. all matches

### Message Passing
- Background script communicates with content script
- Toggle action triggered by browser action click

### Background Color Ignore Filter (v0.1.6)
- **Purpose**: Filter out search matches based on their background color
- **UI Components**:
  - Checkbox to enable/disable feature (content.js:47)
  - Color picker input (content.js:50)
  - Both controls disabled by default
- **Implementation**:
  - `hexToRgb()`: Converts hex color (#ffffff) to RGB object (content.js:208-215)
  - `colorsMatch()`: Exact RGB comparison between computed and selected color (content.js:218-234)
  - `shouldIgnoreElement()`: Checks element's background color against user selection (content.js:237-250)
- **Behavior**:
  - All matches (including ignored) receive highlight styling
  - Ignored matches increment `ignoredCount` but not added to navigable `matches` array
  - Status displays both counts: "Match 2 of 15 (3 ignored)"
  - When all matches ignored: "0 matches (15 ignored)"
- **Use Case**: On job boards like Upwork, ignore matches that have already been highlighted/processed (different background color)

## Common Use Cases

1. **Job Boards** (e.g., Upwork)
   - Selector: `section.air3-card-section.air3-card-hover`
   - Search: "less than 5" (to find jobs with few proposals)
   - Ignore filter: Enable and select background color to skip already-reviewed jobs

2. **Social Media** (e.g., Reddit)
   - Selector: `div[data-testid="post-container"]`
   - Search: Keyword matching

3. **E-commerce** (e.g., Amazon)
   - Selector: `div[data-component-type="s-search-result"]`
   - Search: Price ranges or product features

4. **Generic Web Pages**
   - Selector: `article`, `div.item`, `.product`, etc.
   - Search: Any text content

## Development Guidelines

### Code Style
- Vanilla JavaScript (no frameworks)
- Event-driven architecture
- Inline event handlers and message listeners

### Testing
- Test on multiple websites with varying DOM structures
- Verify selector persistence across sessions
- Test keyboard shortcuts and navigation edge cases
- Ensure cleanup happens when panel is closed

### Adding New Features
When extending functionality, consider:
- Maintaining simplicity (no external dependencies)
- Privacy (keep all operations local)
- Performance (efficient DOM queries)
- User experience (clear feedback, intuitive controls)

### Debugging
- Use Firefox DevTools console for JavaScript errors
- Check `about:debugging` for extension status
- Test selectors in browser console: `document.querySelectorAll('selector')`
- See DEBUG_INSTRUCTIONS.md for detailed debugging steps

## File Structure

```
listnavigator/
├── manifest.json          # Main extension configuration (V3)
├── manifest-cr.json       # Chromium-specific build manifest (V3)
├── manifest-ff.json       # Firefox-specific build manifest (V3)
├── background.js          # Background service worker (cross-browser compatible)
├── content.js            # Main logic (UI, search, navigation)
├── styles.css            # UI styling
├── icon48.png            # Extension icon
├── icon.svg              # Icon source
├── README.md             # User documentation
├── QUICK_START.md        # Quick reference guide
├── FIREFOX_INSTALL.md    # Installation instructions
├── DEBUG_INSTRUCTIONS.md # Debugging guide
├── CHANGELOG.md          # Version history
└── CLAUDE.MD            # This file (developer documentation)
```

## Permissions Explained (Manifest V3)

- `activeTab` - Access to currently active tab for content script injection
- `host_permissions: ["<all_urls>"]` - Ability to run on any website (universal functionality)

## Privacy & Security

- No network requests made
- No data sent to external servers
- No tracking or analytics
- Only local storage used (CSS selector, ignore filter settings)
- All processing happens client-side
- Background color checking uses computed styles only (no external data)

## Known Limitations

- Dynamic content may require panel refresh
- Selector must be valid CSS
- Works on accessible DOM elements only (not in iframes with different origins)
- Background color matching requires exact RGB match (no tolerance for slight variations)

## Future Enhancement Ideas

- Regex support for search text
- Multiple selector support
- Search history
- Custom highlight colors
- Export/import selector presets
- Keyboard shortcut customization
- Color tolerance setting for background matching (allow ~10 RGB unit variance)

## Troubleshooting Common Issues

### "No elements found for selector"
- Verify selector syntax in browser DevTools
- Check if elements are loaded (may need to wait for dynamic content)
- Ensure correct specificity

### "Invalid CSS selector"
- Check for syntax errors (missing quotes, invalid characters)
- Test selector independently in console

### Panel doesn't appear
- Verify extension is loaded in `about:debugging`
- Check console for JavaScript errors
- Reload extension if necessary

### Navigation not working
- Ensure elements are visible and in viewport
- Check if search actually returned matches
- Verify keyboard shortcuts aren't conflicting with browser/page shortcuts

## Versioning

This project uses a specific version numbering scheme in the format **x.y.z** (e.g., 0.1.5, 0.1.10, 1.2.15).

### Version Increment Rules

- **Format**: x.y.z (e.g., 0.1.5, 0.1.10, 1.2.15)
- **Independent increments**: Each component increments independently
  - z increments: 0.1.9 → 0.1.10 (NOT 0.2.0)
  - y increments: 0.9.5 → 0.10.5 (NOT 1.0.5)
  - x increments: 9.2.3 → 10.2.3
- **No automatic resets**: Incrementing z does not reset or affect y; incrementing y does not reset or affect x
- **When to increment**:
  - **z (patch)**: Bug fixes, minor code changes, documentation updates
  - **y (minor)**: New features, enhancements (requires explicit user instruction)
  - **x (major)**: Breaking changes, major rewrites (requires explicit user instruction)

### Version Update Process

When code is modified:
1. **Increment version** in all manifest files (`manifest.json`, `manifest-cr.json`, `manifest-ff.json`)
2. **Update version display** in `content.js` (panel header)
3. **Document changes** in CHANGELOG.md
4. Version number must be updated for ANY code modification

### Current Version Location

- **manifest.json** line 4: `"version": "0.1.14"`
- **manifest-cr.json** line 4: `"version": "0.1.14"`
- **manifest-ff.json** line 4: `"version": "0.1.14"`
- **content.js** line 35: Display in panel header

## Contributing

When modifying this extension:
1. Test on multiple websites
2. Maintain backward compatibility with stored selectors
3. Keep code vanilla JS (no build process needed)
4. Update relevant documentation files
5. Test all keyboard shortcuts
6. Verify cleanup on panel close
7. **Increment version number** whenever code is modified (see Versioning section above)

## Resources

- [MDN: Browser Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Firefox Extension APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)
