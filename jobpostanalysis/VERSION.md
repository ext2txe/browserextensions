# Version History

## Current Version: 0.1.4

### v0.1.3 (2026-01-06)
### v0.1.4 (2026-01-06)- **Fixed:** Hotkey now works! Added fallback keyboard listener for `Ctrl+Shift+V`- **Added:** Minimize/Restore button to collapse panel to header only- **Added:** Clickable links for job titles and freelancer names in job history- **Added:** Hourly Rate column in job history table- **Enhanced:** Job history now captures URLs for jobs and freelancers
- **Fixed:** Changed hotkey from `Ctrl+Shift+J` to `Ctrl+Shift+V` (conflict with Browser Console)
- **Fixed:** Improved "View more" expansion with multi-pass clicking (up to 3 passes)
- **Fixed:** Better extraction for Total Spent and Avg Hourly Rate fields
- **Added:** Hourly Range field extraction (shows when present)
- **Added:** Version number display in panel header (v0.1.3)
- **Removed:** Experience Level field from display

### v0.1.2 (2026-01-06)
- **Fixed:** Changed hotkey from `Ctrl+Shift+A` to `Ctrl+Shift+J` (conflict with Firefox Add-ons)
- **Fixed:** Broadened content script matching to all Upwork pages
- **Fixed:** Added auto-injection fallback for content script
- **Fixed:** Improved message handling with proper async responses
- **Added:** Version number to extension name

### v0.1.1 (2026-01-06)
- Initial debugging fixes
- Added `<all_urls>` permission
- Changed run_at to `document_end`

### v0.1.0 (2026-01-06)
- Initial release
- Basic job post analysis
- HTML table output
- JSON export
- Auto-expand "View more" sections

---

## Version Numbering

Format: `0.MAJOR.MINOR`

- **0.x.y** - Pre-release/beta versions
- **MAJOR** - Significant features or breaking changes (0.1.x → 0.2.x)
- **MINOR** - Bug fixes and small improvements (0.1.2 → 0.1.3)

When MINOR reaches 9, increment: 0.1.9 → 0.1.10

---

## Updating Version

When making updates:

1. **Update version in `manifest.json`:**
   ```json
   "name": "Upwork Job Post Analyzer v0.1.3",
   "version": "0.1.3",
   ```

2. **Document changes in this file (VERSION.md)**

3. **Reload extension in Firefox:**
   - Go to `about:debugging`
   - Click "Reload"

---

## Planned Features (Future Versions)

### v0.2.0 (Major Update)
- [ ] Automated classification algorithm
- [ ] Chrome/Edge support (Manifest v3)
- [ ] Settings page for customization

### v0.1.x (Minor Updates)
- [ ] CSV export option
- [ ] Save analysis history
- [ ] Batch analysis mode
- [ ] Configurable hotkey
- [ ] More robust selector fallbacks
