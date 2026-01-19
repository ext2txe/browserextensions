// Background script for Upwork Job Post Analyzer
// Handles hotkey commands and browser action clicks

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('[Upwork Analyzer] Background script loaded');

// Listen for hotkey command (Ctrl+Shift+A)
browserAPI.commands.onCommand.addListener((command) => {
  if (command === 'analyze-job') {
    console.log('[Upwork Analyzer] Hotkey triggered');
    triggerAnalysis();
  }
});

// Listen for browser action (icon) click
const actionAPI = browserAPI.browserAction || browserAPI.action;
actionAPI.onClicked.addListener(() => {
  console.log('[Upwork Analyzer] Browser action clicked');
  triggerAnalysis();
});

// Trigger analysis in active tab
async function triggerAnalysis() {
  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

    if (tabs.length === 0) {
      console.error('[Upwork Analyzer] No active tab found');
      return;
    }

    const tab = tabs[0];

    // Check if we're on an Upwork page
    if (!tab.url.includes('upwork.com')) {
      console.warn('[Upwork Analyzer] Not on an Upwork page');

      if (browserAPI.scripting) {
        // Manifest V3 (Chrome)
        await browserAPI.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const notification = document.createElement('div');
            notification.className = 'upwork-analyzer-notification error';
            notification.textContent = 'Please navigate to an Upwork job post page';
            notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:white;padding:15px 20px;border-radius:5px;z-index:10000;box-shadow:0 2px 10px rgba(0,0,0,0.2);font-family:sans-serif;';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
          }
        });
      } else {
        // Manifest V2 (Firefox)
        await browserAPI.tabs.executeScript(tab.id, {
          code: `
            const notification = document.createElement('div');
            notification.className = 'upwork-analyzer-notification error';
            notification.textContent = 'Please navigate to an Upwork job post page';
            notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:white;padding:15px 20px;border-radius:5px;z-index:10000;box-shadow:0 2px 10px rgba(0,0,0,0.2);font-family:sans-serif;';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
          `
        });
      }
      return;
    }

    // Try to send message to content script
    try {
      await browserAPI.tabs.sendMessage(tab.id, { action: 'analyze' });
    } catch (msgError) {
      // Content script not loaded yet, inject it manually
      console.log('[Upwork Analyzer] Content script not loaded, injecting...');

      // Inject CSS and script (Manifest V2 vs V3 compatibility)
      if (browserAPI.scripting) {
        // Manifest V3 (Chrome)
        await browserAPI.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['styles/panel.css']
        });
        await browserAPI.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-script.js']
        });
      } else {
        // Manifest V2 (Firefox)
        await browserAPI.tabs.insertCSS(tab.id, {
          file: 'styles/panel.css'
        });
        await browserAPI.tabs.executeScript(tab.id, {
          file: 'content-script.js'
        });
      }

      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try sending message again
      await browserAPI.tabs.sendMessage(tab.id, { action: 'analyze' });
    }

  } catch (error) {
    console.error('[Upwork Analyzer] Error triggering analysis:', error);
  }
}

// Listen for installation/update
browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Upwork Analyzer] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[Upwork Analyzer] Extension updated');
  }
});
