# Installation & Setup

## What's New in Version 2.0

✨ **Now works on ANY website!**
- Configure which sites to run on with URL patterns
- Set custom CSS selectors for different sites
- Same keywords work across all configured sites
- Test selectors before saving

## Quick Install

### Step 1: Install the Extension

1. Open Firefox
2. Type `about:debugging#/runtime/this-firefox` in the address bar and press Enter
3. Click the blue "Load Temporary Add-on" button
4. Navigate to the upwork-highlighter folder and select `manifest.json`
5. You should see "Keyword Highlighter" appear in the list

### Step 2: Configure for Your First Site

**For Upwork (pre-configured):**
1. Go to https://www.upwork.com/nx/find-work/
2. Click the green **"⚙️ Highlighter Settings"** button (bottom-right)
3. URL pattern `*://www.upwork.com/nx/find-work/*` is already there
4. Add keywords: "India", "Saudi Arabia", etc.
5. Click "Save Settings"

**For Any Other Site:**
See the detailed guide in **MULTI-SITE-GUIDE.md**

### Step 3: See Results!

Elements containing your keywords will be highlighted with your chosen color!

## Multi-Site Setup Example

Want to highlight jobs on Upwork, LinkedIn, AND Indeed?

1. Click the settings button
2. Add URL patterns:
   - `*://www.upwork.com/nx/find-work/*`
   - `*://www.linkedin.com/jobs/*`
   - `*://www.indeed.com/jobs*`
3. Set element selector: `article, .job, .listing, section, .job-card-container`
4. Add keywords: Python, Remote, Senior
5. Save settings
6. Visit any of those sites - highlighting works on all!

## Configuration Options

### URL Patterns
Control which sites the extension runs on. Use `*` as wildcard.
- Example: `*://www.upwork.com/*` (all Upwork pages)
- Example: `*://www.linkedin.com/jobs/*` (LinkedIn jobs only)

### Element Selector
CSS selector for elements to highlight.
- Default: `article, .job, .listing, section`
- Use "Test Selector" button to verify it works
- See MULTI-SITE-GUIDE.md for site-specific selectors

### Keywords
Words/phrases to search for (case-insensitive, works on all sites)

### Highlight Color
Choose any color for the background highlight

## After Firefox Restarts

**Settings persist automatically** ✓

Reloading the extension takes 30 seconds:
1. `about:debugging#/runtime/this-firefox`
2. Load Temporary Add-on → `manifest.json`
3. Done! Keywords and URLs are already saved

## Features

- **Multi-Site Support**: Works on any website
- **URL Patterns**: Configure which sites to run on
- **Custom Selectors**: Define what elements to highlight
- **Test Mode**: Test selectors before saving
- **Persistent Settings**: All settings saved permanently
- **Live Updates**: Changes apply immediately
- **On-Page Settings**: Button appears on configured sites
- **Case-Insensitive**: Matches keywords regardless of case

## Need Permanent Installation?

See **PERMANENT-INSTALL.md** for:
- Firefox Developer Edition setup
- Signing for regular Firefox
- Profile-based installation

## Quick Reference

**Common Site Selectors:**
- Upwork: `section.air3-card-section`
- LinkedIn: `.job-card-container`
- Indeed: `.job_seen_beacon`

See **MULTI-SITE-GUIDE.md** for complete list and detailed instructions!
