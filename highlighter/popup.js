// Upwork Job Highlighter - Popup Script
const VERSION = '0.2.9';

// Browser API polyfill for Chrome/Edge compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

document.addEventListener('DOMContentLoaded', function() {
  const keywordList = document.getElementById('keywordList');
  const urlList = document.getElementById('urlList');
  const newKeywordInput = document.getElementById('newKeyword');
  const newUrlInput = document.getElementById('newUrl');
  const addBtn = document.getElementById('addBtn');
  const addUrlBtn = document.getElementById('addUrlBtn');
  const saveBtn = document.getElementById('saveBtn');
  const colorPicker = document.getElementById('colorPicker');
  const selectorInput = document.getElementById('elementSelector');
  const wordBoundariesCheckbox = document.getElementById('wordBoundaries');
  const statusDiv = document.getElementById('status');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  let keywords = [];
  let urlPatterns = [];
  let highlightColor = '#d3d3d3';
  let elementSelector = 'article, .job, .listing, section';
  let useWordBoundaries = true;

  // Load current settings
  function loadSettings() {
    browser.storage.local.get(['keywords', 'highlightColor', 'urlPatterns', 'elementSelector', 'useWordBoundaries']).then(function(result) {
      keywords = result.keywords || [];
      urlPatterns = result.urlPatterns || ['*://www.upwork.com/nx/find-work/*'];
      highlightColor = result.highlightColor || '#d3d3d3';
      elementSelector = result.elementSelector || 'article, .job, .listing, section';
      useWordBoundaries = result.useWordBoundaries !== undefined ? result.useWordBoundaries : true;
      
      colorPicker.value = highlightColor;
      selectorInput.value = elementSelector;
      wordBoundariesCheckbox.checked = useWordBoundaries;
      renderKeywordList();
      renderUrlList();
      console.log('Popup loaded settings:', { keywords, urlPatterns, highlightColor, elementSelector, useWordBoundaries });
    }).catch(function(error) {
      console.error('Error loading settings in popup:', error);
      showStatus('Error loading settings', 'error');
    });
  }

  // Render the keyword list
  function renderKeywordList() {
    keywordList.innerHTML = '';
    
    if (keywords.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-message';
      li.textContent = 'No keywords added yet';
      keywordList.appendChild(li);
      return;
    }

    keywords.forEach((keyword, index) => {
      const li = document.createElement('li');
      li.className = 'keyword-item';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = keyword;
      input.className = 'keyword-input';
      input.dataset.index = index;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = function() {
        deleteKeyword(index);
      };
      
      li.appendChild(input);
      li.appendChild(deleteBtn);
      keywordList.appendChild(li);
    });
  }

  // Render the URL list
  function renderUrlList() {
    urlList.innerHTML = '';
    
    if (urlPatterns.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-message';
      li.textContent = 'No URL patterns added yet';
      urlList.appendChild(li);
      return;
    }

    urlPatterns.forEach((url, index) => {
      const li = document.createElement('li');
      li.className = 'keyword-item';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = url;
      input.className = 'keyword-input';
      input.style.fontFamily = 'monospace';
      input.dataset.index = index;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = function() {
        deleteUrl(index);
      };
      
      li.appendChild(input);
      li.appendChild(deleteBtn);
      urlList.appendChild(li);
    });
  }

  // Add a new keyword
  function addKeyword() {
    const keyword = newKeywordInput.value.trim();
    if (keyword && !keywords.includes(keyword)) {
      keywords.push(keyword);
      newKeywordInput.value = '';
      renderKeywordList();
      showStatus('Keyword added. Click "Save Settings" to apply.', 'info');
    } else if (keywords.includes(keyword)) {
      showStatus('This keyword already exists!', 'error');
    }
  }

  // Add a new URL pattern
  function addUrl() {
    const url = newUrlInput.value.trim();
    if (url && !urlPatterns.includes(url)) {
      urlPatterns.push(url);
      newUrlInput.value = '';
      renderUrlList();
      showStatus('URL added. Click "Save Settings" to apply.', 'info');
    } else if (urlPatterns.includes(url)) {
      showStatus('This URL pattern already exists!', 'error');
    }
  }

  // Delete a keyword
  function deleteKeyword(index) {
    keywords.splice(index, 1);
    renderKeywordList();
    showStatus('Keyword removed. Click "Save Settings" to apply.', 'info');
  }

  // Delete a URL
  function deleteUrl(index) {
    urlPatterns.splice(index, 1);
    renderUrlList();
    showStatus('URL removed. Click "Save Settings" to apply.', 'info');
  }

  // Update keywords from edited inputs
  function updateKeywords() {
    const inputs = document.querySelectorAll('#keywordList .keyword-input');
    const newKeywords = [];
    
    inputs.forEach(input => {
      const value = input.value.trim();
      if (value) {
        newKeywords.push(value);
      }
    });
    
    keywords = newKeywords;
  }

  // Update URLs from edited inputs
  function updateUrls() {
    const inputs = document.querySelectorAll('#urlList .keyword-input');
    const newUrls = [];
    
    inputs.forEach(input => {
      const value = input.value.trim();
      if (value) {
        newUrls.push(value);
      }
    });
    
    urlPatterns = newUrls;
  }

  // Save settings to storage
  function saveSettings() {
    updateKeywords();
    updateUrls();
    highlightColor = colorPicker.value;
    elementSelector = selectorInput.value.trim() || 'article, .job, .listing, section';
    useWordBoundaries = wordBoundariesCheckbox.checked;
    
    console.log('Popup saving settings:', { keywords, urlPatterns, highlightColor, elementSelector, useWordBoundaries });
    
    browser.storage.local.set({
      keywords: keywords,
      urlPatterns: urlPatterns,
      highlightColor: highlightColor,
      elementSelector: elementSelector,
      useWordBoundaries: useWordBoundaries
    }).then(function() {
      console.log('Settings saved from popup');
      showStatus('Settings saved! Reload pages for URL changes to take effect.', 'success');
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
    }).catch(function(error) {
      console.error('Error saving settings from popup:', error);
      showStatus('Error saving: ' + error.message, 'error');
    });
  }

  // Show status message
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }

  // Export settings to JSON file
  function exportSettings() {
    updateKeywords();
    updateUrls();

    const settings = {
      version: VERSION,
      exportDate: new Date().toISOString(),
      keywords: keywords,
      urlPatterns: urlPatterns,
      highlightColor: colorPicker.value,
      elementSelector: selectorInput.value.trim() || 'article, .job, .listing, section',
      useWordBoundaries: wordBoundariesCheckbox.checked
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyword-highlighter-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showStatus('Settings exported successfully!', 'success');
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 3000);
  }

  // Import settings from JSON file
  function importSettings() {
    importFile.click();
  }

  // Handle file import
  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const settings = JSON.parse(e.target.result);

        // Validate settings structure
        if (!settings || typeof settings !== 'object') {
          throw new Error('Invalid settings file format');
        }

        // Import settings (use defaults if properties don't exist)
        keywords = Array.isArray(settings.keywords) ? settings.keywords : [];
        urlPatterns = Array.isArray(settings.urlPatterns) ? settings.urlPatterns : ['*://www.upwork.com/nx/find-work/*'];
        highlightColor = settings.highlightColor || '#d3d3d3';
        elementSelector = settings.elementSelector || 'article, .job, .listing, section';
        useWordBoundaries = settings.useWordBoundaries !== undefined ? settings.useWordBoundaries : true;

        // Update UI
        colorPicker.value = highlightColor;
        selectorInput.value = elementSelector;
        wordBoundariesCheckbox.checked = useWordBoundaries;
        renderKeywordList();
        renderUrlList();

        showStatus('Settings imported successfully! Click "Save Settings" to apply.', 'success');
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 5000);
      } catch (error) {
        console.error('Error importing settings:', error);
        showStatus('Error importing settings: ' + error.message, 'error');
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 5000);
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be imported again
    event.target.value = '';
  }

  // Event listeners
  addBtn.addEventListener('click', addKeyword);
  addUrlBtn.addEventListener('click', addUrl);
  
  newKeywordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addKeyword();
    }
  });

  newUrlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addUrl();
    }
  });

  saveBtn.addEventListener('click', saveSettings);
  exportBtn.addEventListener('click', exportSettings);
  importBtn.addEventListener('click', importSettings);
  importFile.addEventListener('change', handleFileImport);

  // Set version in title
  const versionSpan = document.getElementById('version');
  if (versionSpan) {
    versionSpan.textContent = 'v' + VERSION;
  }

  // Load initial settings
  loadSettings();
});
