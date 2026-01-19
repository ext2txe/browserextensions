// Firefox-compatible background script
// Works with both 'browser' (Firefox) and 'chrome' (Chrome/Edge) APIs

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Handle extension icon click
const actionAPI = browserAPI.browserAction || browserAPI.action;

actionAPI.onClicked.addListener((tab) => {
  // Toggle the search panel
  browserAPI.tabs.sendMessage(tab.id, { action: "toggle" }).catch((error) => {
    console.error('[List Navigator] Failed to send message to content script:', error);
    console.log('[List Navigator] Please reload the page if this is the first time using the extension');
  });
});
