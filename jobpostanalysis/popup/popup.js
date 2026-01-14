// Popup script for Upwork Job Analyzer

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
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
    console.error('Error:', error);
    if (error.message && error.message.includes('Could not establish connection')) {
      statusDiv.textContent = '⚠️ Please reload the page and try again';
    } else {
      statusDiv.textContent = '❌ Error: ' + error.message;
    }
  }
});
