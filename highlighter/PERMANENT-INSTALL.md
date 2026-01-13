# Making the Extension Permanent

The extension currently loads as "temporary" which means it gets removed when Firefox restarts. Here are your options for making it permanent:

## Option 1: Install as Permanent Extension (Recommended for Daily Use)

### Prerequisites
- Install **Firefox Developer Edition** or **Firefox Nightly** (regular Firefox won't work for unsigned extensions)
- Download from: https://www.mozilla.org/en-US/firefox/developer/

### Steps

1. **Open Firefox Developer Edition**

2. **Enable unsigned extensions:**
   - Type `about:config` in the address bar
   - Click "Accept the Risk and Continue"
   - Search for: `xpinstall.signatures.required`
   - Double-click to set it to **false**

3. **Package the extension:**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file
   - Click "Inspect" next to the extension
   - In the console that opens, type: `browser.runtime.id`
   - Copy the ID that appears (looks like: `{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}`)

4. **Create a persistent install:**
   - Navigate to your Firefox profile folder:
     - Windows: `%APPDATA%\Mozilla\Firefox\Profiles\xxxxxxxx.default-release\extensions\`
     - Mac: `~/Library/Application Support/Firefox/Profiles/xxxxxxxx.default-release/extensions/`
     - Linux: `~/.mozilla/firefox/xxxxxxxx.default-release/extensions/`
   - Create a new folder with the extension ID as the name
   - Copy all extension files into this folder
   - Restart Firefox Developer Edition

## Option 2: Keep Using Temporary Installation (Simplest)

If you're okay with reinstalling after each Firefox restart:

### Quick Reinstall Script

Save this as a bookmark for one-click reinstall:

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the extension folder
4. Select `manifest.json`

**Settings will now persist** even with temporary installation (I fixed the storage issue in the latest version).

## Option 3: Sign and Publish (Most Permanent)

For the most permanent solution:

1. Create an account at https://addons.mozilla.org/developers/
2. Submit the extension for review
3. Once approved, it will be signed and can be installed permanently

This takes several days but works on regular Firefox.

## What Changed in This Version

✅ **Settings now persist** across Firefox restarts
- Switched from sync storage to local storage
- Added error handling and logging
- Settings are saved to your Firefox profile

The only thing that doesn't persist with temporary installation is the extension itself - but your keywords and colors will be saved!

## Checking If Settings Are Saved

To verify your settings are persisting:

1. Add some keywords and save
2. Close the settings panel
3. Go to `about:debugging#/runtime/this-firefox`
4. Click "Inspect" next to the extension
5. In the console, type: `browser.storage.local.get(['keywords', 'highlightColor'])`
6. Press Enter - you should see your saved settings

## Troubleshooting

**Settings still not saving?**
- Check the browser console (F12) for error messages
- Make sure you clicked "Save Settings" button
- Try using Firefox Developer Edition instead of regular Firefox

**Extension disappears on restart?**
- This is normal for temporary extensions
- Use Option 1 or 2 above for permanent installation
- Your settings will still be there when you reload the extension
