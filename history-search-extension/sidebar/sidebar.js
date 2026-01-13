// State
let currentResults = [];
let savedSearches = [];

// DOM elements
const domainFilter = document.getElementById('domainFilter');
const urlPattern = document.getElementById('urlPattern');
const titlePattern = document.getElementById('titlePattern');
const useRegex = document.getElementById('useRegex');
const modeAnd = document.getElementById('modeAnd');
const modeOr = document.getElementById('modeOr');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const maxResults = document.getElementById('maxResults');
const searchBtn = document.getElementById('searchBtn');
const resultsCount = document.getElementById('resultsCount');
const results = document.getElementById('results');
const sortBy = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const saveSearchBtn = document.getElementById('saveSearch');
const loadSearchBtn = document.getElementById('loadSearch');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');

// Load saved searches on startup
loadSavedSearches();

// Event listeners
searchBtn.addEventListener('click', performSearch);
exportBtn.addEventListener('click', exportResults);
sortBy.addEventListener('change', () => sortResults(sortBy.value));
saveSearchBtn.addEventListener('click', showSaveSearchModal);
loadSearchBtn.addEventListener('click', showLoadSearchModal);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Allow Enter key in inputs to trigger search
[domainFilter, urlPattern, titlePattern, maxResults].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
});

async function performSearch() {
  searchBtn.textContent = 'Searching...';
  searchBtn.disabled = true;
  
  try {
    const domain = domainFilter.value.trim();
    const urlText = urlPattern.value.trim();
    const titleText = titlePattern.value.trim();
    const isRegexMode = useRegex.checked;
    const isAndMode = modeAnd.checked;
    const start = startDate.value;
    const end = endDate.value;
    const limit = parseInt(maxResults.value) || 100;
    
    // Build time constraints
    const startTime = start ? new Date(start).getTime() : 0;
    const endTime = end ? new Date(end + 'T23:59:59').getTime() : Date.now();
    
    // Search history - get more than we need since we'll filter
    const historyItems = await browser.history.search({
      text: '', // Empty to get all
      startTime: startTime,
      endTime: endTime,
      maxResults: 10000 // Get a large set to filter from
    });
    
    // Filter results
    let filtered = historyItems.filter(item => {
      const checks = [];
      
      // Domain check
      if (domain) {
        const itemDomain = new URL(item.url).hostname;
        checks.push(itemDomain.includes(domain));
      }
      
      // URL pattern check
      if (urlText) {
        if (isRegexMode) {
          try {
            const regex = new RegExp(urlText, 'i');
            checks.push(regex.test(item.url));
          } catch (e) {
            // Invalid regex, treat as plain text
            checks.push(item.url.toLowerCase().includes(urlText.toLowerCase()));
          }
        } else {
          checks.push(item.url.toLowerCase().includes(urlText.toLowerCase()));
        }
      }
      
      // Title pattern check
      if (titleText && item.title) {
        checks.push(item.title.toLowerCase().includes(titleText.toLowerCase()));
      }
      
      // Apply AND/OR logic
      if (checks.length === 0) return true; // No filters, include all
      
      return isAndMode ? checks.every(c => c) : checks.some(c => c);
    });
    
    // Limit results
    filtered = filtered.slice(0, limit);
    
    // Get visit counts for each URL
    const resultsWithVisits = await Promise.all(
      filtered.map(async item => {
        const visits = await browser.history.getVisits({ url: item.url });
        return {
          ...item,
          visitCount: visits.length,
          lastVisit: visits[0]?.visitTime || item.lastVisitTime
        };
      })
    );
    
    currentResults = resultsWithVisits;
    displayResults(currentResults);
    
  } catch (error) {
    console.error('Search error:', error);
    showError('Search failed: ' + error.message);
  } finally {
    searchBtn.textContent = 'Search History';
    searchBtn.disabled = false;
  }
}

function displayResults(items) {
  resultsCount.textContent = items.length;
  exportBtn.disabled = items.length === 0;
  
  if (items.length === 0) {
    results.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>No results found.<br>Try adjusting your search filters.</p>
      </div>
    `;
    return;
  }
  
  results.innerHTML = items.map((item, index) => {
    const date = new Date(item.lastVisit);
    const domain = new URL(item.url).hostname;
    
    return `
      <div class="result-item" style="animation-delay: ${index * 0.03}s">
        <div class="result-title">${escapeHtml(item.title || 'Untitled')}</div>
        <a href="${item.url}" class="result-url" target="_blank">${escapeHtml(item.url)}</a>
        <div class="result-meta">
          <span>📅 ${formatDate(date)}</span>
          <span>🌐 ${escapeHtml(domain)}</span>
          <span>👁️ ${item.visitCount} visit${item.visitCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

function sortResults(sortType) {
  if (currentResults.length === 0) return;
  
  const sorted = [...currentResults];
  
  switch(sortType) {
    case 'date-desc':
      sorted.sort((a, b) => b.lastVisit - a.lastVisit);
      break;
    case 'date-asc':
      sorted.sort((a, b) => a.lastVisit - b.lastVisit);
      break;
    case 'title':
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'domain':
      sorted.sort((a, b) => {
        const domainA = new URL(a.url).hostname;
        const domainB = new URL(b.url).hostname;
        return domainA.localeCompare(domainB);
      });
      break;
  }
  
  currentResults = sorted;
  displayResults(currentResults);
}

function exportResults() {
  if (currentResults.length === 0) return;
  
  const csv = [
    ['Title', 'URL', 'Domain', 'Last Visit', 'Visit Count'].join(','),
    ...currentResults.map(item => {
      const date = new Date(item.lastVisit).toISOString();
      const domain = new URL(item.url).hostname;
      return [
        csvEscape(item.title || 'Untitled'),
        csvEscape(item.url),
        csvEscape(domain),
        date,
        item.visitCount
      ].join(',');
    })
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `history-search-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function showSaveSearchModal() {
  const searchConfig = getCurrentSearchConfig();
  
  modalTitle.textContent = 'Save Search';
  modalBody.innerHTML = `
    <div class="form-group">
      <label for="searchName">Search Name</label>
      <input type="text" id="searchName" placeholder="e.g., Udemy WordPress courses" autofocus>
    </div>
    <button id="saveSearchConfirm" class="primary-btn">Save</button>
  `;
  
  openModal();
  
  const nameInput = document.getElementById('searchName');
  const confirmBtn = document.getElementById('saveSearchConfirm');
  
  confirmBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert('Please enter a name for this search');
      return;
    }
    
    savedSearches.push({ name, config: searchConfig });
    browser.storage.local.set({ savedSearches });
    closeModal();
    showNotification('Search saved!');
  });
  
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmBtn.click();
  });
}

function showLoadSearchModal() {
  modalTitle.textContent = 'Load Saved Search';
  
  if (savedSearches.length === 0) {
    modalBody.innerHTML = '<p style="color: var(--text-tertiary);">No saved searches yet.</p>';
  } else {
    modalBody.innerHTML = savedSearches.map((search, index) => `
      <div class="saved-search-item" data-index="${index}">
        <span class="saved-search-name">${escapeHtml(search.name)}</span>
        <button class="saved-search-delete" data-index="${index}">Delete</button>
      </div>
    `).join('');
    
    // Load search on click
    modalBody.querySelectorAll('.saved-search-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('saved-search-delete')) return;
        const index = parseInt(item.dataset.index);
        loadSearchConfig(savedSearches[index].config);
        closeModal();
      });
    });
    
    // Delete search
    modalBody.querySelectorAll('.saved-search-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        savedSearches.splice(index, 1);
        browser.storage.local.set({ savedSearches });
        showLoadSearchModal(); // Refresh modal
      });
    });
  }
  
  openModal();
}

function getCurrentSearchConfig() {
  return {
    domain: domainFilter.value,
    urlPattern: urlPattern.value,
    titlePattern: titlePattern.value,
    useRegex: useRegex.checked,
    mode: modeAnd.checked ? 'and' : 'or',
    startDate: startDate.value,
    endDate: endDate.value,
    maxResults: maxResults.value
  };
}

function loadSearchConfig(config) {
  domainFilter.value = config.domain || '';
  urlPattern.value = config.urlPattern || '';
  titlePattern.value = config.titlePattern || '';
  useRegex.checked = config.useRegex || false;
  if (config.mode === 'and') {
    modeAnd.checked = true;
  } else {
    modeOr.checked = true;
  }
  startDate.value = config.startDate || '';
  endDate.value = config.endDate || '';
  maxResults.value = config.maxResults || 100;
}

async function loadSavedSearches() {
  const data = await browser.storage.local.get('savedSearches');
  savedSearches = data.savedSearches || [];
}

function openModal() {
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

function showNotification(message) {
  // Simple notification - could be enhanced
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-primary);
    color: var(--bg-primary);
    padding: 12px 20px;
    border-radius: 6px;
    font-weight: 600;
    z-index: 2000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function showError(message) {
  results.innerHTML = `
    <div class="empty-state">
      <p style="color: #ef4444;">${escapeHtml(message)}</p>
    </div>
  `;
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function csvEscape(text) {
  if (!text) return '""';
  text = text.toString().replace(/"/g, '""');
  if (text.includes(',') || text.includes('\n') || text.includes('"')) {
    return `"${text}"`;
  }
  return text;
}
