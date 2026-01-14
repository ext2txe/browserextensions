# Browser Extensions Collection

A collection of powerful, privacy-focused browser extensions for Firefox and Chromium-based browsers (Chrome, Edge, Brave, Opera).

## 🌐 Cross-Browser Compatibility

**All extensions now support both Firefox and Chromium!**

- Each extension contains three manifest files:
  - `manifest.json` - Default (Firefox Manifest V2)
  - `manifest-ff.json` - Firefox-specific (Manifest V2)
  - `manifest-cr.json` - Chromium-specific (Manifest V3)

📖 **See [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md) for detailed installation instructions**

## 📦 Extensions

### List Navigator 0.1.13
**Navigate through any webpage with advanced search and filtering**

**Latest Updates (v0.1.13):**
- ✅ Fixed Enter/Shift+Enter keyboard shortcuts to work globally in panel
- ✅ Added "Only Show" background color filter (inverse of Ignore filter)
- ✅ Made Ignore and Only Show filters mutually exclusive
- ✅ Version number in extension name
- ✅ Full cross-browser compatibility

**Features:**
- Advanced search with CSS selector support
- Background color filtering (ignore or show only specific colors)
- Keyboard navigation (Enter for next, Shift+Enter for previous)
- Real-time highlighting of matches
- Persistent settings across sessions
- Draggable panel interface

**Use Cases:**
- Navigate job listings by highlighting specific criteria
- Filter content by background color (e.g., show only bookmarked items)
- Search and navigate through any list-based content

**Keyboard Shortcuts:**
- `Ctrl+Shift+F` - Toggle panel
- `Enter` - Navigate to next match
- `Shift+Enter` - Navigate to previous match
- `Esc` - Close panel

---

### Auto Load More 0.1.5
**Automatically clicks 'Load More' buttons with intelligent content detection**

**Latest Updates (v0.1.5):**
- ✅ **Intelligent content loading** using MutationObserver
- ✅ Waits for content to finish loading instead of fixed delays
- ✅ Much faster automation (proceeds as soon as content is ready)
- ✅ Version number in extension name
- ✅ Full cross-browser compatibility

**Features:**
- Customizable button text detection (partial matching)
- **Smart content loading detection** (500ms idle timeout)
- Configurable maximum wait time (default: 10 seconds)
- Keyboard automation (PageDown, ArrowDown, End, Space)
- Auto-stop when specific text appears
- Real-time status updates and click counter

**How It Works:**
1. Clicks the "Load More" button
2. **Intelligently waits** for new content to finish loading (monitors DOM changes)
3. Scrolls to keep button visible
4. Repeats until stop condition is met

**Performance Improvement:**
- Old: Fixed 1-second delay per cycle
- New: Waits only as long as needed (typically 1-3 seconds)
- Result: **Significantly faster** while more reliable

---

### Keyword Highlighter 0.2.10
**Highlight elements on any website based on custom keywords and URL patterns**

**Features:**
- Custom keyword highlighting with wildcards
- URL pattern matching for site-specific rules
- Real-time filtering and updates
- Persistent settings
- Visual element highlighting

**Use Cases:**
- Highlight specific terms across multiple websites
- Mark important elements on frequently visited pages
- Filter content based on keywords

---

### Advanced History Search 1.0.0
**Powerful history search with pattern matching, filters, and exports**

**Features:**
- Pattern matching for advanced searches
- Multiple filter options
- Export search results
- Sidebar/side panel interface
- Date range filtering

**Browser-Specific UI:**
- Firefox: Opens in sidebar
- Chrome: Opens in side panel

---

### Upwork Job Post Analyzer 0.1.13
**Analyzes Upwork job posts and extracts detailed information**

**Features:**
- Detailed job post analysis
- One-click data extraction
- Copy to clipboard functionality
- Hotkey support (`Ctrl+Shift+V`)
- Structured data output for classification

**Use Cases:**
- Quickly analyze job requirements
- Extract job details for tracking
- Compare multiple job posts

---

### Udemy Search Results Extractor 0.1.10
**Extracts Udemy course data from search results**

**Features:**
- Extract course title, link, rating
- Student count and review count
- Duration, lecture count, last updated date
- Hotkey support (`Ctrl+Shift+U`)
- Export data for analysis

**Use Cases:**
- Compare course statistics
- Build course recommendation lists
- Track course updates

---

## 🚀 Quick Start

### Firefox Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on..."
3. Select the `manifest.json` file from any extension folder
4. Extension loads automatically with default Firefox manifest

### Chrome/Edge Installation

1. **Swap manifest files:**
   ```bash
   cd extension-folder
   cp manifest-cr.json manifest.json
   ```

2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

📖 **Full instructions:** [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md)

---

## 🔒 Privacy & Security

All extensions in this collection:
- ✅ **No external network requests** (except domain-specific extensions like Udemy)
- ✅ **No tracking or analytics**
- ✅ **No data sent to external servers**
- ✅ **All processing happens client-side**
- ✅ **Local storage only**
- ✅ **Open source - inspect the code**

---

## 📋 Version Numbering

All extensions follow the `x.y.z` versioning scheme:

- **x (major)**: Breaking changes, major rewrites
- **y (minor)**: New features, enhancements
- **z (patch)**: Bug fixes, minor code changes, documentation updates

**Rules:**
- Each component increments independently
- No automatic resets (e.g., 0.1.9 → 0.1.10, NOT 0.2.0)
- Version updated for ANY code modification

---

## 🛠️ Development

### Cross-Browser API Compatibility

All JavaScript code uses a compatibility layer:

```javascript
// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Use browserAPI for all extension API calls
browserAPI.runtime.sendMessage(...);
browserAPI.storage.sync.get(...);
browserAPI.tabs.query(...);
```

### Testing Workflow

1. **Make code changes** (use `browserAPI` wrapper)
2. **Test on Firefox** (uses default `manifest.json`)
3. **Test on Chrome:**
   ```bash
   cp manifest-cr.json manifest.json
   # Test in Chrome
   cp manifest-ff.json manifest.json  # Restore
   ```

### File Structure

Each extension contains:
```
extension-name/
├── manifest.json          # Default (Firefox)
├── manifest-ff.json       # Firefox Manifest V2
├── manifest-cr.json       # Chromium Manifest V3
├── content.js             # Main content script
├── popup.html/popup.js    # Extension popup (if applicable)
├── background.js          # Background script (if applicable)
├── styles.css             # Styling
├── icons/                 # Extension icons
├── README.md              # Extension-specific docs
└── CHANGELOG.md           # Version history (if applicable)
```

---

## 🐛 Troubleshooting

### "Manifest version 2 is deprecated" (Chrome)
You're using the Firefox manifest. Follow Chrome installation steps to swap manifests.

### Extension doesn't work after switching browsers
1. Clear extension storage in browser settings
2. Reload the extension
3. Check browser console for errors

### Keyboard shortcuts not working (List Navigator)
Shortcuts only work when the panel is visible. Open the panel first with `Ctrl+Shift+F`.

---

## 📚 Documentation

- **[BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md)** - Complete cross-browser guide
- **Individual extension READMEs** - Extension-specific documentation
- **CHANGELOG.md** (per extension) - Detailed version history

---

## 🤝 Contributing

When modifying extensions:

1. Update code with `browserAPI` wrapper for cross-browser compatibility
2. Test on both Firefox and Chromium
3. Update **both** `manifest-ff.json` and `manifest-cr.json`
4. Increment version number (x.y.z)
5. Update CHANGELOG.md
6. Update extension-specific README if needed
7. Copy Firefox manifest to `manifest.json` (default)

---

## 📄 License

These extensions are provided as-is for personal use.

---

## 🔗 Resources

- [MDN Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) - Firefox
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/) - Chromium
- [Firefox Extension Workshop](https://extensionworkshop.com/)

---

## ⚡ Recent Updates

### January 2026
- **All extensions** now support both Firefox and Chromium browsers
- **List Navigator 0.1.13**: Fixed keyboard shortcuts, added "Only Show" filter
- **Auto Load More 0.1.5**: Intelligent content loading with MutationObserver
- Added version numbers to all extension names
- Created comprehensive cross-browser compatibility guide
- Updated all code with browserAPI compatibility layer

---

**Note**: Default `manifest.json` is always the Firefox version (Manifest V2). Chromium users must manually swap to `manifest-cr.json` before loading.
