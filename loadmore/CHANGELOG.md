# Changelog

All notable changes to the Auto Load More extension will be documented in this file.

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
