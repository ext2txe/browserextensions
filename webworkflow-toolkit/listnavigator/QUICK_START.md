# Quick Start - List Navigator

## Simple Mode (Like Ctrl+F, but Better!)

1. **Open the panel**: Press **Ctrl+Shift+F** or click the extension icon
2. **Type what you want to find**: Just start typing in the search box
3. **Navigate**: Press **Enter** to go to next match, **Shift+Enter** for previous
4. **That's it!** Works just like Ctrl+F but shows you "Match 2 of 15" and lets you navigate with arrows

## Default Behavior

- **Checkbox is OFF by default** = Simple search mode
- Searches ALL text on the page
- Just like standard Find, but with navigation buttons
- Shows match count (e.g., "Found 124 matches")

## Advanced Mode (Optional)

If you want to search only specific elements:

1. **Check the box**: "Use CSS Selector (advanced)"
2. **Enter a selector**: For example:
   - Upwork jobs: `section.air3-card-section.air3-card-hover`
   - Reddit posts: `div[data-testid="post-container"]`
   - Any article: `article`
3. **Search**: Only searches within those specific elements

## Examples

### Example 1: Find "less than 5" on Upwork (Simple Mode)
1. Go to Upwork job search page
2. Press Ctrl+Shift+F
3. Type: `less than 5`
4. Press Enter to jump through matches
5. ✅ Finds it anywhere on the page

### Example 2: Find "less than 5" ONLY in job cards (Advanced Mode)
1. Check "Use CSS Selector"
2. Selector: `section.air3-card-section.air3-card-hover`
3. Search: `less than 5`
4. Press Enter to jump through matches
5. ✅ Only highlights job cards, ignores other text

### Example 3: Find any text on any page
1. Go to ANY website
2. Press Ctrl+Shift+F
3. Type anything you want to find
4. Navigate with Enter/Shift+Enter
5. ✅ Works everywhere!

## Why Use This Instead of Ctrl+F?

Standard Ctrl+F:
- ❌ No match counter ("2 of 124")
- ❌ Can't navigate with buttons
- ❌ No visual outline of matches
- ❌ Can't limit search to specific sections

List Navigator:
- ✅ Shows "Match 2 of 124"
- ✅ Click arrows OR press Enter/Shift+Enter
- ✅ Blue/orange highlights on matches
- ✅ Optional: Search only specific elements
- ✅ Auto-scrolls to center of screen
- ✅ Remembers your settings

## Keyboard Shortcuts

- **Ctrl+Shift+F** - Open/close panel
- **Enter** - Next match
- **Shift+Enter** - Previous match
- **Escape** - Close panel

## Settings Are Remembered

- Last search text: Saved
- Selector mode on/off: Saved
- Last CSS selector: Saved

So you can close the panel and reopen it later with everything preserved!

## Tips

- **Start simple**: Leave checkbox unchecked, just search
- **Use advanced mode** when you want to search only specific sections
- **Drag the panel**: Click and drag the purple header to move it
- **Re-run search**: Close and reopen panel (Ctrl+Shift+F twice) to update results after page changes
