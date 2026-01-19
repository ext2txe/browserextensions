// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// ==================== TAB SWITCHING ====================
document.addEventListener('DOMContentLoaded', () => {
  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchToTab(targetTab) {
    // Update active states
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    // Find and activate the target tab
    const targetBtn = Array.from(tabBtns).find(b => b.dataset.tab === targetTab);
    const targetPanel = document.getElementById(`${targetTab}-panel`);

    if (targetBtn && targetPanel) {
      targetBtn.classList.add('active');
      targetPanel.classList.add('active');
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchToTab(btn.dataset.tab);
    });
  });

  // Check if a specific tab was requested (e.g., via keyboard shortcut)
  browserAPI.storage.local.get(['activeTab'], (result) => {
    if (result.activeTab) {
      switchToTab(result.activeTab);
      // Clear the stored tab preference
      browserAPI.storage.local.remove('activeTab');
    }
  });

  // Initialize all features
  initHighlighter();
  initNavigator();
  initAnalyzer();
  initAutoLoad();
});

// ==================== HIGHLIGHTER ====================
function initHighlighter() {
  console.log('[Highlighter Init] initHighlighter() function called');

  const keywordInput = document.getElementById('keyword-input');
  const addKeywordBtn = document.getElementById('add-keyword-btn');
  const keywordList = document.getElementById('keyword-list');
  const clearKeywordsBtn = document.getElementById('clear-keywords-btn');

  const urlPatternInput = document.getElementById('url-pattern-input');
  const addUrlBtn = document.getElementById('add-url-btn');
  const urlList = document.getElementById('url-list');

  const elementSelector = document.getElementById('element-selector');
  const highlightColor = document.getElementById('highlight-color');
  const wordBoundaries = document.getElementById('word-boundaries');

  const saveBtn = document.getElementById('save-highlighter-btn');
  const exportBtn = document.getElementById('export-highlighter-btn');
  const importBtn = document.getElementById('import-highlighter-btn');
  const importFile = document.getElementById('import-file');

  // Debug: Log all element references
  console.log('[Highlighter Init] Element references:');
  console.log('[Highlighter Init]   - elementSelector:', elementSelector);
  console.log('[Highlighter Init]   - highlightColor:', highlightColor);
  console.log('[Highlighter Init]   - wordBoundaries:', wordBoundaries);
  console.log('[Highlighter Init]   - saveBtn:', saveBtn);
  console.log('[Highlighter Init]   - exportBtn:', exportBtn);
  console.log('[Highlighter Init]   - importBtn:', importBtn);

  // Add event listener to color picker to log and preserve changes
  let userSelectedColor = null;

  if (highlightColor) {
    console.log('[Highlighter Init] Attaching event listeners to color picker');

    highlightColor.addEventListener('input', (e) => {
      console.log('[Color Picker] Input event - Color changed to:', e.target.value);
      userSelectedColor = e.target.value;
    });

    highlightColor.addEventListener('change', (e) => {
      console.log('[Color Picker] Change event - Color finalized:', e.target.value);
      userSelectedColor = e.target.value;
      // Update the visual immediately
      highlightColor.value = userSelectedColor;
      console.log('[Color Picker] Color input value set to:', highlightColor.value);
    });

    console.log('[Highlighter Init] Event listeners attached successfully');
  } else {
    console.error('[Highlighter Init] ERROR: highlightColor element not found!');
  }

  // Load settings
  loadHighlighterSettings();

  function loadHighlighterSettings() {
    console.log('[Highlighter Load] Loading settings from storage...');
    browserAPI.storage.local.get([
      'keywords',
      'urlPatterns',
      'elementSelector',
      'highlightColor',
      'useWordBoundaries'
    ], (result) => {
      console.log('[Highlighter Load] Storage result:', result);

      // Keywords
      const keywords = result.keywords || [];
      renderTags(keywords, keywordList, removeKeyword);

      // URL Patterns
      const patterns = result.urlPatterns || [];
      renderTags(patterns, urlList, removeUrlPattern);

      // Other settings
      elementSelector.value = result.elementSelector || '';
      console.log('[Highlighter Load] Setting color picker to:', result.highlightColor || '#ffb9b9');
      console.log('[Highlighter Load] Color picker element:', highlightColor);
      highlightColor.value = result.highlightColor || '#ffb9b9';
      console.log('[Highlighter Load] Color picker value after setting:', highlightColor.value);
      wordBoundaries.checked = result.useWordBoundaries || false;
    });
  }

  function renderTags(items, container, removeCallback) {
    container.innerHTML = '';
    items.forEach((item, index) => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `
        <span>${item}</span>
        <span class="tag-remove" data-index="${index}">×</span>
      `;
      tag.querySelector('.tag-remove').addEventListener('click', () => removeCallback(index));
      container.appendChild(tag);
    });
  }

  function removeKeyword(index) {
    browserAPI.storage.local.get(['keywords'], (result) => {
      const keywords = result.keywords || [];
      keywords.splice(index, 1);
      browserAPI.storage.local.set({ keywords }, () => {
        loadHighlighterSettings();
        showStatus('Keyword removed');
      });
    });
  }

  function removeUrlPattern(index) {
    browserAPI.storage.local.get(['urlPatterns'], (result) => {
      const patterns = result.urlPatterns || [];
      patterns.splice(index, 1);
      browserAPI.storage.local.set({ urlPatterns: patterns }, () => {
        loadHighlighterSettings();
        showStatus('URL pattern removed');
      });
    });
  }

  // Add keyword
  addKeywordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const keyword = keywordInput.value.trim();
    if (keyword) {
      browserAPI.storage.local.get(['keywords'], (result) => {
        const keywords = result.keywords || [];
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
          browserAPI.storage.local.set({ keywords }, () => {
            loadHighlighterSettings();
            keywordInput.value = '';
            showStatus('Keyword added');
          });
        } else {
          showStatus('Keyword already exists', 'error');
        }
      });
    }

    return false;
  });

  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeywordBtn.click();
  });

  // Clear all keywords
  clearKeywordsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Clear all keywords?')) {
      browserAPI.storage.local.set({ keywords: [] }, () => {
        loadHighlighterSettings();
        showStatus('All keywords cleared');
      });
    }

    return false;
  });

  // Add URL pattern
  addUrlBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const pattern = urlPatternInput.value.trim();
    if (pattern) {
      browserAPI.storage.local.get(['urlPatterns'], (result) => {
        const patterns = result.urlPatterns || [];
        if (!patterns.includes(pattern)) {
          patterns.push(pattern);
          browserAPI.storage.local.set({ urlPatterns: patterns }, () => {
            loadHighlighterSettings();
            urlPatternInput.value = '';
            showStatus('URL pattern added');
          });
        } else {
          showStatus('URL pattern already exists', 'error');
        }
      });
    }

    return false;
  });

  urlPatternInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUrlBtn.click();
  });

  // Save settings
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('[Highlighter Save] Saving settings...');
    console.log('[Highlighter Save]   - highlightColor:', highlightColor.value);
    console.log('[Highlighter Save]   - elementSelector:', elementSelector.value.trim());
    console.log('[Highlighter Save]   - useWordBoundaries:', wordBoundaries.checked);

    // Get current keywords and urlPatterns from storage, then save all settings together
    browserAPI.storage.local.get(['keywords', 'urlPatterns'], (current) => {
      const settings = {
        keywords: current.keywords || [],
        urlPatterns: current.urlPatterns || [],
        elementSelector: elementSelector.value.trim(),
        highlightColor: highlightColor.value,
        useWordBoundaries: wordBoundaries.checked
      };

      console.log('[Highlighter Save] Complete settings to save:', settings);

      browserAPI.storage.local.set(settings, () => {
        console.log('[Highlighter Save] ✓ Settings saved successfully!');
        showStatus('Settings saved successfully!', 'success');

        // Verify save by reading back
        browserAPI.storage.local.get(['keywords', 'urlPatterns', 'elementSelector', 'highlightColor', 'useWordBoundaries'], (result) => {
          console.log('[Highlighter Save] ✓ Verification read from storage:', result);
        });

        // Reload UI to reflect saved changes
        loadHighlighterSettings();
        console.log('[Highlighter Save] UI reloaded');

        // Notify content script to reload
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            browserAPI.tabs.sendMessage(tabs[0].id, {
              action: 'reloadHighlighter'
            }).catch(() => {});
          }
        });
      });
    });

    return false;
  });

  // Export settings
  exportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    browserAPI.storage.local.get([
      'keywords',
      'urlPatterns',
      'elementSelector',
      'highlightColor',
      'useWordBoundaries',
      'lastExportFilename'
    ], (result) => {
      const exportData = {
        keywords: result.keywords || [],
        urlPatterns: result.urlPatterns || [],
        elementSelector: result.elementSelector || '',
        highlightColor: result.highlightColor || '#ffb9b9',
        useWordBoundaries: result.useWordBoundaries || false
      };

      console.log('[Highlighter] Exporting settings:', exportData);

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;

      // Use last filename or default
      const defaultFilename = result.lastExportFilename || 'highlighter-settings.json';
      link.download = defaultFilename;
      link.click();

      // Store this filename for next time
      browserAPI.storage.local.set({ lastExportFilename: defaultFilename });
      showStatus('Settings exported to ' + defaultFilename);
    });

    return false;
  });

  // Import settings
  importBtn.addEventListener('click', (e) => {
    console.log('[IMPORT] Import button clicked, triggering file picker');
    e.preventDefault();
    e.stopPropagation();
    importFile.click();
    return false;
  });

  importFile.addEventListener('change', (e) => {
    console.log('[IMPORT] File input change event triggered');
    console.log('[IMPORT] Event:', e);
    console.log('[IMPORT] Files:', e.target.files);

    const file = e.target.files[0];
    if (!file) {
      console.log('[IMPORT] No file selected, returning');
      return;
    }

    const filename = file.name;
    console.log('[IMPORT] File selected:', filename, 'Size:', file.size, 'Type:', file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      console.log('[IMPORT] FileReader.onload triggered');
      console.log('[IMPORT] File content length:', event.target.result.length);
      console.log('[IMPORT] First 200 chars:', event.target.result.substring(0, 200));

      try {
        const settings = JSON.parse(event.target.result);
        console.log('[IMPORT] JSON parsed successfully');
        console.log('[IMPORT] Settings object:', settings);

        // Validate that we have the expected structure
        if (typeof settings !== 'object' || settings === null) {
          showStatus('Invalid settings file: not a valid JSON object', 'error');
          console.error('[IMPORT] ✗ Invalid settings:', settings);
          importFile.value = '';
          return;
        }
        console.log('[IMPORT] Settings object validation passed');

        // Check if it has at least one of the expected fields
        const hasKeywords = settings.hasOwnProperty('keywords');
        const hasUrlPatterns = settings.hasOwnProperty('urlPatterns');
        const hasElementSelector = settings.hasOwnProperty('elementSelector');
        const hasHighlightColor = settings.hasOwnProperty('highlightColor');
        const hasWordBoundaries = settings.hasOwnProperty('useWordBoundaries');

        console.log('[IMPORT] Field presence check:');
        console.log('[IMPORT]   - hasKeywords:', hasKeywords);
        console.log('[IMPORT]   - hasUrlPatterns:', hasUrlPatterns);
        console.log('[IMPORT]   - hasElementSelector:', hasElementSelector);
        console.log('[IMPORT]   - hasHighlightColor:', hasHighlightColor);
        console.log('[IMPORT]   - hasWordBoundaries:', hasWordBoundaries);

        if (!hasKeywords && !hasUrlPatterns && !hasElementSelector && !hasHighlightColor && !hasWordBoundaries) {
          showStatus('Invalid settings file: missing all expected fields', 'error');
          console.error('[IMPORT] ✗ Invalid settings - no recognized fields:', settings);
          importFile.value = '';
          return;
        }
        console.log('[IMPORT] At least one recognized field found');

        // Ensure all fields have values (use defaults for missing fields)
        const settingsToSave = {
          keywords: settings.keywords || [],
          urlPatterns: settings.urlPatterns || [],
          elementSelector: settings.elementSelector || '',
          highlightColor: settings.highlightColor || '#ffb9b9',
          useWordBoundaries: settings.useWordBoundaries || false,
          lastExportFilename: filename
        };

        console.log('[IMPORT] Settings prepared for storage:');
        console.log('[IMPORT]   - keywords:', settingsToSave.keywords.length, 'items', settingsToSave.keywords);
        console.log('[IMPORT]   - urlPatterns:', settingsToSave.urlPatterns);
        console.log('[IMPORT]   - elementSelector:', settingsToSave.elementSelector);
        console.log('[IMPORT]   - highlightColor:', settingsToSave.highlightColor);
        console.log('[IMPORT]   - useWordBoundaries:', settingsToSave.useWordBoundaries);
        console.log('[IMPORT]   - lastExportFilename:', settingsToSave.lastExportFilename);

        console.log('[IMPORT] Attempting to save to browserAPI.storage.local...');
        browserAPI.storage.local.set(settingsToSave, () => {
          if (browserAPI.runtime.lastError) {
            showStatus('Error saving settings: ' + browserAPI.runtime.lastError.message, 'error');
            console.error('[IMPORT] ✗ Storage save error:', browserAPI.runtime.lastError);
          } else {
            console.log('[IMPORT] ✓ Storage save successful!');

            // Verify save by reading back
            browserAPI.storage.local.get(['keywords', 'urlPatterns', 'elementSelector', 'highlightColor', 'useWordBoundaries'], (result) => {
              console.log('[IMPORT] ✓ Verification read from storage:', result);
              console.log('[IMPORT]   - keywords in storage:', result.keywords ? result.keywords.length : 0, 'items');
            });

            loadHighlighterSettings();
            console.log('[IMPORT] UI reloaded with new settings');
            showStatus('Settings imported from ' + filename, 'success');
            console.log('[IMPORT] ✓ Import complete!');
          }
          // Reset file input so the same file can be imported again
          importFile.value = '';
          console.log('[IMPORT] File input reset');
        });
      } catch (error) {
        showStatus('Invalid JSON file: ' + error.message, 'error');
        console.error('[IMPORT] ✗ JSON parse error:', error);
        console.error('[IMPORT] Error stack:', error.stack);
        importFile.value = '';
      }
    };
    reader.onerror = () => {
      showStatus('Error reading file', 'error');
      console.error('[IMPORT] ✗ FileReader error');
      importFile.value = '';
    };

    console.log('[IMPORT] Starting FileReader.readAsText()');
    reader.readAsText(file);
  });
}

// ==================== NAVIGATOR ====================
function initNavigator() {
  const openNavigatorBtn = document.getElementById('open-navigator-btn');

  openNavigatorBtn.addEventListener('click', () => {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browserAPI.tabs.sendMessage(tabs[0].id, {
          action: 'toggleNavigator'
        }).then(() => {
          window.close();
        }).catch((error) => {
          showStatus('Error opening navigator panel', 'error');
          console.error(error);
        });
      }
    });
  });
}

// ==================== ANALYZER ====================
function initAnalyzer() {
  const analyzeBtn = document.getElementById('analyze-job-btn');
  const autoExportJson = document.getElementById('auto-export-json');
  const autoDisplayCompact = document.getElementById('auto-display-compact');

  // Load settings
  browserAPI.storage.local.get([
    'autoExportJSON',
    'autoDisplayCompact'
  ], (result) => {
    autoExportJson.checked = result.autoExportJSON || false;
    // Default to true if not set
    autoDisplayCompact.checked = result.autoDisplayCompact !== undefined ? result.autoDisplayCompact : true;
  });

  // Save settings on change
  autoExportJson.addEventListener('change', () => {
    browserAPI.storage.local.set({ autoExportJSON: autoExportJson.checked }, () => {
      showStatus('Auto-export setting saved');
    });
  });

  autoDisplayCompact.addEventListener('change', () => {
    browserAPI.storage.local.set({ autoDisplayCompact: autoDisplayCompact.checked }, () => {
      showStatus('Auto-display setting saved');
    });
  });

  // Analyze button
  analyzeBtn.addEventListener('click', () => {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browserAPI.tabs.sendMessage(tabs[0].id, {
          action: 'analyzeJob'
        }).then(() => {
          showStatus('Analysis triggered', 'success');
          window.close();
        }).catch((error) => {
          showStatus('Not on an Upwork job page', 'error');
        });
      }
    });
  });
}

// ==================== AUTO LOAD ====================
function initAutoLoad() {
  const buttonText = document.getElementById('button-text');
  const pauseDuration = document.getElementById('pause-duration');
  const keyPress = document.getElementById('key-press');
  const stopString = document.getElementById('stop-string');
  const startBtn = document.getElementById('start-autoload-btn');
  const stopBtn = document.getElementById('stop-autoload-btn');
  const statusBox = document.getElementById('autoload-status');

  // Load settings
  browserAPI.storage.sync.get([
    'buttonText',
    'pauseDuration',
    'keyPress',
    'stopString'
  ], (result) => {
    buttonText.value = result.buttonText || 'Load More Jobs';
    pauseDuration.value = result.pauseDuration || 10000;
    keyPress.value = result.keyPress || 'PageDown';
    stopString.value = result.stopString || 'Posted 2 days ago';
  });

  // Save settings on input
  [buttonText, pauseDuration, keyPress, stopString].forEach(input => {
    input.addEventListener('change', saveAutoLoadSettings);
  });

  function saveAutoLoadSettings() {
    const settings = {
      buttonText: buttonText.value,
      pauseDuration: parseInt(pauseDuration.value),
      keyPress: keyPress.value,
      stopString: stopString.value
    };
    browserAPI.storage.sync.set(settings, () => {
      showStatus('Auto-load settings saved');
    });
  }

  // Start automation
  startBtn.addEventListener('click', () => {
    saveAutoLoadSettings();

    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browserAPI.tabs.sendMessage(tabs[0].id, {
          action: 'startAutoLoad',
          settings: {
            buttonText: buttonText.value,
            pauseDuration: parseInt(pauseDuration.value),
            keyPress: keyPress.value,
            stopString: stopString.value
          }
        }).then(() => {
          startBtn.disabled = true;
          stopBtn.disabled = false;
          statusBox.textContent = 'Automation started...';
          showStatus('Auto-load started', 'success');
        }).catch((error) => {
          showStatus('Error starting auto-load', 'error');
        });
      }
    });
  });

  // Stop automation
  stopBtn.addEventListener('click', () => {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browserAPI.tabs.sendMessage(tabs[0].id, {
          action: 'stopAutoLoad'
        }).then(() => {
          startBtn.disabled = false;
          stopBtn.disabled = true;
          statusBox.textContent = 'Automation stopped';
          showStatus('Auto-load stopped');
        }).catch((error) => {
          console.error(error);
        });
      }
    });
  });

  // Listen for status updates from content script
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message.action === 'autoLoadStatus') {
      statusBox.textContent = message.status;
      if (message.done) {
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    }
  });
}

// ==================== UTILITIES ====================
function showStatus(message, type = '') {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;

  // Show error messages longer (5 seconds instead of 3)
  const duration = type === 'error' ? 5000 : 3000;

  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, duration);
}
