# Web Workflow Toolkit v0.2.25

**All-in-one productivity browser extension combining 4 powerful tools:**

1. 🎨 **Keyword Highlighter** - Highlight elements based on custom keywords and URL patterns
2. 🔍 **List Navigator** - Search and navigate through webpage lists with advanced filtering
3. 📊 **Upwork Job Analyzer** - Extract and analyze Upwork job posting details
4. ⚡ **Auto Load More** - Automatically click "Load More" buttons with intelligent detection

## Features

### 🎨 Keyword Highlighter
- **Wildcard Support**: Use `*` and `**` in keywords (e.g., `[$*]` matches `[$500]`, `[$1000]`)
- **URL Pattern Filtering**: Only run on specific websites (e.g., `*://www.upwork.com/nx/find-work/*`)
- **Element Targeting**: Specify CSS selectors to target specific elements
- **Custom Colors**: Choose your highlight color
- **Word Boundaries**: Match whole words only to avoid false matches
- **Import/Export**: Save and share your configurations
- **Hotkey**: `Ctrl+Shift+.` to toggle settings panel

### 🔍 List Navigator
- **Dual Search Modes**: CSS selector-based OR text search
- **Color-Based Filtering**:
  - **Ignore** matches with specific background colors
  - **Only Show** matches with specific background colors
- **Visual Highlighting**: Blue for all matches, orange for current
- **Keyboard Navigation**:
  - `Enter` - Next match
  - `Shift+Enter` - Previous match
  - `Esc` - Close panel
- **Match Counting**: Real-time display (e.g., "Match 2 of 15 (3 ignored)")
- **Auto-scroll**: Centers current match in viewport
- **Hotkey**: `Ctrl+Shift+N` to toggle navigator panel

### 📊 Upwork Job Analyzer
- **Comprehensive Extraction**:
  - Job title, description, budget, and category
  - Client rating, reviews, total spent, location
  - Activity: proposals submitted, interviewing, response rate
  - Skills required
- **Dual Display Modes**:
  - **Compact Overlay**: Quick summary view
  - **Detailed Panel**: Full analysis with all data
- **Auto-features**:
  - Auto-expand collapsible sections
  - Auto-display on job page load (optional)
  - Auto-copy JSON to clipboard (optional)
- **Hotkey**: `Ctrl+Shift+A` to analyze current job

### ⚡ Auto Load More
- **Intelligent Detection**: Uses Mutation Observer to wait for content to load
- **Configurable**:
  - Button text to find
  - Maximum wait time (ms)
  - Key to press after click (PageDown, ArrowDown, End, Space)
  - Stop condition string
- **Real-time Feedback**: Click counter and status display
- **Stop Conditions**: Automatically stops when specified text appears
- **Hotkey**: `Ctrl+Shift+L` to open settings

## Installation

### Firefox
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the extension directory and select `manifest.json`

### Chrome/Edge/Chromium
1. Download or clone this repository
2. Open browser and navigate to `chrome://extensions` (or `edge://extensions`)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension directory

## Usage

### Quick Start
1. Click the extension icon to open the popup
2. Navigate to the desired tab (Highlighter, Navigator, Analyzer, or Auto Load)
3. Configure settings as needed
4. Use the hotkeys for quick access to features

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+.` | Toggle Highlighter settings panel |
| `Ctrl+Shift+N` | Toggle List Navigator panel |
| `Ctrl+Shift+A` | Analyze Upwork job post |
| `Ctrl+Shift+L` | Open Auto Load settings popup |
| `Enter` | Navigate to next match (Navigator) |
| `Shift+Enter` | Navigate to previous match (Navigator) |
| `Esc` | Close Navigator panel |

## Configuration

### Highlighter Settings
- Add keywords (supports wildcards)
- Add URL patterns (where the extension should run)
- Set CSS selector for target elements
- Choose highlight color
- Enable/disable word boundaries

### Navigator Settings
- Select between CSS selector mode or text search
- Configure ignore/only-show color filters
- All settings persist per-page

### Analyzer Settings
- Toggle auto-export JSON to clipboard
- Toggle auto-display compact panel on job pages

### Auto Load Settings
- Set button text to find
- Configure maximum wait time
- Choose key to press after click
- Set stop condition string

## Storage

- **browser.storage.local**: Highlighter settings, Analyzer settings
- **browser.storage.sync**: Auto Load settings (synced across devices)
- **localStorage**: Navigator settings (per-page)

## Permissions

- `activeTab` - Access current tab for feature activation
- `storage` - Save settings
- `clipboardWrite` - Copy analysis to clipboard (Analyzer)
- `tabs` - Communicate with content scripts
- `scripting` - Execute content scripts (Auto Load)
- `<all_urls>` - Run on any website

## Privacy

- ✅ No network requests
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ All processing happens locally
- ✅ Settings stored locally only

## Browser Compatibility

| Browser | Supported | Version |
|---------|-----------|---------|
| Firefox | ✅ | 109+ |
| Chrome | ✅ | 121+ |
| Edge | ✅ | 121+ |
| Brave | ✅ | 121+ |
| Opera | ✅ | 107+ |

## Technical Details

- **Manifest Version**: 3
- **Architecture**: Modular content script with namespace isolation
- **Cross-browser**: Compatible with both Firefox and Chromium APIs
- **Conflict Prevention**: All IDs/classes prefixed with `ww-`
- **Storage**: Uses `browser.storage.local` and `browser.storage.sync`

## Contributing

This extension combines functionality from 4 separate extensions:
1. Keyword Highlighter v0.2.12
2. List Navigator v0.1.14
3. Upwork Job Post Analyzer v0.1.15
4. Auto Load More v0.1.7

When contributing, please:
- Test on multiple websites
- Maintain cross-browser compatibility
- Keep code modular and well-documented
- Update version numbers following semantic versioning
- Update CHANGELOG.md

## Troubleshooting

### Feature Not Working
1. Reload the page
2. Check browser console for errors (F12)
3. Verify extension is enabled in browser settings
4. Reload the extension in browser's extension management page

### Highlighter Not Highlighting
- Check if current URL matches URL patterns
- Verify keywords are added
- Ensure element selector is correct

### Navigator Panel Not Opening
- Try using the keyboard shortcut (`Ctrl+Shift+N`)
- Check if page has finished loading
- Reload the page and try again

### Analyzer Shows "Not on Upwork Page"
- Ensure you're on a job posting page at `upwork.com`
- URL should be like: `https://www.upwork.com/jobs/~...`

### Auto Load Not Working
- Verify button text matches exactly
- Check if stop string appears too soon
- Try increasing the wait time

## License

MIT License - see individual extension directories for original licenses

## Credits

Created by combining and enhancing:
- Keyword Highlighter
- List Navigator
- Upwork Job Post Analyzer
- Auto Load More

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.
