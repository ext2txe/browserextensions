# Quick Start Guide - Web Workflow Toolkit

## Installation (5 minutes)

### Firefox
1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to `webworkflow-toolkit` folder
5. Select `manifest.json`
6. ✅ Extension loaded!

### Chrome/Edge/Brave
1. Open browser
2. Go to `chrome://extensions` (or `edge://extensions`, `brave://extensions`)
3. Toggle "Developer mode" ON (top-right)
4. Click "Load unpacked"
5. Select the `webworkflow-toolkit` folder
6. ✅ Extension loaded!

## First Use (2 minutes)

1. **Click the extension icon** in your toolbar
2. **Explore the 4 tabs**:
   - 🎨 Highlighter
   - 🔍 Navigator
   - 📊 Analyzer
   - ⚡ Auto Load

## Feature Examples

### 🎨 Highlighter - Find Jobs with Keywords

**Use Case**: Highlight Upwork jobs containing "$" or "urgent"

1. Open popup → Highlighter tab
2. Add keywords: `$*`, `urgent`, `immediate`
3. Add URL pattern: `*://www.upwork.com/nx/find-work/*`
4. Set element selector: `section.air3-card-section`
5. Choose highlight color (e.g., yellow `#ffff00`)
6. Click "Save Settings"
7. Go to Upwork job search
8. Press `Ctrl+Shift+,` to see settings panel
9. Jobs with those keywords will be highlighted!

### 🔍 Navigator - Search Through Lists

**Use Case**: Find all job posts mentioning "Python"

1. Go to any webpage with a list (e.g., Upwork, Reddit)
2. Press `Ctrl+Shift+N` to open Navigator
3. **Method 1 - Text Search**:
   - Uncheck "Use CSS Selector"
   - Type "Python" in search box
   - Click "Refresh"
4. **Method 2 - CSS Selector**:
   - Check "Use CSS Selector"
   - Enter selector: `article` or `div.post`
   - Type "Python" in search box
   - Click "Refresh"
5. Use `Enter` to navigate next, `Shift+Enter` for previous
6. Current match highlights in orange!

**Pro Tip**: Use color filters to ignore already-viewed items:
- Click on a viewed item
- Use browser DevTools to get its background color
- Enter that color in "Ignore matches with background color"
- Check the checkbox
- Click "Refresh"

### 📊 Analyzer - Extract Upwork Job Data

**Use Case**: Quickly analyze a job posting

1. Go to any Upwork job page (e.g., `https://www.upwork.com/jobs/~...`)
2. Press `Ctrl+Shift+A` (or click extension → Analyzer → Analyze)
3. Wait 2-3 seconds for sections to expand
4. See complete analysis panel with:
   - Job details (title, budget, description)
   - Client info (rating, reviews, spend)
   - Activity (proposals, response rate)
5. Enable "Auto-copy JSON to clipboard" to automatically get JSON data
6. Enable "Auto-display compact panel" to see summary on every job page

### ⚡ Auto Load - Load All Job Results

**Use Case**: Load all Upwork jobs until 2 days old

1. Open popup → Auto Load tab
2. Configure:
   - Button Text: `Load More Jobs`
   - Max Wait: `10000` (10 seconds)
   - Key to Press: `PageDown`
   - Stop String: `Posted 2 days ago`
3. Go to Upwork job search page
4. Click "Start" (or press `Ctrl+Shift+L`)
5. Watch it automatically:
   - Find and click "Load More" button
   - Wait for content to load
   - Scroll down
   - Repeat until "Posted 2 days ago" appears
6. Click "Stop" to halt anytime

## Keyboard Shortcuts (Memorize These!)

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+,` | Highlighter settings panel |
| `Ctrl+Shift+N` | Navigator search panel |
| `Ctrl+Shift+A` | Analyze job (Upwork only) |
| `Ctrl+Shift+L` | Auto Load settings popup |
| `Enter` | Next match (Navigator) |
| `Shift+Enter` | Previous match (Navigator) |
| `Esc` | Close Navigator |

## Pro Tips

### Highlighter
- Use `*` for wildcard (e.g., `[$*]` matches any dollar amount)
- Use `**` for multi-level wildcard in URLs
- Export settings as JSON to backup or share
- Word boundaries prevents "test" from matching "testing"

### Navigator
- Color filters stack! Use both "Ignore" and "Only Show" together
- CSS selector mode is faster for known page structures
- Text mode works on any page without knowing selectors
- Refresh after page changes (dynamic content)

### Analyzer
- Auto-expand only works on Upwork (skips on other sites)
- JSON export includes all extracted data
- Compact panel shows quick summary, full panel shows everything
- Works on any Upwork job URL format

### Auto Load
- Increase wait time if content loads slowly
- Use stop string to prevent loading too much
- Button text matching is case-insensitive
- Supports `data-test` attributes for button finding

## Common Workflows

### Workflow 1: Upwork Job Hunting
1. Set up Highlighter with keywords: `urgent`, `$*`, `immediate`, `senior`
2. Set URL pattern: `*://www.upwork.com/nx/find-work/*`
3. Go to Upwork job search
4. Use Auto Load to load all jobs (stop at "2 days ago")
5. Highlighted jobs will stand out
6. Click interesting ones
7. Press `Ctrl+Shift+A` to analyze each job
8. Review extracted data and decide

### Workflow 2: Research on Any Site
1. Press `Ctrl+Shift+N` on any list-based page
2. Enter search term (e.g., "machine learning")
3. Navigate matches with `Enter`
4. Mark viewed items differently
5. Use color filter to hide reviewed items
6. Continue searching unreviewed items

### Workflow 3: Data Collection
1. Set up Auto Load to load all content
2. Use Navigator to find specific items
3. Use Analyzer (if Upwork) to extract structured data
4. Export JSON data
5. Process externally with scripts

## Troubleshooting

**Highlighter not working?**
- Check URL pattern matches current site
- Verify element selector is correct
- Try the browser console: `document.querySelectorAll('your-selector')`

**Navigator showing "0 matches"?**
- Ensure elements exist on page
- Try text mode instead of selector mode
- Click "Refresh" after page changes

**Analyzer says "Not on Upwork page"?**
- Only works on `upwork.com/jobs/~...` URLs
- Try reloading the page
- Check you're on a job posting, not job search

**Auto Load not clicking?**
- Verify button text exactly matches
- Check browser console for errors
- Try increasing wait time
- Ensure button is visible on page

## Need Help?

- **Full Documentation**: See README.md
- **Version History**: See CHANGELOG.md
- **Technical Details**: See manifest.json and code comments

## Next Steps

1. ✅ Install extension
2. ✅ Try all 4 features with examples above
3. 📝 Customize settings for your workflow
4. ⌨️ Memorize keyboard shortcuts
5. 🚀 Boost your productivity!

---

**Happy browsing! 🎉**
