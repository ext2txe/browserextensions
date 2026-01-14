# Browser Compatibility Guide

All extensions in this repository support both **Firefox** and **Chromium-based browsers** (Chrome, Edge, Brave, Opera, etc.).

## Manifest Files

Each extension contains three manifest files:

- **`manifest.json`** - Default (Firefox Manifest V2)
- **`manifest-ff.json`** - Firefox-specific (Manifest V2)
- **`manifest-cr.json`** - Chromium-specific (Manifest V3)

## Installing on Firefox

Firefox extensions use the **default `manifest.json`** file (which is a copy of `manifest-ff.json`).

### Temporary Installation (For Development)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension directory and select the `manifest.json` file
5. The extension will be loaded and appear in your toolbar

**Note**: Temporary extensions are removed when Firefox restarts.

### Permanent Installation

To permanently install:
1. Package the extension as a `.zip` file
2. Sign it at [addons.mozilla.org](https://addons.mozilla.org)
3. Install the signed `.xpi` file

## Installing on Chrome/Edge/Chromium

Chromium browsers require **Manifest V3**. You must **swap the manifest file** before loading.

### Installation Steps

1. **Swap manifest files**:
   ```bash
   # In the extension directory
   mv manifest.json manifest-ff-backup.json
   cp manifest-cr.json manifest.json
   ```

2. **Load the extension**:
   - Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory
   - The extension will be loaded

3. **After testing, restore Firefox manifest** (optional):
   ```bash
   mv manifest-ff-backup.json manifest.json
   ```

## Extension-Specific Notes

### List Navigator (v0.1.13)
- ✅ Fully cross-browser compatible
- Code uses `const browserAPI = typeof browser !== 'undefined' ? browser : chrome;`
- No additional changes needed

### Auto Load More (v0.1.5)
- ✅ Fully cross-browser compatible
- Code updated with browserAPI wrapper
- Firefox uses Manifest V2, Chromium uses Manifest V3
- ⚠️ **Chrome users**: Reload the webpage after loading the extension before first use

### Keyword Highlighter (v0.2.10)
- ✅ Already has polyfill: `if (typeof browser === 'undefined') { var browser = chrome; }`
- Works with both manifests

### Advanced History Search (v1.0.0)
- ⚠️ Uses Firefox sidebar (Manifest V2) / Chromium side_panel (Manifest V3)
- Different UI behavior between browsers
- Firefox: Opens in sidebar
- Chrome: Opens in side panel

### Upwork Job Post Analyzer (v0.1.13)
- ✅ Cross-browser compatible
- Manifest V2 for Firefox, V3 for Chromium

### Udemy Search Extractor (v0.1.10)
- ✅ Cross-browser compatible
- Command shortcut updated for Manifest V3 (`_execute_action` vs `_execute_browser_action`)

## Quick Reference: Manifest Differences

| Feature | Firefox (V2) | Chromium (V3) |
|---------|--------------|---------------|
| Version | `manifest_version: 2` | `manifest_version: 3` |
| Permissions | `<all_urls>` in permissions | Separate `host_permissions` array |
| Browser Action | `browser_action` | `action` |
| Background | `background.scripts` | `background.service_worker` |
| Commands | `_execute_browser_action` | `_execute_action` |
| API | `browser.*` | `chrome.*` (polyfilled) |

## API Compatibility Layer

All extensions with JavaScript code use a compatibility layer:

```javascript
// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Then use browserAPI instead of browser or chrome
browserAPI.runtime.sendMessage(...);
browserAPI.storage.sync.get(...);
```

## Troubleshooting

### "Manifest version 2 is deprecated" (Chrome)
- You're using the Firefox manifest
- Follow the Chrome installation steps above to swap manifests

### "service_worker is not supported" (Firefox)
- You're using the Chromium manifest
- Copy `manifest-ff.json` to `manifest.json`

### Extension doesn't work after switching browsers
- Clear extension storage: `chrome://extensions/` → Details → "Clear storage"
- Reload the extension
- Check browser console for errors

### "Please reload the page and try again" (Auto Load More in Chrome)
- The content script hasn't loaded yet on the current tab
- Solution: **Reload the webpage** where you want to use the extension
- Then open the extension popup and click Start
- This happens because Chromium Manifest V3 only injects content scripts on page load

### Start button does nothing (Chrome)
1. Check if the Chromium manifest is active: `cp manifest-cr.json manifest.json`
2. Reload the extension in `chrome://extensions/`
3. **Reload the webpage** where you want to use it
4. Check the console (F12) for errors
5. Verify `host_permissions` includes `<all_urls>` in manifest-cr.json

## Development Workflow

When developing for both browsers:

1. **Make code changes** in `.js` files (use `browserAPI` wrapper)
2. **Test on Firefox** with default `manifest.json`
3. **Test on Chrome**:
   ```bash
   cp manifest-cr.json manifest.json
   # Load in Chrome
   # Test
   cp manifest-ff.json manifest.json  # Restore
   ```
4. **Update both manifests** if changing permissions or structure

## Version Management

When incrementing versions:
1. Update version in **both** `manifest-ff.json` AND `manifest-cr.json`
2. Update version in extension name (if applicable)
3. Update CHANGELOG.md
4. Copy the updated Firefox manifest to `manifest.json`

## Support

For browser-specific issues:
- **Firefox**: [MDN Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- **Chrome**: [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
