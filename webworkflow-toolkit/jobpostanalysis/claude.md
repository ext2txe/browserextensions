# Claude Development Guidelines

## Version Management

### Version Increment Rules

When submitting the extension for testing, increment the version number according to these rules:

**Current Version: 0.1.5**

**Next Version: 0.1.6**

#### Increment Rules:
- For minor updates, bug fixes, and patches: increment the last digit (e.g., 0.1.5 → 0.1.6)
- When the version reaches x.x.9 (e.g., 0.1.9), the next increment is to x.x.10 (NOT x.2.0)
  - Example: 0.1.9 → 0.1.10 → 0.1.11 → ... → 0.1.19 → 0.1.20
- For significant features or breaking changes: increment the middle digit (e.g., 0.1.x → 0.2.0)

#### Files to Update:
1. **manifest.json**
   - Update `"name"` field: `"Upwork Job Post Analyzer v0.1.x"`
   - Update `"version"` field: `"0.1.x"`

2. **content-script.js**
   - Update version display in panel header (line ~275)
   - Look for: `<h3>Job Post Analysis <span style="font-size: 12px; opacity: 0.8;">v0.1.x</span></h3>`

3. **VERSION.md** (optional but recommended)
   - Update current version at the top
   - Add changelog entry with date and changes

### Testing Workflow

Before each test submission:
1. Increment version number
2. Test locally using `about:debugging` in Firefox
3. Verify all functionality works
4. Document changes in VERSION.md or CHANGELOG
5. Create release package if needed

---

## Code Style Guidelines

- Use descriptive variable and function names
- Add comments for complex logic
- Keep functions focused on single responsibilities
- Use ES6+ features (const/let, arrow functions, async/await)
- Handle errors gracefully with try-catch blocks

---

## Extension Development Notes

### Browser Compatibility
- Currently targets Firefox (Manifest v2)
- Future: Chrome/Edge support (Manifest v3 migration)

### Key Features
- Job post analysis and extraction
- Client information gathering
- Job history tracking
- JSON export functionality
- Keyboard shortcuts (Ctrl+Shift+V)
- Draggable analysis panel

### Important Considerations
- Always test on actual Upwork job pages
- Ensure selectors are resilient to DOM changes
- Maintain backward compatibility when possible
- Keep extension lightweight and performant
