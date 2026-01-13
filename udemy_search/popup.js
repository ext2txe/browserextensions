const statusEl = document.getElementById("status");
const openPanelBtn = document.getElementById("openPanelBtn");

function setStatus(s) {
  statusEl.textContent = s || "";
}

openPanelBtn.addEventListener("click", async () => {
  await browser.runtime.sendMessage({ type: "OPEN_PANEL" });
  setStatus("Opening results panel…");
});
