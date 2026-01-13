// Upwork Job Post Analyzer - Content Script
// Extracts job post data and displays analysis

class UpworkJobAnalyzer {
  constructor() {
    this.data = null;
    this.panel = null;
    this.compactPanel = null;
    this.autoDisplayMode = false;
  }

  // Main analysis function
  async analyze(forceDetailedView = false) {
    console.log('[Upwork Analyzer] Starting analysis...');

    // Check if we're on a job post page
    if (!this.isJobPostPage()) {
      this.showNotification('Please navigate to an Upwork job post page', 'error');
      return;
    }

    // Auto-expand "View more" links
    await this.expandAllSections();

    // Extract data
    this.data = this.extractJobData();

    if (!this.data.jobDetails.title) {
      this.showNotification('Could not extract job data. Please ensure you are on a job post page.', 'error');
      return;
    }

    // Display results - compact or detailed
    if (forceDetailedView) {
      this.displayResults();
    } else {
      this.displayCompactPanel();
    }

    console.log('[Upwork Analyzer] Analysis complete:', this.data);
  }

  // Quick analysis without expansion for auto-display
  async quickAnalyze() {
    console.log('[Upwork Analyzer] Quick analysis (no expansion)...');

    // Check if we're on a job post page
    if (!this.isJobPostPage()) {
      return;
    }

    // Extract data without expanding
    this.data = this.extractJobData();

    if (!this.data.jobDetails.title) {
      return;
    }

    // Display compact panel
    this.displayCompactPanel();

    console.log('[Upwork Analyzer] Quick analysis complete');
  }

  // Check if current page is a job post
  isJobPostPage() {
    // Allow testing on local HTML files
    if (window.location.protocol === 'file:') {
      return true;
    }
    // Check for Upwork domain (relaxed check - just needs upwork.com)
    return window.location.href.includes('upwork.com');
  }

  // Auto-expand all "View more" links
  async expandAllSections() {
    console.log('[Upwork Analyzer] Expanding sections...');

    // Multiple passes to catch dynamically loaded content
    for (let pass = 0; pass < 3; pass++) {
      console.log(`[Upwork Analyzer] Expansion pass ${pass + 1}...`);

      // Find all expandable elements
      const expandButtons = [
        ...document.querySelectorAll('[data-cy="jobs-in-progress-button"]'),
        ...document.querySelectorAll('button.collapse-toggle'),
        ...document.querySelectorAll('button.jobs-in-progress-title'),
        ...document.querySelectorAll('a.js-show-more'),
        ...document.querySelectorAll('button[aria-expanded="false"]')
      ];

      let clickedCount = 0;
      for (const button of expandButtons) {
        try {
          // Check if button is visible and clickable
          if (button.offsetParent !== null) {
            const buttonText = button.textContent.toLowerCase().trim();

            // Skip navigation links (Apply now, View job posting, etc.)
            if (buttonText.includes('apply') ||
                buttonText.includes('view job posting') ||
                buttonText.includes('submit proposal') ||
                button.tagName === 'A' && button.getAttribute('href')?.includes('/apply')) {
              continue;
            }

            const ariaExpanded = button.getAttribute('aria-expanded');
            if (ariaExpanded === 'false' ||
                button.classList.contains('js-show-more') ||
                buttonText.includes('view more') ||
                buttonText.includes('show more')) {
              console.log('[Upwork Analyzer] Clicking:', button.textContent.substring(0, 50));
              button.click();
              clickedCount++;
              await this.sleep(300); // Wait for content to load
            }
          }
        } catch (e) {
          console.warn('[Upwork Analyzer] Could not expand:', e);
        }
      }

      console.log(`[Upwork Analyzer] Pass ${pass + 1}: clicked ${clickedCount} buttons`);

      if (clickedCount === 0) break; // No more buttons to click
      await this.sleep(800); // Wait between passes
    }

    console.log('[Upwork Analyzer] Expansion complete, final wait...');
    await this.sleep(500); // Final wait for DOM to settle
  }

  // Extract all job data
  extractJobData() {
    const data = {
      classification: '', // To be filled by classification system
      confidence: null,
      jobDetails: this.extractJobDetails(),
      clientInfo: this.extractClientInfo(),
      activityInfo: this.extractActivityInfo(),
      jobHistory: this.extractJobHistory(),
      analysisMetadata: {
        analyzedAt: new Date().toISOString(),
        url: window.location.href,
        version: '1.0.0'
      }
    };

    return data;
  }

  // Extract basic job details
  extractJobDetails() {
    const fixedPrice = this.getText('[data-cy="fixed-price"] strong');
    const hourlyRange = this.getText('[data-cy="hourly-range"] strong');

    // Extract connects required and available - search broadly
    let connectsText = this.getText('[data-test="connects-to-apply"]') ||
                       this.getText('[data-test="job-apply-cta"]') ||
                       this.getText('[data-qa="connects"]') || '';

    if (!connectsText) {
      const bodyText = document.body.textContent;
      const connectMatch = bodyText.match(/(\d+)\s+Connects?/i);
      connectsText = connectMatch ? connectMatch[0] : '';
    }

    const connectsMatch = connectsText.match(/(\d+)\s+(?:Connects?|connects?)/i);
    const connectsRequired = connectsMatch ? connectsMatch[1] : '';

    // Extract available connects (if shown on page) - try multiple approaches
    let availableConnectsText = this.getText('[data-test="available-connects"]') ||
                                this.getText('[data-qa="available-connects"]') || '';

    // Search for "You have X available Connects" pattern
    if (!availableConnectsText) {
      const bodyText = document.body.textContent;
      const patterns = [
        /You have (\d+) available Connects?/i,
        /(\d+) available Connects?/i,
        /(\d+) Connects? available/i,
        /Connects? available[:\s]+(\d+)/i
      ];

      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match) {
          availableConnectsText = match[0];
          break;
        }
      }
    }

    const availableMatch = availableConnectsText.match(/(\d+)/);
    const availableConnects = availableMatch ? availableMatch[1] : '';

    // Extract bid range if visible - search broadly
    let bidRangeText = this.getText('[data-test="bid-range"]') ||
                       this.getText('.bid-range') ||
                       this.getText('[data-qa="bid-range"]') || '';

    // Try to find the bid range in h5 or strong tags
    if (!bidRangeText) {
      const h5Elements = document.querySelectorAll('h5');
      for (const h5 of h5Elements) {
        const text = h5.textContent;
        if (text.includes('Bid range')) {
          bidRangeText = text.replace(/^Bid range\s*-?\s*/i, '').trim();
          break;
        }
      }
    }

    // Search page body text for bid range patterns
    if (!bidRangeText) {
      const bodyText = document.body.textContent;
      const bidMatch = bodyText.match(/Bid range[:\s-]+(.+?)(?:High|Avg|Low)\s*\$[\d,.]+ \| (?:High|Avg|Low)\s*\$[\d,.]+ \| (?:High|Avg|Low)\s*\$[\d,.]+/i) ||
                       bodyText.match(/Bid[:\s]+\$[\d,]+-\$[\d,]+/i);
      if (bidMatch) {
        bidRangeText = bidMatch[0].replace(/^Bid range\s*-?\s*/i, '').trim();
      }
    }

    return {
      title: this.getText('h4.d-flex span.flex-1') || this.getText('h4 span.flex-1'),
      postedDate: this.getText('.posted-on-line .text-light-on-muted') || '',
      budget: fixedPrice || hourlyRange || '',
      budgetType: this.getText('[data-cy="fixed-price"] .description') ||
                  this.getText('[data-cy="hourly-range"] .description') || '',
      hourlyRange: hourlyRange || '', // Keep hourly range separate if present
      projectType: this.getText('ul.segmentations li span') || '',
      connectsRequired: connectsRequired,
      availableConnects: availableConnects,
      bidRange: bidRangeText
    };
  }

  // Extract client information
  extractClientInfo() {
    const ratingText = this.getText('[data-testid="buyer-rating"] .air3-rating-value-text') ||
                       this.getText('.air3-rating-value-text') || '';

    const reviewText = this.getText('[data-testid="buyer-rating"]') || '';
    const reviewMatch = reviewText.match(/(\d+)\s+reviews?/i);
    const reviewCount = reviewMatch ? reviewMatch[1] : '';

    const location = this.getText('[data-qa="client-location"] strong') || '';
    const jobsPosted = this.getText('[data-qa="client-job-posting-stats"] strong') || '';
    const hireRateText = this.getText('[data-qa="client-job-posting-stats"] div') || '';
    const hireRateMatch = hireRateText.match(/(\d+)%\s+hire\s+rate/i);
    const hireRate = hireRateMatch ? hireRateMatch[1] + '%' : '';

    // Extract number of hires - look for "Hires:" or "Hired:" in Activity section
    console.log('[Upwork Analyzer] hireRateText for extraction:', hireRateText);

    let totalHires = '';

    // Find the "Activity on this job" section by searching for h5 with that text
    let activitySection = null;
    const h5Elements = document.querySelectorAll('h5');

    for (const h5 of h5Elements) {
      if (h5.textContent.includes('Activity on this job')) {
        // Get the parent container that has the activity data
        activitySection = h5.parentElement || h5.closest('section') || h5.closest('div[class*="activity"]');
        console.log('[Upwork Analyzer] Found activity section via h5');
        break;
      }
    }

    // Fallback: try data attributes
    if (!activitySection) {
      activitySection = document.querySelector('[data-test="activity-section"]') ||
                       document.querySelector('[data-qa="job-activity"]');
      if (activitySection) {
        console.log('[Upwork Analyzer] Found activity section via data attribute');
      }
    }

    if (activitySection) {
      const activityText = activitySection.textContent;
      console.log('[Upwork Analyzer] Activity section text:', activityText.substring(0, 200));

      // Look for "X Hires:" or "Hires: X" patterns in activity section
      const hiresPatterns = [
        /(\d+)\s+hires?:/i,  // "X hires:" or "X hire:"
        /Hires?:\s*(\d+)/i,   // "Hires: X" or "Hired: X"
        /Hired:\s*(\d+)/i     // "Hired: X"
      ];

      for (const pattern of hiresPatterns) {
        const match = activityText.match(pattern);
        if (match) {
          totalHires = match[1];
          console.log('[Upwork Analyzer] Matched pattern:', pattern, 'value:', totalHires);
          break;
        }
      }
    } else {
      console.log('[Upwork Analyzer] Activity section not found');
    }

    console.log('[Upwork Analyzer] Extracted totalHires:', totalHires);

    // Try multiple selectors for total spent
    let totalSpent = this.getText('[data-qa="client-spend"]');
    if (!totalSpent) {
      totalSpent = this.getText('strong[data-qa="client-spend"]');
    }
    // Extract just the amount if found
    if (totalSpent) {
      const spentMatch = totalSpent.match(/\$[\d,KkMm.]+/);
      totalSpent = spentMatch ? spentMatch[0] : totalSpent;
    }

    // Try multiple selectors for avg hourly rate
    let avgHourlyRate = this.getText('[data-qa="client-hourly-rate"]');
    if (!avgHourlyRate) {
      avgHourlyRate = this.getText('strong[data-qa="client-hourly-rate"]');
    }
    // Extract just the rate if found
    if (avgHourlyRate) {
      const rateMatch = avgHourlyRate.match(/\$[\d.]+\s*\/?\s*hr/i);
      avgHourlyRate = rateMatch ? rateMatch[0] : avgHourlyRate;
    }

    const memberSince = this.getText('[data-qa="client-contract-date"] small') || '';

    const paymentVerified = document.querySelector('.payment-verified') !== null;

    // Extract country from location
    const countryMatch = location.match(/,\s*([^,]+)$/);
    const country = countryMatch ? countryMatch[1].trim() : location;

    return {
      rating: ratingText,
      reviewCount: reviewCount,
      location: location,
      country: country,
      totalJobs: jobsPosted,
      hireRate: hireRate,
      totalHires: totalHires,
      totalSpent: totalSpent,
      avgHourlyRate: avgHourlyRate,
      memberSince: memberSince,
      paymentVerified: paymentVerified
    };
  }

  // Extract activity information
  extractActivityInfo() {
    // Extract number of proposals - try multiple selectors
    let proposalsText = this.getText('[data-test="proposals-tier"]') ||
                        this.getText('[data-qa="proposals"]') ||
                        this.getText('.proposals-count') || '';

    // Also search entire page text for proposals pattern
    if (!proposalsText) {
      const bodyText = document.body.textContent;
      const proposalSection = bodyText.match(/Proposals?:\s*([^\n]+)/i);
      proposalsText = proposalSection ? proposalSection[1] : '';
    }

    const proposalsMatch = proposalsText.match(/(\d+)\s+to\s+(\d+)/i) ||
                          proposalsText.match(/(\d+)\+/i) ||
                          proposalsText.match(/(?:Less than|less than|fewer than)\s+(\d+)/i);
    let proposalsCount = '';
    if (proposalsMatch) {
      if (proposalsMatch[2]) {
        proposalsCount = `${proposalsMatch[1]}-${proposalsMatch[2]}`;
      } else {
        proposalsCount = proposalsMatch[1] + (proposalsText.includes('+') ? '+' : '');
      }
    }

    // Extract last viewed by client - broader search
    let lastViewedText = this.getText('[data-test="client-activity"]') ||
                         this.getText('[data-qa="client-activity"]') || '';

    if (!lastViewedText) {
      const bodyText = document.body.textContent;
      const viewedMatch = bodyText.match(/Last viewed by client[:\s]+([^\n]+)/i);
      lastViewedText = viewedMatch ? viewedMatch[1] : '';
    }

    const lastViewedMatch = lastViewedText.match(/(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/i);
    const lastViewed = lastViewedMatch ? lastViewedMatch[1] : '';

    // Check if interviewing - broader search with multiple patterns
    let interviewingText = this.getText('[data-test="interviewing"]') ||
                           this.getText('[data-qa="interviewing"]') || '';

    if (!interviewingText) {
      const bodyText = document.body.textContent;
      // Try multiple patterns
      const patterns = [
        /Interviewing[:\s]+(\d+)/i,
        /(\d+)\s+interviewing/i,
        /(\d+)\s+in\s+interviewing/i
      ];

      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match) {
          interviewingText = match[0];
          break;
        }
      }
    }

    // Extract the number from interviewing text
    const interviewingMatch = interviewingText.match(/(\d+)/);
    const interviewing = interviewingMatch ? interviewingMatch[1] : '';

    // Jobs in progress count
    const jobsInProgressText = this.getText('[data-cy="jobs-in-progress-button"]') ||
                               this.getText('.jobs-in-progress') || '';
    const jobsInProgressMatch = jobsInProgressText.match(/(\d+)\s+jobs?\s+in\s+progress/i);
    const jobsInProgress = jobsInProgressMatch ? jobsInProgressMatch[1] : '';

    // Other open jobs count
    let otherOpenJobsText = this.getText('[data-qa="other-open-jobs"]') || '';
    if (!otherOpenJobsText) {
      const bodyText = document.body.textContent;
      const openJobsMatch = bodyText.match(/(\d+)\s+other\s+open\s+jobs?/i);
      otherOpenJobsText = openJobsMatch ? openJobsMatch[0] : '';
    }
    const otherOpenJobsMatch = otherOpenJobsText.match(/(\d+)/);
    const otherOpenJobs = otherOpenJobsMatch ? otherOpenJobsMatch[1] : '';

    return {
      proposalsCount: proposalsCount,
      lastViewed: lastViewed,
      interviewing: interviewing,
      jobsInProgress: jobsInProgress,
      otherOpenJobs: otherOpenJobs
    };
  }

  // Extract job history
  extractJobHistory() {
    const history = [];
    const jobItems = document.querySelectorAll('[data-cy="job"]');

    jobItems.forEach(job => {
      const titleLink = job.querySelector('[data-cy="job-title"]');
      const title = titleLink ? titleLink.textContent.trim() : '';
      const jobUrl = titleLink ? titleLink.getAttribute('href') : '';

      const dateRange = this.getText('[data-cy="date"] .text-body-sm', job);
      const statsText = this.getText('[data-cy="stats"]', job);

      // Parse job type and amount/rate
      let jobType = '';
      let amount = '';
      let hourlyRate = '';

      if (statsText) {
        // Check if it's hourly
        if (statsText.toLowerCase().includes('hourly')) {
          jobType = 'Hourly';
          // Extract hourly rate: e.g., "Hourly $25.00/hr"
          const rateMatch = statsText.match(/\$[\d.]+\s*\/?\s*hr/i);
          if (rateMatch) {
            hourlyRate = rateMatch[0];
            amount = rateMatch[0];
          }
        } else {
          // Fixed-price
          const parts = statsText.split(/\s+/);
          jobType = parts[0] || '';
          amount = parts[parts.length - 1] || '';
        }
      }

      const freelancerLink = job.querySelector('a[href*="/freelancers/"]');
      const freelancer = freelancerLink ? freelancerLink.textContent.trim() : '';
      const freelancerUrl = freelancerLink ? freelancerLink.getAttribute('href') : '';

      const rating = this.getText('.air3-rating-value-text', job) || '';

      if (title) {
        history.push({
          title: title,
          jobUrl: jobUrl,
          dateRange: dateRange,
          type: jobType,
          amount: amount,
          hourlyRate: hourlyRate,
          freelancer: freelancer,
          freelancerUrl: freelancerUrl,
          rating: rating
        });
      }
    });

    return history;
  }

  // Helper: Get text content from selector
  getText(selector, parent = document) {
    const element = parent.querySelector(selector);
    return element ? element.textContent.trim() : '';
  }

  // Helper: Sleep/delay function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Display compact status panel
  displayCompactPanel() {
    // Remove existing compact panel if present
    if (this.compactPanel) {
      this.compactPanel.remove();
    }

    // Create compact panel
    this.compactPanel = this.createCompactPanel();
    document.body.appendChild(this.compactPanel);
  }

  // Display results in HTML table
  displayResults() {
    // Remove existing panel if present
    if (this.panel) {
      this.panel.remove();
    }

    // Create panel
    this.panel = this.createPanel();
    document.body.appendChild(this.panel);
  }

  // Create HTML panel with table
  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'upwork-analyzer-panel';
    panel.className = 'upwork-analyzer-panel';

    panel.innerHTML = `
      <div class="analyzer-header">
        <h3>Job Post Analysis <span style="font-size: 12px; opacity: 0.8;">v0.1.13</span></h3>
        <div class="header-buttons">
          <button class="minimize-btn" title="Minimize">─</button>
          <button class="close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="analyzer-content">
        ${this.generateTable()}
      </div>
      <div class="analyzer-footer">
        <button class="btn-copy-json" title="Copy JSON to clipboard">📋 Copy JSON</button>
        <button class="btn-export-json" title="Download JSON file">💾 Export JSON</button>
        <button class="btn-toggle-details" title="Show/Hide detailed job history">📊 Toggle Details</button>
        <label class="auto-export-checkbox" title="Automatically export JSON file after each analysis">
          <input type="checkbox" id="auto-export-checkbox" />
          <span>Auto-export JSON</span>
        </label>
      </div>
    `;

    // Add event listeners
    panel.querySelector('.close-btn').addEventListener('click', () => this.closePanel());
    panel.querySelector('.minimize-btn').addEventListener('click', () => this.toggleMinimize());
    panel.querySelector('.btn-copy-json').addEventListener('click', () => this.copyToClipboard());
    panel.querySelector('.btn-export-json').addEventListener('click', () => this.exportJSON());
    panel.querySelector('.btn-toggle-details').addEventListener('click', () => this.toggleDetails());

    // Auto-export checkbox
    const autoExportCheckbox = panel.querySelector('#auto-export-checkbox');
    this.loadAutoExportSetting(autoExportCheckbox);
    autoExportCheckbox.addEventListener('change', (e) => this.handleAutoExportChange(e.target.checked));

    // Make panel draggable
    this.makeDraggable(panel);

    return panel;
  }

  // Create compact status panel
  createCompactPanel() {
    const panel = document.createElement('div');
    panel.id = 'upwork-analyzer-compact-panel';
    panel.className = 'upwork-analyzer-compact-panel';

    const d = this.data;
    const jd = d.jobDetails;
    const ci = d.clientInfo;
    const ai = d.activityInfo;
    const historyCount = d.jobHistory.length;

    panel.innerHTML = `
      <div class="compact-header">
        <span class="compact-title">Job Info <span style="font-size: 11px; opacity: 0.8;">v0.1.13</span></span>
        <div class="compact-buttons">
          <button class="btn-full-analysis" title="Run full analysis with expansion">🔍</button>
          <button class="btn-toggle-mode" title="Switch to detailed view">📊</button>
          <button class="btn-auto-mode" title="Toggle auto-display mode">🔄</button>
          <button class="compact-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="compact-content">
        <div class="compact-grid">
          <div class="compact-item">
            <span class="compact-label">Country:</span>
            <span class="compact-value">${this.escapeHtml(ci.country)}</span>
          </div>
          <div class="compact-item">
            <span class="compact-label">Budget:</span>
            <span class="compact-value">${this.escapeHtml(jd.budget)}</span>
          </div>
          ${jd.connectsRequired ? `<div class="compact-item">
            <span class="compact-label">Connects:</span>
            <span class="compact-value">${jd.availableConnects ? `${this.escapeHtml(jd.connectsRequired)}/${this.escapeHtml(jd.availableConnects)}` : this.escapeHtml(jd.connectsRequired)}</span>
          </div>` : ''}
          ${jd.bidRange ? `<div class="compact-item">
            <span class="compact-label">Bid Range:</span>
            <span class="compact-value">${this.escapeHtml(jd.bidRange)}</span>
          </div>` : ''}
          <div class="compact-item">
            <span class="compact-label">Jobs Posted:</span>
            <span class="compact-value">${this.escapeHtml(ci.totalJobs)}</span>
          </div>
          <div class="compact-item">
            <span class="compact-label">Total Spent:</span>
            <span class="compact-value">${this.escapeHtml(ci.totalSpent)}</span>
          </div>
          ${ci.totalHires ? `<div class="compact-item">
            <span class="compact-label">Hires:</span>
            <span class="compact-value">${this.escapeHtml(ci.totalHires)}</span>
          </div>` : ''}
          <div class="compact-item">
            <span class="compact-label">Avg Rate:</span>
            <span class="compact-value">${this.escapeHtml(ci.avgHourlyRate)}</span>
          </div>
          ${ai.proposalsCount ? `<div class="compact-item">
            <span class="compact-label">Proposals:</span>
            <span class="compact-value">${this.escapeHtml(ai.proposalsCount)}</span>
          </div>` : ''}
          ${ai.lastViewed ? `<div class="compact-item">
            <span class="compact-label">Last Viewed:</span>
            <span class="compact-value">${this.escapeHtml(ai.lastViewed)}</span>
          </div>` : ''}
          ${ai.interviewing ? `<div class="compact-item">
            <span class="compact-label">Interviewing:</span>
            <span class="compact-value">${this.escapeHtml(ai.interviewing)}</span>
          </div>` : ''}
          ${ai.jobsInProgress ? `<div class="compact-item">
            <span class="compact-label">Jobs In Progress:</span>
            <span class="compact-value">${this.escapeHtml(ai.jobsInProgress)}</span>
          </div>` : ''}
          ${ai.otherOpenJobs ? `<div class="compact-item">
            <span class="compact-label">Other Open Jobs:</span>
            <span class="compact-value">${this.escapeHtml(ai.otherOpenJobs)}</span>
          </div>` : ''}
          <div class="compact-item">
            <span class="compact-label">History (visible):</span>
            <span class="compact-value">${historyCount}</span>
          </div>
        </div>
      </div>
    `;

    // Check if hires > 0 to apply pink background
    console.log('[Upwork Analyzer] totalHires value:', ci.totalHires);
    const hiresCount = ci.totalHires ? parseInt(ci.totalHires.replace(/,/g, ''), 10) : 0;
    console.log('[Upwork Analyzer] hiresCount parsed:', hiresCount);
    if (hiresCount > 0) {
      console.log('[Upwork Analyzer] Adding has-hires class');
      panel.classList.add('has-hires');
    } else {
      console.log('[Upwork Analyzer] Not adding has-hires class (count is 0 or invalid)');
    }

    // Add event listeners
    panel.querySelector('.compact-close-btn').addEventListener('click', () => this.closeCompactPanel());
    panel.querySelector('.btn-full-analysis').addEventListener('click', () => this.runFullAnalysis());
    panel.querySelector('.btn-toggle-mode').addEventListener('click', () => this.switchToDetailedView());
    panel.querySelector('.btn-auto-mode').addEventListener('click', () => this.toggleAutoDisplayMode());

    // Make panel draggable
    this.makeDraggable(panel);

    return panel;
  }

  // Generate HTML table
  generateTable() {
    const d = this.data;

    return `
      <table class="analysis-table">
        <tr>
          <th colspan="2" class="section-header">Job Details</th>
        </tr>
        <tr>
          <td class="label">Classification</td>
          <td class="value classification-value">
            <input type="text" placeholder="To be determined..." class="classification-input" />
          </td>
        </tr>
        <tr>
          <td class="label">Job Title</td>
          <td class="value">${this.escapeHtml(d.jobDetails.title)}</td>
        </tr>
        <tr>
          <td class="label">Posted</td>
          <td class="value">${this.escapeHtml(d.jobDetails.postedDate)}</td>
        </tr>
        <tr>
          <td class="label">Budget</td>
          <td class="value">${this.escapeHtml(d.jobDetails.budget)} (${this.escapeHtml(d.jobDetails.budgetType)})</td>
        </tr>
        ${d.jobDetails.hourlyRange ? `<tr>
          <td class="label">Hourly Range</td>
          <td class="value">${this.escapeHtml(d.jobDetails.hourlyRange)}</td>
        </tr>` : ''}

        <tr>
          <th colspan="2" class="section-header">Client Information</th>
        </tr>
        <tr>
          <td class="label">Rating</td>
          <td class="value">⭐ ${this.escapeHtml(d.clientInfo.rating)} (${this.escapeHtml(d.clientInfo.reviewCount)} reviews)</td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="value">${this.escapeHtml(d.clientInfo.location)}</td>
        </tr>
        <tr>
          <td class="label">Total Jobs</td>
          <td class="value">${this.escapeHtml(d.clientInfo.totalJobs)}</td>
        </tr>
        <tr>
          <td class="label">Hire Rate</td>
          <td class="value">${this.escapeHtml(d.clientInfo.hireRate)}</td>
        </tr>
        <tr>
          <td class="label">Total Spent</td>
          <td class="value">${this.escapeHtml(d.clientInfo.totalSpent)}</td>
        </tr>
        <tr>
          <td class="label">Avg Hourly Rate</td>
          <td class="value">${this.escapeHtml(d.clientInfo.avgHourlyRate)}</td>
        </tr>
        <tr>
          <td class="label">Member Since</td>
          <td class="value">${this.escapeHtml(d.clientInfo.memberSince)}</td>
        </tr>
        <tr>
          <td class="label">Payment Verified</td>
          <td class="value">${d.clientInfo.paymentVerified ? '✅ Yes' : '❌ No'}</td>
        </tr>

        <tr>
          <th colspan="2" class="section-header">
            Job History Summary
            <span class="job-count">(${d.jobHistory.length} jobs)</span>
          </th>
        </tr>
      </table>

      <div class="job-history-details" style="display: none;">
        <table class="history-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Date Range</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Hourly Rate</th>
              <th>Freelancer</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${d.jobHistory.map(job => `
              <tr>
                <td>${job.jobUrl ?
                  `<a href="${this.escapeHtml(job.jobUrl)}" target="_blank" class="job-link">${this.escapeHtml(job.title)}</a>` :
                  this.escapeHtml(job.title)
                }</td>
                <td>${this.escapeHtml(job.dateRange)}</td>
                <td>${this.escapeHtml(job.type)}</td>
                <td>${this.escapeHtml(job.amount)}</td>
                <td>${this.escapeHtml(job.hourlyRate || '-')}</td>
                <td>${job.freelancerUrl ?
                  `<a href="${this.escapeHtml(job.freelancerUrl)}" target="_blank" class="freelancer-link">${this.escapeHtml(job.freelancer)}</a>` :
                  this.escapeHtml(job.freelancer)
                }</td>
                <td>${this.escapeHtml(job.rating)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Toggle minimize panel
  toggleMinimize() {
    const content = this.panel.querySelector('.analyzer-content');
    const footer = this.panel.querySelector('.analyzer-footer');
    const minimizeBtn = this.panel.querySelector('.minimize-btn');

    if (this.panel.classList.contains('minimized')) {
      this.panel.classList.remove('minimized');
      content.style.display = 'block';
      footer.style.display = 'flex';
      minimizeBtn.textContent = '─';
      minimizeBtn.title = 'Minimize';
    } else {
      this.panel.classList.add('minimized');
      content.style.display = 'none';
      footer.style.display = 'none';
      minimizeBtn.textContent = '□';
      minimizeBtn.title = 'Restore';
    }
  }

  // Toggle job history details
  toggleDetails() {
    const details = this.panel.querySelector('.job-history-details');
    if (details.style.display === 'none') {
      details.style.display = 'block';
    } else {
      details.style.display = 'none';
    }
  }

  // Copy JSON to clipboard
  async copyToClipboard() {
    try {
      const json = JSON.stringify(this.data, null, 2);
      await navigator.clipboard.writeText(json);
      this.showNotification('JSON copied to clipboard!', 'success');
    } catch (e) {
      console.error('[Upwork Analyzer] Copy failed:', e);
      this.showNotification('Failed to copy to clipboard', 'error');
    }
  }

  // Export JSON to file
  exportJSON() {
    const json = JSON.stringify(this.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `upwork-job-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('JSON file downloaded!', 'success');
  }

  // Load auto-export setting from storage
  async loadAutoExportSetting(checkbox) {
    try {
      const result = await browser.storage.local.get('autoExportJSON');
      const autoExport = result.autoExportJSON !== undefined ? result.autoExportJSON : false;
      checkbox.checked = autoExport;
    } catch (e) {
      console.warn('[Upwork Analyzer] Could not load auto-export setting:', e);
      checkbox.checked = false;
    }
  }

  // Handle auto-export checkbox change
  async handleAutoExportChange(checked) {
    try {
      await browser.storage.local.set({ autoExportJSON: checked });
      console.log('[Upwork Analyzer] Auto-export setting saved:', checked);
      this.showNotification(
        checked ? 'Auto-export enabled' : 'Auto-export disabled',
        'success'
      );
    } catch (e) {
      console.error('[Upwork Analyzer] Could not save auto-export setting:', e);
      this.showNotification('Failed to save setting', 'error');
    }
  }

  // Check and perform auto-export if enabled
  async checkAutoExport() {
    try {
      const result = await browser.storage.local.get('autoExportJSON');
      const autoExport = result.autoExportJSON || false;

      if (autoExport) {
        console.log('[Upwork Analyzer] Auto-export enabled, exporting JSON...');
        this.exportJSON();
      }
    } catch (e) {
      console.warn('[Upwork Analyzer] Could not check auto-export setting:', e);
    }
  }

  // Close panel
  closePanel() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }

  // Close compact panel
  closeCompactPanel() {
    if (this.compactPanel) {
      this.compactPanel.remove();
      this.compactPanel = null;
    }
  }

  // Run full analysis with expansion
  async runFullAnalysis() {
    this.showNotification('Running full analysis...', 'info');
    this.closeCompactPanel();
    await this.analyze(true); // Force detailed view with expansion
  }

  // Switch to detailed view
  switchToDetailedView() {
    this.closeCompactPanel();
    this.displayResults();
  }

  // Toggle auto-display mode
  async toggleAutoDisplayMode() {
    this.autoDisplayMode = !this.autoDisplayMode;
    try {
      await browser.storage.local.set({ autoDisplayCompact: this.autoDisplayMode });
      this.showNotification(
        this.autoDisplayMode ? 'Auto-display enabled' : 'Auto-display disabled',
        'success'
      );
      // Update button appearance
      const btn = this.compactPanel?.querySelector('.btn-auto-mode');
      if (btn) {
        btn.style.opacity = this.autoDisplayMode ? '1' : '0.5';
      }
    } catch (e) {
      console.error('[Upwork Analyzer] Could not save auto-display setting:', e);
      this.showNotification('Failed to save setting', 'error');
    }
  }

  // Load auto-display mode setting
  async loadAutoDisplayModeSetting() {
    try {
      const result = await browser.storage.local.get('autoDisplayCompact');
      this.autoDisplayMode = result.autoDisplayCompact || false;
      console.log('[Upwork Analyzer] Auto-display mode:', this.autoDisplayMode);
    } catch (e) {
      console.warn('[Upwork Analyzer] Could not load auto-display setting:', e);
      this.autoDisplayMode = false;
    }
  }

  // Make panel draggable
  makeDraggable(panel) {
    const header = panel.querySelector('.analyzer-header') || panel.querySelector('.compact-header');
    if (!header) return;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('close-btn') ||
          e.target.classList.contains('compact-close-btn') ||
          e.target.tagName === 'BUTTON') return;

      isDragging = true;
      initialX = e.clientX - panel.offsetLeft;
      initialY = e.clientY - panel.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        panel.style.left = currentX + 'px';
        panel.style.top = currentY + 'px';
        panel.style.right = 'auto';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `upwork-analyzer-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize analyzer
const analyzer = new UpworkJobAnalyzer();

// Listen for messages from background script (hotkey trigger)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Upwork Analyzer] Received message:', message);

  if (message.action === 'analyze') {
    analyzer.quickAnalyze()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[Upwork Analyzer] Analysis error:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we'll send response asynchronously
    return true;
  }
});

// Fallback: Direct keyboard listener for Ctrl+Shift+V
document.addEventListener('keydown', (event) => {
  // Check for Ctrl+Shift+V (or Cmd+Shift+V on Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
    event.preventDefault();
    console.log('[Upwork Analyzer] Keyboard shortcut triggered directly');
    analyzer.quickAnalyze();
  }
});

// Auto-display functionality
(async function() {
  // Load auto-display setting
  await analyzer.loadAutoDisplayModeSetting();

  // If auto-display is enabled and we're on a job page, show compact panel
  if (analyzer.autoDisplayMode && analyzer.isJobPostPage()) {
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => analyzer.quickAnalyze(), 1000);
      });
    } else {
      setTimeout(() => analyzer.quickAnalyze(), 1000);
    }
  }
})();

console.log('[Upwork Analyzer] Content script loaded');
