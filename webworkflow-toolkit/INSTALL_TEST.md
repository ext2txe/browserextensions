# Installation & Testing Guide

## Quick Install & Test (5 Minutes)

### Step 1: Install in Firefox

```bash
# 1. Open Firefox
# 2. Navigate to: about:debugging#/runtime/this-firefox
# 3. Click "Load Temporary Add-on"
# 4. Navigate to: C:\Users\joe\source\repos\browserextensions\webworkflow-toolkit
# 5. Select: manifest.json
# 6. ✅ Extension loaded!
```

### Step 2: Verify Installation

1. Look for the extension icon in your toolbar (colorful icon)
2. Click the icon → Should see tabbed popup with 4 tabs
3. Check browser console (F12) for any errors
4. You should see: `[Web Workflow Toolkit] Background script loaded`

### Step 3: Test Each Feature (1 minute each)

#### Test 1: Highlighter 🎨
```
1. Click extension icon → Highlighter tab
2. Add keyword: "test"
3. Add URL pattern: "*"
4. Click "Save Settings"
5. Go to any webpage with the word "test"
6. Press Ctrl+Shift+,
7. ✅ Settings panel should appear
8. ✅ Words containing "test" should be highlighted
```

#### Test 2: Navigator 🔍
```
1. Go to reddit.com or any page with lists
2. Press Ctrl+Shift+N
3. ✅ Navigator panel should appear at top-right
4. Uncheck "Use CSS Selector"
5. Type any word in search box
6. Click "Refresh"
7. ✅ Should show "Match 1 of X"
8. Press Enter
9. ✅ Should navigate to next match
```

#### Test 3: Analyzer 📊
```
1. Go to: https://www.upwork.com/jobs/
2. Click any job posting
3. Wait for page to load
4. Press Ctrl+Shift+A
5. ✅ Should see "Analyzing..." notification
6. Wait 2-3 seconds
7. ✅ Analysis panel should appear with job data
```

#### Test 4: Auto Load ⚡
```
1. Go to any page with "Load More" button
2. Click extension icon → Auto Load tab
3. Enter button text (e.g., "Load More", "Show More")
4. Set wait time: 5000
5. Key to Press: PageDown
6. Leave stop string empty
7. Click "Start"
8. ✅ Should automatically click button and load content
9. Click "Stop" to halt
```

## Detailed Testing Checklist

### ✅ Popup UI Tests

- [ ] Popup opens when clicking extension icon
- [ ] All 4 tabs visible and labeled correctly
- [ ] Tab switching works smoothly
- [ ] All input fields visible and functional
- [ ] Buttons have proper styling
- [ ] Status messages appear at bottom
- [ ] Popup width is 500px (not too wide/narrow)

### ✅ Highlighter Tests

**Settings:**
- [ ] Can add keywords (Enter key works)
- [ ] Can remove keywords (× button)
- [ ] Can clear all keywords
- [ ] Can add URL patterns
- [ ] Can remove URL patterns
- [ ] Color picker changes color
- [ ] Word boundaries checkbox toggles
- [ ] Save button shows success message

**Functionality:**
- [ ] Keywords highlight on matching pages
- [ ] URL patterns filter pages correctly
- [ ] Element selector targets correct elements
- [ ] Ctrl+Shift+, opens settings panel
- [ ] Settings panel is draggable
- [ ] Wildcard matching works (`$*` matches `$500`)
- [ ] Export creates JSON file
- [ ] Import loads settings from JSON

### ✅ Navigator Tests

**Panel:**
- [ ] Ctrl+Shift+N opens/closes panel
- [ ] Panel appears at top-right
- [ ] Panel is draggable
- [ ] Close button (×) works
- [ ] Esc key closes panel

**Search:**
- [ ] CSS selector mode finds elements
- [ ] Text search mode finds text
- [ ] Refresh button updates results
- [ ] Match counter shows "X of Y"
- [ ] "Ignored" count displays correctly

**Navigation:**
- [ ] Enter goes to next match
- [ ] Shift+Enter goes to previous match
- [ ] Wraparound works (last → first)
- [ ] Current match highlights in orange
- [ ] Other matches highlight in blue
- [ ] Page scrolls to center match

**Color Filters:**
- [ ] Can select ignore color
- [ ] Ignore checkbox filters matches
- [ ] Can select "only show" color
- [ ] Only show checkbox filters matches
- [ ] Both filters can work together

### ✅ Analyzer Tests

**Basic:**
- [ ] Ctrl+Shift+A triggers analysis
- [ ] Only works on Upwork job pages
- [ ] Shows error on non-Upwork pages
- [ ] Expands "View more" sections automatically

**Data Extraction:**
- [ ] Job title extracted correctly
- [ ] Budget extracted correctly
- [ ] Description visible
- [ ] Client rating/reviews shown
- [ ] Proposals count shown
- [ ] Skills list displayed

**Options:**
- [ ] Auto-export JSON checkbox saves setting
- [ ] Auto-export copies JSON to clipboard
- [ ] Auto-display compact checkbox saves setting
- [ ] Auto-display shows panel on page load

**Panels:**
- [ ] Compact panel appears in corner
- [ ] Detailed panel appears center
- [ ] Both panels are draggable
- [ ] Close buttons work
- [ ] Panels don't overlap incorrectly

### ✅ Auto Load Tests

**Settings:**
- [ ] Button text input saves
- [ ] Max wait input saves (number only)
- [ ] Key press dropdown works
- [ ] Stop string input saves
- [ ] Settings persist across popups

**Functionality:**
- [ ] Finds button by text
- [ ] Clicks button automatically
- [ ] Waits for content to load
- [ ] Presses configured key after click
- [ ] Stops when stop string appears
- [ ] Click counter increments
- [ ] Status updates in real-time
- [ ] Stop button halts automation
- [ ] Ctrl+Shift+L toggles (if mapped)

### ✅ Cross-Feature Tests

**No Conflicts:**
- [ ] Multiple panels can be open simultaneously
- [ ] Highlighter + Navigator work together
- [ ] Analyzer + Navigator work together
- [ ] All draggable panels have different z-indexes
- [ ] No ID/class name conflicts

**Storage:**
- [ ] Highlighter settings persist (reload page)
- [ ] Navigator settings persist (per-page)
- [ ] Analyzer settings persist
- [ ] Auto Load settings persist
- [ ] Settings survive browser restart (Firefox temp addon doesn't persist)

**Keyboard Shortcuts:**
- [ ] Ctrl+Shift+, works (Highlighter)
- [ ] Ctrl+Shift+N works (Navigator)
- [ ] Ctrl+Shift+A works (Analyzer)
- [ ] Ctrl+Shift+L works (Auto Load)
- [ ] No conflicts with browser shortcuts
- [ ] No conflicts with webpage shortcuts

### ✅ Browser Compatibility

**Firefox:**
- [ ] Loads without errors
- [ ] All features work
- [ ] Console shows no errors
- [ ] Popup renders correctly

**Chrome/Chromium:**
- [ ] Loads without warnings
- [ ] Service worker registered
- [ ] All features work
- [ ] Popup renders correctly

## Common Issues & Solutions

### Issue: Extension doesn't load

**Solution:**
```
1. Check browser console for errors (F12)
2. Verify all files present in directory
3. Check manifest.json syntax (use jsonlint.com)
4. Try reloading extension in browser
```

### Issue: Popup doesn't open

**Solution:**
```
1. Right-click extension icon → Inspect Popup
2. Check console for errors
3. Verify popup.html path in manifest
4. Check popup.js for syntax errors
```

### Issue: Content script not loading

**Solution:**
```
1. Refresh the webpage
2. Check content.js file size (should be ~85KB)
3. Look for console errors on page
4. Verify content_scripts in manifest
5. Check permissions in manifest
```

### Issue: Keyboard shortcuts not working

**Solution:**
```
1. Check browser's keyboard shortcuts settings
2. Look for conflicts with other extensions
3. Try different key combinations
4. Check manifest.json "commands" section
5. Verify background.js is running
```

### Issue: Features don't work on specific sites

**Solution:**
```
1. Check if site blocks content scripts
2. Verify host_permissions in manifest
3. Look for CSP (Content Security Policy) errors
4. Try on a different website
```

## Performance Testing

### Memory Usage
```
1. Open Task Manager / Activity Monitor
2. Find browser process
3. Load extension
4. Open multiple tabs with extension active
5. ✅ Should use < 50MB additional memory
```

### Load Time
```
1. Clear browser cache
2. Reload page with extension
3. Check Network tab (F12)
4. ✅ Content script should load in < 100ms
5. ✅ Popup should open in < 50ms
```

### CPU Usage
```
1. Open heavy webpage (lots of elements)
2. Activate Navigator search
3. Check CPU usage
4. ✅ Should not spike above 20%
```

## Debugging Tips

### View Content Script Logs
```
F12 → Console → Filter: "[Web Workflow Toolkit]"
```

### View Background Script Logs
```
about:debugging → This Firefox → Web Workflow Toolkit → Inspect
```

### View Popup Logs
```
Right-click extension icon → Inspect Popup → Console
```

### Check Storage
```javascript
// Firefox console:
browser.storage.local.get().then(console.log)
browser.storage.sync.get().then(console.log)

// Check localStorage (Navigator settings):
Object.keys(localStorage).filter(k => k.startsWith('ww-'))
```

### Verify Message Passing
```javascript
// In content script console:
browser.runtime.sendMessage({ action: 'test' })

// Should log in background script
```

## Final Checklist Before Use

- [ ] Extension installed successfully
- [ ] Popup opens and all tabs work
- [ ] Tested at least one feature from each tab
- [ ] No console errors
- [ ] Keyboard shortcuts memorized
- [ ] Read QUICK_START.md for examples
- [ ] Bookmarked README.md for reference

## Success Criteria

✅ **All 4 features functional**
✅ **No JavaScript errors in console**
✅ **All keyboard shortcuts work**
✅ **Popup UI renders correctly**
✅ **Settings save and persist**
✅ **No conflicts between features**

---

**Ready to use! 🎉**

For detailed usage examples, see QUICK_START.md
For full documentation, see README.md
