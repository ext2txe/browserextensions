# Quick Setup Guide

## Step 1: Generate Icons

1. Open `icons/generate-icons.html` in your browser
2. Click **"Download All Icons"**
3. Save the three files in the `icons/` folder:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-96.png`

## Step 2: Load Extension in Firefox

1. Open Firefox
2. Type `about:debugging` in the address bar
3. Click **"This Firefox"** in the left sidebar
4. Click **"Load Temporary Add-on..."**
5. Navigate to this folder and select `manifest.json`
6. The extension is now loaded! 🎉

## Step 3: Test the Extension

### Option A: Test on Sample File
1. Open `sample/upwork_sample_job.htm` in Firefox
2. Press `Ctrl+Shift+A` (or click the extension icon)
3. Verify the analysis panel appears with extracted data

### Option B: Test on Live Upwork
1. Go to any Upwork job post (e.g., browse jobs on upwork.com)
2. Press `Ctrl+Shift+A`
3. Watch it auto-expand "View more" sections
4. Review the extracted data

## Step 4: Use the Extension

### Hotkey Method (Fastest)
- Press `Ctrl+Shift+A` on any Upwork job page

### Icon Click Method
- Click the extension icon in toolbar
- Click "Analyze Current Job"

## Features to Try

✅ **Copy JSON** - Click 📋 button to copy data to clipboard
✅ **Export JSON** - Click 💾 button to download as file
✅ **Toggle Details** - Click 📊 button to show/hide job history table
✅ **Classification** - Type in the classification field (for future automation)
✅ **Drag Panel** - Click and drag the panel header to reposition

## Next Steps

- Review the extracted data structure in JSON format
- Define your classification criteria (Save/Review/Discard)
- Plan integration with job navigator system

## Troubleshooting

**Panel doesn't appear?**
- Check you're on an Upwork job post URL (contains `/jobs/`)
- Open Developer Tools (F12) and check Console for errors

**Hotkey doesn't work?**
- Try clicking the extension icon instead
- Check `about:addons` → ⚙️ → Manage Extension Shortcuts

**Data missing?**
- Wait for page to fully load before analyzing
- Some clients may have incomplete profiles

---

For full documentation, see `README.md`
