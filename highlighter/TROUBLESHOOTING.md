# Extension Not Visible? Here's How to Access It

## Quick Fix: Access Settings Without the Icon

You can access the extension settings directly without needing to find the icon:

### Method 1: Through about:debugging
1. Go to `about:debugging#/runtime/this-firefox` in Firefox
2. Find "Upwork Job Highlighter" in the list
3. Click the "Inspect" button next to it
4. In the console that opens, type: `browser.runtime.openOptionsPage()`
5. Press Enter

### Method 2: Check the Overflow Menu
1. Look for the `>>` button on the right side of your Firefox toolbar
2. Click it to see hidden extensions
3. The Upwork Job Highlighter icon should be there
4. You can pin it by right-clicking and selecting "Pin to Toolbar"

### Method 3: Customize Toolbar
1. Right-click anywhere on the Firefox toolbar
2. Select "Customize Toolbar"
3. Look for the Upwork Job Highlighter icon in the available items
4. Drag it to your toolbar
5. Click "Done"

## Alternative: Use Settings Page Directly

I'm creating an updated version that adds a settings page you can access anytime by typing:
`about:addons` → Find "Upwork Job Highlighter" → Click "Preferences"

## Still Can't Find It?

If none of these work, you can still use the extension - it will work automatically on Upwork pages. To configure keywords, we'll add a simpler access method in the next update.
