# Quick Fixes for Common Issues

## Issue 1: "mys" Matches "MySQL" ❌

**Problem:** Partial keyword matching - "mys" highlights "MySQL", "mystic", etc.

**Solution:** Enable "Match whole words only"

1. Open extension settings
2. Check the box: ✓ "Match whole words only"
3. Click "Save Settings"

Now "mys" will NOT match "MySQL" - it only matches the exact word "mys"

**Examples:**
- ✓ With word boundaries: "India" matches "India" but NOT "Indiana"
- ✓ With word boundaries: "SQL" matches "SQL" but NOT "MySQL"
- ✗ Without word boundaries: "India" matches both "India" AND "Indiana"

## Issue 2: Extension Needs Reload After Firefox Restart 🔄

**Why:** Temporary extensions are removed when Firefox closes

**Quick Solution:** This is expected behavior for temporary extensions. Settings ARE saved, you just need to reload the extension itself.

### 30-Second Reload Process

1. Open: `about:debugging#/runtime/this-firefox`
2. Click: "Load Temporary Add-on"
3. Select: `manifest.json`
4. Done! Your keywords are still there ✓

**Bookmark this for one-click access:**
```
about:debugging#/runtime/this-firefox
```

### Permanent Solution

See **PERMANENT-INSTALL.md** for:
- Firefox Developer Edition setup (no reload needed)
- Extension signing (works on regular Firefox)

## Issue 3: Settings Not Restoring 💾

**This is a BUG if it happens!** Settings should persist automatically.

### Quick Diagnosis

Open Console (F12) and run:
```javascript
browser.storage.local.get(['keywords', 'urlPatterns'])
```

**Expected:** Your settings appear
**Problem:** Empty {} or error

### Likely Causes

1. **Privacy Settings Clearing Storage**
   - Go to `about:preferences#privacy`
   - Under "Clear history when Firefox closes"
   - Uncheck "Site settings" ← This clears extension storage!

2. **Private Browsing Mode**
   - Extension storage doesn't persist in private windows
   - Use normal windows

3. **Container Tabs**
   - Storage might be isolated per container
   - Use same container or avoid containers

### Manual Settings Restore

If settings keep disappearing, backup and restore manually:

**Save your settings:**
```javascript
browser.storage.local.get(null).then(data => console.log(JSON.stringify(data, null, 2)))
```
Copy the output to a text file.

**Restore settings:**
```javascript
browser.storage.local.set({
  "keywords": ["India", "Saudi Arabia"],
  "urlPatterns": ["*://www.upwork.com/nx/find-work/*"],
  "highlightColor": "#d3d3d3",
  "elementSelector": "section.air3-card-section",
  "useWordBoundaries": true
}).then(() => location.reload())
```

See **DEBUG-STORAGE.md** for detailed debugging steps.

## Issue 4: Settings Button Not Appearing 🔘

**Cause:** URL doesn't match configured patterns

**Solution:**

1. Click extension icon in toolbar (or use popup via `about:addons`)
2. Check your "Active URL Patterns"
3. Make sure current page URL matches one of them
4. Add pattern if needed: `*://www.example.com/*`
5. Save and reload page

**Example:**
- You're on: `https://www.linkedin.com/jobs/search/`
- Pattern needed: `*://www.linkedin.com/jobs/*` ✓
- Or broader: `*://www.linkedin.com/*` ✓

## Issue 5: Nothing Gets Highlighted 🎨

**Causes & Solutions:**

### Cause A: Element Selector Wrong
1. Open settings
2. Click "Test Selector" button
3. If no orange borders appear, selector is wrong
4. Inspect page to find correct selector
5. Try: `article, section, .card, .item`

### Cause B: Keywords Don't Match
1. Check spelling
2. Check case (shouldn't matter, but verify)
3. Try shorter, more generic keywords
4. Disable "whole word matching" temporarily to test

### Cause C: Extension Not Running
1. Check console for: "Extension enabled on this page: true"
2. If false, URL doesn't match patterns
3. Add correct URL pattern

## Issue 6: Too Many Things Highlighted 🌈

**Problem:** Generic keywords matching everywhere

**Solutions:**

1. **Use more specific keywords**
   - Instead of: "test"
   - Use: "software testing engineer"

2. **Enable word boundaries**
   - ✓ "Match whole words only"
   - Prevents partial matches

3. **Narrow element selector**
   - Instead of: `article, section, div`
   - Use: `.job-card, .listing-item`

## Issue 7: Slow Performance 🐌

**Cause:** Watching too many elements or too many sites

**Solutions:**

1. **Narrow URL patterns**
   - Instead of: `*://www.example.com/*`
   - Use: `*://www.example.com/jobs/*`

2. **Specific element selector**
   - Instead of: `div, article, section`
   - Use: `.job-card-container`
   - Fewer elements = faster

3. **Fewer keywords**
   - Each keyword is checked against each element
   - Keep keyword list focused

## Still Having Issues?

1. Check **DEBUG-STORAGE.md** for storage issues
2. Check **TROUBLESHOOTING.md** for general issues
3. Open browser console (F12) and look for errors
4. Check extension console in `about:debugging`

## One-Line Fixes

### Reload Extension
```
about:debugging#/runtime/this-firefox
```

### Check Storage
```javascript
browser.storage.local.get(null).then(d => console.log(d))
```

### Force Settings Reload
```javascript
location.reload()
```

### Clear All Settings (start fresh)
```javascript
browser.storage.local.clear().then(() => console.log('Cleared!'))
```
