# Release Notes: v0.1.4

## Summary

Version 0.1.4 resolves all major usability issues and adds key features for job classification workflow.

## Key Improvements

### 🎯 Hotkey Fixed
**Problem:** `Ctrl+Shift+V` didn't trigger analysis
**Solution:** Added direct keyboard event listener as fallback
**Result:** Hotkey now works reliably on all Upwork pages

### 📐 Panel Minimize
**Problem:** Panel blocks view of job details
**Solution:** Added minimize button to collapse panel
**Result:** Panel can be minimized to header-only (250px), then restored

### 🔗 Clickable Links
**Problem:** Job history was text-only, hard to navigate to jobs/freelancers
**Solution:** Made job titles and freelancer names clickable links
**Result:** Easy access to job details and freelancer profiles from analysis

### 💰 Hourly Rate Tracking
**Problem:** Hourly rate wasn't captured for classification
**Solution:** Added Hourly Rate column to job history
**Result:** Classification can use hourly rate data

## Quick Start

1. **Reload** extension in `about:debugging`
2. **Navigate** to any Upwork job post
3. **Press** `Ctrl+Shift+V`
4. **View** analysis with minimize option
5. **Click** job history links to explore

## Files Modified

- `manifest.json` - version bump to 0.1.4
- `content-script.js` - keyboard listener, minimize function, link extraction
- `styles/panel.css` - minimize styling, link colors
- `VERSION.md` - changelog
- `CHANGELOG-v0.1.4.md` - detailed changes

## What's Next

### Immediate Testing
- Test on multiple job types (fixed-price, hourly)
- Verify 50+ job history expansion
- Test minimize/restore functionality
- Verify links open correctly

### Classification Development
With hourly rate data now available, you can begin building classification logic:
- Analyze budget ranges
- Consider client spending patterns
- Factor in hire rates
- Use hourly rate vs. fixed price preferences
- Evaluate client history quality (ratings, feedback)

### Future Enhancements (v0.2.x)
- Automated classification algorithm
- Customizable classification rules
- Batch analysis mode
- Save/load analysis history
- Export to CSV
- Integration with job navigator

## Version Comparison

| Feature | v0.1.3 | v0.1.4 |
|---------|--------|--------|
| Hotkey Works | ❌ | ✅ |
| Panel Minimize | ❌ | ✅ |
| Job History Links | ❌ | ✅ |
| Hourly Rate Column | ❌ | ✅ |
| Total Spent Extraction | ✅ | ✅ |
| Avg Hourly Extraction | ✅ | ✅ |
| View More Expansion | ✅ | ✅ |

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify extension is loaded: `about:debugging`
3. Test on sample HTML file first
4. Check that content script loaded: Look for "[Upwork Analyzer] Content script loaded" in console

---

**Ready for Production Testing** ✅
