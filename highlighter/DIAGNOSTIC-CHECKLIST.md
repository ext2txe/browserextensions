# Settings Not Restoring - Diagnostic Checklist

## Current Situation

You have Firefox Developer Edition and:
- ❌ Restart does NOT reload extension automatically
- ❌ Manual reload does NOT restore settings

This means the extension is still installed as **temporary**.

---

## Immediate Diagnostic Steps

### Step 1: Check Installation Type

1. Open Firefox Developer Edition
2. Go to: `about:addons`
3. Find "Keyword Highlighter"
4. Look at the details

**If you see:**
- "This is a temporary extension" → Still temporary, needs permanent install
- No such message → Installed permanently ✓

### Step 2: Check Console Logs

1. Go to a page where extension should work (e.g., Upwork)
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for messages starting with `[Keyword Highlighter]`

**You should see:**
```
[Keyword Highlighter] Extension initializing...
[Keyword Highlighter] Loading settings from storage...
[Keyword Highlighter] Storage read successful!
[Keyword Highlighter] Loaded settings: {keywords: [...], ...}
```

**If you see:**
- No messages at all → Extension not loading
- Error messages → There's a problem (copy the errors)
- Empty storage `{keywords: []}` → Settings not saved

### Step 3: Manual Storage Check

In the console (F12), type this:

```javascript
browser.storage.local.get(null).then(data => {
    console.log("=== ALL STORAGE DATA ===");
    console.log(data);
    console.log("Number of keys:", Object.keys(data).length);
});
```

**Expected result:**
You should see your keywords, urlPatterns, etc.

**If empty:**
Settings were never saved or were cleared.

---

## Fix 1: Install Permanently

Since you're using Firefox Developer Edition, you can install unsigned extensions permanently.

### Quick Install Steps

**Option A: Enable about:config + Install XPI**

1. `about:config` → Set `xpinstall.signatures.required` to `false`
2. Create XPI file:
   ```bash
   cd upwork-highlighter
   zip -r ../keyword-highlighter.xpi *
   ```
3. `about:addons` → Gear icon → Install Add-on From File
4. Select the .xpi file
5. Restart Firefox

**Option B: Use the script**

```bash
chmod +x create-xpi.sh
./create-xpi.sh
```

Then install the resulting .xpi file.

See **FIREFOX-DEVELOPER-INSTALL.md** for detailed instructions.

---

## Fix 2: Force Save Test Settings

If installation is permanent but settings still don't save:

### Test Save

1. Open Developer Tools (F12)  
2. Go to Console
3. Run this:

```javascript
await browser.storage.local.set({
    keywords: ["TEST", "India", "Saudi Arabia"],
    urlPatterns: ["*://www.upwork.com/nx/find-work/*"],
    highlightColor: "#ffeb3b",
    elementSelector: "section.air3-card-section",
    useWordBoundaries: true
});

console.log("Saved! Verifying...");

const data = await browser.storage.local.get(null);
console.log("Storage now contains:", data);
```

### Test Load

1. Reload the page
2. Open console
3. Check if the logs show your TEST keyword:
   ```
   [Keyword Highlighter] Loaded settings: {keywords: ["TEST", ...], ...}
   ```

If you see your TEST keyword, storage is working!

---

## Fix 3: Clear and Reinstall

If settings are corrupted:

### Complete Reset

1. Remove extension completely
2. Clear storage:
   ```javascript
   browser.storage.local.clear()
   ```
3. Close Firefox
4. Reopen Firefox
5. Reinstall extension permanently
6. Configure settings fresh

---

## Debugging Output

After following the steps above, please provide:

**1. Installation Type:**
From `about:addons` - is it temporary or permanent?

**2. Console Logs:**
Copy all messages starting with `[Keyword Highlighter]`

**3. Storage Check:**
Output from: `browser.storage.local.get(null)`

**4. Error Messages:**
Any errors in the console

**5. Test Results:**
Did the manual save/load test work?

---

## Expected Behavior After Permanent Install

✓ Extension appears in `about:addons`
✓ Extension loads automatically on Firefox start
✓ Settings persist across restarts
✓ No "temporary extension" warning
✓ Console shows: "Loaded settings: {keywords: [...]}"

---

## Common Mistakes

### Mistake 1: Still Using Temporary Install
**Symptom:** Need to reload after every restart
**Fix:** Install permanently (see above)

### Mistake 2: Not Setting about:config
**Symptom:** Can't install unsigned extension
**Fix:** Set `xpinstall.signatures.required` to `false`

### Mistake 3: Settings Not Clicked "Save"
**Symptom:** Settings disappear
**Fix:** Always click "Save Settings" button

### Mistake 4: Wrong Profile
**Symptom:** Extension works, then disappears
**Fix:** Always use the same Firefox profile

---

## Next Steps

1. ✓ Verify installation type (temporary vs permanent)
2. ✓ Check console logs
3. ✓ Check storage contents
4. ✓ If temporary: Install permanently
5. ✓ If permanent: Run storage tests
6. ✓ Report findings

Please run through these steps and report what you find!
