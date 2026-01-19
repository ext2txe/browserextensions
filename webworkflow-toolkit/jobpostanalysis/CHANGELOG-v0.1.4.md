# Changelog v0.1.4

## What's New

### ✅ Fixed Issues

1. **Hotkey Now Works!**
   - Added fallback direct keyboard listener
   - `Ctrl+Shift+V` now triggers analysis reliably
   - Works even if Firefox command API doesn't fire
   - Console log confirms: "Keyboard shortcut triggered directly"

2. **Minimize/Restore Panel**
   - New minimize button (─) next to close button
   - Click to minimize: hides content and footer
   - Minimized panel shows only header bar (250px wide)
   - Click again (□) to restore full panel
   - Great for keeping panel available while viewing job page

### 📝 Enhanced Features

1. **Job History with Links**
   - **Job titles** are now clickable links (opens in new tab)
   - **Freelancer names** are now clickable links (opens in new tab)
   - Links styled in Upwork green (#14a800)
   - Hover shows underline effect

2. **Hourly Rate in Job History**
   - New "Hourly Rate" column in job history table
   - Shows hourly rate for hourly jobs
   - Shows "-" for fixed-price jobs
   - Useful for classification logic

3. **Better Data Extraction**
   - Captures both `jobUrl` and `freelancerUrl` from history
   - Extracts hourly rate separately from amount
   - More robust URL extraction

## Visual Changes

### Panel Header
```
Job Post Analysis v0.1.4  [─] [×]
```
- Version number displayed
- Minimize button (─)
- Close button (×)

### Minimized State
```
Job Post Analysis v0.1.4  [□] [×]
```
- Shows only header (no content/footer)
- Resize to 250px wide
- Click restore (□) to expand

### Job History Table
```
| Job Title (link)     | Date   | Type  | Amount  | Hourly Rate | Freelancer (link) | Rating |
|----------------------|--------|-------|---------|-------------|-------------------|--------|
| Website Redesign     | Nov-Dec| Fixed | $500    | -           | John D.          | 5.0    |
| API Development      | Oct    | Hourly| $45/hr  | $45/hr      | Sarah M.         | 4.8    |
```

## Technical Details

### Keyboard Listener
```javascript
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
    event.preventDefault();
    analyzer.analyze();
  }
});
```
- Listens directly on document
- Prevents default paste behavior
- Works with Ctrl (Windows/Linux) or Cmd (Mac)

### Job History Data Structure
```json
{
  "title": "Job Title",
  "jobUrl": "https://www.upwork.com/jobs/~021234...",
  "dateRange": "Nov 2025 - Dec 2025",
  "type": "Hourly",
  "amount": "$45.00/hr",
  "hourlyRate": "$45.00/hr",
  "freelancer": "John Doe",
  "freelancerUrl": "https://www.upwork.com/freelancers/~01234...",
  "rating": "5.0"
}
```

## Testing Instructions

1. **Reload Extension**
   - `about:debugging#/runtime/this-firefox`
   - Click "Reload"

2. **Test Hotkey**
   - Open any Upwork page
   - Press `Ctrl+Shift+V`
   - Console should show: "Keyboard shortcut triggered directly"
   - Panel should appear immediately

3. **Test Minimize**
   - Click minimize button (─)
   - Panel shrinks to header only
   - Click restore (□)
   - Panel expands to full size

4. **Test Job History Links**
   - Click "Toggle Details" to show job history
   - Job titles should be clickable green links
   - Freelancer names should be clickable green links
   - Both open in new tab

5. **Test Hourly Rate Column**
   - View job history for mixed fixed-price and hourly jobs
   - Hourly column shows rate for hourly jobs
   - Shows "-" for fixed-price jobs

## Known Issues

None currently! All major issues resolved:
- ~~Hotkey doesn't work~~ ✅ Fixed with fallback listener
- ~~Panel blocks view~~ ✅ Fixed with minimize feature
- ~~No links in job history~~ ✅ Fixed with clickable links
- ~~Missing hourly rate~~ ✅ Fixed with new column

## Next Steps

1. Begin classification algorithm development
2. Test with 100+ job history items
3. Optimize for performance with large datasets
4. Consider adding filter/search functionality
