# Debug Instructions

## How to Debug the Extension

### 1. Reload the Extension
1. Go to `about:debugging#/runtime/this-firefox`
2. Find "List Navigator"
3. Click **"Reload"**
4. Refresh your web page

### 2. Open Browser Console
Press **F12** or **Ctrl+Shift+K** to open Firefox DevTools

### 3. Test Keyboard Shortcut (Ctrl+Shift+F)

**Expected Console Output:**
```
[List Navigator] Content script loaded successfully
[List Navigator] Keyboard shortcut detected
[List Navigator] showPanel called
[List Navigator] Search value: (whatever you typed)
[List Navigator] Re-running search  (if there's text)
[List Navigator] performSearch called
[List Navigator] Search params: {useSelector: false, selector: "", searchTerm: "your text"}
```

**If you DON'T see "Keyboard shortcut detected":**
- The keyboard event isn't firing
- Check if Firefox has overridden Ctrl+Shift+F
- Try clicking the extension icon instead

**If you see "Keyboard shortcut detected" but not "showPanel called":**
- The togglePanel function has an issue
- Check console for errors

### 4. Test Refresh Button

**Click the 🔄 Refresh button**

**Expected Console Output:**
```
[List Navigator] Refresh button clicked
[List Navigator] performSearch called
[List Navigator] Search params: {useSelector: false, selector: "", searchTerm: "your text"}
```

**If you DON'T see "Refresh button clicked":**
- The button click handler isn't attached
- The button element might not exist
- Check if panel is visible: `document.getElementById('job-navigator-panel')`

### 5. Test Search Functionality

**Type in the search box**

**Expected Console Output:**
```
[List Navigator] performSearch called
[List Navigator] Search params: {useSelector: false, selector: "", searchTerm: "abc"}
```

**Should see this output on EVERY keystroke**

### 6. Common Issues and Fixes

#### Issue: "Elements not initialized" error
**Cause:** Panel hasn't been created yet
**Fix:** Make sure panel is visible before trying to search

#### Issue: Keyboard shortcut does nothing
**Cause:** Firefox might be intercepting Ctrl+Shift+F
**Check:** Try clicking the extension icon instead
**Alternative:** Change keyboard shortcut in manifest.json

#### Issue: Refresh button does nothing
**Cause:** Button click handler not attached
**Debug Steps:**
1. Open console
2. Type: `document.getElementById('job-navigator-refresh')`
3. If it returns `null`, the button doesn't exist
4. If it returns an element, check if it has click listeners

#### Issue: Panel appears but search doesn't work
**Cause:** Search input not initialized
**Debug Steps:**
1. Open console
2. Type: `document.getElementById('job-navigator-search')`
3. Check if it returns the input element
4. Type: `document.getElementById('job-navigator-search').value`
5. Check if it has your search text

### 7. Manual Testing in Console

**Check if panel exists:**
```javascript
document.getElementById('job-navigator-panel')
```

**Check if panel is visible:**
```javascript
document.getElementById('job-navigator-panel').classList.contains('visible')
```

**Get refresh button:**
```javascript
document.getElementById('job-navigator-refresh')
```

**Manually trigger refresh:**
```javascript
document.getElementById('job-navigator-refresh').click()
```

**Check search input value:**
```javascript
document.getElementById('job-navigator-search').value
```

**Manually trigger search (if performSearch is defined):**
- Can't call directly since it's in IIFE closure
- Must use button clicks or keyboard events

### 8. What to Report

If something doesn't work, please report:
1. What action you took (clicked button, pressed keys, etc.)
2. What console messages you saw (or didn't see)
3. Any red error messages in console
4. Results from manual testing commands above

### 9. Quick Diagnostic Checklist

Run these in console and report results:

```javascript
// 1. Is panel created?
!!document.getElementById('job-navigator-panel')

// 2. Is panel visible?
document.getElementById('job-navigator-panel')?.classList.contains('visible')

// 3. Does refresh button exist?
!!document.getElementById('job-navigator-refresh')

// 4. Does search input exist?
!!document.getElementById('job-navigator-search')

// 5. What's in the search input?
document.getElementById('job-navigator-search')?.value

// 6. Are buttons disabled?
document.getElementById('job-navigator-prev')?.disabled
document.getElementById('job-navigator-next')?.disabled
```

Copy all the results and share them!
