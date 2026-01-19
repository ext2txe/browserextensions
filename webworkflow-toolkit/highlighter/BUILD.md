# Building Keyword Highlighter

This extension supports both Firefox and Chromium-based browsers (Chrome, Edge, Brave, etc.). Since these browsers use different manifest formats, you need to build for your target browser.

## Quick Start

### Windows

**For Firefox:**
```batch
build-firefox.bat
```

**For Chrome/Edge:**
```batch
build-chromium.bat
```

### macOS/Linux

**For Firefox:**
```bash
chmod +x build-firefox.sh
./build-firefox.sh
```

**For Chrome/Edge:**
```bash
chmod +x build-chromium.sh
./build-chromium.sh
```

## Manual Build

If you prefer to build manually:

### Firefox
```bash
cp manifest.firefox.json manifest.json
```

### Chrome/Edge
```bash
cp manifest.chromium.json manifest.json
```

## Key Differences

### Manifest Version
- **Firefox**: Uses Manifest V2 (`manifest.firefox.json`)
- **Chrome/Edge**: Uses Manifest V3 (`manifest.chromium.json`)

### Manifest Differences

| Feature | Firefox (V2) | Chrome/Edge (V3) |
|---------|-------------|------------------|
| Manifest Version | 2 | 3 |
| Browser Action | `browser_action` | `action` |
| Host Permissions | Included in `permissions` | Separate `host_permissions` |
| Browser API | Native `browser` object | Polyfilled `chrome` → `browser` |

### Code Compatibility

The extension code (`popup.js` and `content.js`) includes a browser API polyfill that automatically detects and adapts to both browsers:

```javascript
// Browser API polyfill for Chrome/Edge compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}
```

This means **the same JavaScript files work on both Firefox and Chromium** without modification.

## Installation After Build

### Firefox
1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from the extension directory

**Note:** Temporary extensions are removed when Firefox restarts. For permanent installation, see `FIREFOX-DEVELOPER-INSTALL.md`.

### Chrome/Edge
1. Open Chrome/Edge
2. Navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the extension directory

## Distribution

### Creating Release Packages

For Firefox:
```bash
./build-firefox.sh
zip -r keyword-highlighter-firefox.zip . -x "*.git*" "*.chromium.json" "build-chromium.*" "*.sh"
```

For Chrome/Edge:
```bash
./build-chromium.sh
zip -r keyword-highlighter-chromium.zip . -x "*.git*" "*.firefox.json" "build-firefox.*" "*.sh"
```

### Publishing

- **Firefox Add-ons**: Submit to https://addons.mozilla.org/
- **Chrome Web Store**: Submit to https://chrome.google.com/webstore/devconsole
- **Edge Add-ons**: Submit to https://partner.microsoft.com/dashboard/microsoftedge

## Development Workflow

1. Make code changes to `content.js`, `popup.js`, or `popup.html`
2. Update version in:
   - `popup.js` (line 2: `const VERSION`)
   - `content.js` (line 2: `const VERSION`)
   - `manifest.firefox.json` (line 4: `"version"`)
   - `manifest.chromium.json` (line 4: `"version"`)
   - `README.md` (version badge and history)
3. Run the appropriate build script for your test browser
4. Reload the extension in the browser
5. Test thoroughly in both Firefox and Chrome

## Troubleshooting

**Issue:** Build script doesn't run on Mac/Linux
**Solution:** Make scripts executable: `chmod +x build-*.sh`

**Issue:** Extension doesn't work after building
**Solution:** Ensure you ran the correct build script for your browser

**Issue:** Changes not reflected
**Solution:** After rebuilding, reload the extension in your browser

**Issue:** Different behavior between browsers
**Solution:** This is expected due to browser differences. Test features in both browsers.

## Version Numbering

- Format: `0.2.X`
- Increment X for each release
- Update in all 4 locations (see Development Workflow)
- Keep versions synchronized across all files
