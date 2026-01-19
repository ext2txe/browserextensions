# Changelog

All notable changes to the Auto Load More extension will be documented in this file.

## [0.1.7] - 2026-01-18

### Changed
- **Migrated to Manifest V3**: Upgraded all manifests from V2 to V3 for cross-browser compatibility
- Now fully compatible with both Firefox and Chromium-based browsers using the same V3 standard
- Changed `browser_action` to `action`
- Split permissions: `activeTab`, `storage`, and `scripting` in `permissions`, `<all_urls>` in `host_permissions`
- Future-proof architecture with improved security model
- No breaking changes for users - all functionality preserved

## [0.1.6] - 2026-01-15

### Fixed
- **Firefox compatibility issue**: Fixed popup not loading properly in Firefox
- DOM elements now properly initialized after DOMContentLoaded event
- Settings now persist correctly when changed in Firefox
- Start button now functions correctly in Firefox
- Added console logging for better debugging

### Changed
- Refactored popup.js to use DOMContentLoaded event listener
- Moved event listener setup into dedicated function
- Improved error handling with detailed console logs

## [0.1.5] - 2026-01-14

### Added
- Intelligent content loading detection using MutationObserver
- Version number display in extension name and popup UI
- Smart DOM mutation monitoring that waits for content to finish loading

### Changed
- Replaced fixed delay with intelligent content detection (500ms idle timeout)
- Changed "Pause Duration" to "Max Load Wait" to better reflect new behavior
- Increased default timeout from 1000ms to 10000ms (maximum wait time)
- Minimum timeout changed from 100ms to 1000ms
- Extension name now includes version number: "Auto Load More 0.1.5"

### Improved
- Faster automation cycle as it proceeds immediately when content finishes loading
- More reliable operation on pages with variable loading times
- Better performance by filtering out insignificant DOM mutations
- Reduced unnecessary waiting while maintaining stability

## [1.0.0] - Initial Release

### Features
- Customizable button text detection with partial matching
- Configurable pause duration between actions
- Keyboard automation (PageDown, ArrowDown, End, Space)
- Smart stop conditions based on page text
- Real-time status updates and click counter
- Persistent settings across browser sessions
- Multiple button detection strategies
- Visual feedback in popup interface
