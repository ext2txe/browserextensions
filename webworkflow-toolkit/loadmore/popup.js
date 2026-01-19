// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('[Auto Load More] Popup script loaded');

// DOM elements - will be initialized after DOM loads
let buttonTextInput;
let pauseDurationInput;
let keyPressSelect;
let stopStringInput;
let startBtn;
let stopBtn;
let statusDiv;
let counterDiv;

// Load saved settings and check automation state on popup open
async function initializePopup() {
  console.log('[Auto Load More] Initializing popup');

  // Get DOM elements
  buttonTextInput = document.getElementById('buttonText');
  pauseDurationInput = document.getElementById('pauseDuration');
  keyPressSelect = document.getElementById('keyPress');
  stopStringInput = document.getElementById('stopString');
  startBtn = document.getElementById('startBtn');
  stopBtn = document.getElementById('stopBtn');
  statusDiv = document.getElementById('status');
  counterDiv = document.getElementById('counter');

  console.log('[Auto Load More] DOM elements:', {
    buttonTextInput: !!buttonTextInput,
    startBtn: !!startBtn
  });

  // Load saved settings
  try {
    const items = await browserAPI.storage.sync.get({
      buttonText: 'Load More Jobs',
      pauseDuration: 10000,
      keyPress: 'PageDown',
      stopString: 'Posted 2 days ago'
    });

    console.log('[Auto Load More] Loaded settings:', items);

    buttonTextInput.value = items.buttonText;
    pauseDurationInput.value = items.pauseDuration;
    keyPressSelect.value = items.keyPress;
    stopStringInput.value = items.stopString;
  } catch (error) {
    console.error('[Auto Load More] Error loading settings:', error);
  }

  // Check if automation is currently running
  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const response = await browserAPI.tabs.sendMessage(tabs[0].id, {
      type: 'GET_STATE'
    });

    if (response && response.isRunning) {
      // Automation is running, update UI accordingly
      startBtn.disabled = true;
      stopBtn.disabled = false;
      statusDiv.textContent = `Running... (Clicks: ${response.clickCount})`;
      statusDiv.className = 'status status-running';
      counterDiv.textContent = `Clicks: ${response.clickCount}`;
    }
  } catch (error) {
    // Content script not ready or no automation running, keep defaults
    console.log('[Auto Load More] Content script not available yet');
  }

  // Set up event listeners
  setupEventListeners();
}

// Set up event listeners for buttons
function setupEventListeners() {
  console.log('[Auto Load More] Setting up event listeners');

  // Start button click handler
  startBtn.addEventListener('click', handleStartClick);

  // Stop button click handler
  stopBtn.addEventListener('click', handleStopClick);
}

// Start button click handler
async function handleStartClick() {
  console.log('[Auto Load More] Start button clicked');

  const settings = {
    buttonText: buttonTextInput.value.trim(),
    pauseDuration: parseInt(pauseDurationInput.value, 10),
    keyPress: keyPressSelect.value,
    stopString: stopStringInput.value.trim()
  };

  console.log('[Auto Load More] Settings:', settings);

  // Validate inputs
  if (!settings.buttonText) {
    statusDiv.textContent = 'Please enter button text';
    statusDiv.className = 'status status-error';
    return;
  }

  if (!settings.stopString) {
    statusDiv.textContent = 'Please enter stop string';
    statusDiv.className = 'status status-error';
    return;
  }

  if (settings.pauseDuration < 1000) {
    statusDiv.textContent = 'Max load wait must be at least 1000ms';
    statusDiv.className = 'status status-error';
    return;
  }

  // Save settings
  try {
    await browserAPI.storage.sync.set(settings);
    console.log('[Auto Load More] Settings saved');
  } catch (error) {
    console.error('[Auto Load More] Error saving settings:', error);
  }

  // Get active tab
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

  // Send start message to content script
  try {
    await browserAPI.tabs.sendMessage(tabs[0].id, {
      type: 'START_AUTOMATION',
      settings: settings
    });

    // Update UI
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusDiv.textContent = 'Starting automation...';
    statusDiv.className = 'status status-running';
    counterDiv.textContent = 'Clicks: 0';
  } catch (error) {
    // Content script not loaded - try to inject it (Manifest V3 compatibility)
    if (error.message && error.message.includes('Could not establish connection')) {
      statusDiv.textContent = 'Please reload the page and try again';
      statusDiv.className = 'status status-error';
      console.error('[Auto Load More] Content script not loaded:', error);
    } else {
      statusDiv.textContent = 'Error: ' + error.message;
      statusDiv.className = 'status status-error';
      console.error('[Auto Load More] Error:', error);
    }
  }
}

// Stop button click handler
async function handleStopClick() {
  console.log('[Auto Load More] Stop button clicked');

  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

  try {
    await browserAPI.tabs.sendMessage(tabs[0].id, {
      type: 'STOP_AUTOMATION'
    });

    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusDiv.textContent = 'Stopped by user';
    statusDiv.className = 'status status-info';
  } catch (error) {
    // Just update UI even if message fails
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusDiv.textContent = 'Stopped';
    statusDiv.className = 'status status-info';
    console.error('[Auto Load More] Error stopping:', error);
  }
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  // DOM is already ready
  initializePopup();
}

// Listen for status updates from content script
browserAPI.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATUS_UPDATE') {
    statusDiv.textContent = message.status;
    statusDiv.className = 'status status-' + message.level;
  } else if (message.type === 'COUNTER_UPDATE') {
    counterDiv.textContent = `Clicks: ${message.count}`;
  } else if (message.type === 'AUTOMATION_STOPPED') {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusDiv.textContent = message.reason || 'Stopped';
    statusDiv.className = 'status status-info';
  }
});
