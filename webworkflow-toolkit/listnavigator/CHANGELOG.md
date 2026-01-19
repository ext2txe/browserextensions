# Changelog

## Version 0.1.14

### Architecture: Migrated to Manifest V3 🚀

**Upgraded to Manifest V3 for cross-browser compatibility** ✅
- Migrated from Manifest V2 to Manifest V3
- Now fully compatible with both Firefox and Chromium-based browsers (Chrome, Edge, etc.)
- Single codebase for all browsers - no separate versions needed
- Background script now runs as a service worker

**Technical Changes:**
- Updated `manifest.json`, `manifest-cr.json`, and `manifest-ff.json` to V3 format
- Changed `manifest_version` from 2 to 3
- Replaced `browser_action` with `action`
- Split permissions: `activeTab` in `permissions`, `<all_urls>` in `host_permissions`
- Changed background script from `scripts: ["background.js"]` to `service_worker: "background.js"`
- `background.js` already cross-browser compatible (uses polyfill pattern)

**Benefits:**
- Future-proof architecture
- Better Chrome/Chromium support
- Firefox continues to support both V2 and V3
- Improved security model
- Better performance with service workers

**Migration Notes:**
- No breaking changes for users
- All existing functionality preserved
- Saved settings and preferences remain compatible
- No action required from users

---

## Version 0.1.13

### New Feature: "Only Show" Background Color Filter

**Added inverse color filter option** ✅
- New "Only show matches with background color" option
- Works inversely to "Ignore" - only displays matches with the specified background color
- Mutually exclusive with "Ignore" option
- When "Only Show" is enabled, "Ignore" is automatically disabled and vice versa
- Uses same color matching logic as Ignore feature
- Persistent across sessions via localStorage

**Use Cases:**
- Show only highlighted items (e.g., yellow background)
- Focus on specific categories marked by background color
- Filter to see only bookmarked/flagged items

**Technical Implementation:**
- Added `onlyShowEnabledCheckbox` and `onlyShowColorInput` UI elements
- Added `shouldOnlyShowElement()` helper function (returns true only if color matches)
- Modified `performSearch()` to check both filters: `shouldIgnore || !shouldShow`
- Automatic mutual exclusion in change event handlers
- On load, if both are enabled, Ignore is disabled (Only Show takes precedence)

**Added:**
- Version number in extension name: "List Navigator 0.1.13"

---

## Version 0.1.12

### Bug Fix: Enter and Shift+Enter Keyboard Shortcuts

**Fixed navigation shortcuts not working** ✅
- Enter and Shift+Enter now work globally when panel is visible
- Previously only worked when search input field had focus
- Now works from any input field or button in the panel
- Enter: Navigate to next match
- Shift+Enter: Navigate to previous match
- Escape: Close panel (still works)

**Technical change:**
- Moved keyboard event listener from `searchInput` to `document` level
- Added check to only handle shortcuts when panel is visible
- Prevents shortcuts from interfering with page when panel is closed

**Added:**
- Version number in extension name: "List Navigator 0.1.12"

---

## Version 0.1.11

### UX Improvement: Don't Highlight Ignored Matches

**Better visual clarity** ✅
- Ignored matches are NO LONGER highlighted with blue outline
- Only navigable matches receive the blue highlight
- Navigation is now intuitive - what you see highlighted is what you can navigate
- Status message updated: "Found 15 - all ignored" when all matches are ignored
- Previous behavior: All 18 matches highlighted, but only 15 navigable (confusing)
- New behavior: Only 15 navigable matches highlighted

**Why this matters:**
- Before: "Match 2 of 15 (3 ignored)" but 18 items had blue outlines
- After: "Match 2 of 15 (3 ignored)" and exactly 15 items have blue outlines
- What you see is what you get - no confusion about what's navigable

---

## Version 0.1.10

### Bug Fix: Background Color Check Timing

**Fixed ignore filter not working** ✅
- Now checks background color BEFORE applying highlight class
- Previously, the highlight class with `!important` was overwriting the original background
- The extension's blue background overlay (rgba(102, 126, 234, 0.1)) was preventing color matching
- Color check now happens on original element state

**Technical issue:**
- CSS applies `background-color: rgba(102, 126, 234, 0.1) !important;` to all matches
- This overwrote the original background color (e.g., rgb(255, 185, 185))
- `getComputedStyle()` was returning the blue overlay instead of original color
- Fixed by reordering: check color → then apply highlight class

---

## Version 0.1.9

### Bug Fix: Auto-run Search on Panel Open

**Fixed search not running automatically** ✅
- Now saves search text to localStorage (`list-navigator-search-text`)
- Loads saved search text when panel is created
- Added 100ms timeout before auto-running search to handle browser autofill timing
- Search now runs automatically when panel opens with existing search text
- Refresh button now works properly

**Changes:**
- Search text persistence across sessions
- Timing fix ensures autofill values are captured before checking

---

## Version 0.1.8

### Debug Logging Added

**Enhanced debug output** ✅
- Added console logging for ignore checkbox changes
- Added console logging for color picker changes
- Added console logging for search input changes
- Added console logging for selector changes
- Helps diagnose issues with UI interactions not triggering searches

---

## Version 0.1.7

### Bug Fix: Background Color Matching

**Fixed background color detection** ✅
- Now traverses parent elements to find effective background color
- Previously only checked the matched element itself (often transparent)
- Added `getEffectiveBackgroundColor()` function that walks up DOM tree
- Checks up to 10 parent levels for non-transparent background
- Added debug logging for "less than" matches to troubleshoot

**Technical details:**
- Color picker provides hex (e.g., #ffb9b9)
- Computed styles return rgb/rgba format
- rgb(255, 185, 185) = #ffb9b9
- Now handles transparent elements correctly

---

## Version 0.1.6

### New Feature: Background Color Ignore Filter

**Ignore matches by background color** ✅
- New checkbox: "Ignore matches with background color:"
- Color picker to select which background color to ignore
- When enabled, matches with the specified background color are excluded from navigation
- Status display shows both visible matches and ignored count
  - Example: "Match 2 of 15 (3 ignored)"
  - When all ignored: "0 matches (15 ignored)"
- Settings persist across sessions (localStorage)
- Default state: Disabled
- Uses exact RGB color matching
- Useful for filtering out highlighted or colored text elements

**How it works:**
1. Check the "Ignore matches with background color" checkbox
2. Select a color using the color picker (defaults to white #ffffff)
3. Matches with that exact background color will be counted but not navigable
4. The ignored count is shown in the status message

---

## Version 0.1.5

## Latest Update

### Fixed Issues

1. **Scrolling on wraparound navigation** ✅
   - Fixed: When clicking Previous and wrapping to last entry, viewport now scrolls correctly
   - Fixed: Scrolling works properly when navigating from 2nd-to-last to last result
   - Solution: Added 10ms delay before scrollIntoView to ensure DOM updates complete
   - Added error checking for invalid match indices

2. **Added Refresh Button** ✅
   - New button: "🔄 Refresh" in the control panel
   - Re-scans the page for matches without closing/reopening panel
   - Useful when page content changes dynamically
   - No need to press Ctrl+Shift+F twice anymore

### Features Added

3. **CSS Selector is Optional** ✅
   - Checkbox: "Use CSS Selector (advanced)"
   - Default (unchecked): Searches all text on page like Ctrl+F
   - Checked: Searches only within specified CSS selector
   - Selector field is disabled when checkbox is unchecked

4. **Settings Persistence** ✅
   - Remembers checkbox state (selector on/off)
   - Remembers last CSS selector used
   - Persists across page reloads and browser restarts

5. **Auto-refresh on reopen** ✅
   - When you reopen panel with Ctrl+Shift+F, search automatically re-runs
   - Shows updated match counts if page content changed

## Button Layout

```
[↑ Previous] [↓ Next] [🔄 Refresh]
```

- Previous/Next: Equal width, larger
- Refresh: Slightly smaller, fits nicely on the right

## How to Update

1. Go to `about:debugging#/runtime/this-firefox`
2. Find "List Navigator"
3. Click **"Reload"**
4. Refresh your webpage

## Known Behavior

- Smooth scrolling: 10ms delay ensures proper scroll behavior
- Leaf elements only: In simple mode, searches text in leaf nodes (no nested elements)
- Panel excluded: Search never matches text within the extension panel itself

## Usage Tips

**Simple Mode (Default):**
- Just type and search
- Works like Ctrl+F but shows "Match 2 of 15"
- Navigate with Enter/Shift+Enter or click arrows

**Advanced Mode (Checkbox enabled):**
- Specify CSS selector to limit search scope
- Example: `section.card` only searches within card sections
- Useful for filtering specific page sections

**Refresh Button:**
- Click when page content changes (AJAX loads, infinite scroll, etc.)
- Updates match count and re-highlights
- Faster than closing/reopening panel
