# Testing Instructions

## Step 1: Reload the Extension

After making the fixes, you need to reload:

1. Go to `about:debugging#/runtime/this-firefox`
2. Find "Upwork Job Post Analyzer"
3. Click **"Reload"** button
4. Check for any errors in the console

## Step 2: Test on Sample HTML File

1. Open `sample/upwork_sample_job.htm` in Firefox
2. Open Developer Tools (F12) and go to Console tab
3. Try **both methods**:

### Method A: Hotkey
- Press `Ctrl+Shift+A`
- Look for console message: `[Upwork Analyzer] Received message: {action: "analyze"}`
- Panel should appear

### Method B: Extension Icon
- Click extension icon in toolbar
- Click "🔍 Analyze Current Job"
- Panel should appear

## Step 3: Check Console for Errors

If it still doesn't work, check the console for these messages:

✅ **Good messages:**
```
[Upwork Analyzer] Content script loaded
[Upwork Analyzer] Received message: {action: "analyze"}
[Upwork Analyzer] Starting analysis...
[Upwork Analyzer] Expanding sections...
[Upwork Analyzer] Analysis complete: {classification: "", ...}
```

❌ **Error messages to report:**
- Any red error messages
- "Receiving end does not exist"
- "Could not establish connection"

## Step 4: Test on Live Upwork (Optional)

1. Go to any Upwork job page (e.g., https://www.upwork.com/jobs/)
2. Click on any job posting
3. Press `Ctrl+Shift+A`
4. Panel should appear with extracted data

## Common Issues

### "Receiving end does not exist"
- **Fixed!** The extension now auto-injects the content script if needed
- Reload the extension after updating files

### Hotkey doesn't work
- Check Firefox shortcuts: `about:addons` → ⚙️ → Manage Extension Shortcuts
- Verify `Ctrl+Shift+A` is assigned to "Analyze current Upwork job post"
- Try clicking the extension icon instead

### Panel doesn't appear
- Open Console (F12) and look for error messages
- Ensure you're on an Upwork page or the sample HTML file
- Try reloading the page

## What Changed (Fixes Applied)

1. ✅ Broadened content script matching from `*://*.upwork.com/*/jobs/*` to `*://*.upwork.com/*`
2. ✅ Added auto-injection of content script if not already loaded
3. ✅ Added proper message response handling
4. ✅ Made job detection more flexible (allows file:// protocol for testing)
5. ✅ Added `<all_urls>` permission for better compatibility
6. ✅ Changed `run_at` from `document_idle` to `document_end`

## Next Steps

After testing works:
1. Test JSON copy/export buttons
2. Test dragging the panel
3. Test "Toggle Details" for job history
4. Verify all data fields are extracted correctly
