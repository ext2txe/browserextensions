function normalizeSpace(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function parseTagText(tags) {
  // tags like: ["428 ratings", "3.5 total hours", "23 lectures", ...]
  let ratingsCount = "";
  let length = "";
  let lectures = "";

  for (const t of tags) {
    const text = normalizeSpace(t);

    // "45,430 ratings" OR "24 ratings"
    if (/\bratings\b/i.test(text)) ratingsCount = text;

    // "3.5 total hours" / "2 total hours" / sometimes "15.5 hours" etc.
    if (/\btotal hours\b/i.test(text) || /\bhours\b/i.test(text) || /\bminute\b/i.test(text)) {
      // Prefer the explicit "total hours" tag if present
      if (!length || /\btotal hours\b/i.test(text)) length = text;
    }

    // "23 lectures"
    if (/\blectures\b/i.test(text)) lectures = text;
  }

  return { ratingsCount, length, lectures };
}

function extractCoursesFromPage() {
  // Udemy search cards commonly use <section class="... vertical-card-module--card ...">
  // but class hashes change, so we use robust patterns:
  const cardSections = Array.from(
    document.querySelectorAll('section[class*="vertical-card-module--card"]')
  );

  const results = [];

  for (const card of cardSections) {
    const linkEl = card.querySelector('h2 a[href*="/course/"]');
    if (!linkEl) continue;

    const url = linkEl.href;
    const title =
      normalizeSpace(linkEl.textContent) ||
      normalizeSpace(card.querySelector('div[class*="card-title-module--clipped"]')?.textContent);

    // rating number stored in data-purpose="rating-number"
    const rating = normalizeSpace(card.querySelector('[data-purpose="rating-number"]')?.textContent);

    // tags list items like "428 ratings", "3.5 total hours", "23 lectures"
    const tagEls = Array.from(card.querySelectorAll('ul[class*="tag-list-module--list"] li'));
    const tags = tagEls.map(li => normalizeSpace(li.textContent)).filter(Boolean);

    const { ratingsCount, length, lectures } = parseTagText(tags);

    results.push({
      title,
      url,
      rating,
      ratingsCount,
      length,
      lectures
    });
  }

  // De-dupe by URL (Udemy sometimes repeats sections in DOM)
  const deduped = [];
  const seen = new Set();
  for (const r of results) {
    if (!r.url || seen.has(r.url)) continue;
    seen.add(r.url);
    deduped.push(r);
  }

  return deduped;
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "UDEMY_EXTRACT") {
    return Promise.resolve({ ok: true, courses: extractCoursesFromPage() });
  }
});
