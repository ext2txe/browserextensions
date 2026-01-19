// Job Navigator - Full Version
// Firefox-compatible content script

(function() {
  'use strict';

  // Use browser API if available (Firefox), otherwise use chrome API
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  let panel = null;
  let useSelectorCheckbox = null;
  let selectorInput = null;
  let searchInput = null;
  let statusDiv = null;
  let prevButton = null;
  let nextButton = null;
  let ignoreEnabledCheckbox = null;
  let ignoreColorInput = null;
  let onlyShowEnabledCheckbox = null;
  let onlyShowColorInput = null;
  let matches = [];
  let currentMatchIndex = -1;
  let ignoredCount = 0;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // Create the search panel UI
  function createPanel() {
    if (panel) return; // Already exists

    panel = document.createElement('div');
    panel.id = 'job-navigator-panel';
    panel.innerHTML = `
      <div id="job-navigator-header">
        <span>List Navigator <span style="font-size: 0.8em; opacity: 0.7;">v0.1.14</span></span>
        <button id="job-navigator-close" title="Close (Esc)">×</button>
      </div>
      <div id="job-navigator-content">
        <div id="job-navigator-selector-container">
          <label id="job-navigator-selector-label">
            <input type="checkbox" id="job-navigator-use-selector" />
            Use CSS Selector (advanced)
          </label>
          <input type="text" id="job-navigator-selector" placeholder="CSS Selector (e.g., section.item, article)" disabled />
        </div>
        <input type="text" id="job-navigator-search" placeholder="Search text (case-insensitive)" />
        <div id="job-navigator-ignore-container">
          <label id="job-navigator-ignore-label">
            <input type="checkbox" id="job-navigator-ignore-enabled" />
            Ignore matches with background color:
          </label>
          <input type="color" id="job-navigator-ignore-color" value="#ffffff" disabled />
        </div>
        <div id="job-navigator-onlyshow-container">
          <label id="job-navigator-onlyshow-label">
            <input type="checkbox" id="job-navigator-onlyshow-enabled" />
            Only show matches with background color:
          </label>
          <input type="color" id="job-navigator-onlyshow-color" value="#ffffff" disabled />
        </div>
        <div id="job-navigator-controls">
          <button id="job-navigator-prev" disabled>↑ Previous</button>
          <button id="job-navigator-next" disabled>↓ Next</button>
          <button id="job-navigator-refresh" title="Re-scan page for new matches">🔄 Refresh</button>
        </div>
        <div id="job-navigator-status">Enter search text to find matches</div>
        <div id="job-navigator-help">
          <div><strong>Tips:</strong></div>
          <div>• Type to search all text on page</div>
          <div>• Or enable selector to search specific elements</div>
          <div>• Press <strong>Enter</strong> for next match</div>
          <div>• Press <strong>Shift+Enter</strong> for previous</div>
          <div>• Press <strong>Esc</strong> to close</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Get references to UI elements
    useSelectorCheckbox = document.getElementById('job-navigator-use-selector');
    selectorInput = document.getElementById('job-navigator-selector');
    searchInput = document.getElementById('job-navigator-search');
    statusDiv = document.getElementById('job-navigator-status');
    prevButton = document.getElementById('job-navigator-prev');
    nextButton = document.getElementById('job-navigator-next');
    ignoreEnabledCheckbox = document.getElementById('job-navigator-ignore-enabled');
    ignoreColorInput = document.getElementById('job-navigator-ignore-color');
    onlyShowEnabledCheckbox = document.getElementById('job-navigator-onlyshow-enabled');
    onlyShowColorInput = document.getElementById('job-navigator-onlyshow-color');
    const refreshButton = document.getElementById('job-navigator-refresh');
    const closeButton = document.getElementById('job-navigator-close');
    const header = document.getElementById('job-navigator-header');

    // Load saved values from localStorage
    const savedSelector = localStorage.getItem('list-navigator-selector');
    const savedUseSelector = localStorage.getItem('list-navigator-use-selector') === 'true';
    const savedSearchText = localStorage.getItem('list-navigator-search-text') || '';
    const savedIgnoreEnabled = localStorage.getItem('list-navigator-ignore-enabled') === 'true';
    const savedIgnoreColor = localStorage.getItem('list-navigator-ignore-color') || '#ffffff';
    const savedOnlyShowEnabled = localStorage.getItem('list-navigator-onlyshow-enabled') === 'true';
    const savedOnlyShowColor = localStorage.getItem('list-navigator-onlyshow-color') || '#ffffff';

    if (savedSelector) {
      selectorInput.value = savedSelector;
    }

    if (savedSearchText) {
      searchInput.value = savedSearchText;
    }

    useSelectorCheckbox.checked = savedUseSelector;
    selectorInput.disabled = !savedUseSelector;

    ignoreEnabledCheckbox.checked = savedIgnoreEnabled;
    ignoreColorInput.value = savedIgnoreColor;
    ignoreColorInput.disabled = !savedIgnoreEnabled;

    onlyShowEnabledCheckbox.checked = savedOnlyShowEnabled;
    onlyShowColorInput.value = savedOnlyShowColor;
    onlyShowColorInput.disabled = !savedOnlyShowEnabled;

    // If both are enabled, disable ignore (only show takes precedence)
    if (savedIgnoreEnabled && savedOnlyShowEnabled) {
      ignoreEnabledCheckbox.checked = false;
      ignoreColorInput.disabled = true;
      localStorage.setItem('list-navigator-ignore-enabled', 'false');
    }

    // Checkbox handler
    useSelectorCheckbox.addEventListener('change', () => {
      const useSelector = useSelectorCheckbox.checked;
      selectorInput.disabled = !useSelector;
      localStorage.setItem('list-navigator-use-selector', useSelector);
      performSearch();
    });

    // Ignore feature handlers
    ignoreEnabledCheckbox.addEventListener('change', () => {
      const ignoreEnabled = ignoreEnabledCheckbox.checked;
      ignoreColorInput.disabled = !ignoreEnabled;

      // Mutually exclusive: if enabling Ignore, disable Only Show
      if (ignoreEnabled && onlyShowEnabledCheckbox.checked) {
        onlyShowEnabledCheckbox.checked = false;
        onlyShowColorInput.disabled = true;
        localStorage.setItem('list-navigator-onlyshow-enabled', 'false');
      }

      localStorage.setItem('list-navigator-ignore-enabled', ignoreEnabled);
      console.log('[List Navigator] Ignore checkbox changed:', ignoreEnabled);
      performSearch();
    });

    ignoreColorInput.addEventListener('input', () => {
      const newColor = ignoreColorInput.value;
      localStorage.setItem('list-navigator-ignore-color', newColor);
      console.log('[List Navigator] Ignore color changed:', newColor);
      performSearch();
    });

    // Only Show feature handlers
    onlyShowEnabledCheckbox.addEventListener('change', () => {
      const onlyShowEnabled = onlyShowEnabledCheckbox.checked;
      onlyShowColorInput.disabled = !onlyShowEnabled;

      // Mutually exclusive: if enabling Only Show, disable Ignore
      if (onlyShowEnabled && ignoreEnabledCheckbox.checked) {
        ignoreEnabledCheckbox.checked = false;
        ignoreColorInput.disabled = true;
        localStorage.setItem('list-navigator-ignore-enabled', 'false');
      }

      localStorage.setItem('list-navigator-onlyshow-enabled', onlyShowEnabled);
      console.log('[List Navigator] Only Show checkbox changed:', onlyShowEnabled);
      performSearch();
    });

    onlyShowColorInput.addEventListener('input', () => {
      const newColor = onlyShowColorInput.value;
      localStorage.setItem('list-navigator-onlyshow-color', newColor);
      console.log('[List Navigator] Only Show color changed:', newColor);
      performSearch();
    });

    // Search input handlers
    selectorInput.addEventListener('input', () => {
      localStorage.setItem('list-navigator-selector', selectorInput.value);
      console.log('[List Navigator] Selector changed');
      performSearch();
    });
    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value;
      localStorage.setItem('list-navigator-search-text', searchValue);
      console.log('[List Navigator] Search input changed:', searchValue);
      performSearch();
    });

    // Navigation buttons
    prevButton.addEventListener('click', navigateToPrevious);
    nextButton.addEventListener('click', navigateToNext);
    refreshButton.addEventListener('click', () => {
      console.log('[List Navigator] Refresh button clicked');
      performSearch();
    });

    // Close button
    closeButton.addEventListener('click', hidePanel);

    // Global keyboard shortcuts when panel is visible
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts if panel is visible
      if (!panel.classList.contains('visible')) return;

      // Escape key to close
      if (e.key === 'Escape') {
        hidePanel();
        return;
      }

      // Enter key for next, Shift+Enter for previous
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          navigateToPrevious();
        } else {
          navigateToNext();
        }
      }
    });

    // Dragging functionality
    header.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
  }

  // Dragging functions
  function startDragging(e) {
    isDragging = true;
    const rect = panel.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    panel.style.cursor = 'grabbing';
  }

  function drag(e) {
    if (!isDragging) return;

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;

    panel.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    panel.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    panel.style.right = 'auto'; // Override right positioning when dragging
  }

  function stopDragging() {
    if (isDragging) {
      isDragging = false;
      panel.style.cursor = '';
    }
  }

  // Show the panel
  function showPanel() {
    console.log('[List Navigator] showPanel called');
    createPanel();
    panel.classList.add('visible');

    // Ensure elements are initialized
    if (!searchInput) {
      searchInput = document.getElementById('job-navigator-search');
    }

    if (searchInput) {
      searchInput.focus();

      // Use setTimeout to ensure any browser autofill has completed
      setTimeout(() => {
        const searchValue = searchInput.value.trim();
        console.log('[List Navigator] Search value on open:', searchValue);
        if (searchValue) {
          console.log('[List Navigator] Auto-running search');
          performSearch();
        }
      }, 100);
    } else {
      console.error('[List Navigator] searchInput not found');
    }
  }

  // Hide the panel
  function hidePanel() {
    if (panel) {
      panel.classList.remove('visible');
      clearHighlights();
    }
  }

  // Toggle panel visibility
  function togglePanel() {
    if (panel && panel.classList.contains('visible')) {
      hidePanel();
    } else {
      showPanel();
    }
  }

  // Helper: Convert hex color to RGB object
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Helper: Compare two colors for exact match
  function colorsMatch(rgbColor, hexColor) {
    // Parse rgb(r, g, b) or rgba(r, g, b, a) format
    const rgbMatch = rgbColor.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) return false;

    const rgb1 = {
      r: parseInt(rgbMatch[0]),
      g: parseInt(rgbMatch[1]),
      b: parseInt(rgbMatch[2])
    };

    const rgb2 = hexToRgb(hexColor);
    if (!rgb2) return false;

    // Exact match
    return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
  }

  // Helper: Get effective background color (traverse up if transparent)
  function getEffectiveBackgroundColor(element) {
    let el = element;
    let depth = 0;
    const maxDepth = 10;

    while (el && el !== document.body && depth < maxDepth) {
      const bg = window.getComputedStyle(el).backgroundColor;
      // Check if not transparent
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      el = el.parentElement;
      depth++;
    }
    return 'rgb(255, 255, 255)'; // Default to white
  }

  // Helper: Check if element should be ignored based on background color
  function shouldIgnoreElement(element) {
    if (!ignoreEnabledCheckbox || !ignoreEnabledCheckbox.checked) {
      return false;
    }

    const targetColor = ignoreColorInput ? ignoreColorInput.value : null;
    if (!targetColor) return false;

    // Get effective background color (checking parents if transparent)
    const computedBg = getEffectiveBackgroundColor(element);

    // Debug logging
    const isMatch = colorsMatch(computedBg, targetColor);
    if (element.textContent.toLowerCase().includes('less than')) {
      console.log('[List Navigator] Ignore color check:', {
        element: element.textContent.substring(0, 50),
        computedBg,
        targetColor,
        isMatch
      });
    }

    // Compare colors
    return isMatch;
  }

  // Helper: Check if element should be shown based on background color (Only Show mode)
  function shouldOnlyShowElement(element) {
    if (!onlyShowEnabledCheckbox || !onlyShowEnabledCheckbox.checked) {
      return true; // If Only Show is not enabled, show all elements
    }

    const targetColor = onlyShowColorInput ? onlyShowColorInput.value : null;
    if (!targetColor) return true;

    // Get effective background color (checking parents if transparent)
    const computedBg = getEffectiveBackgroundColor(element);

    // Debug logging
    const isMatch = colorsMatch(computedBg, targetColor);
    if (element.textContent.toLowerCase().includes('less than')) {
      console.log('[List Navigator] Only Show color check:', {
        element: element.textContent.substring(0, 50),
        computedBg,
        targetColor,
        isMatch
      });
    }

    // Return true only if color matches (opposite of shouldIgnoreElement)
    return isMatch;
  }

  // Perform search
  function performSearch() {
    console.log('[List Navigator] performSearch called');

    // Ensure all elements are initialized
    if (!useSelectorCheckbox) {
      useSelectorCheckbox = document.getElementById('job-navigator-use-selector');
    }
    if (!selectorInput) {
      selectorInput = document.getElementById('job-navigator-selector');
    }
    if (!searchInput) {
      searchInput = document.getElementById('job-navigator-search');
    }
    if (!statusDiv) {
      statusDiv = document.getElementById('job-navigator-status');
    }
    if (!prevButton) {
      prevButton = document.getElementById('job-navigator-prev');
    }
    if (!nextButton) {
      nextButton = document.getElementById('job-navigator-next');
    }

    // Safety check
    if (!useSelectorCheckbox || !selectorInput || !searchInput || !statusDiv) {
      console.error('[List Navigator] Elements not initialized', {
        useSelectorCheckbox: !!useSelectorCheckbox,
        selectorInput: !!selectorInput,
        searchInput: !!searchInput,
        statusDiv: !!statusDiv
      });
      return;
    }

    const useSelector = useSelectorCheckbox.checked;
    const selector = selectorInput.value.trim();
    const searchTerm = searchInput.value.trim().toLowerCase();

    console.log('[List Navigator] Search params:', { useSelector, selector, searchTerm });

    // Clear previous highlights
    clearHighlights();
    matches = [];
    currentMatchIndex = -1;
    ignoredCount = 0;

    if (!searchTerm) {
      statusDiv.textContent = 'Enter search text';
      updateButtons();
      return;
    }

    let elements;

    if (useSelector) {
      // Mode 1: Use CSS selector
      if (!selector) {
        statusDiv.textContent = 'Enter a CSS selector';
        updateButtons();
        return;
      }

      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        statusDiv.textContent = 'Invalid CSS selector';
        updateButtons();
        return;
      }

      if (elements.length === 0) {
        statusDiv.textContent = `No elements found for selector "${selector}"`;
        updateButtons();
        return;
      }
    } else {
      // Mode 2: Search all text-containing elements (like Ctrl+F)
      // Get all elements that could contain visible text
      elements = document.querySelectorAll('body *');
    }

    // Search for matches
    elements.forEach((element) => {
      // Skip the navigator panel itself
      if (element.id === 'job-navigator-panel' || element.closest('#job-navigator-panel')) {
        return;
      }

      // In non-selector mode, only match leaf elements (elements that directly contain text)
      if (!useSelector) {
        // Skip if element has child elements (not a leaf)
        if (element.children.length > 0) {
          return;
        }
      }

      const text = element.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        // Check background color BEFORE applying highlight class
        // (highlight class changes background with !important)

        // Apply filters (mutually exclusive)
        const shouldIgnore = shouldIgnoreElement(element);
        const shouldShow = shouldOnlyShowElement(element);

        // Add to matches or ignored count
        if (shouldIgnore || !shouldShow) {
          ignoredCount++;
          // Don't highlight ignored/filtered elements at all
        } else {
          // Only highlight matches that pass filters
          element.classList.add('job-navigator-highlight');
          matches.push(element);
        }
      }
    });

    // Update status
    const totalFound = matches.length + ignoredCount;

    if (matches.length === 0) {
      if (ignoredCount > 0) {
        statusDiv.textContent = `Found ${totalFound} - all ignored`;
      } else {
        statusDiv.textContent = useSelector
          ? `No matches found in ${elements.length} elements`
          : 'No matches found';
      }
    } else {
      const ignoredText = ignoredCount > 0 ? ` (${ignoredCount} ignored)` : '';
      statusDiv.textContent = `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}${ignoredText}`;
      // Auto-navigate to first match
      currentMatchIndex = 0;
      highlightCurrentMatch();
    }

    updateButtons();
  }

  // Navigate to next match
  function navigateToNext() {
    if (matches.length === 0) return;

    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    highlightCurrentMatch();
  }

  // Navigate to previous match
  function navigateToPrevious() {
    if (matches.length === 0) return;

    currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    highlightCurrentMatch();
  }

  // Highlight current match and scroll to it
  function highlightCurrentMatch() {
    // Remove current highlight from all matches
    matches.forEach((match) => {
      match.classList.remove('job-navigator-highlight-current');
      match.classList.add('job-navigator-highlight');
    });

    // Highlight current match
    const currentMatch = matches[currentMatchIndex];
    if (!currentMatch) {
      console.error('[List Navigator] Invalid match index:', currentMatchIndex);
      return;
    }

    currentMatch.classList.remove('job-navigator-highlight');
    currentMatch.classList.add('job-navigator-highlight-current');

    // Scroll to center of viewport - use a small delay to ensure DOM has updated
    setTimeout(() => {
      currentMatch.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }, 10);

    // Update status
    const ignoredText = ignoredCount > 0 ? ` (${ignoredCount} ignored)` : '';
    statusDiv.textContent = `Match ${currentMatchIndex + 1} of ${matches.length}${ignoredText}`;
    updateButtons();
  }

  // Update button states
  function updateButtons() {
    const hasMatches = matches.length > 0;
    prevButton.disabled = !hasMatches;
    nextButton.disabled = !hasMatches;
  }

  // Clear all highlights
  function clearHighlights() {
    document.querySelectorAll('.job-navigator-highlight, .job-navigator-highlight-current')
      .forEach((el) => {
        el.classList.remove('job-navigator-highlight', 'job-navigator-highlight-current');
      });
  }

  // Listen for messages from background script
  browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      togglePanel();
    }
  });

  // Keyboard shortcut: Ctrl+Shift+F
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      console.log('[List Navigator] Keyboard shortcut detected');
      e.preventDefault();
      togglePanel();
    }
  });

  console.log('[List Navigator] Content script loaded successfully');

})();
