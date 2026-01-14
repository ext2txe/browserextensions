// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Open sidebar/side panel when browser action is clicked
const actionAPI = browserAPI.browserAction || browserAPI.action;

actionAPI.onClicked.addListener(async () => {
  // Firefox: Open sidebar
  if (browserAPI.sidebarAction) {
    browserAPI.sidebarAction.open();
  }
  // Chrome: Open side panel (Manifest V3)
  else if (browserAPI.sidePanel) {
    // Get the current window
    const window = await browserAPI.windows.getCurrent();
    browserAPI.sidePanel.open({ windowId: window.id }).catch((error) => {
      console.error('[History Search] Failed to open side panel:', error);
    });
  }
});
