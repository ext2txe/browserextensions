# Changelog

All notable changes to the Web Workflow Toolkit will be documented in this file.

## [0.2.39] - 2026-01-19

### Fixed
- **Highlighter Panel Z-Index**: Increased z-index so Highlighter panel appears in front of Navigator panel
  - Changed z-index from 2147483645 to 2147483649
  - Highlighter panel now displays on top when both panels are open
  - Allows easy interaction with Highlighter settings while Navigator is visible

### Technical Details
- Updated z-index in content.js line 143
- Z-index hierarchy: Highlighter (2147483649) > Other panels (2147483646-2147483648)
- Both panels remain independently draggable

## [0.2.38] - 2026-01-19

### Fixed
- **Highlighter Panel Positioning**: Fixed panel appearing off-screen due to invalid saved position
  - Panel was positioned at x:0, y:1241 (way off-screen down and left)
  - localStorage had saved position with empty/invalid values: `{left: "", top: ""}`
  - Added validation to only apply saved position if it has valid numeric values
  - Panel now correctly appears at default position (bottom-right corner)
  - Added comprehensive logging to diagnose position issues

### Technical Details
- Fixed at content.js lines 229-254
- Validates saved position has non-empty left/top values that parse to numbers
- Falls back to default position (bottom: 80px, right: 20px) if invalid
- Logs saved position for debugging

## [0.2.35] - 2026-01-19

### Fixed
- **Open Highlighter Button Now Works**: Fixed scope issue preventing button from opening Highlighter panel
  - Changed `toggleSettingsPanel()` to `HighlighterModule.toggle()`
  - The Navigator module couldn't access the private function in HighlighterModule
  - Now correctly calls the exported toggle method
  - Button now successfully opens the Highlighter settings panel

### Technical Details
- HighlighterModule exports `toggle: toggleSettingsPanel` at line 717
- Navigator needs to call the public API: `HighlighterModule.toggle()`
- Fixed at content.js line 930
- Error was: "ReferenceError: toggleSettingsPanel is not defined"

### Root Cause
- HighlighterModule uses IIFE pattern with private functions
- `toggleSettingsPanel` is private and only exposed via `toggle` property
- Navigator code was trying to call private function directly
- Solution: Use the public interface provided by the module

## [0.2.34] - 2026-01-19

### Improved
- **Open Highlighter Button Debugging**: Added diagnostic logging to troubleshoot button event
  - Logs when searching for the Open Highlighter button element
  - Shows the element reference when found (or null if not found)
  - Confirms when click event listener is attached
  - Logs when button is actually clicked
  - Error message if button element not found

### Technical Details
- Added logging at content.js lines 925, 927, 932, 934
- Helps diagnose if button exists and if event listener is attached
- Console will show `[Navigator]` prefixed messages for all button operations

### Debugging Steps
1. Open Navigator panel
2. Check console for: `[Navigator] Looking for Open Highlighter button:`
3. If element shown → button exists, listener should attach
4. If null → button wasn't created in DOM
5. Click button and check for: `[Navigator] Open Highlighter button clicked!`

## [0.2.33] - 2026-01-19

### Added
- **Highlighter Button in Navigator Panel**: Added quick access to Highlighter settings from List Navigator
  - New "🎨 Open Highlighter Settings" button appears in Navigator panel above Tips section
  - Clicking the button opens the Highlighter settings panel (already in content script)
  - Provides convenient access to keyword configuration without closing Navigator
  - Styled with orange background (#FF9800) for visibility

### Technical Details
- Added button HTML in Navigator panel template (content.js lines 784-788)
- Added event listener to call `toggleSettingsPanel()` (content.js lines 923-930)
- Button appears between status area and Tips section with visual separator
- Reuses existing Highlighter panel functionality - no duplicate code

### User Experience
- Users can now quickly switch between Navigator and Highlighter settings on the same page
- Both panels are draggable and can be positioned independently
- Navigator panel → Highlighter settings is now one click instead of multiple steps

## [0.2.32] - 2026-01-19

### Improved
- **Initialization Debugging**: Added comprehensive initialization logging to diagnose startup issues
  - Logs when `initHighlighter()` function is called
  - Logs all DOM element references (color picker, selectors, buttons)
  - Confirms whether color picker element exists before attaching listeners
  - Shows error message if color picker element not found
  - Confirms when event listeners are successfully attached

### Technical Details
- Added `[Highlighter Init]` logging at function start (line 49)
- Added element reference logging for all form controls (lines 67-74)
- Added defensive check for `highlightColor` existence before attaching events (line 79)
- Error logging if element not found (line 97)

### Purpose
- If no console output appears, it means `initHighlighter()` is not being called
- If console shows "element not found", the HTML ID is wrong or DOM not ready
- If console shows element references, we can verify the color picker exists

## [0.2.31] - 2026-01-19

### Improved
- **Color Picker Event Logging**: Added comprehensive event listeners to diagnose color picker update issues
  - Added `input` event listener to track color changes as they happen
  - Added `change` event listener to track when color selection is finalized
  - Logs show exact color values when picker is used
  - Explicitly sets color input value when change event fires to ensure visual update
  - Stores user-selected color in variable for debugging

### Technical Details
- Added event listeners to `highlightColor` input in popup.js lines 70-81
- Logs use `[Color Picker]` prefix for easy filtering
- Both `input` and `change` events are monitored to catch all update scenarios
- Explicitly calls `highlightColor.value = userSelectedColor` to force visual update

## [0.2.30] - 2026-01-19

### Fixed
- **Color Picker Not Updating**: Removed hardcoded default color value from HTML color input
  - The `value="#ffb9b9"` attribute in popup.html was preventing the color picker from updating
  - Color picker now initializes without a default value and is set only from storage
  - This allows the color picker to properly display and update when user selects a new color
  - JavaScript in popup.js still provides the default `#ffb9b9` if storage is empty

### Technical Details
- Removed `value="#ffb9b9"` from `<input type="color" id="highlight-color">` in popup.html line 70
- Color picker now relies entirely on JavaScript to set its value from storage
- Default color logic remains in popup.js as fallback: `result.highlightColor || '#ffb9b9'`

## [0.2.29] - 2026-01-19

### Improved
- **Color Picker UI Refresh**: Added UI reload after save to ensure color picker displays saved value
  - After saving settings, `loadHighlighterSettings()` is now called to refresh all UI fields
  - This ensures color picker, element selector, and checkboxes show the values from storage
  - Prevents UI/storage desync issues

### Improved
- **Color Picker Diagnostic Logging**: Added comprehensive logging to color picker operations
  - Logs when loading settings from storage
  - Shows the color value being set to the picker
  - Logs the color picker element reference
  - Shows the color picker value after setting it
  - Makes it easy to diagnose if color picker widget is updating correctly
  - Uses `[Highlighter Load]` prefix for easy filtering

### Technical Details
- Enhanced `loadHighlighterSettings()` in popup.js with detailed logging
- Added UI reload call after successful save operation

## [0.2.28] - 2026-01-19

### Fixed
- **CRITICAL: Highlighter Save Bug**: Fixed save button erasing keywords and URL patterns
  - Save button was only saving color, selector, and word boundaries settings
  - This caused keywords and URL patterns to be lost/cleared when saving other settings
  - Now retrieves current keywords and URL patterns from storage before saving all settings together
  - Added comprehensive logging to save operation showing all values being saved
  - Added verification read-back to confirm save succeeded

### Improved
- **Save Operation Logging**: Added detailed logging to highlighter save process
  - Logs all settings being saved (color, selector, word boundaries, keywords, URL patterns)
  - Shows complete settings object before save
  - Includes verification read-back from storage after save
  - Uses `[Highlighter Save]` prefix for easy filtering

### Impact
- This was a critical data loss bug affecting all users who changed color/selector settings
- Users who changed highlight color and clicked Save would lose all their keywords
- Now fixed - all settings are preserved when saving any setting

## [0.2.27] - 2026-01-19

### Improved
- **Highlighter Diagnostic Logging**: Added comprehensive logging to diagnose highlight color issues
  - Logs raw storage values when settings are loaded
  - Shows all loaded settings (keywords count, color, URL patterns, selector, word boundaries)
  - Logs when styles are injected with the current color value
  - Logs all storage change events with new values
  - Logs when highlights are re-applied due to storage changes
  - Makes it easy to verify if color is being loaded and applied correctly

### Technical Details
- Enhanced `loadSettings()` in content.js with detailed logging
- Added logging to `injectHighlightStyles()` to show color being used in CSS
- Enhanced storage change listener with per-field logging
- All logs use `[Highlighter]` prefix for easy filtering

## [0.2.26] - 2026-01-19

### Improved
- **Comprehensive Import Logging**: Added detailed diagnostic logging to keyword highlighter import process
  - All import steps now logged with `[IMPORT]` prefix for easy debugging
  - Shows file selection details (name, size, type)
  - Displays file content preview and parsing status
  - Logs field presence validation results
  - Shows exact data being saved to storage
  - Includes verification read-back from storage to confirm save
  - All errors include full stack traces
  - Makes troubleshooting import issues much easier

### Technical Details
- Enhanced `popup/popup.js` import handler with 20+ diagnostic log statements
- Logging covers: file selection, JSON parsing, validation, storage save, verification
- Helps identify exactly where import process fails if issues occur

## [0.2.25] - 2026-01-18

### Fixed
- **Import Validation**: Improved import validation to properly detect valid settings files
  - Now uses `hasOwnProperty()` to check for field presence instead of falsy checks
  - Accepts files with any combination of valid fields (keywords, urlPatterns, elementSelector, highlightColor, useWordBoundaries)
  - Better error messages distinguish between invalid JSON and missing fields

### Note
- **File Path Storage**: Browser security prevents extensions from accessing or storing file system paths
  - Only filename (not full path) can be persisted for export/import
  - This is a browser limitation, not an extension bug

## [0.2.24] - 2026-01-18

### Fixed
- **Popup Panel Auto-Close**: Fixed popup closing automatically after button clicks
  - Added `e.preventDefault()` and `e.stopPropagation()` to all button click handlers
  - Popup now stays open after Save, Import, Export, Add Keyword, Add URL, Clear operations
  - Added `return false` to prevent default browser behavior

### Changed
- **Default Highlight Color**: Changed from light gray (#d3d3d3) to light pink (#ffb9b9 / RGB 255, 185, 185)
  - Updated default in HTML color input
  - Updated default in all JavaScript fallback values
  - More visible highlighting for better UX

## [0.2.23] - 2026-01-18

### Fixed
- **Import Settings Bug**: Fixed critical bug where highlightColor and other settings were lost during import
  - Import now ensures ALL fields are saved with proper default values
  - Missing fields in imported JSON files now use default values instead of being omitted
  - Previously, `storage.local.set()` only saved keys present in imported file, losing other settings

### Improved
- **Import Logging**: Added console logging to show complete settings structure being imported

## [0.2.22] - 2026-01-18

### Fixed
- **Import/Export Reliability**: Improved import/export functionality
  - Added validation to ensure imported files contain required settings fields
  - Export now includes default values for all fields to prevent missing data
  - Added comprehensive console logging for debugging import/export issues
  - Validation message displayed if imported file is missing required fields

### Improved
- **Better Error Reporting**: Enhanced debugging capabilities
  - Console logs now show exported data structure
  - Import validation logs show which fields are missing
  - Successful import logs confirm settings structure

## [0.2.21] - 2026-01-18

### Fixed
- **Highlighter Keyboard Shortcut**: Changed from `Ctrl+Shift+Comma` to `Ctrl+Shift+Period` for Firefox compatibility
  - The "Comma" key name was not recognized by Firefox's command API
  - New shortcut is `Ctrl+Shift+.` (period/dot key)

### Improved
- **Import Error Handling**: Enhanced import functionality with better error reporting
  - Added detailed error messages for JSON parse errors
  - Added file read error handling
  - Increased error message display duration to 5 seconds
  - Added console logging for debugging
  - File input now properly resets after import attempt
- **File Path Persistence**: Import/export now remembers last used filename
  - After importing settings, the filename is remembered
  - Next export will default to the same filename
  - Provides better workflow when managing multiple configuration files

## [0.2.20] - 2026-01-18

### Fixed
- **Job Analyzer Detailed View**: Restored all missing data fields in the detailed analysis panel
  - Added Classification input field
  - Added Posted Date, Budget Type, Project Type
  - Added Connects Required/Available, Bid Range
  - Added Client Rating, Review Count, Hire Rate, Total Hires
  - Added Member Since, Payment Verified status
  - Added complete Activity section (Proposals, Last Viewed, Interviewing, Jobs In Progress, Other Open Jobs)
  - Added full Job History table with all previous jobs and details

### Changed
- **Auto-save panel positions**: All draggable panels now automatically save and restore their positions
  - Highlighter settings panel position persists across sessions
  - Navigator panel position persists across sessions
  - Analyzer detail panel position persists across sessions
  - Analyzer compact panel position persists across sessions
- **Auto Display default**: Job Analyzer "Auto-display compact panel" option now defaults to True
- **Version in name**: Extension name now includes version number for clarity

## [1.0.0] - 2026-01-18

### 🎉 Initial Release

**Web Workflow Toolkit** - The all-in-one productivity browser extension combining 4 powerful tools into a single, unified interface.

### Added

#### Core Architecture
- **Manifest V3** cross-browser support (Firefox 109+, Chrome 121+)
- **Unified popup interface** with tabbed navigation
- **Modular content script** with namespace isolation
- **4 integrated features**:
  - 🎨 Keyword Highlighter
  - 🔍 List Navigator
  - 📊 Upwork Job Analyzer
  - ⚡ Auto Load More

#### Keyboard Shortcuts
- `Ctrl+Shift+,` - Toggle Highlighter settings panel
- `Ctrl+Shift+N` - Toggle List Navigator panel
- `Ctrl+Shift+A` - Analyze Upwork job post
- `Ctrl+Shift+L` - Open Auto Load settings popup
- `Enter` - Next match (Navigator)
- `Shift+Enter` - Previous match (Navigator)
- `Esc` - Close Navigator panel

#### 🎨 Keyword Highlighter (v0.2.12 features)
- Wildcard keyword matching (`*` and `**` support)
- URL pattern filtering (only run on specific sites)
- Custom CSS selector targeting
- Configurable highlight color
- Word boundary matching option
- Import/Export settings as JSON
- Draggable settings panel
- Real-time keyword and URL pattern management

#### 🔍 List Navigator (v0.1.14 features)
- Dual search modes (CSS selector OR text search)
- Background color-based filtering:
  - Ignore matches by color
  - Only show matches by color
- Visual match highlighting (blue/orange)
- Keyboard navigation (Enter/Shift+Enter)
- Auto-scroll to current match
- Wraparound navigation
- Real-time match counting with ignored count
- Draggable search panel

#### 📊 Upwork Job Analyzer (v0.1.15 features)
- Comprehensive job data extraction:
  - Job title, description, budget, category
  - Client rating, reviews, total spent, location
  - Proposals, interviewing count, response rate
  - Required skills
- Dual display modes (compact overlay + detailed panel)
- Auto-expand collapsible sections on Upwork
- Auto-display on job page load (optional)
- Auto-copy JSON to clipboard (optional)
- Upwork-specific DOM selectors

#### ⚡ Auto Load More (v0.1.7 features)
- Intelligent content loading detection (Mutation Observer)
- Configurable settings:
  - Button text matching
  - Maximum wait time
  - Key to press after click
  - Stop condition string
- Real-time click counter
- Status display
- Multiple button finding strategies
- Automatic scroll after click

### Technical Implementation

#### Conflict Prevention
- All IDs prefixed with `ww-` (Web Workflow)
- All CSS classes prefixed with `ww-`
- All localStorage keys prefixed with `ww-`
- Unique z-index values for each panel:
  - Highlighter: 2147483645
  - Analyzer: 2147483646
  - Navigator: 2147483647

#### Storage Architecture
- **browser.storage.local**: Highlighter settings, Analyzer settings
- **browser.storage.sync**: Auto Load settings (cloud-synced)
- **localStorage**: Navigator settings (per-page persistence)

#### Cross-Browser Compatibility
- Service worker + scripts background configuration
- Universal manifest works in both Firefox and Chromium
- Cross-browser API wrapper (`browserAPI`)

#### UI/UX Enhancements
- Modern tabbed popup interface
- Color-coded feature tabs (visual icons)
- Consistent button styling across all features
- Responsive design for smaller screens
- Status messages and feedback
- Keyboard shortcut hints in UI

### Permissions
- `activeTab` - Current tab access
- `storage` - Settings persistence
- `clipboardWrite` - JSON export (Analyzer)
- `tabs` - Content script communication
- `scripting` - Dynamic script injection
- `<all_urls>` - Universal website support

### Privacy & Security
- ✅ No network requests
- ✅ No external data transmission
- ✅ No tracking or analytics
- ✅ All processing local
- ✅ Settings stored locally only

---

## Migration from Individual Extensions

If you're migrating from the individual extensions:

### From Keyword Highlighter v0.2.12
- **Settings**: Export your settings from the old extension and import into the Highlighter tab
- **Storage**: Keys remain compatible (`keywords`, `urlPatterns`, `highlightColor`, etc.)
- **Hotkey Change**: `Ctrl+Shift+L` → `Ctrl+Shift+,`

### From List Navigator v0.1.14
- **Settings**: Per-page settings will NOT transfer automatically
- **Functionality**: 100% compatible, all features preserved
- **Hotkey Change**: `Ctrl+Shift+F` → `Ctrl+Shift+N`

### From Upwork Job Post Analyzer v0.1.15
- **Settings**: Auto-export and auto-display settings preserved
- **Storage Keys**: Compatible (`autoExportJSON`, `autoDisplayCompact`)
- **Hotkey Change**: `Ctrl+Shift+V` → `Ctrl+Shift+A`

### From Auto Load More v0.1.7
- **Settings**: All settings preserved if using storage.sync
- **Storage Keys**: Compatible (`buttonText`, `pauseDuration`, `keyPress`, `stopString`)
- **New Hotkey**: `Ctrl+Shift+L` (no hotkey in original)

---

## Known Limitations

- Background color matching uses exact RGB (no tolerance for slight variations)
- Navigator settings are per-page (localStorage) and don't sync
- Analyzer only works on Upwork job posting pages
- Dynamic content may require panel refresh in Navigator
- Selector must be valid CSS in both Highlighter and Navigator

---

## Future Enhancements (Planned)

- [ ] Color tolerance setting for background matching (±10 RGB units)
- [ ] Regex support for search patterns
- [ ] Multiple selector support
- [ ] Search history in Navigator
- [ ] Custom highlight colors per keyword
- [ ] Export/import all settings (unified)
- [ ] Keyboard shortcut customization
- [ ] Settings sync across devices (Navigator)
- [ ] Additional analyzer support (LinkedIn, Indeed, etc.)
- [ ] Custom button click patterns for Auto Load

---

## Credits

This extension combines and enhances functionality from 4 original extensions:
- **Keyword Highlighter** v0.2.12
- **List Navigator** v0.1.14
- **Upwork Job Post Analyzer** v0.1.15
- **Auto Load More** v0.1.7

All credit to the original implementations while creating a unified, enhanced experience.
