// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('[Udemy Search] Popup script loaded');

// DOM elements - will be initialized after DOM loads
let statusEl;
let openPanelBtn;

function setStatus(s) {
  if (statusEl) {
    statusEl.textContent = s || "";
  }
}

// Initialize popup
function initializePopup() {
  console.log('[Udemy Search] Initializing popup');

  // Get DOM elements
  statusEl = document.getElementById("status");
  openPanelBtn = document.getElementById("openPanelBtn");

  console.log('[Udemy Search] DOM elements:', {
    statusEl: !!statusEl,
    openPanelBtn: !!openPanelBtn
  });

  // Set up event listener
  openPanelBtn.addEventListener("click", handleOpenPanelClick);
}

// Open panel button click handler
async function handleOpenPanelClick() {
  console.log('[Udemy Search] Open panel button clicked');

  await browserAPI.runtime.sendMessage({ type: "OPEN_PANEL" });
  setStatus("Opening results panel…");
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  // DOM is already ready
  initializePopup();
}
