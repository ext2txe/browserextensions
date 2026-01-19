# Firefox Installation Guide

## Problem Solved
Your extension wasn't working because **styles.css** and **icon48.png** were missing! These files have now been created.

## Current Files (All Required Files Present)
- ✅ `manifest.json` - Firefox Manifest V2
- ✅ `background.js` - Firefox-compatible background script
- ✅ `content.js` - Test version with alerts
- ✅ `styles.css` - UI styles (NOW CREATED)
- ✅ `icon48.png` - Extension icon (NOW CREATED)

## Installation Steps

### 1. Open Firefox Extension Debugging
- Open Firefox
- Type in address bar: `about:debugging#/runtime/this-firefox`
- Press Enter

### 2. Load the Extension
- Click **"Load Temporary Add-on..."** button
- Navigate to: `C:\Users\joe\source\repos\browserextensions\listnavigator`
- Select **manifest.json**
- Click **Open**

### 3. Verify Installation
You should see:
- Extension name: **"Job List Navigator"**
- Status: Active/Running
- Purple icon in your extensions toolbar

## Testing the Extension

### Test 1: Go to Upwork
- Navigate to: https://www.upwork.com/nx/find-work/
- **Expected:** Alert appears saying "Job Navigator test version loaded successfully!"
- If you see this alert, the extension is working!

### Test 2: Click Extension Icon
- Click the purple Job List Navigator icon in your toolbar
- **Expected:** Alert appears saying "Extension icon was clicked!"

### Test 3: Keyboard Shortcut
- Press: **Ctrl+Shift+F**
- **Expected:** Alert appears saying "Keyboard shortcut detected!"

### Test 4: Job Detection
- After page loads completely (wait ~1 second)
- **Expected:** Alert appears saying "Found X job sections on this page"

## What to Check if Still Not Working

### Firefox Console (F12)
1. Press **F12** or **Ctrl+Shift+K**
2. Click **Console** tab
3. Look for messages starting with `[TEST VERSION]`
4. Look for any red error messages

### Extension Console
1. Go back to `about:debugging#/runtime/this-firefox`
2. Find "Job List Navigator" in the list
3. Click **"Inspect"** button
4. Check console for errors

### Common Issues

**No alerts appear:**
- Check you're on `*.upwork.com/*` URL
- Check Firefox console for errors
- Try reloading the page (Ctrl+R)

**Extension not in list:**
- Check all 5 files are present in folder
- Check manifest.json has no syntax errors
- Try removing and re-adding the extension

**Icon not showing:**
- Extension is loaded but icon might be in overflow menu
- Click the puzzle piece icon in toolbar
- Pin "Job List Navigator" to toolbar

## Next Steps

Once the test version works (you see all 4 alerts), you can switch to the full version:

1. Replace `content.js` with the full version (ask Claude)
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Reload** button next to your extension
4. Test the full search and navigation features

## Important Note

Temporary extensions are **removed when Firefox closes**. You'll need to reload it each time you start Firefox. To make it permanent, you'll need to sign it through Mozilla's Add-on Developer Hub (more complex process).
