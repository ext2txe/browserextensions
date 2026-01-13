// Automation state
let isRunning = false;
let settings = null;
let clickCount = 0;
let automationTimeout = null;

// Send status update to popup
function updateStatus(status, level = 'info') {
  browser.runtime.sendMessage({
    type: 'STATUS_UPDATE',
    status: status,
    level: level
  });
}

// Update click counter
function updateCounter() {
  browser.runtime.sendMessage({
    type: 'COUNTER_UPDATE',
    count: clickCount
  });
}

// Notify automation stopped
function notifyStop(reason) {
  browser.runtime.sendMessage({
    type: 'AUTOMATION_STOPPED',
    reason: reason
  });
}

// Find button by text content or data-test attribute
function findButton(buttonText) {
  // Strategy 1: Try to find by data-test attribute first (more reliable for the specific case)
  const dataTestButton = document.querySelector('[data-test="load-more-button"]');
  if (dataTestButton && dataTestButton.offsetParent !== null) {
    return dataTestButton;
  }

  // Strategy 2: Find all clickable elements
  const candidates = [
    ...document.querySelectorAll('button'),
    ...document.querySelectorAll('input[type="button"]'),
    ...document.querySelectorAll('input[type="submit"]'),
    ...document.querySelectorAll('a[role="button"]'),
    ...document.querySelectorAll('[role="button"]')
  ];

  // Filter by text content (partial match, case-insensitive)
  const searchText = buttonText.toLowerCase();
  for (const element of candidates) {
    // Check if element is visible
    if (element.offsetParent === null) continue;

    const text = element.textContent || element.value || element.getAttribute('aria-label') || '';
    if (text.toLowerCase().includes(searchText)) {
      return element;
    }
  }

  return null;
}

// Check if stop string exists in the page
function checkForStopString(stopString) {
  const bodyText = document.body.innerText || document.body.textContent;
  return bodyText.includes(stopString);
}

// Simulate keypress or perform scroll action
function simulateKeyPress(key) {
  // For scroll keys, perform actual scrolling instead of just firing events
  // because simulated keyboard events don't trigger native browser scroll behavior
  switch(key) {
    case 'End':
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    case 'Home':
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    case 'PageDown':
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      return;
    case 'PageUp':
      window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      return;
    case 'ArrowDown':
      window.scrollBy({ top: 100, behavior: 'smooth' });
      return;
    case 'ArrowUp':
      window.scrollBy({ top: -100, behavior: 'smooth' });
      return;
  }

  // For non-scroll keys, dispatch keyboard events
  const event = new KeyboardEvent('keydown', {
    key: key,
    code: key,
    keyCode: getKeyCode(key),
    which: getKeyCode(key),
    bubbles: true,
    cancelable: true
  });

  document.dispatchEvent(event);

  // Also dispatch keyup for completeness
  const upEvent = new KeyboardEvent('keyup', {
    key: key,
    code: key,
    keyCode: getKeyCode(key),
    which: getKeyCode(key),
    bubbles: true,
    cancelable: true
  });

  document.dispatchEvent(upEvent);
}

// Get keyCode for common keys
function getKeyCode(key) {
  const keyCodes = {
    'PageDown': 34,
    'PageUp': 33,
    'End': 35,
    'Home': 36,
    'ArrowLeft': 37,
    'ArrowUp': 38,
    'ArrowRight': 39,
    'ArrowDown': 40,
    'Space': 32
  };
  return keyCodes[key] || 0;
}

// Main automation cycle
async function runAutomationCycle() {
  if (!isRunning) return;

  try {
    // Step 1: Check for stop string first
    if (checkForStopString(settings.stopString)) {
      stopAutomation(`Stop string found: "${settings.stopString}"`);
      alert(`Automation stopped: Found "${settings.stopString}" on the page.`);
      return;
    }

    // Step 2: Find and click the button
    const button = findButton(settings.buttonText);
    if (!button) {
      stopAutomation('Button not found');
      updateStatus('Error: Button not found', 'error');
      return;
    }

    updateStatus(`Clicking button... (${clickCount + 1})`, 'running');
    button.click();
    clickCount++;
    updateCounter();

    // Step 3: Wait for pause duration
    await sleep(settings.pauseDuration);

    if (!isRunning) return;

    // Step 3.5: Short delay before keypress to allow page to update
    await sleep(500);

    if (!isRunning) return;

    // Step 4: Scroll to make the button visible (better than End key)
    updateStatus(`Scrolling to button...`, 'running');
    const buttonAfterLoad = findButton(settings.buttonText);
    if (buttonAfterLoad) {
      buttonAfterLoad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Fallback to keypress if button not found
      simulateKeyPress(settings.keyPress);
    }

    // Step 5: Wait a bit for content to load after keypress
    await sleep(settings.pauseDuration);

    if (!isRunning) return;

    // Step 6: Check for stop string again after new content loaded
    if (checkForStopString(settings.stopString)) {
      stopAutomation(`Stop string found: "${settings.stopString}"`);
      alert(`Automation stopped: Found "${settings.stopString}" on the page.`);
      return;
    }

    // Step 7: Schedule next cycle
    updateStatus(`Waiting... (Clicks: ${clickCount})`, 'running');
    automationTimeout = setTimeout(runAutomationCycle, 500);

  } catch (error) {
    stopAutomation(`Error: ${error.message}`);
    updateStatus(`Error: ${error.message}`, 'error');
  }
}

// Helper function for sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start automation
function startAutomation(config) {
  if (isRunning) {
    stopAutomation('Already running');
    return;
  }

  settings = config;
  isRunning = true;
  clickCount = 0;
  updateCounter();
  updateStatus('Automation started', 'running');

  runAutomationCycle();
}

// Stop automation
function stopAutomation(reason) {
  isRunning = false;
  if (automationTimeout) {
    clearTimeout(automationTimeout);
    automationTimeout = null;
  }
  notifyStop(reason);
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_AUTOMATION') {
    startAutomation(message.settings);
    sendResponse({ success: true });
  } else if (message.type === 'STOP_AUTOMATION') {
    stopAutomation('Stopped by user');
    sendResponse({ success: true });
  } else if (message.type === 'GET_STATE') {
    // Send current state to popup when it opens
    sendResponse({
      isRunning: isRunning,
      clickCount: clickCount,
      settings: settings
    });
  }
  return true;
});
