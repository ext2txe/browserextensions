# PERMANENT Installation in Firefox Developer Edition

## Current Problem

You're still using **temporary installation** which:
- ❌ Gets removed on Firefox restart
- ❌ May have storage issues
- ❌ Requires manual reload

## Solution: Permanent Installation

Firefox Developer Edition allows unsigned extensions to run permanently.

---

## Method 1: Install from about:debugging (Recommended)

### Step 1: Enable Unsigned Extensions

1. Open Firefox Developer Edition
2. Type in address bar: `about:config`
3. Click "Accept the Risk and Continue"
4. Search for: `xpinstall.signatures.required`
5. Click the toggle button to set it to **false**
6. You should see: `xpinstall.signatures.required = false`

### Step 2: Package the Extension

We need to create a .xpi file (Firefox extension package):

**On Linux/Mac:**
```bash
cd upwork-highlighter
zip -r ../keyword-highlighter.xpi *
```

**On Windows (PowerShell):**
```powershell
cd upwork-highlighter
Compress-Archive -Path * -DestinationPath ..\keyword-highlighter.xpi
```

**Or use the command line:**
```bash
cd upwork-highlighter
zip -r -FS ../keyword-highlighter.xpi * --exclude '*.git*'
```

### Step 3: Install Permanently

1. In Firefox Developer Edition, go to: `about:addons`
2. Click the gear icon (⚙️) in the top right
3. Select "Install Add-on From File..."
4. Browse to and select `keyword-highlighter.xpi`
5. Click "Add" when prompted
6. **Done!** Extension is now permanent

### Step 4: Verify

1. Close Firefox completely
2. Reopen Firefox Developer Edition
3. Extension should still be there ✓
4. Settings should still be there ✓

---

## Method 2: Load from Extensions Directory

### Step 1: Find Your Profile Directory

1. Type in address bar: `about:support`
2. Look for "Profile Directory" (or "Profile Folder")
3. Click "Open Directory" / "Open Folder"
4. This opens your Firefox profile folder

### Step 2: Install Extension

1. In the profile directory, look for an `extensions` folder
   - If it doesn't exist, create it
2. Copy the **entire upwork-highlighter folder** into the extensions folder
3. Rename it to: `keyword-highlighter@youremail.com`
   - The format must be: `name@domain`
   - Example: `keyword-highlighter@example.com`

### Step 3: Restart Firefox

1. Close Firefox completely
2. Reopen Firefox Developer Edition
3. Go to `about:addons`
4. Extension should be installed permanently

---

## Method 3: Using Extension ID

### Step 1: Add Extension ID to manifest.json

1. Open `manifest.json`
2. Add this line after `"version"`:
```json
"browser_specific_settings": {
  "gecko": {
    "id": "keyword-highlighter@example.com"
  }
},
```

### Step 2: Create XPI and Install

1. Package as XPI (see Method 1, Step 2)
2. Install from file (see Method 1, Step 3)

---

## Troubleshooting

### Issue: "Add-on could not be installed"

**Solution:**
- Make sure `xpinstall.signatures.required` is set to `false` in about:config
- Restart Firefox Developer Edition after changing this setting

### Issue: "Extension is corrupt"

**Solution:**
- Make sure the XPI file was created correctly
- Try Method 2 instead (extensions directory)

### Issue: Extension appears but settings still don't persist

**Diagnostic Steps:**

1. Open Firefox Developer Tools (F12)
2. Go to Console tab
3. Type this and press Enter:
```javascript
browser.storage.local.get(null).then(d => console.log("Storage:", d))
```

4. You should see your settings

If storage is empty:
- The extension isn't saving properly
- See diagnostic section below

---

## Storage Diagnostic

### Test if Storage Works

1. After installing permanently, visit: `about:debugging#/runtime/this-firefox`
2. Find "Keyword Highlighter"
3. Click "Inspect"
4. In the console, run:

```javascript
// Test save
await browser.storage.local.set({test: "hello"})
console.log("Saved")

// Test read
const data = await browser.storage.local.get("test")
console.log("Read:", data)

// Should show: Read: {test: "hello"}
```

If this works, storage is functional.

### Test Extension Settings

In the same console:

```javascript
// Save test settings
await browser.storage.local.set({
  keywords: ["test1", "test2"],
  urlPatterns: ["*://www.upwork.com/*"],
  highlightColor: "#ff0000"
})

// Read them back
const settings = await browser.storage.local.get(null)
console.log("Settings:", settings)
```

### Access Test Page

1. After installing the extension, visit this URL in Firefox:
   ```
   moz-extension://[EXTENSION-ID]/test-storage.html
   ```
   
   To find your extension ID:
   - Go to `about:debugging#/runtime/this-firefox`
   - Look for "Internal UUID" under your extension
   - Or just type `moz-extension://` and let Firefox autocomplete

2. Click the buttons to test storage
3. This will show if storage is working

---

## Current Status Check

Run this in the browser console (F12) to see what's happening:

```javascript
// Check if extension is running
console.log("Extension loaded:", typeof browser !== 'undefined')

// Check storage
browser.storage.local.get(null).then(data => {
    console.log("=== STORAGE CONTENTS ===")
    console.log(JSON.stringify(data, null, 2))
    console.log("=== KEYS IN STORAGE ===")
    console.log(Object.keys(data))
})
```

---

## After Permanent Installation

Once installed permanently:

✓ Extension loads automatically on Firefox start
✓ Settings persist across restarts
✓ No need to reload extension
✓ Extension appears in `about:addons`

---

## If Nothing Works

### Nuclear Option: Fresh Extension ID

1. Completely remove the extension
2. Clear all storage: 
   ```javascript
   browser.storage.local.clear()
   ```
3. Add unique ID to manifest:
   ```json
   "browser_specific_settings": {
     "gecko": {
       "id": "keyword-highlighter-{unique-number}@example.com"
     }
   }
   ```
4. Reinstall

### Report Issue

If still not working, please provide:

1. Firefox Developer Edition version
2. Operating system
3. Output from the diagnostic commands above
4. Any error messages in browser console
5. Output from test-storage.html

---

## Summary

**For Permanent Installation:**
1. Set `xpinstall.signatures.required` to `false` in about:config
2. Create XPI file: `zip -r keyword-highlighter.xpi *`
3. Install from file: about:addons → gear icon → Install Add-on From File
4. Restart Firefox
5. Done!

**Settings should now:**
- ✓ Save automatically
- ✓ Persist across restarts
- ✓ Load when extension starts
