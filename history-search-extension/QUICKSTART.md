# Quick Start Guide

## Step 1: Generate Icons

1. Open `generate-icons.html` in Firefox
2. Click each download button
3. Save all 4 icons in the `icons/` folder

## Step 2: Install Extension

1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox" 
4. Click "Load Temporary Add-on"
5. Select `manifest.json` from this folder

## Step 3: Use It

1. Click the extension icon in your toolbar (or press Ctrl+Shift+Y if configured)
2. The sidebar opens on the right
3. Enter your search criteria:
   - **Domain**: e.g., `udemy.com`
   - **URL contains**: e.g., `wordpress`
   - **Mode**: AND (all must match) or OR (any can match)
4. Click "Search History"

## Example: Find Udemy WordPress Courses

```
Domain: udemy.com
URL contains: wordpress
Mode: AND
[Search History]
```

Result: All your Udemy visits that have "wordpress" in the URL.

## Features

- ✓ Domain filtering
- ✓ URL pattern matching (with regex support)
- ✓ Title search
- ✓ Date range filtering
- ✓ AND/OR logic
- ✓ Sort by date/title/domain
- ✓ Export to CSV
- ✓ Save & load searches

## Tips

- Save frequently used searches with the bookmark icon
- Export results for analysis in Excel/Sheets
- Use regex for powerful pattern matching
- Check "Use regex pattern" for patterns like `course-\d+`

See `README.md` for full documentation.
