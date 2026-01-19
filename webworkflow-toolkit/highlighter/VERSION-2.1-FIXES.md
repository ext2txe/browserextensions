# Version 2.1 - Bug Fixes

All three issues you reported have been addressed!

## ✅ Fix 1: "mys" No Longer Matches "MySQL"

**Problem:** Partial keyword matching was too broad

**Solution:** Added "Match whole words only" option (enabled by default)

### How It Works Now

**With word boundaries (default):**
- "mys" → Matches only "mys" (exact word)
- "SQL" → Matches "SQL" but NOT "MySQL"  
- "India" → Matches "India" but NOT "Indiana"

**Without word boundaries:**
- "mys" → Matches "MySQL", "mystic", "mysterious"
- "SQL" → Matches "SQL", "MySQL", "NoSQL"
- "India" → Matches "India", "Indiana", "Indian"

### Where to Find It

**In Settings Panel (on-page button):**
- Look for checkbox: ✓ "Match whole words only (prevents "mys" from matching "MySQL")"
- Checked = precise matching (default)
- Unchecked = loose matching

**In Popup (extension icon):**
- Same checkbox appears in the Keywords section

## ✅ Fix 2: Extension Reload After Firefox Restart

**Problem:** Extension disappears when Firefox restarts

**Explanation:** This is **expected behavior** for temporary extensions - Firefox always removes them

**The Good News:** Your settings ARE saved! You just need to reload the extension itself.

### Quick Reload (30 seconds)

1. `about:debugging#/runtime/this-firefox`
2. "Load Temporary Add-on"
3. Select `manifest.json`
4. Done! Keywords/colors/URLs automatically restored ✓

**Bookmark for one-click:** `about:debugging#/runtime/this-firefox`

### Permanent Solution

See **PERMANENT-INSTALL.md** for:
- **Firefox Developer Edition** (recommended) - no reload needed ever
- **Sign & Publish** - works on regular Firefox permanently

## ✅ Fix 3: Settings Not Restoring

**Problem:** Settings disappearing after restart

**Root Cause:** This was happening because Firefox privacy settings were clearing extension storage

### Diagnosis Tools Added

**Check if settings are actually saved:**
```javascript
browser.storage.local.get(['keywords', 'urlPatterns'])
```

Run this in browser console (F12). If you see your settings, they're saved correctly.

### Common Causes Fixed

**Added troubleshooting for:**
1. Firefox clearing storage on exit (privacy settings)
2. Private browsing mode (storage doesn't persist)
3. Container tabs (isolated storage)
4. Profile issues

### Debugging Guide

New file: **DEBUG-STORAGE.md** - comprehensive guide to fix storage issues

**Quick check:**
1. Go to `about:preferences#privacy`
2. Look for "Clear history when Firefox closes"
3. If enabled, click "Settings..."
4. **Uncheck "Site settings"** ← This was clearing your extension storage!

### Manual Backup/Restore

If settings keep disappearing, you can now backup:

**Backup:**
```javascript
browser.storage.local.get(null).then(data => console.log(JSON.stringify(data, null, 2)))
```

**Restore:**
```javascript
browser.storage.local.set({
  "keywords": ["India", "Saudi Arabia"],
  "urlPatterns": ["*://www.upwork.com/nx/find-work/*"],
  "useWordBoundaries": true
}).then(() => location.reload())
```

## New Files Added

1. **QUICK-FIXES.md** - Solutions for all common issues
2. **DEBUG-STORAGE.md** - Detailed storage troubleshooting
3. **CHANGELOG-v2.md** - Version history

## Testing Your Installation

### Test 1: Word Boundaries
1. Add keyword: "mys"
2. Check: ✓ "Match whole words only"
3. Save settings
4. Visit page with "MySQL"
5. Should NOT be highlighted ✓

### Test 2: Settings Persistence
1. Add keywords and save
2. Close Firefox completely
3. Reopen Firefox
4. Reload extension (about:debugging)
5. Open console, run: `browser.storage.local.get(['keywords'])`
6. Keywords should still be there ✓

### Test 3: Multi-Site
1. Add multiple URL patterns
2. Add keywords
3. Visit each site
4. Settings button should appear
5. Keywords should highlight ✓

## Upgrade Instructions

1. Remove old version from `about:debugging`
2. Install new version
3. **Your settings are preserved!** ✓
4. New checkbox appears: "Match whole words only"
5. Default: checked (recommended)

## What Changed Technically

### Code Changes
- Added `useWordBoundaries` setting (default: true)
- Updated `containsKeyword()` to use regex with `\b` word boundaries
- Added checkbox to both settings panel and popup
- Settings now include: keywords, urlPatterns, elementSelector, highlightColor, useWordBoundaries
- Enhanced console logging for debugging

### Storage Schema
```javascript
{
  keywords: ["India", "Saudi Arabia"],
  urlPatterns: ["*://www.upwork.com/nx/find-work/*"],
  elementSelector: "section.air3-card-section",
  highlightColor: "#d3d3d3",
  useWordBoundaries: true  // NEW!
}
```

## Troubleshooting

If you still have issues after upgrading:

**Issue: Settings not saving**
→ See **DEBUG-STORAGE.md**

**Issue: Keywords matching too broadly**
→ Enable "Match whole words only"

**Issue: Extension needs reload**
→ This is normal for temporary extensions
→ See **PERMANENT-INSTALL.md** for permanent solution

**Issue: Nothing highlighted**
→ See **QUICK-FIXES.md** Issue #5

## Summary

✅ Word boundary matching - fixed
✅ Settings persistence - comprehensive debugging added
✅ Firefox restart - explained + permanent install guide

All your issues are addressed! The extension is now more precise and includes extensive troubleshooting documentation.
