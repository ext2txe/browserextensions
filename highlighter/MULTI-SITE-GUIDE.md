# Multi-Site Configuration Guide

The extension now works on ANY website! You can configure which sites it runs on and what elements to highlight.

## Quick Start Examples

### Example 1: Upwork Jobs
**URL Pattern:** `*://www.upwork.com/nx/find-work/*`
**Element Selector:** `section.air3-card-section`
**Keywords:** India, Saudi Arabia, Remote

### Example 2: LinkedIn Jobs
**URL Pattern:** `*://www.linkedin.com/jobs/*`
**Element Selector:** `.job-card-container, .job-card-list__entity`
**Keywords:** Python, Remote, Senior

### Example 3: Indeed Jobs
**URL Pattern:** `*://www.indeed.com/jobs*`
**Element Selector:** `.job_seen_beacon, .jobsearch-SerpJobCard`
**Keywords:** JavaScript, Full-time, $100k

### Example 4: Multiple Sites at Once
Add multiple URL patterns:
- `*://www.upwork.com/nx/find-work/*`
- `*://www.linkedin.com/jobs/*`
- `*://www.indeed.com/jobs*`

The extension will work on all of them with the same keywords!

## Configuration Options

### 1. URL Patterns

URL patterns determine which pages the extension runs on.

**Pattern Syntax:**
- `*` = matches any characters except `/`
- `**` = matches any characters including `/`
- Examples:
  - `*://www.upwork.com/*` - All Upwork pages
  - `*://www.upwork.com/nx/find-work/*` - Only Upwork job search
  - `*://*.linkedin.com/*` - All LinkedIn subdomains
  - `*://example.com/jobs/**` - All pages under /jobs/ directory

**How to Add:**
1. Click the settings button (or open popup)
2. Go to "Active URL Patterns"
3. Enter your pattern (e.g., `*://www.linkedin.com/jobs/*`)
4. Click "Add"
5. Click "Save Settings"
6. Reload the page

### 2. Element Selector

This CSS selector defines which elements to highlight on the page.

**Default:** `article, .job, .listing, section`

**Finding the Right Selector:**

1. Open the page you want to highlight
2. Right-click on an item you want to highlight
3. Select "Inspect Element"
4. Look at the HTML - find a class or tag that wraps each item
5. Use that in your selector

**Examples:**
- `article` - All article tags
- `.job-card` - All elements with class "job-card"
- `div.listing` - All divs with class "listing"
- `.job, .post, .item` - Multiple selectors (comma-separated)

**Testing Your Selector:**
1. Enter your selector in the settings
2. Click "Test Selector" button
3. Elements matching your selector will get orange borders for 5 seconds
4. Adjust selector if needed
5. Click "Save Settings" when satisfied

### 3. Keywords

Keywords are matched case-insensitively against ALL text in each element.

**Tips:**
- Use specific keywords: "Python Developer" instead of just "Python"
- Add variations: "Remote", "Work from home", "WFH"
- Keywords work across all configured sites

## Step-by-Step: Adding a New Site

Let's say you want to highlight LinkedIn jobs containing "Python":

### Step 1: Add the URL Pattern
1. Go to LinkedIn jobs: https://www.linkedin.com/jobs/
2. Click the settings button on the page
3. In "Active URL Patterns", enter: `*://www.linkedin.com/jobs/*`
4. Click "Add"

### Step 2: Find the Right Selector
1. Right-click on a job listing
2. Click "Inspect Element"
3. Look for a class that wraps each job (e.g., `.job-card-container`)
4. Enter this in "Element Selector": `.job-card-container`

### Step 3: Test the Selector
1. Click "Test Selector" button
2. You should see orange borders around each job for 5 seconds
3. If you don't see borders, try a different selector

### Step 4: Add Keywords
1. In the "Keywords" section, add: Python
2. Add more keywords if desired: Remote, Senior, etc.

### Step 5: Save and Test
1. Click "Save Settings"
2. Reload the LinkedIn page
3. Jobs containing "Python" should now be highlighted!

## Common Selectors for Popular Sites

### Upwork
**URL:** `*://www.upwork.com/nx/find-work/*`
**Selector:** `section.air3-card-section`

### LinkedIn
**URL:** `*://www.linkedin.com/jobs/*`
**Selector:** `.job-card-container, .job-card-list__entity`

### Indeed
**URL:** `*://www.indeed.com/jobs*`
**Selector:** `.job_seen_beacon, .jobsearch-SerpJobCard`

### Monster
**URL:** `*://www.monster.com/jobs/search/*`
**Selector:** `.card-content`

### Glassdoor
**URL:** `*://www.glassdoor.com/Job/*`
**Selector:** `.react-job-listing`

### RemoteOK
**URL:** `*://remoteok.com/*`
**Selector:** `tr.job`

## Troubleshooting

**Settings button doesn't appear:**
- Check that your current URL matches one of your URL patterns
- Open browser console (F12) and look for extension messages
- Try reloading the page

**Nothing gets highlighted:**
- Test your selector with the "Test Selector" button
- Check browser console for errors
- Make sure keywords are spelled correctly
- Try more generic keywords

**Wrong elements getting highlighted:**
- Your selector might be too broad
- Inspect the page and find a more specific selector
- Use "Test Selector" to verify

**Extension not working after adding new URL:**
- Make sure you clicked "Save Settings"
- Reload the page after saving
- Check that URL pattern matches the current page

## Advanced Tips

### Using Multiple Selectors
Separate with commas:
```
.job-card, .listing-item, article.post
```

### Highlighting Different Element Types
For sites with varying structures:
```
article, section, .card, .item, .entry
```

### Precise URL Matching
Match exact paths:
```
*://example.com/jobs/search
```

Match any subpath:
```
*://example.com/jobs/*
```

### Finding Elements with DevTools
1. Press F12 to open Developer Tools
2. Click the "Select Element" tool (top-left corner)
3. Hover over elements on the page
4. Look at the class names and tags shown
5. Use those in your selector

## Examples for Different Use Cases

### Job Search Across Multiple Sites
**URLs:**
- `*://www.upwork.com/nx/find-work/*`
- `*://www.linkedin.com/jobs/*`
- `*://www.indeed.com/jobs*`

**Keywords:** Python, Remote, Senior, Full-time
**Color:** #ffeb3b (yellow)

### Real Estate Listings
**URLs:**
- `*://www.zillow.com/homes/*`
- `*://www.redfin.com/city/*`

**Selector:** `.property-card, .listing`
**Keywords:** 3 bedroom, pool, garage
**Color:** #4caf50 (green)

### News Articles
**URLs:**
- `*://news.ycombinator.com/*`
- `*://www.reddit.com/r/programming/*`

**Selector:** `.athing, .thing`
**Keywords:** JavaScript, TypeScript, React
**Color:** #2196f3 (blue)

## Need Help?

1. Check browser console (F12) for error messages
2. Use "Test Selector" button to verify your selector works
3. Start with broad selectors and narrow down
4. Test one site at a time before adding more
