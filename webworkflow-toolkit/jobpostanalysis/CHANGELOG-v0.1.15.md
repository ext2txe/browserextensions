# Changelog - v0.1.15

## Release Date
2026-01-18

## Changed
- **Migrated to Manifest V3**: Upgraded all manifests from V2 to V3 for cross-browser compatibility
- Now fully compatible with both Firefox and Chromium-based browsers using the same V3 standard
- Changed `browser_action` to `action`
- Changed `background.scripts` to `background.service_worker`
- Split permissions: `activeTab`, `clipboardWrite`, `tabs`, and `storage` in `permissions`, `<all_urls>` in `host_permissions`
- Future-proof architecture with improved security model
- No breaking changes for users - all functionality preserved

## Technical Details
This migration moves the extension from the legacy Manifest V2 format to the modern Manifest V3 standard, which is now supported by both Firefox and Chromium browsers. The service worker-based background script provides better performance and follows current web extension standards.
