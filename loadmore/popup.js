// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Get DOM elements
const buttonTextInput = document.getElementById('buttonText');
const pauseDurationInput = document.getElementById('pauseDuration');
const keyPressSelect = document.getElementById('keyPress');
const stopStringInput = document.getElementById('stopString');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const counterDiv = document.getElementById('counter');

// Load saved settings and check automation state on popup open
async function initializePopup() {
  // Load saved settings
  const items = await browserAPI.storage.sync.get({
    buttonText: 'Load More Jobs',
    pauseDuration: 10000,
    keyPress: 'PageDown',
    stopString: 'Posted 2 days ago'
  });

  buttonTextInput.value = items.buttonText;
  pauseDurationInput.value = items.pauseDuration;
  keyPressSelect.value = items.keyPress;
  stopStringInput.value = items.stopString;

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
    console.log('Content script not available yet');
  }
}

// Initialize on popup open
initializePopup();

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

// Start button click handler
startBtn.addEventListener('click', async () => {
  const settings = {
    buttonText: buttonTextInput.value.trim(),
    pauseDuration: parseInt(pauseDurationInput.value, 10),
    keyPress: keyPressSelect.value,
    stopString: stopStringInput.value.trim()
  };

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
  await browserAPI.storage.sync.set(settings);

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
});

// Stop button click handler
stopBtn.addEventListener('click', async () => {
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
});
