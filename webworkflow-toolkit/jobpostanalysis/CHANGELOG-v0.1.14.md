# Changelog - v0.1.14

## Release Date
2026-01-15

## Fixed
- **Firefox compatibility issue**: Fixed popup not loading properly in Firefox
- DOM elements now properly initialized after DOMContentLoaded event
- Analyze button now functions correctly in Firefox
- Added console logging for better debugging

## Changed
- Refactored popup.js to use DOMContentLoaded event listener
- Improved error handling with detailed console logs
- Event listener setup moved to initialization function

## Technical Details
Previously, the popup.js was trying to access DOM elements immediately at script load time, which caused the elements to be `null` in Firefox. This resulted in:
- Button not responding to clicks
- Extension appearing broken in Firefox

The fix ensures the DOM is fully loaded before attempting to access any elements, making the extension work reliably across all browsers.
