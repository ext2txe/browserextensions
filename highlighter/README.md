# Keyword Highlighter Browser Extension

A powerful browser extension that highlights webpage elements based on custom keywords and URL patterns. Perfect for job boards, search results, and content filtering.

![Version](https://img.shields.io/badge/version-0.2.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🎯 Smart Keyword Matching
- **Wildcard Support**: Use `*` as a wildcard in keywords
  - `[$*]` matches `[$500]`, `[$1000]`, `[$50k]`
  - `india*` matches "india", "indian", "indiana"
  - `*test*` matches "testing", "contest", "latest"
- **Word Boundaries**: Optional whole-word matching to prevent partial matches
  - When enabled, "mys" won't match "MySQL"
- **Case-Insensitive**: All keyword matching is case-insensitive

### 🎨 Customization
- **Custom Highlight Color**: Choose any color via color picker
- **Flexible Element Selectors**: Use CSS selectors to target specific elements
  - Default: `article, .job, .listing, section`
  - Supports any valid CSS selector syntax
- **URL Pattern Filtering**: Control which websites the extension runs on
  - Supports wildcards: `*://www.upwork.com/nx/find-work/*`
  - Multiple patterns supported

### 📊 Real-Time Feedback
- **Live Hit Counter**: See how many elements matched your keywords
- **Draggable Settings Panel**: Move the settings panel anywhere on screen
- **Test Selector Tool**: Preview which elements your CSS selector targets
- **Dynamic Updates**: Automatically detects new content (infinite scroll compatible)

### 💾 Import/Export Settings
- **Backup Configuration**: Export settings to JSON file
- **Restore Settings**: Import previously saved configurations
- **Version Tracking**: Settings files include version and export date

## Installation

### Quick Install

The extension requires a browser-specific build. Choose your browser:

**Windows:**
```batch
# For Firefox
build-firefox.bat

# For Chrome/Edge
build-chromium.bat
```

**Mac/Linux:**
```bash
# For Firefox
chmod +x build-firefox.sh && ./build-firefox.sh

# For Chrome/Edge
chmod +x build-chromium.sh && ./build-chromium.sh
```

### Firefox
1. Download or clone this repository
2. Run `build-firefox.bat` (Windows) or `./build-firefox.sh` (Mac/Linux)
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension directory

**Note:** Temporary extensions are removed when Firefox restarts, but settings persist. See `FIREFOX-DEVELOPER-INSTALL.md` for permanent installation.

### Chrome/Edge
1. Download or clone this repository
2. Run `build-chromium.bat` (Windows) or `./build-chromium.sh` (Mac/Linux)
3. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
4. Enable "Developer mode" (toggle in top-right)
5. Click "Load unpacked"
6. Select the extension directory

**Detailed build instructions:** See `BUILD.md` for advanced options and troubleshooting.

## Usage

### Quick Start
1. Click the extension icon to open settings
2. Add URL patterns where the extension should run
3. Add keywords you want to highlight
4. Choose a highlight color
5. Click "Save Settings"
6. Navigate to a matching URL and see highlights!

### Floating Settings Button
When on an active page, you'll see a green button in the bottom-right corner:

```
⚙️ Highlighter Settings v0.2.9 (47 hits)
```

- Shows current version
- Displays real-time hit count
- Click to open settings panel
- Drag the panel by its header to reposition

### Keyword Examples

| Keyword | Matches | Notes |
|---------|---------|-------|
| `India` | "India", "india", "INDIA" | Case-insensitive exact match |
| `[$*]` | `[$500]`, `[$1000]`, `[$50k]` | Wildcard for variable amounts |
| `node*` | "node", "node.js", "nodejs" | Prefix wildcard |
| `*test*` | "testing", "contest", "latest" | Contains wildcard |
| `React*` | "React", "ReactJS", "React Native" | Technology names |

### URL Pattern Examples

| Pattern | Matches |
|---------|---------|
| `*://www.upwork.com/*` | All pages on upwork.com |
| `*://www.upwork.com/nx/find-work/*` | Only find-work section |
| `*://jobs.example.com/**` | All pages including subpaths |
| `https://specific-site.com/*` | Only HTTPS on specific site |

## Settings Reference

### Keywords Section
- **Add Keywords**: Type keyword and press Enter or click "Add"
- **Edit Keywords**: Click on any keyword in the list to edit
- **Delete Keywords**: Click "Delete" button next to keyword
- **Match Whole Words**: Toggle checkbox to enable/disable word boundary matching

### URL Patterns Section
- Controls which websites the extension activates on
- Uses wildcard patterns: `*` matches any characters (except `/`), `**` matches including `/`
- Extension only runs when current URL matches at least one pattern

### Element Selector
- CSS selector for elements to scan for keywords
- Comma-separated for multiple selectors
- Click "Test Selector" to preview which elements will be targeted
- Default: `article, .job, .listing, section`

### Import/Export
- **Export**: Downloads `keyword-highlighter-settings-YYYY-MM-DD.json`
- **Import**: Loads settings from JSON file (must click "Save Settings" to apply)

## Configuration File Format

Exported settings are in JSON format:

```json
{
  "version": "0.2.9",
  "exportDate": "2026-01-18T12:34:56.789Z",
  "keywords": [
    "India",
    "[$*]",
    "React*"
  ],
  "urlPatterns": [
    "*://www.upwork.com/nx/find-work/*"
  ],
  "highlightColor": "#d3d3d3",
  "elementSelector": "article, .job, .listing, section",
  "useWordBoundaries": true
}
```

## Technical Details

### Browser Compatibility
- **Firefox**: Manifest V2, native `browser` API
- **Chrome/Edge/Brave**: Manifest V3, `chrome` API with automatic polyfill
- Requires browser-specific build (see `BUILD.md`)
- Same codebase works on both browsers via polyfill

### Manifest Versions
- **Firefox**: Uses `manifest.firefox.json` (Manifest V2)
- **Chromium**: Uses `manifest.chromium.json` (Manifest V3)
- Build scripts automatically copy the correct manifest

### Permissions Required
- `storage`: Save and load settings
- `activeTab`: Access current tab for highlighting
- `host_permissions` (Chromium only): Required for content script injection

### Performance
- Mutation Observer monitors DOM changes for dynamic content
- Debounced updates prevent excessive re-highlighting
- Minimal memory footprint
- Cross-browser compatible code

## Version History

### v0.2.9 (Current)
- **Critical Fix**: Settings button now properly opens/closes panel
- **Critical Fix**: Extension elements no longer affected by highlighting
- Added exclusion logic to skip extension's own UI elements
- Strengthened CSS isolation with !important rules
- Button and panel now immune to page layout interference

### v0.2.8
- **Critical Fix**: Resolved layout breaking issue
- Changed from inline styles to CSS class-based highlighting
- Prevents CSS conflicts with existing page styles
- More reliable highlighting that doesn't affect page layout

### v0.2.7
- Added browser-specific manifest files (Firefox & Chromium)
- Created build scripts for easy deployment
- Full Manifest V3 support for Chrome/Edge
- Comprehensive BUILD.md documentation
- Cross-browser compatibility ensured

### v0.2.6
- Fixed settings button click handler
- Added draggable settings panel with header
- Improved UI/UX

### v0.2.5
- Added version number to floating button
- Implemented live hit counter
- Real-time button text updates

### v0.2.4
- Added import/export functionality
- Settings backup and restore

### v0.2.3
- Added browser compatibility polyfill
- Chrome/Edge support
- Version display in UI

### v0.2.2
- Implemented wildcard keyword support
- Fixed word boundary matching bug
- Enhanced keyword matching logic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Clone the repository
2. Make your changes
3. Test in both Firefox and Chrome
4. Update version number in `popup.js` and `content.js`
5. Update README.md if needed

### Version Numbering
- Format: `0.2.X`
- Increment X for each change (no wrapping: 0.2.9 → 0.2.10)
- Update in both `popup.js` and `content.js`

## Tips & Tricks

### Job Board Filtering
Perfect for filtering job postings by location, budget, or technology:
```
Keywords: [$1000+*], Remote, React*, Python
URL: *://www.upwork.com/nx/find-work/*
Selector: article
```

### Content Highlighting
Highlight specific topics on news sites:
```
Keywords: AI*, *machine learning*, robotics
URL: *://news.site.com/*
Selector: article, .post, .story
```

### Search Results Enhancement
Make important results stand out:
```
Keywords: official*, documentation, tutorial*
URL: *://www.google.com/search*
Selector: .g, .search-result
```

## License

MIT License - feel free to use, modify, and distribute.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for better browsing experiences**
