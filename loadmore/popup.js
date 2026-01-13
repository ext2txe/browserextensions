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
  const items = await browser.storage.sync.get({
    buttonText: 'Load More Jobs',
    pauseDuration: 1000,
    keyPress: 'PageDown',
    stopString: 'Posted 2 days ago'
  });

  buttonTextInput.value = items.buttonText;
  pauseDurationInput.value = items.pauseDuration;
  keyPressSelect.value = items.keyPress;
  stopStringInput.value = items.stopString;

  // Check if automation is currently running
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const response = await browser.tabs.sendMessage(tabs[0].id, {
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
browser.runtime.onMessage.addListener((message) => {
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

  if (settings.pauseDuration < 100) {
    statusDiv.textContent = 'Pause duration must be at least 100ms';
    statusDiv.className = 'status status-error';
    return;
  }

  // Save settings
  await browser.storage.sync.set(settings);

  // Get active tab
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  // Send start message to content script
  browser.tabs.sendMessage(tabs[0].id, {
    type: 'START_AUTOMATION',
    settings: settings
  });

  // Update UI
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusDiv.textContent = 'Starting automation...';
  statusDiv.className = 'status status-running';
  counterDiv.textContent = 'Clicks: 0';
});

// Stop button click handler
stopBtn.addEventListener('click', async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  browser.tabs.sendMessage(tabs[0].id, {
    type: 'STOP_AUTOMATION'
  });

  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.textContent = 'Stopped by user';
  statusDiv.className = 'status status-info';
});
