// Popup script for Upwork Job Analyzer

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  statusDiv.style.display = 'block';
  statusDiv.textContent = '⏳ Analyzing...';

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

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
    await browser.tabs.sendMessage(tab.id, { action: 'analyze' });

    statusDiv.textContent = '✅ Analysis started!';

    // Close popup after a short delay
    setTimeout(() => {
      window.close();
    }, 1000);

  } catch (error) {
    console.error('Error:', error);
    statusDiv.textContent = '❌ Error: ' + error.message;
  }
});
