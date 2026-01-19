# Auto Load More - Firefox Extension v0.1.5

A Firefox extension that automates clicking "Load More" buttons with customizable pagination and stop conditions.

## Features

- **Customizable Button Detection**: Define the text/caption of the button to click (supports partial matching)
- **Intelligent Content Loading**: Automatically detects when new content finishes loading using DOM mutation observation
- **Configurable Timeout**: Set maximum wait time for content to load (with fallback protection)
- **Keyboard Automation**: Automatically press keys (PageDown, ArrowDown, End, Space) after each button click
- **Smart Stop Conditions**: Automatically stops when a specified text appears on the page
- **Visual Feedback**: Real-time status updates and click counter
- **Persistent Settings**: Saves your configuration across browser sessions

## Installation

### Method 1: Temporary Installation (For Testing)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension directory and select the `manifest.json` file
5. The extension will be loaded and appear in your toolbar

**Note**: Temporary extensions are removed when Firefox restarts.

### Method 2: Permanent Installation (Requires Signing)

To permanently install the extension, you need to:

1. Create a Firefox developer account at [addons.mozilla.org](https://addons.mozilla.org)
2. Package the extension as a `.zip` file
3. Submit it to Mozilla for signing
4. Install the signed `.xpi` file

Alternatively, you can use Firefox Developer Edition or Nightly with `xpinstall.signatures.required` set to `false` in `about:config` (not recommended for security reasons).

## Usage

1. **Navigate to the page** with the "Load More" button (e.g., a job listing page)

2. **Click the extension icon** in your toolbar to open the popup

3. **Configure the settings**:
   - **Button Text/Caption**: Enter the text to find in the button (default: "Load More Jobs")
   - **Max Load Wait**: Set the maximum time to wait for content to load in milliseconds (default: 10000ms)
   - **Key to Press**: Select which key to press after clicking (default: PageDown)
   - **Stop String**: Enter text that signals when to stop (default: "Posted 2 days ago")

4. **Click "Start"** to begin automation

5. **Monitor progress** in the status area and click counter

6. **Click "Stop"** at any time to halt the automation

## How It Works

The extension follows this cycle:

1. Check if the stop string appears on the page → Stop if found
2. Find and click the button matching your text
3. **Wait intelligently for new content to finish loading** (monitors DOM changes)
4. Scroll to keep the button visible or press the configured keyboard key
5. Check for stop string again → Stop if found
6. Repeat from step 1

### Intelligent Content Loading (New in v0.1.5)

Instead of using a fixed delay, the extension now uses a **MutationObserver** to detect when the page finishes loading new content:

- Monitors DOM changes after clicking the button
- Waits 500ms of idle time (no new content added) before proceeding
- Has a maximum timeout (configurable) to prevent infinite waiting
- Only considers significant changes (new elements added/removed)
- Ignores style and attribute changes for better performance

## Example Use Case

For job listing sites:

```
Button Text: "Load More Jobs"
Max Load Wait: 10000 (10 seconds maximum)
Key to Press: PageDown
Stop String: "Posted 2 days ago"
```

The extension will:
- Click "Load More Jobs"
- Wait for new content to finish loading (typically 1-3 seconds)
- Scroll to keep the button visible
- Continue until it finds a job posted 2 days ago
- Alert you and stop automatically

**Performance**: The intelligent loading detection means the extension proceeds as soon as content finishes loading, making it much faster than fixed delays while being more reliable than waiting too little.

## Troubleshooting

### Button Not Found
- Verify the button text is correct (check the actual button on the page)
- The extension uses partial matching, so "Load More" will match "Load More Jobs"
- The button must be visible on the page

### Automation Stops Immediately
- Check if the stop string already exists on the page
- The stop condition is case-sensitive

### Key Press Not Working
- Some websites may prevent keyboard events from scripts
- Try a different key or verify the website allows automated keyboard input

## Technical Details

### Button Detection Strategy

The extension uses multiple strategies to find buttons:

1. **Attribute-based**: Looks for `data-test="load-more-button"` (for your specific use case)
2. **Text-based**: Searches all clickable elements (`button`, `input[type="button"]`, `[role="button"]`, etc.) for matching text
3. **Partial matching**: Case-insensitive substring matching for flexibility

### Permissions

- `activeTab`: Required to interact with the current page
- `storage`: Required to save settings
- `scripting`: Required to inject the content script

## Files Structure

```
loadmore/
├── manifest.json          # Extension configuration
├── popup.html            # User interface
├── popup.js              # UI logic and settings management
├── content.js            # Core automation logic
├── styles.css            # UI styling
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md             # This file
```

## License

This extension is provided as-is for personal use.

## Support

For issues or questions, please refer to the Firefox extension documentation:
- [MDN Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
