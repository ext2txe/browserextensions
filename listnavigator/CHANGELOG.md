# Changelog

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
