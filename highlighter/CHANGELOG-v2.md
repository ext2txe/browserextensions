# Version 2.0 - Multi-Site Support!

## 🎉 Major New Features

### 1. Works on ANY Website
No longer limited to Upwork! Configure the extension to work on:
- Job sites (LinkedIn, Indeed, Glassdoor, etc.)
- Real estate sites (Zillow, Redfin, etc.)
- News sites, forums, marketplaces
- ANY website you want!

### 2. Configurable URL Patterns
Tell the extension which sites to run on:
- Add multiple URL patterns
- Use wildcards (`*`) for flexible matching
- Extension only activates on matching URLs

### 3. Custom Element Selectors
Define what elements to highlight on each site:
- Use CSS selectors
- Test selectors before saving (adds orange borders)
- Works with any HTML structure

### 4. Unified Keywords
Same keywords work across all configured sites:
- Add keywords once
- Highlighted everywhere
- Perfect for multi-site job searching

## Upgrading from Version 1.0

### What's Different?

**Before (v1.0):**
- Only worked on Upwork
- Hardcoded to Upwork URLs
- Fixed element selector

**Now (v2.0):**
- Works on any website
- User-configured URL patterns
- Custom element selectors
- Test mode for selectors

### Migration Steps

1. Remove old version from `about:debugging`
2. Install new version
3. Your keywords are already saved! ✓
4. Default URL pattern is set to Upwork
5. Add more sites as needed

## New Settings

### URL Patterns
- **Default:** `*://www.upwork.com/nx/find-work/*`
- **Format:** Use `*` as wildcard
- **Example:** `*://www.linkedin.com/jobs/*`

### Element Selector
- **Default:** `article, .job, .listing, section`
- **Format:** Any valid CSS selector
- **Test:** Click "Test Selector" to verify

## Quick Multi-Site Setup

Want to highlight "Python" jobs on Upwork AND LinkedIn?

1. Open settings
2. Add URL patterns:
   - *://www.upwork.com/nx/find-work/*
   - *://www.linkedin.com/jobs/*
3. Set selector: `section, article, .job-card-container`
4. Add keyword: `Python`
5. Save and visit either site!

## Documentation

- **INSTALL.md** - Installation guide
- **MULTI-SITE-GUIDE.md** - Complete multi-site setup guide
- **PERMANENT-INSTALL.md** - Permanent installation options

## Compatibility

✅ Fully backward compatible with v1.0
✅ Existing keywords and settings preserved
