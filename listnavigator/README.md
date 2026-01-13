# List Navigator - Universal Web Page Search Extension

A Firefox browser extension that lets you search and navigate through any webpage elements using CSS selectors.

## Features

- **Universal**: Works on ANY website (not just Upwork)
- **CSS Selector Based**: Target specific elements on the page
- **Auto-refresh**: Search results update when you reopen the panel
- **Smart Navigation**: Up/down arrows with wraparound
- **Visual Highlighting**: Blue outline for matches, orange for current
- **Keyboard Shortcuts**: Ctrl+Shift+F to open, Enter/Shift+Enter to navigate
- **Remembers Selector**: Your last CSS selector is saved automatically
- **Draggable Panel**: Move it anywhere on the screen

## Installation

1. Open Firefox
2. Navigate to: `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this directory
5. The extension will appear in your toolbar

## How to Use

### Step 1: Open the Panel
- Click the extension icon in your toolbar, OR
- Press **Ctrl+Shift+F**

### Step 2: Enter CSS Selector
Enter a CSS selector to target elements on the page. Examples:

**For Upwork job listings:**
```
section.air3-card-section.air3-card-hover
```

**For Reddit posts:**
```
div[data-testid="post-container"]
```

**For Amazon products:**
```
div[data-component-type="s-search-result"]
```

**For any article:**
```
article
```

**For any div with class "item":**
```
div.item
```

**Generic selectors:**
- `div.card` - All divs with class "card"
- `li` - All list items
- `.product` - All elements with class "product"
- `#main article` - All articles inside element with id "main"

### Step 3: Enter Search Text
Type what you want to find within those elements. Search is case-insensitive.

Examples:
- `less than 5` (for Upwork proposals)
- `payment verified`
- `$50`
- Any text you want to find

### Step 4: Navigate Results
- **Click "↓ Next"** or **press Enter** - Go to next match
- **Click "↑ Previous"** or **press Shift+Enter** - Go to previous match
- Results wrap around (last → first, first → last)

## Keyboard Shortcuts

- **Ctrl+Shift+F** - Toggle panel
- **Enter** - Next match
- **Shift+Enter** - Previous match
- **Escape** - Close panel

## Visual Feedback

- **Blue outline** - All matching elements
- **Orange outline** - Current focused match
- **Auto-scroll** - Current match scrolls to center of screen
- **Status display** - Shows "Match 2 of 15", etc.

## Pro Tips

### Finding the Right Selector

1. **Right-click** on an element you want to search
2. Select **Inspect Element** (Firefox DevTools opens)
3. Look at the element's classes and tags
4. Build your selector:
   - Tag name: `article`, `div`, `section`
   - Class: `.classname` or `tag.classname`
   - Multiple classes: `div.class1.class2`
   - Attribute: `div[data-id="something"]`

### Common Patterns

**Job listings sites:**
```
article.job, div.job-card, section.listing
```

**E-commerce product cards:**
```
div.product, article.item, li.result
```

**Social media posts:**
```
article[role="article"], div[data-testid="post"]
```

**Search results:**
```
div.result, li.search-result, article.listing
```

### Selector Will Be Remembered

The extension saves your last selector in localStorage, so when you:
1. Close the panel
2. Reopen it later (even on a different page)

Your selector will still be there! Just update it if you're on a different site.

## Auto-Refresh Feature

When you reopen the panel (Ctrl+Shift+F or click icon):
- If you had a previous search, it automatically re-runs
- This accounts for page content changes (new items loaded, etc.)
- Results update to reflect current page state

## Examples

### Example 1: Upwork Jobs with Few Proposals
**Selector:** `section.air3-card-section.air3-card-hover`
**Search:** `less than 5`
**Result:** Finds all job postings with fewer than 5 proposals

### Example 2: Reddit Posts Mentioning "JavaScript"
**Selector:** `div[data-testid="post-container"]`
**Search:** `javascript`
**Result:** Finds all posts mentioning JavaScript

### Example 3: Amazon Products Under $50
**Selector:** `div[data-component-type="s-search-result"]`
**Search:** `$4`
**Result:** Finds products with prices containing "$4" (including $40-49)

## Troubleshooting

**"No elements found for selector"**
- Check if your CSS selector is correct
- Open DevTools (F12) and try the selector in Console:
  ```javascript
  document.querySelectorAll('your-selector-here')
  ```

**"Invalid CSS selector"**
- Your selector has syntax errors
- Common mistakes:
  - Missing quotes: `div[class=item]` → `div[class="item"]`
  - Invalid characters

**Search returns no matches:**
- Elements exist but don't contain your search text
- Try a shorter/partial search term
- Check spelling and case (though search is case-insensitive)

**Panel doesn't appear:**
- Check extension is loaded in `about:debugging`
- Try reloading the extension
- Check browser console (F12) for errors

## Technical Details

- **Manifest Version**: 2 (Firefox compatible)
- **Permissions**: `<all_urls>`, `activeTab`
- **Storage**: Uses localStorage to remember selector
- **Compatibility**: Firefox (Manifest V2)

## Files

- `manifest.json` - Extension configuration
- `background.js` - Handles icon clicks
- `content.js` - Main extension logic
- `styles.css` - UI styling
- `icon48.png` - Extension icon

## Privacy

This extension:
- ✅ Works entirely locally (no network requests)
- ✅ No data collection
- ✅ No external dependencies
- ✅ Only stores your last CSS selector in localStorage
