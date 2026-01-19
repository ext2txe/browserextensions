// Web Workflow Toolkit - Unified Content Script
// Combines: Highlighter, List Navigator, Job Post Analyzer, Auto Load More
const VERSION = '0.2.25';

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('[Web Workflow Toolkit] Content script loaded v' + VERSION);

// ============================================================================
// NAMESPACE: Keyword Highlighter Module
// ============================================================================
const HighlighterModule = (function() {
  'use strict';

  let keywords = [];
  let highlightColor = '#d3d3d3';
  let settingsPanel = null;
  let urlPatterns = [];
  let elementSelector = 'article, .job, .listing, section';
  let isEnabled = false;
  let useWordBoundaries = true;
  let hitCount = 0;

  // Check if current URL matches any configured patterns
  function matchesUrlPattern(url, pattern) {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '___DOUBLESTAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/___DOUBLESTAR___/g, '.*');
    const regex = new RegExp('^' + regexPattern + '$');
    return regex.test(url);
  }

  function shouldRunOnCurrentPage() {
    const currentUrl = window.location.href;
    if (!urlPatterns || urlPatterns.length === 0) return false;
    return urlPatterns.some(pattern => matchesUrlPattern(currentUrl, pattern));
  }

  // Load settings from storage
  function loadSettings() {
    console.log('[Highlighter] Loading settings...');
    browserAPI.storage.local.get(['keywords', 'highlightColor', 'urlPatterns', 'elementSelector', 'useWordBoundaries']).then(function(result) {
      console.log('[Highlighter] Raw storage result:', result);
      keywords = result.keywords || [];
      highlightColor = result.highlightColor || '#d3d3d3';
      urlPatterns = result.urlPatterns || ['*://www.upwork.com/nx/find-work/*'];
      elementSelector = result.elementSelector || 'article, .job, .listing, section';
      useWordBoundaries = result.useWordBoundaries !== undefined ? result.useWordBoundaries : true;

      console.log('[Highlighter] Settings loaded:');
      console.log('[Highlighter]   - keywords:', keywords.length, 'items');
      console.log('[Highlighter]   - highlightColor:', highlightColor);
      console.log('[Highlighter]   - urlPatterns:', urlPatterns);
      console.log('[Highlighter]   - elementSelector:', elementSelector);
      console.log('[Highlighter]   - useWordBoundaries:', useWordBoundaries);

      isEnabled = shouldRunOnCurrentPage();
      console.log('[Highlighter] Enabled:', isEnabled);

      if (isEnabled) {
        highlightJobs();
        updateSettingsPanel();
      }
    }).catch(function(error) {
      console.error('[Highlighter] Error loading settings:', error);
    });
  }

  // Keyboard shortcut handler for Ctrl+Shift+,
  // NOTE: This is now handled by background.js, but keeping as fallback
  function handleKeyboardShortcut(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ',') {
      e.preventDefault();
      console.log('[Highlighter] Hotkey pressed: Ctrl+Shift+,');
      toggleSettingsPanel();
    }
  }

  // Make panel draggable
  function makePanelDraggable(panel, handle) {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;

    handle.style.cursor = 'move';
    handle.style.userSelect = 'none';

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      initialX = e.clientX - (parseInt(panel.style.left) || 0);
      initialY = e.clientY - (parseInt(panel.style.top) || 0);
      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        const maxX = window.innerWidth - panel.offsetWidth;
        const maxY = window.innerHeight - panel.offsetHeight;
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));
        panel.style.left = currentX + 'px';
        panel.style.top = currentY + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
      }
    }

    function dragEnd(e) {
      isDragging = false;
      // Save position
      const position = {
        left: panel.style.left,
        top: panel.style.top
      };
      localStorage.setItem('ww-highlighter-position', JSON.stringify(position));
    }
  }

  // Create settings panel
  function createSettingsPanel() {
    console.log('[Highlighter] createSettingsPanel called');
    injectHighlightStyles();

    const panel = document.createElement('div');
    panel.id = 'ww-highlighter-panel';
    console.log('[Highlighter] Panel div created');
    panel.style.cssText = `
      position: fixed !important;
      bottom: 80px !important;
      right: 20px !important;
      width: 400px !important;
      max-height: 600px !important;
      z-index: 2147483649 !important;
      background: white !important;
      border-radius: 8px !important;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3) !important;
      padding: 0 !important;
      display: none;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    panel.innerHTML = `
      <div id="hl-panel-header" style="background: #4CAF50 !important; color: white !important; padding: 12px 20px !important; border-radius: 8px 8px 0 0 !important; margin: 0 !important; cursor: move !important; user-select: none !important;">
        <h2 style="margin: 0 !important; font-size: 18px !important; font-weight: bold !important; color: white !important;">
          ⚙️ Highlighter Settings <span style="font-size: 12px !important; font-weight: normal !important; opacity: 0.9 !important;">v${VERSION}</span>
        </h2>
      </div>
      <div style="padding: 20px !important; max-height: 550px !important; overflow-y: auto !important; background: white !important;">

      <div style="margin-bottom: 16px !important;">
        <label style="display: block !important; margin-bottom: 8px !important; font-weight: 500 !important; color: #555 !important;">Highlight Color:</label>
        <input type="color" id="hl-color-picker" value="#d3d3d3" style="width: 100% !important; height: 40px !important; border: 1px solid #ddd !important; border-radius: 4px !important; cursor: pointer !important;">
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #555;">Active URLs</h3>
        <p style="font-size: 12px; color: #666; margin: 0 0 12px 0;">Extension only runs on these URL patterns. Use * as wildcard.</p>

        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="hl-new-url" placeholder="e.g., *://www.upwork.com/*" style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
          <button id="hl-add-url-btn" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Add</button>
        </div>

        <ul id="hl-url-list" style="list-style: none; padding: 0; margin: 0 0 16px 0; max-height: 150px; overflow-y: auto;"></ul>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #555;">Element Selector</h3>
        <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">CSS selector for elements to highlight (comma-separated)</p>
        <input type="text" id="hl-selector" placeholder="article, .job, .listing" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-bottom: 8px;">
        <button id="hl-test-selector-btn" style="background: #FF9800; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">Test Selector (adds border)</button>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #555;">Keywords</h3>
        <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">Elements containing any of these keywords will be highlighted. Use * as wildcard (e.g., [$*] matches [$500], [$1000]).</p>

        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; cursor: pointer;">
          <input type="checkbox" id="hl-word-boundaries" style="width: 18px; height: 18px; cursor: pointer;">
          <span>Match whole words only (prevents "mys" from matching "MySQL")</span>
        </label>

        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="hl-new-keyword" placeholder="Enter keyword (e.g., India, [$*], node*)" style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
          <button id="hl-add-btn" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Add</button>
        </div>

        <ul id="hl-keyword-list" style="list-style: none; padding: 0; margin: 0 0 16px 0; max-height: 150px; overflow-y: auto;"></ul>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <button id="hl-export-btn" style="flex: 1; background: #FF9800; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">
          Export Settings
        </button>
        <button id="hl-import-btn" style="flex: 1; background: #9C27B0; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">
          Import Settings
        </button>
      </div>
      <input type="file" id="hl-import-file" accept=".json" style="display: none;">

      <button id="hl-save-btn" style="width: 100%; background: #2196F3; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 500; margin-bottom: 8px;">
        Save Settings
      </button>

      <button id="hl-close-btn" style="width: 100%; background: #666; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 14px;">
        Close
      </button>

      <div id="hl-status" style="margin-top: 12px; padding: 10px; border-radius: 4px; text-align: center; font-size: 14px; display: none;"></div>
      </div>
    `;

    console.log('[Highlighter] Appending panel to body...');
    document.body.appendChild(panel);
    settingsPanel = panel;
    console.log('[Highlighter] Panel appended, settingsPanel variable set');

    // Restore saved position
    const savedPosition = localStorage.getItem('ww-highlighter-position');
    console.log('[Highlighter] Saved position from localStorage:', savedPosition);

    if (savedPosition) {
      try {
        const position = JSON.parse(savedPosition);
        console.log('[Highlighter] Parsed position:', position);

        // Only apply saved position if it has valid values
        if (position.left && position.top &&
            !isNaN(parseInt(position.left)) && !isNaN(parseInt(position.top))) {
          panel.style.left = position.left;
          panel.style.top = position.top;
          panel.style.right = 'auto';
          panel.style.bottom = 'auto';
          console.log('[Highlighter] Applied saved position');
        } else {
          console.log('[Highlighter] Saved position invalid, using default position');
        }
      } catch (e) {
        console.error('[Highlighter] Error parsing saved position:', e);
      }
    } else {
      console.log('[Highlighter] No saved position, using default (bottom: 80px, right: 20px)');
    }

    const header = document.getElementById('hl-panel-header');
    if (header) makePanelDraggable(panel, header);

    // Event listeners
    document.getElementById('hl-add-btn').addEventListener('click', addKeywordFromPanel);
    document.getElementById('hl-new-keyword').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') addKeywordFromPanel();
    });
    document.getElementById('hl-add-url-btn').addEventListener('click', addUrlFromPanel);
    document.getElementById('hl-new-url').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') addUrlFromPanel();
    });
    document.getElementById('hl-test-selector-btn').addEventListener('click', testSelector);
    document.getElementById('hl-save-btn').addEventListener('click', saveSettingsFromPanel);
    document.getElementById('hl-close-btn').addEventListener('click', toggleSettingsPanel);
    document.getElementById('hl-export-btn').addEventListener('click', exportSettings);
    document.getElementById('hl-import-btn').addEventListener('click', function() {
      document.getElementById('hl-import-file').click();
    });
    document.getElementById('hl-import-file').addEventListener('change', handleFileImport);

    updateSettingsPanel();
  }

  function toggleSettingsPanel() {
    console.log('[Highlighter] toggleSettingsPanel called, settingsPanel exists:', !!settingsPanel);

    if (!settingsPanel) {
      console.log('[Highlighter] Creating settings panel...');
      createSettingsPanel();
      console.log('[Highlighter] Settings panel created:', settingsPanel);
    }

    const currentDisplay = window.getComputedStyle(settingsPanel).display;
    console.log('[Highlighter] Current display:', currentDisplay);
    console.log('[Highlighter] Panel position:', {
      top: settingsPanel.style.top,
      bottom: settingsPanel.style.bottom,
      left: settingsPanel.style.left,
      right: settingsPanel.style.right,
      position: settingsPanel.style.position,
      zIndex: settingsPanel.style.zIndex
    });

    if (currentDisplay === 'none') {
      console.log('[Highlighter] Showing panel...');
      settingsPanel.style.setProperty('display', 'block', 'important');
      console.log('[Highlighter] Display property set to block');

      // Also ensure it's visible and in viewport
      settingsPanel.style.setProperty('opacity', '1', 'important');
      settingsPanel.style.setProperty('visibility', 'visible', 'important');
    } else {
      console.log('[Highlighter] Hiding panel...');
      settingsPanel.style.setProperty('display', 'none', 'important');
    }

    const finalDisplay = window.getComputedStyle(settingsPanel).display;
    console.log('[Highlighter] Final display:', finalDisplay);
    console.log('[Highlighter] Panel in DOM:', document.body.contains(settingsPanel));
    console.log('[Highlighter] Panel getBoundingClientRect:', settingsPanel.getBoundingClientRect());
  }

  function updateSettingsPanel() {
    if (!settingsPanel) return;

    const colorPicker = document.getElementById('hl-color-picker');
    if (colorPicker) colorPicker.value = highlightColor;

    const selectorInput = document.getElementById('hl-selector');
    if (selectorInput) selectorInput.value = elementSelector;

    const wordBoundariesCheckbox = document.getElementById('hl-word-boundaries');
    if (wordBoundariesCheckbox) wordBoundariesCheckbox.checked = useWordBoundaries;

    const urlList = document.getElementById('hl-url-list');
    if (urlList) {
      urlList.innerHTML = '';
      if (urlPatterns.length === 0) {
        const li = document.createElement('li');
        li.style.cssText = 'text-align: center; color: #999; padding: 20px; font-style: italic;';
        li.textContent = 'No URL patterns added';
        urlList.appendChild(li);
      } else {
        urlPatterns.forEach((url, index) => {
          const li = document.createElement('li');
          li.style.cssText = 'display: flex; gap: 8px; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px; border: 1px solid #e0e0e0;';

          const input = document.createElement('input');
          input.type = 'text';
          input.value = url;
          input.style.cssText = 'flex: 1; padding: 6px 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px; font-family: monospace;';
          input.dataset.index = index;

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.style.cssText = 'background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 13px;';
          deleteBtn.onclick = function() {
            urlPatterns.splice(index, 1);
            updateSettingsPanel();
            showStatus('URL removed. Click "Save Settings" to apply.', 'info');
          };

          li.appendChild(input);
          li.appendChild(deleteBtn);
          urlList.appendChild(li);
        });
      }
    }

    const keywordList = document.getElementById('hl-keyword-list');
    if (!keywordList) return;

    keywordList.innerHTML = '';
    if (keywords.length === 0) {
      const li = document.createElement('li');
      li.style.cssText = 'text-align: center; color: #999; padding: 20px; font-style: italic;';
      li.textContent = 'No keywords added yet';
      keywordList.appendChild(li);
      return;
    }

    keywords.forEach((keyword, index) => {
      const li = document.createElement('li');
      li.style.cssText = 'display: flex; gap: 8px; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px; border: 1px solid #e0e0e0;';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = keyword;
      input.style.cssText = 'flex: 1; padding: 6px 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px;';
      input.dataset.index = index;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.cssText = 'background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 13px;';
      deleteBtn.onclick = function() {
        keywords.splice(index, 1);
        updateSettingsPanel();
        showStatus('Keyword removed. Click "Save Settings" to apply.', 'info');
      };

      li.appendChild(input);
      li.appendChild(deleteBtn);
      keywordList.appendChild(li);
    });
  }

  function addKeywordFromPanel() {
    const input = document.getElementById('hl-new-keyword');
    const keyword = input.value.trim();

    if (keyword && !keywords.includes(keyword)) {
      keywords.push(keyword);
      input.value = '';
      updateSettingsPanel();
      showStatus('Keyword added. Click "Save Settings" to apply.', 'info');
    } else if (keywords.includes(keyword)) {
      showStatus('This keyword already exists!', 'error');
    }
  }

  function addUrlFromPanel() {
    const input = document.getElementById('hl-new-url');
    const url = input.value.trim();

    if (url && !urlPatterns.includes(url)) {
      urlPatterns.push(url);
      input.value = '';
      updateSettingsPanel();
      showStatus('URL pattern added. Click "Save Settings" to apply and reload page.', 'info');
    } else if (urlPatterns.includes(url)) {
      showStatus('This URL pattern already exists!', 'error');
    }
  }

  function testSelector() {
    const selectorInput = document.getElementById('hl-selector');
    const testSelector = selectorInput.value.trim() || elementSelector;

    document.querySelectorAll('[data-hl-test]').forEach(el => {
      el.style.border = '';
      el.removeAttribute('data-hl-test');
    });

    try {
      const elements = document.querySelectorAll(testSelector);
      if (elements.length === 0) {
        showStatus(`No elements found with selector "${testSelector}"`, 'error');
      } else {
        elements.forEach(el => {
          el.style.border = '3px solid #FF9800';
          el.setAttribute('data-hl-test', 'true');
        });
        showStatus(`Found ${elements.length} elements. Borders added for 5 seconds.`, 'success');

        setTimeout(() => {
          document.querySelectorAll('[data-hl-test]').forEach(el => {
            el.style.border = '';
            el.removeAttribute('data-hl-test');
          });
        }, 5000);
      }
    } catch (error) {
      showStatus('Invalid CSS selector: ' + error.message, 'error');
    }
  }

  function saveSettingsFromPanel() {
    const keywordInputs = document.querySelectorAll('#hl-keyword-list input');
    const newKeywords = [];
    keywordInputs.forEach(input => {
      const value = input.value.trim();
      if (value) newKeywords.push(value);
    });
    keywords = newKeywords;

    const urlInputs = document.querySelectorAll('#hl-url-list input');
    const newUrls = [];
    urlInputs.forEach(input => {
      const value = input.value.trim();
      if (value) newUrls.push(value);
    });
    urlPatterns = newUrls;

    const colorPicker = document.getElementById('hl-color-picker');
    if (colorPicker) highlightColor = colorPicker.value;

    const selectorInput = document.getElementById('hl-selector');
    if (selectorInput) elementSelector = selectorInput.value.trim() || elementSelector;

    const wordBoundariesCheckbox = document.getElementById('hl-word-boundaries');
    if (wordBoundariesCheckbox) useWordBoundaries = wordBoundariesCheckbox.checked;

    const settingsToSave = {
      keywords: keywords,
      highlightColor: highlightColor,
      urlPatterns: urlPatterns,
      elementSelector: elementSelector,
      useWordBoundaries: useWordBoundaries
    };

    browserAPI.storage.local.set(settingsToSave).then(function() {
      console.log('[Highlighter] Settings saved successfully');
      showStatus('Settings saved! Reload page if URL patterns changed.', 'success');
      highlightJobs();
      setTimeout(() => {
        const statusDiv = document.getElementById('hl-status');
        if (statusDiv) statusDiv.style.display = 'none';
      }, 3000);
    }).catch(function(error) {
      console.error('[Highlighter] Error saving settings:', error);
      showStatus('Error saving settings: ' + error.message, 'error');
    });
  }

  function showStatus(message, type) {
    const statusDiv = document.getElementById('hl-status');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.style.display = 'block';

    if (type === 'success') {
      statusDiv.style.cssText += 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
    } else if (type === 'error') {
      statusDiv.style.cssText += 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
    } else if (type === 'info') {
      statusDiv.style.cssText += 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
    }
  }

  function exportSettings() {
    const settings = {
      version: VERSION,
      exportDate: new Date().toISOString(),
      keywords: keywords,
      urlPatterns: urlPatterns,
      highlightColor: highlightColor,
      elementSelector: elementSelector,
      useWordBoundaries: useWordBoundaries
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `highlighter-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('Settings exported successfully!', 'success');
    setTimeout(() => {
      const statusDiv = document.getElementById('hl-status');
      if (statusDiv) statusDiv.style.display = 'none';
    }, 3000);
  }

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const settings = JSON.parse(e.target.result);

        if (!settings || typeof settings !== 'object') {
          throw new Error('Invalid settings file format');
        }

        keywords = Array.isArray(settings.keywords) ? settings.keywords : [];
        urlPatterns = Array.isArray(settings.urlPatterns) ? settings.urlPatterns : ['*://www.upwork.com/nx/find-work/*'];
        highlightColor = settings.highlightColor || '#d3d3d3';
        elementSelector = settings.elementSelector || 'article, .job, .listing, section';
        useWordBoundaries = settings.useWordBoundaries !== undefined ? settings.useWordBoundaries : true;

        updateSettingsPanel();
        showStatus('Settings imported successfully! Click "Save Settings" to apply.', 'success');
        setTimeout(() => {
          const statusDiv = document.getElementById('hl-status');
          if (statusDiv) statusDiv.style.display = 'none';
        }, 5000);
      } catch (error) {
        console.error('Error importing settings:', error);
        showStatus('Error importing settings: ' + error.message, 'error');
        setTimeout(() => {
          const statusDiv = document.getElementById('hl-status');
          if (statusDiv) statusDiv.style.display = 'none';
        }, 5000);
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  }

  function containsKeyword(text) {
    if (!text || keywords.length === 0) return false;

    return keywords.some(keyword => {
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) return false;

      const hasWildcard = trimmedKeyword.includes('*');

      if (hasWildcard) {
        const regexPattern = trimmedKeyword
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        const regex = new RegExp(regexPattern, 'i');
        return regex.test(text);
      } else if (useWordBoundaries) {
        const escapedKeyword = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('\\b' + escapedKeyword + '\\b', 'i');
        return regex.test(text);
      } else {
        return text.toLowerCase().includes(trimmedKeyword.toLowerCase());
      }
    });
  }

  function injectHighlightStyles() {
    console.log('[Highlighter] Injecting styles with color:', highlightColor);
    const existingStyle = document.getElementById('ww-highlighter-style');
    if (existingStyle) {
      console.log('[Highlighter] Removing existing style element');
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'ww-highlighter-style';
    style.textContent = `
      .ww-keyword-highlighter-match:not(#ww-highlighter-panel):not(#ww-highlighter-panel *) {
        background-color: ${highlightColor} !important;
      }

      #ww-highlighter-panel * {
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }

      #ww-highlighter-panel button {
        display: inline-block !important;
        border: none !important;
        cursor: pointer !important;
        font-size: inherit !important;
        line-height: normal !important;
        text-align: center !important;
        text-decoration: none !important;
        vertical-align: middle !important;
      }

      #ww-highlighter-panel input {
        display: block !important;
        border: 1px solid #ddd !important;
        line-height: normal !important;
        vertical-align: middle !important;
      }

      #ww-highlighter-panel label,
      #ww-highlighter-panel span,
      #ww-highlighter-panel p,
      #ww-highlighter-panel h2,
      #ww-highlighter-panel h3 {
        display: block !important;
        line-height: normal !important;
      }
    `;
    document.head.appendChild(style);
  }

  function highlightJobs() {
    if (!isEnabled) return;

    injectHighlightStyles();

    try {
      const elements = document.querySelectorAll(elementSelector);
      hitCount = 0;

      elements.forEach(element => {
        if (element.id === 'ww-highlighter-panel' || element.closest('#ww-highlighter-panel')) {
          return;
        }

        const elementText = element.textContent;

        if (containsKeyword(elementText)) {
          element.classList.add('ww-keyword-highlighter-match');
          hitCount++;
        } else {
          element.classList.remove('ww-keyword-highlighter-match');
        }
      });

      console.log(`[Highlighter] Highlighted ${hitCount} of ${elements.length} elements`);
    } catch (error) {
      console.error('[Highlighter] Error highlighting elements:', error);
    }
  }

  const observer = new MutationObserver(function(mutations) {
    highlightJobs();
  });

  function init() {
    console.log('[Highlighter] Initializing...');
    loadSettings();

    document.addEventListener('keydown', handleKeyboardShortcut);

    setTimeout(() => {
      if (isEnabled) {
        const targetNode = document.body;
        if (targetNode) {
          observer.observe(targetNode, {
            childList: true,
            subtree: true
          });
        }
      }
    }, 500);
  }

  browserAPI.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      console.log('[Highlighter] Storage changed:', changes);
      if (changes.keywords) {
        keywords = changes.keywords.newValue || [];
        console.log('[Highlighter] Keywords updated:', keywords.length, 'items');
      }
      if (changes.highlightColor) {
        highlightColor = changes.highlightColor.newValue || '#d3d3d3';
        console.log('[Highlighter] Color updated to:', highlightColor);
      }
      if (changes.urlPatterns) {
        urlPatterns = changes.urlPatterns.newValue || [];
        isEnabled = shouldRunOnCurrentPage();
        console.log('[Highlighter] URL patterns updated, enabled:', isEnabled);
      }
      if (changes.elementSelector) {
        elementSelector = changes.elementSelector.newValue || 'article, .job, .listing, section';
        console.log('[Highlighter] Element selector updated:', elementSelector);
      }
      if (changes.useWordBoundaries) {
        useWordBoundaries = changes.useWordBoundaries.newValue !== undefined ? changes.useWordBoundaries.newValue : true;
        console.log('[Highlighter] Word boundaries updated:', useWordBoundaries);
      }

      if (isEnabled) {
        console.log('[Highlighter] Re-applying highlights due to storage change');
        highlightJobs();
        updateSettingsPanel();
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    toggle: toggleSettingsPanel,
    reload: loadSettings
  };
})();

// ============================================================================
// NAMESPACE: List Navigator Module
// ============================================================================
const NavigatorModule = (function() {
  'use strict';

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

  function createPanel() {
    if (panel) return;

    panel = document.createElement('div');
    panel.id = 'ww-navigator-panel';
    panel.innerHTML = `
      <div id="ww-navigator-header">
        <span>List Navigator <span style="font-size: 0.8em; opacity: 0.7;">v${VERSION}</span></span>
        <button id="ww-navigator-close" title="Close (Esc)">×</button>
      </div>
      <div id="ww-navigator-content">
        <div id="ww-navigator-selector-container">
          <label id="ww-navigator-selector-label">
            <input type="checkbox" id="ww-navigator-use-selector" />
            Use CSS Selector (advanced)
          </label>
          <input type="text" id="ww-navigator-selector" placeholder="CSS Selector (e.g., section.item, article)" disabled />
        </div>
        <input type="text" id="ww-navigator-search" placeholder="Search text (case-insensitive)" />
        <div id="ww-navigator-ignore-container">
          <label id="ww-navigator-ignore-label">
            <input type="checkbox" id="ww-navigator-ignore-enabled" />
            Ignore matches with background color:
          </label>
          <input type="color" id="ww-navigator-ignore-color" value="#ffffff" disabled />
        </div>
        <div id="ww-navigator-onlyshow-container">
          <label id="ww-navigator-onlyshow-label">
            <input type="checkbox" id="ww-navigator-onlyshow-enabled" />
            Only show matches with background color:
          </label>
          <input type="color" id="ww-navigator-onlyshow-color" value="#ffffff" disabled />
        </div>
        <div id="ww-navigator-controls">
          <button id="ww-navigator-prev" disabled>↑ Previous</button>
          <button id="ww-navigator-next" disabled>↓ Next</button>
          <button id="ww-navigator-refresh" title="Re-scan page for new matches">🔄 Refresh</button>
        </div>
        <div id="ww-navigator-status">Enter search text to find matches</div>
        <div style="margin: 12px 0; padding: 8px 0; border-top: 1px solid #ddd;">
          <button id="ww-open-highlighter-btn" style="width: 100%; padding: 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">
            🎨 Open Highlighter Settings
          </button>
        </div>
        <div id="ww-navigator-help">
          <div><strong>Tips:</strong></div>
          <div>• Type to search all text on page</div>
          <div>• Or enable selector to search specific elements</div>
          <div>• Press <strong>Enter</strong> for next match</div>
          <div>• Press <strong>Shift+Enter</strong> for previous</div>
          <div>• Press <strong>Esc</strong> to close</div>
        </div>
      </div>
    `;

    // Inject CSS
    injectNavigatorStyles();

    document.body.appendChild(panel);

    // Restore saved position
    const savedPosition = localStorage.getItem('ww-navigator-position');
    if (savedPosition) {
      const position = JSON.parse(savedPosition);
      panel.style.left = position.left;
      panel.style.top = position.top;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    // Get references
    useSelectorCheckbox = document.getElementById('ww-navigator-use-selector');
    selectorInput = document.getElementById('ww-navigator-selector');
    searchInput = document.getElementById('ww-navigator-search');
    statusDiv = document.getElementById('ww-navigator-status');
    prevButton = document.getElementById('ww-navigator-prev');
    nextButton = document.getElementById('ww-navigator-next');
    ignoreEnabledCheckbox = document.getElementById('ww-navigator-ignore-enabled');
    ignoreColorInput = document.getElementById('ww-navigator-ignore-color');
    onlyShowEnabledCheckbox = document.getElementById('ww-navigator-onlyshow-enabled');
    onlyShowColorInput = document.getElementById('ww-navigator-onlyshow-color');
    const refreshButton = document.getElementById('ww-navigator-refresh');
    const closeButton = document.getElementById('ww-navigator-close');
    const header = document.getElementById('ww-navigator-header');

    // Load saved values
    const savedSelector = localStorage.getItem('ww-navigator-selector');
    const savedUseSelector = localStorage.getItem('ww-navigator-use-selector') === 'true';
    const savedSearchText = localStorage.getItem('ww-navigator-search-text') || '';
    const savedIgnoreEnabled = localStorage.getItem('ww-navigator-ignore-enabled') === 'true';
    const savedIgnoreColor = localStorage.getItem('ww-navigator-ignore-color') || '#ffffff';
    const savedOnlyShowEnabled = localStorage.getItem('ww-navigator-onlyshow-enabled') === 'true';
    const savedOnlyShowColor = localStorage.getItem('ww-navigator-onlyshow-color') || '#ffffff';

    if (savedSelector) selectorInput.value = savedSelector;
    if (savedSearchText) searchInput.value = savedSearchText;

    useSelectorCheckbox.checked = savedUseSelector;
    selectorInput.disabled = !savedUseSelector;

    ignoreEnabledCheckbox.checked = savedIgnoreEnabled;
    ignoreColorInput.value = savedIgnoreColor;
    ignoreColorInput.disabled = !savedIgnoreEnabled;

    onlyShowEnabledCheckbox.checked = savedOnlyShowEnabled;
    onlyShowColorInput.value = savedOnlyShowColor;
    onlyShowColorInput.disabled = !savedOnlyShowEnabled;

    if (savedIgnoreEnabled && savedOnlyShowEnabled) {
      ignoreEnabledCheckbox.checked = false;
      ignoreColorInput.disabled = true;
      localStorage.setItem('ww-navigator-ignore-enabled', 'false');
    }

    // Event listeners
    useSelectorCheckbox.addEventListener('change', () => {
      const useSelector = useSelectorCheckbox.checked;
      selectorInput.disabled = !useSelector;
      localStorage.setItem('ww-navigator-use-selector', useSelector);
      performSearch();
    });

    ignoreEnabledCheckbox.addEventListener('change', () => {
      const ignoreEnabled = ignoreEnabledCheckbox.checked;
      ignoreColorInput.disabled = !ignoreEnabled;

      if (ignoreEnabled && onlyShowEnabledCheckbox.checked) {
        onlyShowEnabledCheckbox.checked = false;
        onlyShowColorInput.disabled = true;
        localStorage.setItem('ww-navigator-onlyshow-enabled', 'false');
      }

      localStorage.setItem('ww-navigator-ignore-enabled', ignoreEnabled);
      performSearch();
    });

    ignoreColorInput.addEventListener('input', () => {
      const newColor = ignoreColorInput.value;
      localStorage.setItem('ww-navigator-ignore-color', newColor);
      performSearch();
    });

    onlyShowEnabledCheckbox.addEventListener('change', () => {
      const onlyShowEnabled = onlyShowEnabledCheckbox.checked;
      onlyShowColorInput.disabled = !onlyShowEnabled;

      if (onlyShowEnabled && ignoreEnabledCheckbox.checked) {
        ignoreEnabledCheckbox.checked = false;
        ignoreColorInput.disabled = true;
        localStorage.setItem('ww-navigator-ignore-enabled', 'false');
      }

      localStorage.setItem('ww-navigator-onlyshow-enabled', onlyShowEnabled);
      performSearch();
    });

    onlyShowColorInput.addEventListener('input', () => {
      const newColor = onlyShowColorInput.value;
      localStorage.setItem('ww-navigator-onlyshow-color', newColor);
      performSearch();
    });

    selectorInput.addEventListener('input', () => {
      localStorage.setItem('ww-navigator-selector', selectorInput.value);
      performSearch();
    });

    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value;
      localStorage.setItem('ww-navigator-search-text', searchValue);
      performSearch();
    });

    prevButton.addEventListener('click', navigateToPrevious);
    nextButton.addEventListener('click', navigateToNext);
    refreshButton.addEventListener('click', () => performSearch());
    closeButton.addEventListener('click', hidePanel);

    // Open Highlighter button
    const openHighlighterBtn = document.getElementById('ww-open-highlighter-btn');
    console.log('[Navigator] Looking for Open Highlighter button:', openHighlighterBtn);
    if (openHighlighterBtn) {
      console.log('[Navigator] Attaching click listener to Open Highlighter button');
      openHighlighterBtn.addEventListener('click', () => {
        console.log('[Navigator] Open Highlighter button clicked!');
        HighlighterModule.toggle();
      });
      console.log('[Navigator] Event listener attached successfully');
    } else {
      console.error('[Navigator] ERROR: Open Highlighter button not found!');
    }

    document.addEventListener('keydown', (e) => {
      if (!panel.classList.contains('ww-visible')) return;

      if (e.key === 'Escape') {
        hidePanel();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          navigateToPrevious();
        } else {
          navigateToNext();
        }
      }
    });

    // Dragging
    header.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
  }

  function injectNavigatorStyles() {
    if (document.getElementById('ww-navigator-styles')) return;

    const style = document.createElement('style');
    style.id = 'ww-navigator-styles';
    style.textContent = `
      #ww-navigator-panel {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 350px;
        background: white;
        border: 2px solid #4CAF50;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2147483646;
        font-family: Arial, sans-serif;
        display: none;
      }
      #ww-navigator-panel.ww-visible {
        display: block;
      }
      #ww-navigator-header {
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        font-weight: bold;
        font-size: 16px;
        border-radius: 6px 6px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      #ww-navigator-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        line-height: 1;
      }
      #ww-navigator-content {
        padding: 15px;
      }
      #ww-navigator-selector-container,
      #ww-navigator-ignore-container,
      #ww-navigator-onlyshow-container {
        margin-bottom: 12px;
      }
      #ww-navigator-selector-label,
      #ww-navigator-ignore-label,
      #ww-navigator-onlyshow-label {
        display: block;
        margin-bottom: 5px;
        font-size: 13px;
        cursor: pointer;
      }
      #ww-navigator-search,
      #ww-navigator-selector {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 10px;
        box-sizing: border-box;
      }
      #ww-navigator-ignore-color,
      #ww-navigator-onlyshow-color {
        width: 100%;
        height: 35px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      #ww-navigator-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
      }
      #ww-navigator-controls button {
        flex: 1;
        padding: 8px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      }
      #ww-navigator-controls button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      #ww-navigator-refresh {
        background: #FF9800 !important;
      }
      #ww-navigator-status {
        padding: 8px;
        background: #f0f0f0;
        border-radius: 4px;
        font-size: 13px;
        text-align: center;
        margin-bottom: 10px;
      }
      #ww-navigator-help {
        font-size: 12px;
        color: #666;
        line-height: 1.5;
      }
      .ww-navigator-highlight {
        background-color: #FFEB3B !important;
        outline: 2px solid #FFC107 !important;
      }
      .ww-navigator-highlight-current {
        background-color: #FF9800 !important;
        outline: 3px solid #F57C00 !important;
      }
    `;
    document.head.appendChild(style);
  }

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

    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;

    panel.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    panel.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    panel.style.right = 'auto';
  }

  function stopDragging() {
    if (isDragging) {
      isDragging = false;
      panel.style.cursor = '';
      // Save position
      const position = {
        left: panel.style.left,
        top: panel.style.top
      };
      localStorage.setItem('ww-navigator-position', JSON.stringify(position));
    }
  }

  function showPanel() {
    createPanel();
    panel.classList.add('ww-visible');

    if (!searchInput) searchInput = document.getElementById('ww-navigator-search');

    if (searchInput) {
      searchInput.focus();

      setTimeout(() => {
        const searchValue = searchInput.value.trim();
        if (searchValue) performSearch();
      }, 100);
    }
  }

  function hidePanel() {
    if (panel) {
      panel.classList.remove('ww-visible');
      clearHighlights();
    }
  }

  function togglePanel() {
    if (panel && panel.classList.contains('ww-visible')) {
      hidePanel();
    } else {
      showPanel();
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function colorsMatch(rgbColor, hexColor) {
    const rgbMatch = rgbColor.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) return false;

    const rgb1 = {
      r: parseInt(rgbMatch[0]),
      g: parseInt(rgbMatch[1]),
      b: parseInt(rgbMatch[2])
    };

    const rgb2 = hexToRgb(hexColor);
    if (!rgb2) return false;

    return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
  }

  function getEffectiveBackgroundColor(element) {
    let el = element;
    let depth = 0;
    const maxDepth = 10;

    while (el && el !== document.body && depth < maxDepth) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      el = el.parentElement;
      depth++;
    }
    return 'rgb(255, 255, 255)';
  }

  function shouldIgnoreElement(element) {
    if (!ignoreEnabledCheckbox || !ignoreEnabledCheckbox.checked) return false;

    const targetColor = ignoreColorInput ? ignoreColorInput.value : null;
    if (!targetColor) return false;

    const computedBg = getEffectiveBackgroundColor(element);
    return colorsMatch(computedBg, targetColor);
  }

  function shouldOnlyShowElement(element) {
    if (!onlyShowEnabledCheckbox || !onlyShowEnabledCheckbox.checked) return true;

    const targetColor = onlyShowColorInput ? onlyShowColorInput.value : null;
    if (!targetColor) return true;

    const computedBg = getEffectiveBackgroundColor(element);
    return colorsMatch(computedBg, targetColor);
  }

  function performSearch() {
    if (!useSelectorCheckbox || !selectorInput || !searchInput || !statusDiv) {
      console.error('[Navigator] Elements not initialized');
      return;
    }

    const useSelector = useSelectorCheckbox.checked;
    const selector = selectorInput.value.trim();
    const searchTerm = searchInput.value.trim().toLowerCase();

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
      elements = document.querySelectorAll('body *');
    }

    elements.forEach((element) => {
      if (element.id === 'ww-navigator-panel' || element.closest('#ww-navigator-panel')) {
        return;
      }

      if (!useSelector) {
        if (element.children.length > 0) return;
      }

      const text = element.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        const shouldIgnore = shouldIgnoreElement(element);
        const shouldShow = shouldOnlyShowElement(element);

        if (shouldIgnore || !shouldShow) {
          ignoredCount++;
        } else {
          element.classList.add('ww-navigator-highlight');
          matches.push(element);
        }
      }
    });

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
      currentMatchIndex = 0;
      highlightCurrentMatch();
    }

    updateButtons();
  }

  function navigateToNext() {
    if (matches.length === 0) return;

    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    highlightCurrentMatch();
  }

  function navigateToPrevious() {
    if (matches.length === 0) return;

    currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    highlightCurrentMatch();
  }

  function highlightCurrentMatch() {
    matches.forEach((match) => {
      match.classList.remove('ww-navigator-highlight-current');
      match.classList.add('ww-navigator-highlight');
    });

    const currentMatch = matches[currentMatchIndex];
    if (!currentMatch) return;

    currentMatch.classList.remove('ww-navigator-highlight');
    currentMatch.classList.add('ww-navigator-highlight-current');

    setTimeout(() => {
      currentMatch.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }, 10);

    const ignoredText = ignoredCount > 0 ? ` (${ignoredCount} ignored)` : '';
    statusDiv.textContent = `Match ${currentMatchIndex + 1} of ${matches.length}${ignoredText}`;
    updateButtons();
  }

  function updateButtons() {
    const hasMatches = matches.length > 0;
    prevButton.disabled = !hasMatches;
    nextButton.disabled = !hasMatches;
  }

  function clearHighlights() {
    document.querySelectorAll('.ww-navigator-highlight, .ww-navigator-highlight-current')
      .forEach((el) => {
        el.classList.remove('ww-navigator-highlight', 'ww-navigator-highlight-current');
      });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      togglePanel();
    }
  });

  return {
    toggle: togglePanel
  };
})();

// ============================================================================
// NAMESPACE: Job Post Analyzer Module
// ============================================================================
const AnalyzerModule = (function() {
  'use strict';

  let data = null;
  let panel = null;
  let compactPanel = null;
  let autoDisplayMode = false;

  async function analyze(forceDetailedView = false) {
    console.log('[Analyzer] Starting analysis...');

    if (!isJobPostPage()) {
      showNotification('Please navigate to an Upwork job post page', 'error');
      return;
    }

    await expandAllSections();
    data = extractJobData();

    if (!data.jobDetails.title) {
      showNotification('Could not extract job data. Please ensure you are on a job post page.', 'error');
      return;
    }

    if (forceDetailedView) {
      displayResults();
    } else {
      displayCompactPanel();
    }

    console.log('[Analyzer] Analysis complete:', data);
  }

  async function quickAnalyze() {
    console.log('[Analyzer] Quick analysis...');

    if (!isJobPostPage()) return;

    data = extractJobData();

    if (!data.jobDetails.title) return;

    displayCompactPanel();
  }

  function isJobPostPage() {
    if (window.location.protocol === 'file:') return true;
    return window.location.href.includes('upwork.com');
  }

  async function expandAllSections() {
    console.log('[Analyzer] Expanding sections...');

    for (let pass = 0; pass < 3; pass++) {
      const expandButtons = [
        ...document.querySelectorAll('[data-cy="jobs-in-progress-button"]'),
        ...document.querySelectorAll('button.collapse-toggle'),
        ...document.querySelectorAll('button.jobs-in-progress-title'),
        ...document.querySelectorAll('a.js-show-more'),
        ...document.querySelectorAll('button[aria-expanded="false"]')
      ];

      let clickedCount = 0;
      for (const button of expandButtons) {
        try {
          if (button.offsetParent !== null) {
            const buttonText = button.textContent.toLowerCase().trim();

            if (buttonText.includes('apply') ||
                buttonText.includes('view job posting') ||
                buttonText.includes('submit proposal') ||
                button.tagName === 'A' && button.getAttribute('href')?.includes('/apply')) {
              continue;
            }

            const ariaExpanded = button.getAttribute('aria-expanded');
            if (ariaExpanded === 'false' ||
                button.classList.contains('js-show-more') ||
                buttonText.includes('view more') ||
                buttonText.includes('show more')) {
              button.click();
              clickedCount++;
              await sleep(300);
            }
          }
        } catch (e) {
          console.warn('[Analyzer] Could not expand:', e);
        }
      }

      if (clickedCount === 0) break;
      await sleep(800);
    }

    await sleep(500);
  }

  function extractJobData() {
    return {
      classification: '',
      confidence: null,
      jobDetails: extractJobDetails(),
      clientInfo: extractClientInfo(),
      activityInfo: extractActivityInfo(),
      jobHistory: extractJobHistory(),
      analysisMetadata: {
        analyzedAt: new Date().toISOString(),
        url: window.location.href,
        version: VERSION
      }
    };
  }

  function extractJobDetails() {
    const fixedPrice = getText('[data-cy="fixed-price"] strong');
    const hourlyRange = getText('[data-cy="hourly-range"] strong');

    let connectsText = getText('[data-test="connects-to-apply"]') ||
                       getText('[data-test="job-apply-cta"]') ||
                       getText('[data-qa="connects"]') || '';

    if (!connectsText) {
      const bodyText = document.body.textContent;
      const connectMatch = bodyText.match(/(\d+)\s+Connects?/i);
      connectsText = connectMatch ? connectMatch[0] : '';
    }

    const connectsMatch = connectsText.match(/(\d+)\s+(?:Connects?|connects?)/i);
    const connectsRequired = connectsMatch ? connectsMatch[1] : '';

    let availableConnectsText = getText('[data-test="available-connects"]') ||
                                getText('[data-qa="available-connects"]') || '';

    if (!availableConnectsText) {
      const bodyText = document.body.textContent;
      const patterns = [
        /You have (\d+) available Connects?/i,
        /(\d+) available Connects?/i,
        /(\d+) Connects? available/i,
        /Connects? available[:\s]+(\d+)/i
      ];

      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match) {
          availableConnectsText = match[0];
          break;
        }
      }
    }

    const availableMatch = availableConnectsText.match(/(\d+)/);
    const availableConnects = availableMatch ? availableMatch[1] : '';

    let bidRangeText = getText('[data-test="bid-range"]') ||
                       getText('.bid-range') ||
                       getText('[data-qa="bid-range"]') || '';

    if (!bidRangeText) {
      const h5Elements = document.querySelectorAll('h5');
      for (const h5 of h5Elements) {
        const text = h5.textContent;
        if (text.includes('Bid range')) {
          bidRangeText = text.replace(/^Bid range\s*-?\s*/i, '').trim();
          break;
        }
      }
    }

    if (!bidRangeText) {
      const bodyText = document.body.textContent;
      const bidMatch = bodyText.match(/Bid range[:\s-]+(.+?)(?:High|Avg|Low)\s*\$[\d,.]+ \| (?:High|Avg|Low)\s*\$[\d,.]+ \| (?:High|Avg|Low)\s*\$[\d,.]+/i) ||
                       bodyText.match(/Bid[:\s]+\$[\d,]+-\$[\d,]+/i);
      if (bidMatch) {
        bidRangeText = bidMatch[0].replace(/^Bid range\s*-?\s*/i, '').trim();
      }
    }

    return {
      title: getText('h4.d-flex span.flex-1') || getText('h4 span.flex-1'),
      postedDate: getText('.posted-on-line .text-light-on-muted') || '',
      budget: fixedPrice || hourlyRange || '',
      budgetType: getText('[data-cy="fixed-price"] .description') ||
                  getText('[data-cy="hourly-range"] .description') || '',
      hourlyRange: hourlyRange || '',
      projectType: getText('ul.segmentations li span') || '',
      connectsRequired: connectsRequired,
      availableConnects: availableConnects,
      bidRange: bidRangeText
    };
  }

  function extractClientInfo() {
    const ratingText = getText('[data-testid="buyer-rating"] .air3-rating-value-text') ||
                       getText('.air3-rating-value-text') || '';

    const reviewText = getText('[data-testid="buyer-rating"]') || '';
    const reviewMatch = reviewText.match(/(\d+)\s+reviews?/i);
    const reviewCount = reviewMatch ? reviewMatch[1] : '';

    const location = getText('[data-qa="client-location"] strong') || '';
    const jobsPosted = getText('[data-qa="client-job-posting-stats"] strong') || '';
    const hireRateText = getText('[data-qa="client-job-posting-stats"] div') || '';
    const hireRateMatch = hireRateText.match(/(\d+)%\s+hire\s+rate/i);
    const hireRate = hireRateMatch ? hireRateMatch[1] + '%' : '';

    let totalHires = '';

    let activitySection = null;
    const h5Elements = document.querySelectorAll('h5');

    for (const h5 of h5Elements) {
      if (h5.textContent.includes('Activity on this job')) {
        activitySection = h5.parentElement || h5.closest('section') || h5.closest('div[class*="activity"]');
        break;
      }
    }

    if (!activitySection) {
      activitySection = document.querySelector('[data-test="activity-section"]') ||
                       document.querySelector('[data-qa="job-activity"]');
    }

    if (activitySection) {
      const activityText = activitySection.textContent;

      const hiresPatterns = [
        /(\d+)\s+hires?:/i,
        /Hires?:\s*(\d+)/i,
        /Hired:\s*(\d+)/i
      ];

      for (const pattern of hiresPatterns) {
        const match = activityText.match(pattern);
        if (match) {
          totalHires = match[1];
          break;
        }
      }
    }

    let totalSpent = getText('[data-qa="client-spend"]');
    if (!totalSpent) {
      totalSpent = getText('strong[data-qa="client-spend"]');
    }
    if (totalSpent) {
      const spentMatch = totalSpent.match(/\$[\d,KkMm.]+/);
      totalSpent = spentMatch ? spentMatch[0] : totalSpent;
    }

    let avgHourlyRate = getText('[data-qa="client-hourly-rate"]');
    if (!avgHourlyRate) {
      avgHourlyRate = getText('strong[data-qa="client-hourly-rate"]');
    }
    if (avgHourlyRate) {
      const rateMatch = avgHourlyRate.match(/\$[\d.]+\s*\/?\s*hr/i);
      avgHourlyRate = rateMatch ? rateMatch[0] : avgHourlyRate;
    }

    const memberSince = getText('[data-qa="client-contract-date"] small') || '';
    const paymentVerified = document.querySelector('.payment-verified') !== null;

    const countryMatch = location.match(/,\s*([^,]+)$/);
    const country = countryMatch ? countryMatch[1].trim() : location;

    return {
      rating: ratingText,
      reviewCount: reviewCount,
      location: location,
      country: country,
      totalJobs: jobsPosted,
      hireRate: hireRate,
      totalHires: totalHires,
      totalSpent: totalSpent,
      avgHourlyRate: avgHourlyRate,
      memberSince: memberSince,
      paymentVerified: paymentVerified
    };
  }

  function extractActivityInfo() {
    let proposalsText = getText('[data-test="proposals-tier"]') ||
                        getText('[data-qa="proposals"]') ||
                        getText('.proposals-count') || '';

    if (!proposalsText) {
      const bodyText = document.body.textContent;
      const proposalSection = bodyText.match(/Proposals?:\s*([^\n]+)/i);
      proposalsText = proposalSection ? proposalSection[1] : '';
    }

    const proposalsMatch = proposalsText.match(/(\d+)\s+to\s+(\d+)/i) ||
                          proposalsText.match(/(\d+)\+/i) ||
                          proposalsText.match(/(?:Less than|less than|fewer than)\s+(\d+)/i);
    let proposalsCount = '';
    if (proposalsMatch) {
      if (proposalsMatch[2]) {
        proposalsCount = `${proposalsMatch[1]}-${proposalsMatch[2]}`;
      } else {
        proposalsCount = proposalsMatch[1] + (proposalsText.includes('+') ? '+' : '');
      }
    }

    let lastViewedText = getText('[data-test="client-activity"]') ||
                         getText('[data-qa="client-activity"]') || '';

    if (!lastViewedText) {
      const bodyText = document.body.textContent;
      const viewedMatch = bodyText.match(/Last viewed by client[:\s]+([^\n]+)/i);
      lastViewedText = viewedMatch ? viewedMatch[1] : '';
    }

    const lastViewedMatch = lastViewedText.match(/(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/i);
    const lastViewed = lastViewedMatch ? lastViewedMatch[1] : '';

    let interviewingText = getText('[data-test="interviewing"]') ||
                           getText('[data-qa="interviewing"]') || '';

    if (!interviewingText) {
      const bodyText = document.body.textContent;
      const patterns = [
        /Interviewing[:\s]+(\d+)/i,
        /(\d+)\s+interviewing/i,
        /(\d+)\s+in\s+interviewing/i
      ];

      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match) {
          interviewingText = match[0];
          break;
        }
      }
    }

    const interviewingMatch = interviewingText.match(/(\d+)/);
    const interviewing = interviewingMatch ? interviewingMatch[1] : '';

    const jobsInProgressText = getText('[data-cy="jobs-in-progress-button"]') ||
                               getText('.jobs-in-progress') || '';
    const jobsInProgressMatch = jobsInProgressText.match(/(\d+)\s+jobs?\s+in\s+progress/i);
    const jobsInProgress = jobsInProgressMatch ? jobsInProgressMatch[1] : '';

    let otherOpenJobsText = getText('[data-qa="other-open-jobs"]') || '';
    if (!otherOpenJobsText) {
      const bodyText = document.body.textContent;
      const openJobsMatch = bodyText.match(/(\d+)\s+other\s+open\s+jobs?/i);
      otherOpenJobsText = openJobsMatch ? openJobsMatch[0] : '';
    }
    const otherOpenJobsMatch = otherOpenJobsText.match(/(\d+)/);
    const otherOpenJobs = otherOpenJobsMatch ? otherOpenJobsMatch[1] : '';

    return {
      proposalsCount: proposalsCount,
      lastViewed: lastViewed,
      interviewing: interviewing,
      jobsInProgress: jobsInProgress,
      otherOpenJobs: otherOpenJobs
    };
  }

  function extractJobHistory() {
    const history = [];
    const jobItems = document.querySelectorAll('[data-cy="job"]');

    jobItems.forEach(job => {
      const titleLink = job.querySelector('[data-cy="job-title"]');
      const title = titleLink ? titleLink.textContent.trim() : '';
      const jobUrl = titleLink ? titleLink.getAttribute('href') : '';

      const dateRange = getText('[data-cy="date"] .text-body-sm', job);
      const statsText = getText('[data-cy="stats"]', job);

      let jobType = '';
      let amount = '';
      let hourlyRate = '';

      if (statsText) {
        if (statsText.toLowerCase().includes('hourly')) {
          jobType = 'Hourly';
          const rateMatch = statsText.match(/\$[\d.]+\s*\/?\s*hr/i);
          if (rateMatch) {
            hourlyRate = rateMatch[0];
            amount = rateMatch[0];
          }
        } else {
          const parts = statsText.split(/\s+/);
          jobType = parts[0] || '';
          amount = parts[parts.length - 1] || '';
        }
      }

      const freelancerLink = job.querySelector('a[href*="/freelancers/"]');
      const freelancer = freelancerLink ? freelancerLink.textContent.trim() : '';
      const freelancerUrl = freelancerLink ? freelancerLink.getAttribute('href') : '';

      const rating = getText('.air3-rating-value-text', job) || '';

      if (title) {
        history.push({
          title: title,
          jobUrl: jobUrl,
          dateRange: dateRange,
          type: jobType,
          amount: amount,
          hourlyRate: hourlyRate,
          freelancer: freelancer,
          freelancerUrl: freelancerUrl,
          rating: rating
        });
      }
    });

    return history;
  }

  function getText(selector, parent = document) {
    const element = parent.querySelector(selector);
    return element ? element.textContent.trim() : '';
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function displayCompactPanel() {
    if (compactPanel) compactPanel.remove();

    compactPanel = createCompactPanel();
    document.body.appendChild(compactPanel);
  }

  function displayResults() {
    if (panel) panel.remove();

    panel = createPanel();
    document.body.appendChild(panel);
  }

  function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'ww-analyzer-panel';
    panel.className = 'ww-analyzer-panel';

    injectAnalyzerStyles();

    panel.innerHTML = `
      <div class="ww-analyzer-header">
        <h3>Job Post Analysis <span style="font-size: 12px; opacity: 0.8;">v${VERSION}</span></h3>
        <div class="ww-header-buttons">
          <button class="ww-minimize-btn" title="Minimize">─</button>
          <button class="ww-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="ww-analyzer-content">
        ${generateTable()}
      </div>
      <div class="ww-analyzer-footer">
        <button class="ww-btn-copy-json" title="Copy JSON to clipboard">📋 Copy JSON</button>
        <button class="ww-btn-export-json" title="Download JSON file">💾 Export JSON</button>
        <button class="ww-btn-toggle-details" title="Show/Hide detailed job history">📊 Toggle Details</button>
        <label class="ww-auto-export-checkbox" title="Automatically export JSON file after each analysis">
          <input type="checkbox" id="ww-auto-export-checkbox" />
          <span>Auto-export JSON</span>
        </label>
      </div>
    `;

    panel.querySelector('.ww-close-btn').addEventListener('click', () => closePanel());
    panel.querySelector('.ww-minimize-btn').addEventListener('click', () => toggleMinimize());
    panel.querySelector('.ww-btn-copy-json').addEventListener('click', () => copyToClipboard());
    panel.querySelector('.ww-btn-export-json').addEventListener('click', () => exportJSON());
    panel.querySelector('.ww-btn-toggle-details').addEventListener('click', () => toggleDetails());

    const autoExportCheckbox = panel.querySelector('#ww-auto-export-checkbox');
    loadAutoExportSetting(autoExportCheckbox);
    autoExportCheckbox.addEventListener('change', (e) => handleAutoExportChange(e.target.checked));

    makeDraggable(panel);

    // Restore saved position
    const savedPosition = localStorage.getItem('ww-analyzer-detail-position');
    if (savedPosition) {
      const position = JSON.parse(savedPosition);
      panel.style.left = position.left;
      panel.style.top = position.top;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    return panel;
  }

  function createCompactPanel() {
    const panel = document.createElement('div');
    panel.id = 'ww-analyzer-compact-panel';
    panel.className = 'ww-analyzer-compact-panel';

    injectAnalyzerStyles();

    const d = data;
    const jd = d.jobDetails;
    const ci = d.clientInfo;
    const ai = d.activityInfo;
    const historyCount = d.jobHistory.length;

    panel.innerHTML = `
      <div class="ww-compact-header">
        <span class="ww-compact-title">Job Info <span style="font-size: 11px; opacity: 0.8;">v${VERSION}</span></span>
        <div class="ww-compact-buttons">
          <button class="ww-btn-full-analysis" title="Run full analysis with expansion">🔍</button>
          <button class="ww-btn-toggle-mode" title="Switch to detailed view">📊</button>
          <button class="ww-btn-auto-mode" title="Toggle auto-display mode">🔄</button>
          <button class="ww-compact-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="ww-compact-content">
        <div class="ww-compact-grid">
          <div class="ww-compact-item">
            <span class="ww-compact-label">Country:</span>
            <span class="ww-compact-value">${escapeHtml(ci.country)}</span>
          </div>
          <div class="ww-compact-item">
            <span class="ww-compact-label">Budget:</span>
            <span class="ww-compact-value">${escapeHtml(jd.budget)}</span>
          </div>
          ${jd.connectsRequired ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Connects:</span>
            <span class="ww-compact-value">${jd.availableConnects ? `${escapeHtml(jd.connectsRequired)}/${escapeHtml(jd.availableConnects)}` : escapeHtml(jd.connectsRequired)}</span>
          </div>` : ''}
          ${jd.bidRange ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Bid Range:</span>
            <span class="ww-compact-value">${escapeHtml(jd.bidRange)}</span>
          </div>` : ''}
          <div class="ww-compact-item">
            <span class="ww-compact-label">Jobs Posted:</span>
            <span class="ww-compact-value">${escapeHtml(ci.totalJobs)}</span>
          </div>
          <div class="ww-compact-item">
            <span class="ww-compact-label">Total Spent:</span>
            <span class="ww-compact-value">${escapeHtml(ci.totalSpent)}</span>
          </div>
          ${ci.totalHires ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Hires:</span>
            <span class="ww-compact-value">${escapeHtml(ci.totalHires)}</span>
          </div>` : ''}
          <div class="ww-compact-item">
            <span class="ww-compact-label">Avg Rate:</span>
            <span class="ww-compact-value">${escapeHtml(ci.avgHourlyRate)}</span>
          </div>
          ${ai.proposalsCount ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Proposals:</span>
            <span class="ww-compact-value">${escapeHtml(ai.proposalsCount)}</span>
          </div>` : ''}
          ${ai.lastViewed ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Last Viewed:</span>
            <span class="ww-compact-value">${escapeHtml(ai.lastViewed)}</span>
          </div>` : ''}
          ${ai.interviewing ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Interviewing:</span>
            <span class="ww-compact-value">${escapeHtml(ai.interviewing)}</span>
          </div>` : ''}
          ${ai.jobsInProgress ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Jobs In Progress:</span>
            <span class="ww-compact-value">${escapeHtml(ai.jobsInProgress)}</span>
          </div>` : ''}
          ${ai.otherOpenJobs ? `<div class="ww-compact-item">
            <span class="ww-compact-label">Other Open Jobs:</span>
            <span class="ww-compact-value">${escapeHtml(ai.otherOpenJobs)}</span>
          </div>` : ''}
          <div class="ww-compact-item">
            <span class="ww-compact-label">History (visible):</span>
            <span class="ww-compact-value">${historyCount}</span>
          </div>
        </div>
      </div>
    `;

    const hiresCount = ci.totalHires ? parseInt(ci.totalHires.replace(/,/g, ''), 10) : 0;
    if (hiresCount > 0) {
      panel.classList.add('ww-has-hires');
    }

    panel.querySelector('.ww-compact-close-btn').addEventListener('click', () => closeCompactPanel());
    panel.querySelector('.ww-btn-full-analysis').addEventListener('click', () => runFullAnalysis());
    panel.querySelector('.ww-btn-toggle-mode').addEventListener('click', () => switchToDetailedView());
    panel.querySelector('.ww-btn-auto-mode').addEventListener('click', () => toggleAutoDisplayMode());

    makeDraggable(panel);

    // Restore saved position
    const savedPosition = localStorage.getItem('ww-analyzer-compact-position');
    if (savedPosition) {
      const position = JSON.parse(savedPosition);
      panel.style.left = position.left;
      panel.style.top = position.top;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    return panel;
  }

  function injectAnalyzerStyles() {
    if (document.getElementById('ww-analyzer-styles')) return;

    const style = document.createElement('style');
    style.id = 'ww-analyzer-styles';
    style.textContent = `
      .ww-analyzer-panel, .ww-analyzer-compact-panel {
        position: fixed;
        top: 20px;
        left: 20px;
        background: white;
        border: 2px solid #2196F3;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2147483647;
        font-family: Arial, sans-serif;
        max-width: 500px;
      }
      .ww-analyzer-header, .ww-compact-header {
        background: #2196F3;
        color: white;
        padding: 10px 15px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 6px 6px 0 0;
        cursor: move;
      }
      .ww-analyzer-header h3 {
        margin: 0;
        font-size: 16px;
      }
      .ww-header-buttons, .ww-compact-buttons {
        display: flex;
        gap: 10px;
      }
      .ww-close-btn, .ww-minimize-btn, .ww-compact-close-btn, .ww-btn-full-analysis, .ww-btn-toggle-mode, .ww-btn-auto-mode {
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
        line-height: 1;
      }
      .ww-analyzer-content {
        padding: 15px;
        max-height: 400px;
        overflow-y: auto;
      }
      .ww-analysis-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      .ww-analysis-table td {
        padding: 8px;
        border-bottom: 1px solid #eee;
      }
      .ww-analysis-table .label {
        font-weight: bold;
        width: 40%;
      }
      .ww-analysis-table .section-header {
        background: #f0f0f0;
        font-weight: bold;
        padding: 10px;
        text-align: center;
      }
      .ww-analyzer-footer {
        padding: 10px 15px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .ww-analyzer-footer button {
        flex: 1;
        padding: 8px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .ww-compact-content {
        padding: 15px;
      }
      .ww-compact-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }
      .ww-compact-item {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding: 6px;
        background: #f9f9f9;
        border-radius: 4px;
      }
      .ww-compact-label {
        font-weight: bold;
      }
      .ww-has-hires {
        background: #ffe4f2 !important;
      }
      .ww-analyzer-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2147483648;
        opacity: 0;
        transition: opacity 0.3s;
        font-family: Arial, sans-serif;
      }
      .ww-analyzer-notification.show {
        opacity: 1;
      }
      .ww-analyzer-notification.error {
        background: #f44336;
      }
      .ww-classification-input {
        width: 100%;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .ww-job-count {
        font-size: 13px;
        font-weight: normal;
        opacity: 0.8;
      }
      .ww-job-history-details {
        margin-top: 15px;
        overflow-x: auto;
      }
      .ww-history-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .ww-history-table th {
        background: #f0f0f0;
        padding: 8px;
        text-align: left;
        border-bottom: 2px solid #ddd;
        font-weight: bold;
      }
      .ww-history-table td {
        padding: 6px 8px;
        border-bottom: 1px solid #eee;
      }
      .ww-job-link, .ww-freelancer-link {
        color: #2196F3;
        text-decoration: none;
      }
      .ww-job-link:hover, .ww-freelancer-link:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  function generateTable() {
    const d = data;

    return `
      <table class="ww-analysis-table">
        <tr>
          <th colspan="2" class="section-header">Job Details</th>
        </tr>
        <tr>
          <td class="label">Classification</td>
          <td class="value classification-value">
            <input type="text" placeholder="To be determined..." class="ww-classification-input" />
          </td>
        </tr>
        <tr>
          <td class="label">Job Title</td>
          <td class="value">${escapeHtml(d.jobDetails.title)}</td>
        </tr>
        <tr>
          <td class="label">Posted</td>
          <td class="value">${escapeHtml(d.jobDetails.postedDate)}</td>
        </tr>
        <tr>
          <td class="label">Budget</td>
          <td class="value">${escapeHtml(d.jobDetails.budget)} (${escapeHtml(d.jobDetails.budgetType)})</td>
        </tr>
        ${d.jobDetails.hourlyRange ? `<tr>
          <td class="label">Hourly Range</td>
          <td class="value">${escapeHtml(d.jobDetails.hourlyRange)}</td>
        </tr>` : ''}
        ${d.jobDetails.projectType ? `<tr>
          <td class="label">Project Type</td>
          <td class="value">${escapeHtml(d.jobDetails.projectType)}</td>
        </tr>` : ''}
        ${d.jobDetails.connectsRequired ? `<tr>
          <td class="label">Connects Required</td>
          <td class="value">${escapeHtml(d.jobDetails.connectsRequired)}${d.jobDetails.availableConnects ? ` / ${escapeHtml(d.jobDetails.availableConnects)} available` : ''}</td>
        </tr>` : ''}
        ${d.jobDetails.bidRange ? `<tr>
          <td class="label">Bid Range</td>
          <td class="value">${escapeHtml(d.jobDetails.bidRange)}</td>
        </tr>` : ''}

        <tr>
          <th colspan="2" class="section-header">Client Information</th>
        </tr>
        <tr>
          <td class="label">Rating</td>
          <td class="value">⭐ ${escapeHtml(d.clientInfo.rating)} (${escapeHtml(d.clientInfo.reviewCount)} reviews)</td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="value">${escapeHtml(d.clientInfo.location)}</td>
        </tr>
        <tr>
          <td class="label">Total Jobs Posted</td>
          <td class="value">${escapeHtml(d.clientInfo.totalJobs)}</td>
        </tr>
        <tr>
          <td class="label">Hire Rate</td>
          <td class="value">${escapeHtml(d.clientInfo.hireRate)}</td>
        </tr>
        ${d.clientInfo.totalHires ? `<tr>
          <td class="label">Total Hires</td>
          <td class="value">${escapeHtml(d.clientInfo.totalHires)}</td>
        </tr>` : ''}
        <tr>
          <td class="label">Total Spent</td>
          <td class="value">${escapeHtml(d.clientInfo.totalSpent)}</td>
        </tr>
        <tr>
          <td class="label">Avg Hourly Rate</td>
          <td class="value">${escapeHtml(d.clientInfo.avgHourlyRate)}</td>
        </tr>
        <tr>
          <td class="label">Member Since</td>
          <td class="value">${escapeHtml(d.clientInfo.memberSince)}</td>
        </tr>
        <tr>
          <td class="label">Payment Verified</td>
          <td class="value">${d.clientInfo.paymentVerified ? '✅ Yes' : '❌ No'}</td>
        </tr>

        <tr>
          <th colspan="2" class="section-header">Activity on this Job</th>
        </tr>
        ${d.activityInfo.proposalsCount ? `<tr>
          <td class="label">Proposals</td>
          <td class="value">${escapeHtml(d.activityInfo.proposalsCount)}</td>
        </tr>` : ''}
        ${d.activityInfo.lastViewed ? `<tr>
          <td class="label">Last Viewed by Client</td>
          <td class="value">${escapeHtml(d.activityInfo.lastViewed)}</td>
        </tr>` : ''}
        ${d.activityInfo.interviewing ? `<tr>
          <td class="label">Interviewing</td>
          <td class="value">${escapeHtml(d.activityInfo.interviewing)}</td>
        </tr>` : ''}
        ${d.activityInfo.jobsInProgress ? `<tr>
          <td class="label">Jobs In Progress</td>
          <td class="value">${escapeHtml(d.activityInfo.jobsInProgress)}</td>
        </tr>` : ''}
        ${d.activityInfo.otherOpenJobs ? `<tr>
          <td class="label">Other Open Jobs</td>
          <td class="value">${escapeHtml(d.activityInfo.otherOpenJobs)}</td>
        </tr>` : ''}

        <tr>
          <th colspan="2" class="section-header">
            Job History Summary
            <span class="ww-job-count">(${d.jobHistory.length} jobs)</span>
          </th>
        </tr>
      </table>

      <div class="ww-job-history-details" style="display: none;">
        <table class="ww-history-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Date Range</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Hourly Rate</th>
              <th>Freelancer</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${d.jobHistory.map(job => `
              <tr>
                <td>${job.jobUrl ?
                  `<a href="${escapeHtml(job.jobUrl)}" target="_blank" class="ww-job-link">${escapeHtml(job.title)}</a>` :
                  escapeHtml(job.title)
                }</td>
                <td>${escapeHtml(job.dateRange)}</td>
                <td>${escapeHtml(job.type)}</td>
                <td>${escapeHtml(job.amount)}</td>
                <td>${escapeHtml(job.hourlyRate || '-')}</td>
                <td>${job.freelancerUrl ?
                  `<a href="${escapeHtml(job.freelancerUrl)}" target="_blank" class="ww-freelancer-link">${escapeHtml(job.freelancer)}</a>` :
                  escapeHtml(job.freelancer)
                }</td>
                <td>${escapeHtml(job.rating)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function toggleMinimize() {
    const content = panel.querySelector('.ww-analyzer-content');
    const footer = panel.querySelector('.ww-analyzer-footer');
    const minimizeBtn = panel.querySelector('.ww-minimize-btn');

    if (panel.classList.contains('ww-minimized')) {
      panel.classList.remove('ww-minimized');
      content.style.display = 'block';
      footer.style.display = 'flex';
      minimizeBtn.textContent = '─';
    } else {
      panel.classList.add('ww-minimized');
      content.style.display = 'none';
      footer.style.display = 'none';
      minimizeBtn.textContent = '□';
    }
  }

  function toggleDetails() {
    const details = panel.querySelector('.ww-job-history-details');
    if (details) {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
  }

  async function copyToClipboard() {
    try {
      const json = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(json);
      showNotification('JSON copied to clipboard!', 'success');
    } catch (e) {
      showNotification('Failed to copy to clipboard', 'error');
    }
  }

  function exportJSON() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `upwork-job-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('JSON file downloaded!', 'success');
  }

  async function loadAutoExportSetting(checkbox) {
    try {
      const result = await browserAPI.storage.local.get('autoExportJSON');
      const autoExport = result.autoExportJSON !== undefined ? result.autoExportJSON : false;
      checkbox.checked = autoExport;
    } catch (e) {
      checkbox.checked = false;
    }
  }

  async function handleAutoExportChange(checked) {
    try {
      await browserAPI.storage.local.set({ autoExportJSON: checked });
      showNotification(checked ? 'Auto-export enabled' : 'Auto-export disabled', 'success');
    } catch (e) {
      showNotification('Failed to save setting', 'error');
    }
  }

  function closePanel() {
    if (panel) {
      panel.remove();
      panel = null;
    }
  }

  function closeCompactPanel() {
    if (compactPanel) {
      compactPanel.remove();
      compactPanel = null;
    }
  }

  async function runFullAnalysis() {
    showNotification('Running full analysis...', 'info');
    closeCompactPanel();
    await analyze(true);
  }

  function switchToDetailedView() {
    closeCompactPanel();
    displayResults();
  }

  async function toggleAutoDisplayMode() {
    autoDisplayMode = !autoDisplayMode;
    try {
      await browserAPI.storage.local.set({ autoDisplayCompact: autoDisplayMode });
      showNotification(
        autoDisplayMode ? 'Auto-display enabled' : 'Auto-display disabled',
        'success'
      );
    } catch (e) {
      showNotification('Failed to save setting', 'error');
    }
  }

  function makeDraggable(panel) {
    const header = panel.querySelector('.ww-analyzer-header') || panel.querySelector('.ww-compact-header');
    if (!header) return;

    let isDragging = false;
    let currentX, currentY, initialX, initialY;

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('ww-close-btn') ||
          e.target.classList.contains('ww-compact-close-btn') ||
          e.target.tagName === 'BUTTON') return;

      isDragging = true;
      initialX = e.clientX - panel.offsetLeft;
      initialY = e.clientY - panel.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        panel.style.left = currentX + 'px';
        panel.style.top = currentY + 'px';
        panel.style.right = 'auto';
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Save position based on panel type
        const position = {
          left: panel.style.left,
          top: panel.style.top
        };
        const storageKey = panel.classList.contains('ww-analyzer-compact-panel')
          ? 'ww-analyzer-compact-position'
          : 'ww-analyzer-detail-position';
        localStorage.setItem(storageKey, JSON.stringify(position));
      }
    });
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ww-analyzer-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
      event.preventDefault();
      quickAnalyze();
    }
  });

  return {
    analyze: quickAnalyze
  };
})();

// ============================================================================
// NAMESPACE: Auto Load More Module
// ============================================================================
const AutoLoadModule = (function() {
  'use strict';

  let isRunning = false;
  let settings = null;
  let clickCount = 0;
  let automationTimeout = null;
  let contentObserver = null;

  function updateStatus(status, level = 'info') {
    browserAPI.runtime.sendMessage({
      type: 'STATUS_UPDATE',
      status: status,
      level: level
    }).catch(() => {});
  }

  function updateCounter() {
    browserAPI.runtime.sendMessage({
      type: 'COUNTER_UPDATE',
      count: clickCount
    }).catch(() => {});
  }

  function notifyStop(reason) {
    browserAPI.runtime.sendMessage({
      type: 'AUTOMATION_STOPPED',
      reason: reason
    }).catch(() => {});
  }

  function findButton(buttonText) {
    const dataTestButton = document.querySelector('[data-test="load-more-button"]');
    if (dataTestButton && dataTestButton.offsetParent !== null) {
      return dataTestButton;
    }

    const candidates = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('input[type="button"]'),
      ...document.querySelectorAll('input[type="submit"]'),
      ...document.querySelectorAll('a[role="button"]'),
      ...document.querySelectorAll('[role="button"]')
    ];

    const searchText = buttonText.toLowerCase();
    for (const element of candidates) {
      if (element.offsetParent === null) continue;

      const text = element.textContent || element.value || element.getAttribute('aria-label') || '';
      if (text.toLowerCase().includes(searchText)) {
        return element;
      }
    }

    return null;
  }

  function checkForStopString(stopString) {
    const bodyText = document.body.innerText || document.body.textContent;
    return bodyText.includes(stopString);
  }

  function simulateKeyPress(key) {
    switch(key) {
      case 'End':
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
      case 'Home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      case 'PageDown':
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        return;
      case 'PageUp':
        window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
        return;
      case 'ArrowDown':
        window.scrollBy({ top: 100, behavior: 'smooth' });
        return;
      case 'ArrowUp':
        window.scrollBy({ top: -100, behavior: 'smooth' });
        return;
    }

    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      keyCode: getKeyCode(key),
      which: getKeyCode(key),
      bubbles: true,
      cancelable: true
    });

    document.dispatchEvent(event);

    const upEvent = new KeyboardEvent('keyup', {
      key: key,
      code: key,
      keyCode: getKeyCode(key),
      which: getKeyCode(key),
      bubbles: true,
      cancelable: true
    });

    document.dispatchEvent(upEvent);
  }

  function getKeyCode(key) {
    const keyCodes = {
      'PageDown': 34,
      'PageUp': 33,
      'End': 35,
      'Home': 36,
      'ArrowLeft': 37,
      'ArrowUp': 38,
      'ArrowRight': 39,
      'ArrowDown': 40,
      'Space': 32
    };
    return keyCodes[key] || 0;
  }

  async function runAutomationCycle() {
    if (!isRunning) return;

    try {
      if (checkForStopString(settings.stopString)) {
        stopAutomation(`Stop string found: "${settings.stopString}"`);
        alert(`Automation stopped: Found "${settings.stopString}" on the page.`);
        return;
      }

      const button = findButton(settings.buttonText);
      if (!button) {
        stopAutomation('Button not found');
        updateStatus('Error: Button not found', 'error');
        return;
      }

      updateStatus(`Clicking button... (${clickCount + 1})`, 'running');
      button.click();
      clickCount++;
      updateCounter();

      updateStatus(`Waiting for content to load... (${clickCount})`, 'running');
      await waitForContentLoad(settings.pauseDuration || 10000);

      if (!isRunning) return;

      updateStatus(`Scrolling to button...`, 'running');
      const buttonAfterLoad = findButton(settings.buttonText);
      if (buttonAfterLoad) {
        buttonAfterLoad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(300);
      } else {
        simulateKeyPress(settings.keyPress);
        await sleep(300);
      }

      if (!isRunning) return;

      if (checkForStopString(settings.stopString)) {
        stopAutomation(`Stop string found: "${settings.stopString}"`);
        alert(`Automation stopped: Found "${settings.stopString}" on the page.`);
        return;
      }

      updateStatus(`Waiting... (Clicks: ${clickCount})`, 'running');
      automationTimeout = setTimeout(runAutomationCycle, 500);

    } catch (error) {
      stopAutomation(`Error: ${error.message}`);
      updateStatus(`Error: ${error.message}`, 'error');
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function waitForContentLoad(timeout = 10000) {
    return new Promise((resolve) => {
      let timeoutId;
      let idleTimer;
      const idleDelay = 500;

      timeoutId = setTimeout(() => {
        if (contentObserver) {
          contentObserver.disconnect();
          contentObserver = null;
        }
        if (idleTimer) clearTimeout(idleTimer);
        resolve();
      }, timeout);

      const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (contentObserver) {
            contentObserver.disconnect();
            contentObserver = null;
          }
          clearTimeout(timeoutId);
          resolve();
        }, idleDelay);
      };

      contentObserver = new MutationObserver((mutations) => {
        const significantMutations = mutations.filter(mutation => {
          if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
            return true;
          }
          return false;
        });

        if (significantMutations.length > 0) {
          resetIdleTimer();
        }
      });

      contentObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });

      resetIdleTimer();
    });
  }

  function startAutomation(config) {
    if (isRunning) {
      stopAutomation('Already running');
      return;
    }

    settings = config;
    isRunning = true;
    clickCount = 0;
    updateCounter();
    updateStatus('Automation started', 'running');

    runAutomationCycle();
  }

  function stopAutomation(reason) {
    isRunning = false;
    if (automationTimeout) {
      clearTimeout(automationTimeout);
      automationTimeout = null;
    }
    if (contentObserver) {
      contentObserver.disconnect();
      contentObserver = null;
    }
    notifyStop(reason);
  }

  return {
    start: startAutomation,
    stop: stopAutomation,
    isRunning: () => isRunning,
    getState: () => ({
      isRunning: isRunning,
      clickCount: clickCount,
      settings: settings
    })
  };
})();

// ============================================================================
// MESSAGE HANDLER - Routes messages to appropriate modules
// ============================================================================
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Web Workflow Toolkit] Received message:', request);

  // Highlighter actions
  if (request.action === 'toggleHighlighter') {
    HighlighterModule.toggle();
    sendResponse({ success: true });
  }
  else if (request.action === 'reloadHighlighter') {
    HighlighterModule.reload();
    sendResponse({ success: true });
  }

  // Navigator actions
  else if (request.action === 'toggleNavigator') {
    NavigatorModule.toggle();
    sendResponse({ success: true });
  }

  // Analyzer actions
  else if (request.action === 'analyzeJob') {
    AnalyzerModule.analyze()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }

  // Auto Load actions
  else if (request.action === 'toggleAutoLoad') {
    // Toggle: start if stopped, stop if running
    if (AutoLoadModule.isRunning()) {
      AutoLoadModule.stop('Toggled off by keyboard shortcut');
      sendResponse({ success: true });
    } else {
      // Need to load settings first
      browserAPI.storage.sync.get(['buttonText', 'pauseDuration', 'keyPress', 'stopString'], (result) => {
        const settings = {
          buttonText: result.buttonText || 'Load More Jobs',
          pauseDuration: result.pauseDuration || 10000,
          keyPress: result.keyPress || 'PageDown',
          stopString: result.stopString || 'Posted 2 days ago'
        };
        AutoLoadModule.start(settings);
        sendResponse({ success: true });
      });
      return true; // Async response for storage.get
    }
  }
  else if (request.action === 'startAutoLoad' || request.type === 'START_AUTOMATION') {
    AutoLoadModule.start(request.settings);
    sendResponse({ success: true });
  }
  else if (request.action === 'stopAutoLoad' || request.type === 'STOP_AUTOMATION') {
    AutoLoadModule.stop('Stopped by user');
    sendResponse({ success: true });
  }
  else if (request.type === 'GET_STATE') {
    sendResponse(AutoLoadModule.getState());
  }

  return false;
});

console.log('[Web Workflow Toolkit] All modules initialized successfully');
