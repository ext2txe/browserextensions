// Popup script for Upwork Job Analyzer

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('[Job Post Analysis] Popup script loaded');

// DOM elements - will be initialized after DOM loads
let analyzeBtn;
let statusDiv;

// Initialize popup
function initializePopup() {
  console.log('[Job Post Analysis] Initializing popup');

  // Get DOM elements
  analyzeBtn = document.getElementById('analyzeBtn');
  statusDiv = document.getElementById('status');

  console.log('[Job Post Analysis] DOM elements:', {
    analyzeBtn: !!analyzeBtn,
    statusDiv: !!statusDiv
  });

  // Set up event listener
  analyzeBtn.addEventListener('click', handleAnalyzeClick);
}

// Analyze button click handler
async function handleAnalyzeClick() {
  console.log('[Job Post Analysis] Analyze button clicked');

  statusDiv.style.display = 'block';
  statusDiv.textContent = '⏳ Analyzing...';

  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

    if (tabs.length === 0) {
      statusDiv.textContent = '❌ No active tab found';
      return;
    }

    const tab = tabs[0];

    if (!tab.url.includes('upwork.com')) {
      statusDiv.textContent = '⚠️ Not on Upwork.com';
      return;
    }

    // Send message to content script
    await browserAPI.tabs.sendMessage(tab.id, { action: 'analyze' });

    statusDiv.textContent = '✅ Analysis started!';

    // Close popup after a short delay
    setTimeout(() => {
      window.close();
    }, 1000);

  } catch (error) {
    console.error('[Job Post Analysis] Error:', error);
    if (error.message && error.message.includes('Could not establish connection')) {
      statusDiv.textContent = '⚠️ Please reload the page and try again';
    } else {
      statusDiv.textContent = '❌ Error: ' + error.message;
    }
  }
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  // DOM is already ready
  initializePopup();
}
