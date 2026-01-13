const statusEl = document.getElementById("status");
const extractBtn = document.getElementById("extractBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const includeUpdatedEl = document.getElementById("includeUpdated");
const tbody = document.querySelector("#tbl tbody");

const progressRow = document.getElementById("progressRow");
const progressText = document.getElementById("progressText");

let lastData = [];
let sortAscending = false;
let pollTimer = null;

function setStatus(s) {
  statusEl.textContent = s || "";
}

function setProcessing(isOn, text = "") {
  extractBtn.disabled = isOn;
  includeUpdatedEl.disabled = isOn;
  progressRow.style.display = isOn ? "flex" : "none";
  progressText.textContent = text || "";
}

async function getUdemyTab() {
  // Find the most recent Udemy search tab
  const tabs = await browser.tabs.query({ url: "https://www.udemy.com/courses/search/*" });

  if (tabs.length === 0) {
    return null;
  }

  // Return the most recently accessed tab
  tabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  return tabs[0];
}

function render(rows) {
  tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.lastUpdated || ""}</td>
      <td>${r.title || ""}</td>
      <td>${r.rating || ""}</td>
      <td>${r.ratingsCount || ""}</td>
      <td>${r.length || ""}</td>
      <td>${r.lectures || ""}</td>
      <td><a href="${r.url}" target="_blank" rel="noopener">open</a></td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  const headers = ["lastUpdated","title","url","rating","ratingsCount","length","lectures"];
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => escapeCsv(r[h])).join(","));
  return lines.join("\n");
}

async function pollJob() {
  const resp = await browser.runtime.sendMessage({ type: "JOB_STATUS" }).catch(() => null);
  const job = resp?.job;

  if (!job) {
    setProcessing(false);
    return;
  }

  if (job.state === "extracting" || job.state === "fetching_updates") {
    setProcessing(true, job.message || "Processing…");
    setStatus(job.message || "Processing…");
    if (job.results?.length) {
      lastData = job.results;
      render(lastData);
      copyBtn.disabled = lastData.length === 0;
    }
    return; // keep polling
  }

  // done or error
  setProcessing(false);
  if (job.state === "done") {
    setStatus(job.message || "Done.");
    lastData = job.results || [];
    render(lastData);
    copyBtn.disabled = lastData.length === 0;
    // Adjust width to fit content
    await adjustWindowWidth();
  } else if (job.state === "error") {
    setStatus(job.error || "Error.");
  }

  // stop polling
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

async function loadBufferedResults() {
  const resp = await browser.runtime.sendMessage({ type: "LOAD_LAST_RESULTS" }).catch(() => null);
  const buffered = resp?.lastResults || [];
  if (buffered.length) {
    lastData = buffered;
    render(lastData);
    copyBtn.disabled = false;
    setStatus(`Loaded ${buffered.length} results.`);
  }
}

copyBtn.addEventListener("click", async () => {
  if (!lastData.length) return;
  await navigator.clipboard.writeText(toCsv(lastData));
  setStatus(`Copied CSV for ${lastData.length} courses to clipboard.`);
});

clearBtn.addEventListener("click", async () => {
  lastData = [];
  render(lastData);
  copyBtn.disabled = true;
  await browser.storage.local.remove("lastResults");
  setStatus("Results cleared.");
});

extractBtn.addEventListener("click", async () => {
  // Hard guard against double clicks
  if (extractBtn.disabled) return;

  setProcessing(true, "Finding Udemy tab…");
  setStatus("Finding Udemy tab…");

  const tab = await getUdemyTab();
  if (!tab?.id) {
    setProcessing(false);
    setStatus("No Udemy search tab found. Please open a Udemy search page first.");
    return;
  }

  setStatus("Starting extraction…");

  const includeUpdated = includeUpdatedEl.checked;

  // Start job in background
  await browser.runtime.sendMessage({
    type: "JOB_START",
    tabId: tab.id,
    includeUpdated
  }).catch(() => null);

  // Poll for progress
  if (!pollTimer) pollTimer = setInterval(pollJob, 250);
  await pollJob();
});

function setupSortHandler() {
  const header = document.querySelector('#tbl th:first-child');
  if (!header) return;

  header.addEventListener("click", () => {
    if (!lastData.length) return;

    sortAscending = !sortAscending;

    lastData.sort((a, b) => {
      const dateA = a.lastUpdated || "";
      const dateB = b.lastUpdated || "";

      // Empty dates go to the end
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      // Compare dates as strings (yyyy-mm-dd format sorts correctly)
      const comparison = dateA.localeCompare(dateB);
      return sortAscending ? comparison : -comparison;
    });

    render(lastData);

    // Update header to show sort direction
    header.textContent = `Last updated ${sortAscending ? '↑' : '↓'}`;

    setStatus(`Sorted by date ${sortAscending ? '(oldest first)' : '(newest first)'}.`);
  });
}

// Listen for messages from background/popup
browser.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "PANEL_UPDATE") {
    // Refresh panel when extraction happens
    loadBufferedResults();
    return Promise.resolve({ ok: true });
  }
});

// Adjust window width based on table content
async function adjustWindowWidth() {
  const table = document.getElementById("tbl");
  if (!table) return;

  // Wait a bit for table to render
  await new Promise(r => setTimeout(r, 100));

  const tableWidth = table.scrollWidth;
  const padding = 60; // Account for padding and scrollbar
  const minWidth = 600;
  const maxWidth = 1600;

  const idealWidth = Math.min(Math.max(tableWidth + padding, minWidth), maxWidth);

  const currentWindow = await browser.windows.getCurrent();
  await browser.windows.update(currentWindow.id, { width: idealWidth });

  // Save width preference
  await browser.storage.local.set({ panelWidth: idealWidth });
}

// Listen for window resize to save new width
window.addEventListener("resize", async () => {
  const currentWindow = await browser.windows.getCurrent();
  await browser.storage.local.set({ panelWidth: currentWindow.width });
});

// On panel open: load buffered results and start polling
(async function init() {
  setupSortHandler();

  // Restore saved panel width
  const { panelWidth } = await browser.storage.local.get("panelWidth");
  if (panelWidth) {
    const currentWindow = await browser.windows.getCurrent();
    await browser.windows.update(currentWindow.id, { width: panelWidth });
  }

  await loadBufferedResults();
  if (!pollTimer) pollTimer = setInterval(pollJob, 250);
  await pollJob();

  // Adjust width after loading data
  if (lastData.length > 0) {
    await adjustWindowWidth();
  }
})();
