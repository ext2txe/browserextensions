# Upwork Job Post Analyzer

A Firefox browser extension that analyzes Upwork job posts and extracts detailed information for job classification.

## Features

- **📊 Comprehensive Job Analysis**: Extracts job details, client information, and job history
- **⌨️ Hotkey Activation**: Press `Ctrl+Shift+A` to analyze any Upwork job post
- **🔍 Auto-Expand**: Automatically expands "View more" sections to get complete job history
- **📋 JSON Export**: Copy data to clipboard or download as JSON file
- **📈 HTML Table Display**: Clean, organized presentation of extracted data
- **🎯 Classification Ready**: Includes classification field for automated job categorization

## Installation

### Firefox

1. **Generate Icons** (one-time setup):
   - Open `icons/generate-icons.html` in your browser
   - Click "Download All Icons" button
   - Save the three PNG files (`icon-16.png`, `icon-48.png`, `icon-96.png`) in the `icons/` folder

2. **Load the Extension**:
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from this directory
   - The extension will be loaded and active

3. **For Permanent Installation**:
   - Package the extension as a ZIP file
   - Submit to Firefox Add-ons (AMO) for signing
   - Or use Firefox Developer Edition for unsigned extensions

### Chrome (Future Support)

Chrome support requires converting manifest v2 to v3. Instructions will be added when Chrome support is implemented.

## Usage

### Method 1: Hotkey (Recommended)

1. Navigate to any Upwork job post page (e.g., `https://www.upwork.com/*/jobs/*`)
2. Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
3. The extension will automatically:
   - Expand all "View more" sections
   - Extract job data
   - Display the analysis panel

### Method 2: Extension Icon

1. Navigate to an Upwork job post
2. Click the extension icon in the toolbar
3. Click "Analyze Current Job" button

### Method 3: Popup

1. Click the extension icon
2. Click "🔍 Analyze Current Job" in the popup

## Extracted Data

### Job Details
- Job title
- Posted date
- Budget/price
- Budget type (Fixed-price/Hourly)
- Experience level
- Project type

### Client Information
- Rating & review count
- Location
- Total jobs posted
- Hire rate
- Total amount spent
- Average hourly rate paid
- Member since date
- Payment verification status

### Job History
For each previous job:
- Job title
- Date range (start - end)
- Job type (Fixed-price/Hourly)
- Price/rate amount
- Freelancer name
- Rating

## Output Formats

### HTML Table
The analysis panel displays data in an organized table format with:
- Collapsible job history details
- Classification input field
- Action buttons (Copy JSON, Export JSON, Toggle Details)

### JSON Export
```json
{
  "classification": "",
  "confidence": null,
  "jobDetails": {
    "title": "Job Title",
    "postedDate": "Posted 4 hours ago",
    "budget": "$75.00",
    "budgetType": "Fixed-price",
    "experienceLevel": "Expert",
    "projectType": "One-time project"
  },
  "clientInfo": {
    "rating": "4.8",
    "reviewCount": "176",
    "location": "United States, Missouri City",
    "totalJobs": "496 jobs posted",
    "hireRate": "58%",
    "totalSpent": "$33K total spent",
    "avgHourlyRate": "$4.19/hr avg hourly rate paid",
    "memberSince": "Member since Mar 26, 2018",
    "paymentVerified": true
  },
  "jobHistory": [
    {
      "title": "Wordpress Edits...",
      "dateRange": "Nov 2025 - Dec 2025",
      "type": "Fixed-price",
      "amount": "$40.00",
      "freelancer": "Muhammad Daniyal S.",
      "rating": "5.0"
    }
  ],
  "analysisMetadata": {
    "analyzedAt": "2026-01-05T10:30:00Z",
    "url": "https://www.upwork.com/...",
    "version": "1.0.0"
  }
}
```

## File Structure

```
jobpostanalysis/
├── manifest.json              # Extension manifest (Firefox v2)
├── background.js              # Background script (hotkey handler)
├── content-script.js          # Main content script (data extraction)
├── styles/
│   └── panel.css             # Analysis panel styling
├── popup/
│   ├── popup.html            # Extension popup UI
│   └── popup.js              # Popup script
├── icons/
│   ├── generate-icons.html   # Icon generator tool
│   ├── icon-16.png          # 16x16 icon
│   ├── icon-48.png          # 48x48 icon
│   └── icon-96.png          # 96x96 icon
├── sample/
│   └── upwork_sample_job.htm # Sample Upwork job post for testing
└── README.md                 # This file
```

## Testing

### Using the Sample File

1. Open `sample/upwork_sample_job.htm` in Firefox
2. Press `Ctrl+Shift+A` or click the extension icon
3. Verify that data is extracted correctly
4. Test all buttons: Copy JSON, Export JSON, Toggle Details

### On Live Upwork Pages

1. Navigate to any Upwork job post
2. Trigger analysis via hotkey or icon
3. Verify auto-expansion of "View more" sections
4. Check data accuracy

## Integration with Job Navigator

This extension outputs data in a format ready for integration with a job navigator system:

### Classification System (Future Enhancement)
The `classification` field can be populated by:
- Manual input via the classification input field
- Automated classification algorithm based on:
  - Budget range
  - Client rating and history
  - Job type and requirements
  - Client spending patterns

### Workflow Integration
1. Scan job listings
2. Analyze each job post
3. Classify as: **Save** / **Review** / **Discard**
4. Store data for batch processing

## Development

### Debugging

Enable debug logs in Firefox Developer Tools Console:
```javascript
// All logs are prefixed with [Upwork Analyzer]
```

### Modifying Selectors

If Upwork changes their HTML structure, update selectors in `content-script.js`:
- `extractJobDetails()` - Job detail selectors
- `extractClientInfo()` - Client info selectors
- `extractJobHistory()` - Job history selectors

### Adding New Fields

1. Update extraction methods in `content-script.js`
2. Add new table rows in `generateTable()` method
3. Update JSON structure in `extractJobData()`

## Known Limitations

- Only works on Upwork job post pages (URLs matching `*://*.upwork.com/*/jobs/*`)
- Some job history items may not load if Upwork uses lazy loading
- Auto-expansion waits 1.5 seconds total; may need adjustment for slow connections
- Firefox only (Chrome support planned)

## Troubleshooting

### Extension doesn't activate
- Ensure you're on a valid Upwork job post page
- Check that the URL contains `/jobs/`
- Reload the page and try again

### Data not extracted
- Wait for page to fully load before analyzing
- Check browser console for error messages
- Some fields may be empty if client hasn't provided data

### Hotkey not working
- Check Firefox's hotkey settings: `about:addons` → ⚙️ → Manage Extension Shortcuts
- Ensure no other extension is using `Ctrl+Shift+A`
- Try using the extension icon instead

## Future Enhancements

- [ ] Chrome/Edge support (Manifest v3 conversion)
- [ ] Automated classification algorithm
- [ ] Batch analysis of multiple job posts
- [ ] Data export to CSV format
- [ ] Integration API for external job navigator systems
- [ ] Configurable selectors via settings page
- [ ] Save analysis history locally
- [ ] Custom classification tags/categories

## Version History

### v1.0.0 (2026-01-06)
- Initial release
- Firefox support with Manifest v2
- Hotkey activation (`Ctrl+Shift+A`)
- Auto-expand "View more" sections
- HTML table display
- JSON export functionality
- Classification field placeholder

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly on both sample and live Upwork pages
4. Submit a pull request

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review browser console logs
3. Open an issue with:
   - Firefox version
   - Extension version
   - Steps to reproduce
   - Console error messages

---

**Note**: This extension is not affiliated with or endorsed by Upwork. It's designed for personal use to analyze job postings more efficiently.
