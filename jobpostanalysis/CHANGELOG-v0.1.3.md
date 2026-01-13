# Changelog v0.1.3

## What's New

### ✅ Fixed Issues

1. **Hotkey Changed to Ctrl+Shift+V**
   - Previous: `Ctrl+Shift+J` opened Firefox Browser Console
   - Now: `Ctrl+Shift+V` works without conflicts
   - Also updated in popup display

2. **Improved "View More" Expansion**
   - Now performs **3 passes** to catch all expandable content
   - Clicks all types of expand buttons:
     - `[data-cy="jobs-in-progress-button"]`
     - `button.collapse-toggle`
     - `a.js-show-more`
     - `footer a` and `footer span a`
     - Any `button[aria-expanded="false"]`
   - Logs each click in console for debugging
   - Stops automatically when no more buttons found

3. **Better Field Extraction**
   - **Total Spent**: Now extracts from nested `data-qa="client-spend"` structure
   - **Avg Hourly Rate**: Now extracts from `data-qa="client-hourly-rate"` with regex matching
   - Both fields use regex patterns to extract just the dollar amounts

4. **Added Hourly Range Field**
   - Extracts hourly range when job is hourly-based
   - Shows as separate row only if present
   - Format: `$10.00-$25.00/hr`

### 📝 Changes

1. **Removed Experience Level**
   - Field removed from display panel
   - Still in data structure if needed later

2. **Version Display**
   - Panel header now shows: "Job Post Analysis v0.1.3"
   - Helps track which version is installed

3. **Console Logging**
   - More detailed expansion logs:
     - Pass number (1-3)
     - Buttons clicked per pass
     - Button text being clicked

## Testing Instructions

1. **Reload Extension**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Reload" next to the extension

2. **Test Hotkey**
   - Open any Upwork job page
   - Press `Ctrl+Shift+V`
   - Panel should appear (not Browser Console!)

3. **Test View More Expansion**
   - Open a job with many job history items (50+)
   - Press `Ctrl+Shift+V`
   - Watch console (F12) for expansion logs
   - Verify all job history items are extracted

4. **Test Field Extraction**
   - Check that "Total Spent" shows (e.g., "$33K")
   - Check that "Avg Hourly Rate" shows (e.g., "$4.19/hr")
   - Check that hourly jobs show "Hourly Range"

## Known Issues

None currently. Previous issues resolved:
- ~~Hotkey conflicts~~ ✅ Fixed
- ~~View more doesn't expand~~ ✅ Fixed
- ~~Missing Total Spent~~ ✅ Fixed
- ~~Missing Avg Hourly Rate~~ ✅ Fixed

## Next Steps

1. Test on multiple live Upwork job posts
2. Verify all 50+ job history items are captured
3. Test with both fixed-price and hourly jobs
4. Begin developing classification algorithm
