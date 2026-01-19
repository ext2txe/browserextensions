# Changelog

All notable changes to the Keyword Highlighter extension will be documented in this file.

## [0.2.13] - 2026-01-19

### Fixed
- **Auto-save on import**: Imported keywords and settings are now automatically saved to storage
- Previously, users had to manually click "Save Settings" after importing, or keywords would be lost
- Import now automatically persists all settings (keywords, URL patterns, colors, selectors, options)
- Status message updated to reflect automatic saving

### Technical Details
- Modified `handleFileImport()` in popup.js to call `browser.storage.local.set()` immediately after successful import
- Added proper error handling for storage failures during import
- Import operation now matches export behavior (both are fully automatic)

## [0.2.12] - 2026-01-18

### Changed
- **Migrated to Manifest V3**: Upgraded all manifests from V2 to V3 for cross-browser compatibility
- Now fully compatible with both Firefox and Chromium-based browsers using the same V3 standard
- Changed `browser_action` to `action`
- Split permissions: `activeTab` and `storage` in `permissions`, `<all_urls>` in `host_permissions`
- Future-proof architecture with improved security model
- No breaking changes for users - all functionality preserved

## [0.2.11] - 2026-01-15

### Fixed
- **Firefox manifest issue**: Restored Firefox-compatible manifest.json
- Main manifest.json was incorrectly set to Chromium (Manifest V3) instead of Firefox (Manifest V2)
- Extension now loads properly in Firefox again

### Changed
- Chromium version backed up to manifest-cr.json
- Firefox version (manifest-ff.json) copied to manifest.json

### Note
The popup.js already had proper DOMContentLoaded handling, so no code changes were needed. This was purely a manifest configuration issue that occurred when Chromium support was added.

## [0.2.10] - Previous version

See CHANGELOG-v2.md for version 2.x feature history.
