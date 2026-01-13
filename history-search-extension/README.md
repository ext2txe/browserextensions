# Advanced History Search

A powerful Firefox extension for searching your browser history with advanced filters, pattern matching, and export capabilities.

## Features

- **Domain Filtering**: Search within specific domains (e.g., `udemy.com`)
- **URL Pattern Matching**: Find URLs containing specific text or matching regex patterns
- **Title Search**: Search in page titles
- **AND/OR Logic**: Combine filters with AND (all must match) or OR (any can match) logic
- **Date Range**: Filter results by time period
- **Multiple Sort Options**: Sort by date (newest/oldest), title, or domain
- **Visit Count**: See how many times you've visited each page
- **CSV Export**: Export search results for external analysis
- **Save Searches**: Save frequently used search configurations for quick access
- **Regex Support**: Use regular expressions for complex URL patterns

## Installation

### From Source (Temporary)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select the `manifest.json` file

### Permanent Installation

To install permanently (without it disappearing when Firefox restarts):

1. The extension needs to be signed by Mozilla
2. Submit it to [addons.mozilla.org](https://addons.mozilla.org/) for review
3. Or use Firefox Developer Edition/Nightly with `xpinstall.signatures.required` set to `false` in `about:config`

## Usage

### Opening the Extension

- Click the extension icon in your toolbar to open the search sidebar
- Or use the keyboard shortcut: `Ctrl+Shift+Y` (if configured)

### Basic Search

1. **Domain Filter**: Enter a domain to search within (e.g., `udemy.com`, `github.com`)
   - Leave empty to search all domains

2. **URL Contains**: Enter text to find in URLs
   - Example: `wordpress` will find all URLs containing "wordpress"
   - Check "Use regex pattern" for advanced pattern matching

3. **Title Contains**: Search in page titles
   - Case-insensitive text matching

4. **Search Mode**:
   - **Match ALL (AND)**: Results must match all specified filters
   - **Match ANY (OR)**: Results match any specified filter

5. Click "Search History" to run the search

### Example Searches

**Find all Udemy courses about WordPress:**
- Domain: `udemy.com`
- URL contains: `wordpress`
- Mode: AND

**Find all GitHub repositories OR Stack Overflow posts:**
- Domain: (leave empty)
- URL contains: `github.com|stackoverflow.com`
- Use regex: ✓
- Mode: OR

**Find recent visits to documentation:**
- URL contains: `docs|documentation`
- Use regex: ✓
- From date: (last week)

### Advanced Features

**Regex Patterns:**
- Enable "Use regex pattern" for powerful matching
- Example: `course-\d+` matches URLs like `course-123`, `course-456`
- Example: `(tutorial|guide|howto)` matches any of these words

**Saving Searches:**
1. Configure your search filters
2. Click the bookmark icon (💾) in the header
3. Give it a name
4. Load it anytime from the saved searches menu

**Exporting Results:**
1. Perform a search
2. Click "Export CSV"
3. Opens in your default CSV viewer or saves to Downloads

**Sorting:**
- Latest first (default)
- Oldest first
- By title (alphabetical)
- By domain (grouped by site)

## Tips

- Start with broad searches, then narrow down
- Use domain filter first to reduce result set
- Regex is powerful but not required for most searches
- Save frequently used searches for quick access
- Export large result sets to analyze in Excel/Sheets

## Privacy

This extension:
- Only accesses your local browser history
- Does not send any data to external servers
- Stores saved searches locally in Firefox's storage
- All processing happens on your device

## Permissions

- `history`: Read and search your browser history
- `storage`: Save your search configurations locally

## Troubleshooting

**No results found:**
- Try removing some filters
- Check that date range includes your visits
- Verify domain name is correct (no `www.` unless the actual URL has it)

**Regex not working:**
- Check pattern syntax
- Test your regex at regex101.com first
- Invalid patterns fall back to plain text search

**Sidebar won't open:**
- Check that the extension is enabled in `about:addons`
- Try reloading the extension in `about:debugging`

## Development

Built with:
- Firefox WebExtensions API
- Vanilla JavaScript (no frameworks)
- CSS with custom properties for theming

To modify:
1. Edit files in the extension directory
2. Reload the extension in `about:debugging`
3. Changes take effect immediately

## License

MIT License - feel free to modify and distribute

## Support

For issues or feature requests, please file an issue on GitHub.
