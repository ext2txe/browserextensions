// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('[Web Workflow Toolkit] Background script loaded');

// Handle keyboard shortcuts
browserAPI.commands.onCommand.addListener((command) => {
  console.log('[Web Workflow Toolkit] Command received:', command);

  // Auto Load shortcut opens popup instead of starting automation
  if (command === 'toggle-autoload') {
    // Open popup (action is already configured in manifest)
    // Store which tab to open in storage
    browserAPI.storage.local.set({ activeTab: 'autoload' }, () => {
      browserAPI.action.openPopup().catch((error) => {
        // Fallback: If openPopup doesn't work, send message to content script
        console.log('[Web Workflow Toolkit] Could not open popup, falling back to content script');
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            browserAPI.tabs.sendMessage(tabs[0].id, { action: 'toggleAutoLoad' }).catch(console.error);
          }
        });
      });
    });
    return;
  }

  browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error('[Web Workflow Toolkit] No active tab found');
      return;
    }

    const tab = tabs[0];

    // Map commands to actions
    const actionMap = {
      'toggle-highlighter': 'toggleHighlighter',
      'toggle-navigator': 'toggleNavigator',
      'analyze-job': 'analyzeJob'
    };

    const action = actionMap[command];
    if (action) {
      browserAPI.tabs.sendMessage(tab.id, { action }).catch((error) => {
        console.error(`[Web Workflow Toolkit] Failed to send message for ${command}:`, error);
      });
    }
  });
});

// Handle toolbar icon click (open popup)
const actionAPI = browserAPI.browserAction || browserAPI.action;
// Note: No need to handle click as popup is configured in manifest

// Listen for installation/update
browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Web Workflow Toolkit] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[Web Workflow Toolkit] Extension updated to version', browserAPI.runtime.getManifest().version);
  }
});
