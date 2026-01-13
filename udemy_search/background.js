let currentJob = null;
let panelWindowId = null;
// currentJob = {
//   id: string,
//   state: "idle" | "extracting" | "fetching_updates" | "done" | "error",
//   total: number,
//   processed: number,
//   message: string,
//   results: array,
//   error: string
// }

// Open or focus the results panel
async function openPanel() {
  // Check if panel window still exists
  if (panelWindowId) {
    try {
      const win = await browser.windows.get(panelWindowId);
      // If window exists, focus it
      await browser.windows.update(panelWindowId, { focused: true });
      return panelWindowId;
    } catch (e) {
      // Window was closed, create a new one
      panelWindowId = null;
    }
  }

  // Create new panel window
  const win = await browser.windows.create({
    url: "panel.html",
    type: "popup",
    width: 1000,
    height: 600
  });
  panelWindowId = win.id;
  return panelWindowId;
}

// Notify panel of updates
async function notifyPanel() {
  if (!panelWindowId) return;

  try {
    const win = await browser.windows.get(panelWindowId);
    // Send message to all tabs in the panel window
    const tabs = await browser.tabs.query({ windowId: panelWindowId });
    for (const tab of tabs) {
      browser.tabs.sendMessage(tab.id, { type: "PANEL_UPDATE" }).catch(() => {});
    }
  } catch (e) {
    // Panel was closed
    panelWindowId = null;
  }
}

function newJob() {
  return {
    id: String(Date.now()),
    state: "idle",
    total: 0,
    processed: 0,
    message: "",
    results: [],
    error: ""
  };
}

async function fetchLastUpdated(courseUrl) {
  const res = await fetch(courseUrl, { credentials: "omit" });
  const html = await res.text();

  const patterns = [
    /Last updated\s*[:\-]?\s*([0-9]{1,2}\/[0-9]{4})/i,
    /Last updated\s*[:\-]?\s*([A-Za-z]+\s+\d{4})/i
  ];

  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) {
      const rawDate = m[1].trim();
      return formatDateToYYYYMMDD(rawDate);
    }
  }
  return "";
}

function formatDateToYYYYMMDD(dateStr) {
  // Parse various formats and convert to yyyy-mm-dd

  // Handle "MM/YYYY" format (e.g., "12/2025")
  const mmYYYYMatch = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYYYYMatch) {
    const month = mmYYYYMatch[1].padStart(2, '0');
    const year = mmYYYYMatch[2];
    return `${year}-${month}-01`;
  }

  // Handle "Month YYYY" format (e.g., "January 2025")
  const monthNames = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };

  const monthYearMatch = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    const month = monthNames[monthName];
    if (month) {
      return `${year}-${month}-01`;
    }
  }

  // Return original if no pattern matches
  return dateStr;
}

browser.runtime.onMessage.addListener(async (msg, sender) => {
  // Start a job
  if (msg?.type === "JOB_START") {
    // Prevent double-start
    if (currentJob && (currentJob.state === "extracting" || currentJob.state === "fetching_updates")) {
      return { ok: true, job: currentJob };
    }

    currentJob = newJob();
    currentJob.state = "extracting";
    currentJob.message = "Extracting from page…";

    try {
      const tabId = msg.tabId;
      const includeUpdated = !!msg.includeUpdated;

      // 1) Ask content script for base extraction
      const resp = await browser.tabs.sendMessage(tabId, { type: "UDEMY_EXTRACT" });
      if (!resp?.ok) throw new Error("Content script extraction failed.");

      let courses = resp.courses || [];
      currentJob.results = courses.map(c => ({ ...c, lastUpdated: "" }));
      currentJob.total = currentJob.results.length;
      currentJob.processed = currentJob.total; // extraction is one step
      currentJob.state = includeUpdated ? "fetching_updates" : "done";
      currentJob.message = includeUpdated
        ? `Found ${currentJob.total} courses. Fetching “Last updated”…`
        : `Done. Found ${currentJob.total} courses.`;

      // Persist snapshot (optional but helpful)
      await browser.storage.local.set({ lastResults: currentJob.results });

      // 2) If requested, fetch updates sequentially and report progress
      if (includeUpdated && currentJob.total) {
        currentJob.processed = 0;

        for (let i = 0; i < currentJob.results.length; i++) {
          const url = currentJob.results[i].url;

          try {
            const updated = await fetchLastUpdated(url);
            currentJob.results[i].lastUpdated = updated || "";
          } catch (e) {
            currentJob.results[i].lastUpdated = "";
          }

          currentJob.processed = i + 1;
          currentJob.message = `Fetching “Last updated”… ${currentJob.processed}/${currentJob.total}`;

          // Update stored results occasionally (optional)
          if ((i + 1) % 5 === 0 || i === currentJob.results.length - 1) {
            await browser.storage.local.set({ lastResults: currentJob.results });
          }

          // light throttle
          await new Promise(r => setTimeout(r, 250));
        }

        currentJob.state = "done";
        currentJob.message = `Done. Found ${currentJob.total} courses (with last-updated where available).`;
      }

      return { ok: true, job: currentJob };
    } catch (e) {
      currentJob.state = "error";
      currentJob.error = String(e?.message || e);
      currentJob.message = "Error.";
      return { ok: false, job: currentJob };
    }
  }

  // Poll job status
  if (msg?.type === "JOB_STATUS") {
    return { ok: true, job: currentJob };
  }

  // Load last buffered results even if no job running
  if (msg?.type === "LOAD_LAST_RESULTS") {
    const { lastResults } = await browser.storage.local.get("lastResults");
    return { ok: true, lastResults: lastResults || [] };
  }

  // Open panel request
  if (msg?.type === "OPEN_PANEL") {
    await openPanel();
    return { ok: true };
  }
});
