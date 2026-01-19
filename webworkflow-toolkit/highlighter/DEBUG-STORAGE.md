# Debugging: Settings Not Restoring After Firefox Restart

## The Issue

You're experiencing settings not persisting when Firefox restarts. Let's diagnose and fix this.

## Quick Test: Are Settings Actually Saving?

### Step 1: Verify Storage
1. Open the extension settings
2. Add a keyword (e.g., "test")
3. Click "Save Settings"
4. Open Firefox Developer Tools (F12)
5. Go to Console tab
6. Type this and press Enter:
```javascript
browser.storage.local.get(['keywords', 'urlPatterns', 'highlightColor', 'elementSelector', 'useWordBoundaries'])
```
7. You should see your settings displayed

### Step 2: Check After Restart
1. Close Firefox completely
2. Reopen Firefox
3. Go to `about:debugging#/runtime/this-firefox`
4. Reload the extension (Load Temporary Add-on → manifest.json)
5. Open Developer Tools (F12)
6. Run the same command:
```javascript
browser.storage.local.get(['keywords', 'urlPatterns', 'highlightColor', 'elementSelector', 'useWordBoundaries'])
```

**Expected:** Your settings should still be there
**Problem:** If they're gone, Firefox is clearing local storage

## Common Causes & Solutions

### Cause 1: Firefox Privacy Settings

Firefox might be configured to clear storage on exit.

**Fix:**
1. Go to `about:preferences#privacy`
2. Under "History", check if it's set to "Never remember history" or "Clear history when Firefox closes"
3. If yes, click "Settings..." next to "Clear history when Firefox closes"
4. **Uncheck "Site settings"** - this is what clears extension storage
5. Click OK and restart Firefox

### Cause 2: Private Browsing Mode

Extension storage doesn't persist in Private Browsing.

**Fix:**
- Use normal browsing windows, not private windows
- The extension won't work properly in private mode

### Cause 3: Extension Profile Location

The extension might be looking in the wrong Firefox profile.

**Fix:**
1. Type `about:profiles` in Firefox
2. Note which profile is "Default Profile" and "in use"
3. Make sure you're always starting Firefox with the same profile

### Cause 4: Firefox Container Tabs

If you're using Container Tabs, storage might be isolated.

**Fix:**
- Use the extension in the same container each time
- Or avoid using containers for the sites you want highlighted

## Permanent Fix: Install for Real

The real issue is that **temporary extensions** can have storage quirks. The permanent solution:

### Option A: Firefox Developer Edition (Recommended)

1. Download **Firefox Developer Edition**
2. Install the extension permanently (see PERMANENT-INSTALL.md)
3. Storage will be 100% reliable

### Option B: Regular Firefox with Signed Extension

1. Package the extension
2. Sign it at https://addons.mozilla.org
3. Install the signed .xpi file
4. Storage will be 100% reliable

## Workaround: Manual Settings Backup

Until you get permanent installation working, you can backup/restore settings:

### Backup Settings
1. Open Developer Tools (F12)
2. Console tab
3. Run:
```javascript
browser.storage.local.get(null).then(data => console.log(JSON.stringify(data, null, 2)))
```
4. Copy the output to a text file

### Restore Settings
1. Open Developer Tools (F12)
2. Console tab
3. Paste this (replace YOUR_SETTINGS with your saved data):
```javascript
browser.storage.local.set(YOUR_SETTINGS).then(() => console.log('Settings restored!'))
```

Example:
```javascript
browser.storage.local.set({
  "keywords": ["India", "Saudi Arabia", "Python"],
  "urlPatterns": ["*://www.upwork.com/nx/find-work/*"],
  "highlightColor": "#d3d3d3",
  "elementSelector": "section.air3-card-section",
  "useWordBoundaries": true
}).then(() => console.log('Settings restored!'))
```

## Quick Reinstall Checklist

**After every Firefox restart:**
1. `about:debugging#/runtime/this-firefox`
2. "Load Temporary Add-on"
3. Select `manifest.json`
4. Settings SHOULD load automatically
5. If not, check console for errors
6. If still not working, try the manual restore above

## Still Not Working?

### Check Console Errors
1. Go to `about:debugging#/runtime/this-firefox`
2. Find "Keyword Highlighter"
3. Click "Inspect"
4. Look for any red errors in the console
5. Share those errors for debugging

### Verify Extension Is Loading
1. Visit a configured URL (e.g., Upwork)
2. Open Console (F12)
3. You should see log messages like:
   - "Loaded settings: {keywords: [...], ...}"
   - "Extension enabled on this page: true"
4. If you don't see these, the extension isn't loading properly

### Nuclear Option: Fresh Profile
1. Create a new Firefox profile
2. Install the extension there
3. Configure settings
4. Test if they persist

This will tell us if it's a profile-specific issue.

## Report Back

If none of this works, please report:
1. Firefox version
2. Operating system
3. Any console errors
4. Result of the storage.local.get() test
5. Your privacy settings
