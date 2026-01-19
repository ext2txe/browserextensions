// Upwork Job Highlighter - Content Script
const VERSION = '0.2.9';

// Browser API polyfill for Chrome/Edge compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

(function() {
  'use strict';

  let keywords = [];
  let highlightColor = '#d3d3d3'; // Default gray color
  let settingsPanel = null;
  let urlPatterns = [];
  let elementSelector = 'article, .job, .listing, section';
  let isEnabled = false;
  let useWordBoundaries = true; // Match whole words only by default
  let hitCount = 0; // Track number of highlighted elements

  // Check if current URL matches any of the configured patterns
  function matchesUrlPattern(url, pattern) {
    // Convert pattern to regex
    // * matches anything, ** matches anything including /
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
    
    // If no patterns configured, don't run
    if (!urlPatterns || urlPatterns.length === 0) {
      return false;
    }
    
    // Check if current URL matches any pattern
    return urlPatterns.some(pattern => matchesUrlPattern(currentUrl, pattern));
  }

  // Load settings from storage
  function loadSettings() {
    console.log('[Keyword Highlighter] Loading settings from storage...');
    console.log('[Keyword Highlighter] Current URL:', window.location.href);
    
    browser.storage.local.get(['keywords', 'highlightColor', 'urlPatterns', 'elementSelector', 'useWordBoundaries']).then(function(result) {
      console.log('[Keyword Highlighter] Storage read successful!');
      console.log('[Keyword Highlighter] Raw storage result:', result);
      
      keywords = result.keywords || [];
      highlightColor = result.highlightColor || '#d3d3d3';
      urlPatterns = result.urlPatterns || ['*://www.upwork.com/nx/find-work/*'];
      elementSelector = result.elementSelector || 'article, .job, .listing, section';
      useWordBoundaries = result.useWordBoundaries !== undefined ? result.useWordBoundaries : true;
      
      console.log('[Keyword Highlighter] Loaded settings:', { 
        keywords, 
        highlightColor, 
        urlPatterns, 
        elementSelector, 
        useWordBoundaries 
      });
      
      // Check if we should run on this page
      isEnabled = shouldRunOnCurrentPage();
      console.log('[Keyword Highlighter] Extension enabled on this page:', isEnabled);
      console.log('[Keyword Highlighter] URL patterns to match:', urlPatterns);
      
      if (isEnabled) {
        highlightJobs();
        updateSettingsPanel();
      } else {
        console.log('[Keyword Highlighter] Not running on this page - URL does not match patterns');
      }
    }).catch(function(error) {
      console.error('[Keyword Highlighter] ERROR loading settings:', error);
      console.error('[Keyword Highlighter] Error stack:', error.stack);
    });
  }

  // Keyboard shortcut handler for Ctrl+Shift+L
  function handleKeyboardShortcut(e) {
    // Check for Ctrl+Shift+L (or Cmd+Shift+L on Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      console.log('[Keyword Highlighter] Hotkey pressed: Ctrl+Shift+L');
      toggleSettingsPanel();
    }
  }

  // Make panel draggable
  function makePanelDraggable(panel, handle) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

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

        // Keep panel within viewport bounds
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
    }
  }

  // Create settings panel
  function createSettingsPanel() {
    // Ensure CSS is injected
    injectHighlightStyles();

    const panel = document.createElement('div');
    panel.id = 'upwork-highlighter-panel';
    panel.style.cssText = `
      position: fixed !important;
      bottom: 80px !important;
      right: 20px !important;
      width: 400px !important;
      max-height: 600px !important;
      z-index: 2147483647 !important;
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

    document.body.appendChild(panel);
    settingsPanel = panel;

    // Make panel draggable by its header
    const header = document.getElementById('hl-panel-header');
    if (header) {
      makePanelDraggable(panel, header);
    }

    // Add event listeners
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
    if (!settingsPanel) {
      createSettingsPanel();
    }

    const currentDisplay = window.getComputedStyle(settingsPanel).display;
    console.log('[Keyword Highlighter] Current display:', currentDisplay);

    if (currentDisplay === 'none') {
      settingsPanel.style.setProperty('display', 'block', 'important');
      console.log('[Keyword Highlighter] Panel opened - display set to block');
    } else {
      settingsPanel.style.setProperty('display', 'none', 'important');
      console.log('[Keyword Highlighter] Panel closed - display set to none');
    }
  }

  function updateSettingsPanel() {
    if (!settingsPanel) return;
    
    // Update color picker
    const colorPicker = document.getElementById('hl-color-picker');
    if (colorPicker) {
      colorPicker.value = highlightColor;
    }
    
    // Update selector input
    const selectorInput = document.getElementById('hl-selector');
    if (selectorInput) {
      selectorInput.value = elementSelector;
    }
    
    // Update word boundaries checkbox
    const wordBoundariesCheckbox = document.getElementById('hl-word-boundaries');
    if (wordBoundariesCheckbox) {
      wordBoundariesCheckbox.checked = useWordBoundaries;
    }
    
    // Update URL list
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
    
    // Update keyword list
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
    
    // Remove previous test borders
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
    console.log('[Keyword Highlighter] Save button clicked');
    
    // Update keywords from edited inputs
    const keywordInputs = document.querySelectorAll('#hl-keyword-list input');
    const newKeywords = [];
    keywordInputs.forEach(input => {
      const value = input.value.trim();
      if (value) newKeywords.push(value);
    });
    keywords = newKeywords;
    
    // Update URL patterns from edited inputs
    const urlInputs = document.querySelectorAll('#hl-url-list input');
    const newUrls = [];
    urlInputs.forEach(input => {
      const value = input.value.trim();
      if (value) newUrls.push(value);
    });
    urlPatterns = newUrls;
    
    // Update color
    const colorPicker = document.getElementById('hl-color-picker');
    if (colorPicker) {
      highlightColor = colorPicker.value;
    }
    
    // Update selector
    const selectorInput = document.getElementById('hl-selector');
    if (selectorInput) {
      elementSelector = selectorInput.value.trim() || elementSelector;
    }
    
    // Update word boundaries
    const wordBoundariesCheckbox = document.getElementById('hl-word-boundaries');
    if (wordBoundariesCheckbox) {
      useWordBoundaries = wordBoundariesCheckbox.checked;
    }
    
    const settingsToSave = {
      keywords: keywords,
      highlightColor: highlightColor,
      urlPatterns: urlPatterns,
      elementSelector: elementSelector,
      useWordBoundaries: useWordBoundaries
    };
    
    console.log('[Keyword Highlighter] Attempting to save settings:', settingsToSave);
    
    // Save to storage
    browser.storage.local.set(settingsToSave).then(function() {
      console.log('[Keyword Highlighter] ✓ Settings saved successfully to storage!');
      
      // Verify the save by reading back
      browser.storage.local.get(null).then(function(allData) {
        console.log('[Keyword Highlighter] Verification - all data in storage:', allData);
      });
      
      showStatus('Settings saved! Reload page if URL patterns changed.', 'success');
      highlightJobs();
      setTimeout(() => {
        const statusDiv = document.getElementById('hl-status');
        if (statusDiv) statusDiv.style.display = 'none';
      }, 3000);
    }).catch(function(error) {
      console.error('[Keyword Highlighter] ✗ ERROR saving settings:', error);
      console.error('[Keyword Highlighter] Error details:', error.message);
      console.error('[Keyword Highlighter] Error stack:', error.stack);
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

  // Export settings to JSON file
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
    a.download = `keyword-highlighter-settings-${new Date().toISOString().split('T')[0]}.json`;
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

  // Handle file import
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

  // Check if text contains any of the keywords (case-insensitive)
  function containsKeyword(text) {
    if (!text || keywords.length === 0) return false;

    return keywords.some(keyword => {
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) return false;

      // Check if keyword contains wildcard
      const hasWildcard = trimmedKeyword.includes('*');

      if (hasWildcard) {
        // Wildcard mode: escape special regex chars except *, then convert * to .*
        const regexPattern = trimmedKeyword
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')  // Escape special chars except *
          .replace(/\*/g, '.*');                    // Convert * to .* (match any chars)

        const regex = new RegExp(regexPattern, 'i');
        return regex.test(text);
      } else if (useWordBoundaries) {
        // Match whole words only - "mys" won't match "MySQL"
        const escapedKeyword = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('\\b' + escapedKeyword + '\\b', 'i');
        return regex.test(text);
      } else {
        // Match anywhere (case-insensitive) - "mys" will match "MySQL"
        return text.toLowerCase().includes(trimmedKeyword.toLowerCase());
      }
    });
  }

  // Inject CSS for highlighting and panel
  function injectHighlightStyles() {
    // Remove existing style if present
    const existingStyle = document.getElementById('keyword-highlighter-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'keyword-highlighter-style';
    style.textContent = `
      /* Only affect background color, nothing else */
      .keyword-highlighter-match:not(#upwork-highlighter-panel):not(#upwork-highlighter-panel *) {
        background-color: ${highlightColor} !important;
      }

      /* Ensure panel elements display correctly */
      #upwork-highlighter-panel * {
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }

      #upwork-highlighter-panel button {
        display: inline-block !important;
        border: none !important;
        cursor: pointer !important;
        font-size: inherit !important;
        line-height: normal !important;
        text-align: center !important;
        text-decoration: none !important;
        vertical-align: middle !important;
      }

      #upwork-highlighter-panel input {
        display: block !important;
        border: 1px solid #ddd !important;
        line-height: normal !important;
        vertical-align: middle !important;
      }

      #upwork-highlighter-panel label,
      #upwork-highlighter-panel span,
      #upwork-highlighter-panel p,
      #upwork-highlighter-panel h2,
      #upwork-highlighter-panel h3 {
        display: block !important;
        line-height: normal !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Highlight jobs that match keywords
  function highlightJobs() {
    if (!isEnabled) return;

    // Inject/update CSS styles
    injectHighlightStyles();

    // Find all elements matching the configured selector
    try {
      const elements = document.querySelectorAll(elementSelector);
      hitCount = 0; // Reset hit count

      elements.forEach(element => {
        // Skip our extension's own panel
        if (element.id === 'upwork-highlighter-panel' ||
            element.closest('#upwork-highlighter-panel')) {
          return;
        }

        // Get all text content from the element
        const elementText = element.textContent;

        // Check if this element contains any keywords
        if (containsKeyword(elementText)) {
          element.classList.add('keyword-highlighter-match');
          hitCount++; // Increment hit count
        } else {
          // Remove highlight class if no match
          element.classList.remove('keyword-highlighter-match');
        }
      });

      console.log(`Highlighted ${hitCount} of ${elements.length} elements`);
    } catch (error) {
      console.error('Error highlighting elements:', error);
    }
  }

  // Watch for new jobs being added to the page (e.g., infinite scroll)
  const observer = new MutationObserver(function(mutations) {
    highlightJobs();
  });

  // Start observing when page is ready
  function init() {
    console.log('[Keyword Highlighter] Extension initializing...');
    console.log('[Keyword Highlighter] Page URL:', window.location.href);
    console.log('[Keyword Highlighter] Document ready state:', document.readyState);

    loadSettings();

    // Add keyboard shortcut listener
    document.addEventListener('keydown', handleKeyboardShortcut);
    console.log('[Keyword Highlighter] Keyboard shortcut (Ctrl+Shift+L) listener added');

    // Give settings time to load before starting observer
    setTimeout(() => {
      console.log('[Keyword Highlighter] Post-load check - isEnabled:', isEnabled);

      if (isEnabled) {
        console.log('[Keyword Highlighter] Extension enabled for this URL');

        // Watch for DOM changes
        const targetNode = document.body;
        if (targetNode) {
          observer.observe(targetNode, {
            childList: true,
            subtree: true
          });
          console.log('[Keyword Highlighter] DOM observer started');
        }
      } else {
        console.log('[Keyword Highlighter] Extension not enabled for this URL');
        console.log('[Keyword Highlighter] Current URL patterns:', urlPatterns);
        console.log('[Keyword Highlighter] Configure URLs in settings to enable on this page');
      }
    }, 500);
  }

  // Listen for settings updates
  browser.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      if (changes.keywords) {
        keywords = changes.keywords.newValue || [];
      }
      if (changes.highlightColor) {
        highlightColor = changes.highlightColor.newValue || '#d3d3d3';
      }
      if (changes.urlPatterns) {
        urlPatterns = changes.urlPatterns.newValue || [];
        // Recheck if extension should be enabled on current page
        isEnabled = shouldRunOnCurrentPage();
        console.log('URL patterns updated. Extension enabled:', isEnabled);
      }
      if (changes.elementSelector) {
        elementSelector = changes.elementSelector.newValue || 'article, .job, .listing, section';
      }
      if (changes.useWordBoundaries) {
        useWordBoundaries = changes.useWordBoundaries.newValue !== undefined ? changes.useWordBoundaries.newValue : true;
      }
      console.log('Settings updated from storage:', { keywords, highlightColor, urlPatterns, elementSelector, useWordBoundaries });
      if (isEnabled) {
        highlightJobs();
        updateSettingsPanel();
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
