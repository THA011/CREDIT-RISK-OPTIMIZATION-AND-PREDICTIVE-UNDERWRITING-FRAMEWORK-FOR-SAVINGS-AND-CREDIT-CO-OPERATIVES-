// ─────────────────────────────────────────────────────────────────────────────
// CREDIT RISK DASHBOARD — dashboard.js
// Mwatha Maina Analytics · SASRA Framework
// ─────────────────────────────────────────────────────────────────────────────

(function () {

  // ── Chart.js global defaults (Updated for Clean Light Theme) ─────────────────
  Chart.defaults.color = '#475569';                 // Deep Slate Gray for text
  Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.borderColor = '#e2e8f0';          // Soft Slate Border Grid lines

  // ── Color palette (Matched perfectly to Colgate White/Emerald theme) ────────
  const C = {
    accent:  '#00875a',   // Corporate Colgate Emerald Green
    accent2: '#0052cc',   // Executive Royal Blue
    warn:    '#d97706',   // High-readability Amber
    danger:  '#dc2626',   // Clean High-contrast Crimson
    text:    '#0f172a',   // Slate Black
    text2:   '#475569',   // Slate Gray
    text3:   '#94a3b8',   // Light Muted Label Slate
    bg2:     '#ffffff',   // Card background (pure white)
    border:  '#e2e8f0',   // Separation Gray
    perf:    '#00875a',   // Performing Tier Emerald
    watch:   '#d97706',   // Watch Tier Amber
    sub:     '#dc2626',   // Defaulting Substandard Crimson
  };

  // ── Chart instances ─────────────────────────────────────────────────────────
  let charts = {};

  // ── State ─────────────────────────────────────────────────────────────────
  let allData = [];

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const fileInput   = document.getElementById('fileInput');
  const uploadCard  = document.getElementById('uploadCard');
  const dashboard   = document.getElementById('dashboard');
  const statusPill  = document.getElementById('status-pill');
  const statusText  = document.getElementById('status-text');

  // ── File input / drag-drop ────────────────────────────────────────────────
  fileInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) parseCSV(f);
  });

  uploadCard.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') fileInput.click();
  });

  uploadCard.addEventListener('dragover', e => {
    e.preventDefault();
    uploadCard.classList.add('dragging');
  });

  uploadCard.addEventListener('dragleave', () => uploadCard.classList.remove('dragging'));

  uploadCard.addEventListener('drop', e => {
    e.preventDefault();
    uploadCard.classList.remove('dragging');
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) parseCSV(f);
  });

  // ── CSV parsing ───────────────────────────────────────────────────────────
  function parseCSV(file) {
    statusText.textContent = 'PARSING…';

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        allData = results.data.filter(r => r.Member_ID);
        if (!allData.length) {
          statusText.textContent = 'PARSE ERROR';
          return;
        }
        buildDashboard(allData);
      },
      error: function () {
        statusText.textContent = 'LOAD ERROR';
      }
    });
  }

  // ── Main build ────────────────────────────────────────────────────────────
  function buildDashboard(data) {
    dashboard.classList.add('visible');
    statusPill.classList.add('loaded');
    statusText.textContent = data.length + ' MEMBERS LOADED';
    document.getElementById('upload-zone').style.marginBottom = '0';

    const stats = computeStats(data);

    renderKPIs(stats);
    renderCharts(stats);
    renderTierBreakdown(stats);
    renderDPDGrid(stats);
    renderTable(data);
    animateKPIs();
  }

  // ── Stats computation ─────────────────────────────────────────────────────
  function computeStats(data) {
    const n = data.length;

    const totalPrincipal = data.reduce((s, r) => s + (r.Principal_Loan_KES || 0), 0);
    const totalProvision = data.reduce((s, r) => s + (r.Required_Provision_KES || 0), 0);
    const avgRepay = data.reduce((s, r) => s + (r.Repayment_Rate || 0), 0) / n;
    const avgDPD   = data.reduce((s, r) => s + (r.Days_Past_Due || 0), 0) / n;

    const T = { Performing: [], Watch: [], Substandard: [], Doubtful: [], Loss: [] };
    data.forEach(r => {
      const t = r.Risk_Classification || 'Unknown';
      if (!T[t]) T[t] = [];
      T[t].push(r);
    });

    const tierStats = {};
    Object.keys(T).forEach(t => {
      const members = T[t];
      tierStats[t] = {
        count: members.length,
        principal: members.reduce((s, r) => s + (r.Principal_Loan_KES || 0), 0),
        provision: members.reduce((s, r) => s + (r.Required_Provision_KES || 0), 0),
        avgRepay: members.length ? members.reduce((s, r) => s + (r.Repayment_Rate || 0), 0) / members.length : 0,
        avgDPD:   members.length ? members.reduce((s, r) => s + (r.Days_Past_Due || 0), 0) / members.length : 0,
      };
    });

    const watchMembers = T['Watch'] || [];
    const dpdBuckets = [
      { label: '0–7',  min: 0,  max: 7,  count: 0 },
      { label: '8–14', min: 8,  max: 14, count: 0 },
      { label: '15–21',min: 15, max: 21, count: 0 },
      { label: '22–30',min: 22, max: 30, count: 0 },
    ];
    watchMembers.forEach(r => {
      const d = r.Days_Past_Due || 0;
      dpdBuckets.forEach(b => { if (d >= b.min && d <= b.max) b.count++; });
    });

    const loanGroups = {};
    data.forEach(r => {
      const k = 'KES ' + fmtNum(r.Principal_Loan_KES || 0);
      loanGroups[k] = (loanGroups[k] || 0) + 1;
    });
    const loanSizes = Object.entries(loanGroups)
      .sort((a, b) => parseInt(a[0].replace(/\D/g,'')) - parseInt(b[0].replace(/\D/g,'')));

    const repayBuckets = Array(10).fill(0);
    data.forEach(r => {
      const pct = (r.Repayment_Rate || 0) * 100;
      const idx = Math.min(Math.floor(pct / 10), 9);
      repayBuckets[idx]++;
    });

    const scoreBuckets = Array(6).fill(0);
    data.forEach(r => {
      const pd = Math.max(0, Math.min(1, 1 - (r.Repayment_Rate || 0) + (r.Days_Past_Due || 0) * 0.01));
      const score = Math.round(900 - pd * 600);
      const idx = Math.min(Math.floor((score - 300) / 100), 5);
      if (idx >= 0) scoreBuckets[idx]++;
    });

    return {
      n, totalPrincipal, totalProvision, avgRepay, avgDPD,
      T, tierStats, dpdBuckets, loanSizes, repayBuckets, scoreBuckets,
      provRatio: totalProvision / totalPrincipal,
    };
  }

  // ── KPI render ────────────────────────────────────────────────────────────
  function renderKPIs(s) {
    document.getElementById('kpi-members').textContent   = s.n.toLocaleString();
    document.getElementById('kpi-portfolio').textContent = fmtM(s.totalPrincipal);
    document.getElementById('kpi-provision').textContent = fmtM(s.totalProvision);
    document.getElementById('kpi-prov-ratio').textContent = (s.provRatio * 100).toFixed(2) + '%';
    document.getElementById('kpi-repay').textContent     = (s.avgRepay * 100).toFixed(1) + '%';
    document.getElementById('kpi-dpd').textContent       = s.avgDPD.toFixed(1);
  }

  function animateKPIs() {
    const cells = document.querySelectorAll('.kpi-cell');
    cells.forEach((cell, i) => {
      setTimeout(() => cell.classList.add('animated'), i * 60);
    });
  }

  // ── Charts Setup ──────────────────────────────────────────────────────────
  function renderCharts(s) {
    destroyAll();

    const tierOrder = ['Performing', 'Watch', 'Substandard', 'Doubtful', 'Loss'];
    const tierColors = [C.perf, C.watch, C.sub, '#b84fe3', '#e11d48'];
    const activeTiers = tierOrder.filter(t => (s.tierStats[t]?.count || 0) > 0);

    // 1. Risk Tier doughnut
    charts.riskTier = new Chart(document.getElementById('riskTierChart'), {
      type: 'doughnut',
      data: {
        labels: activeTiers,
        datasets: [{
          data: activeTiers.map(t => s.tierStats[t].count),
          backgroundColor: activeTiers.map(t => tierColors[tierOrder.indexOf(t)]),
          borderColor: C.bg2,
          borderWidth: 2,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 10,
              boxWidth: 8,
              boxHeight: 8,
              font: { family: "'IBM Plex Mono', monospace", size: 10 },
              color: C.text2,
              generateLabels: function(chart) {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: label + ' (' + data.datasets[0].data[i] + ')',
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: 'transparent',
                  index: i,
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} portfolios (${(ctx.raw/s.n*100).toFixed(1)}%)`
            }
          }
        }
      }
    });

    // 2. Provision bar chart
    charts.provision = new Chart(document.getElementById('provisionChart'), {
      type: 'bar',
      data: {
        labels: activeTiers,
        datasets: [{
          label: 'KES',
          data: activeTiers.map(t => s.tierStats[t].provision),
          backgroundColor: activeTiers.map(t => tierColors[tierOrder.indexOf(t)] + 'dd'),
          borderColor: activeTiers.map(t => tierColors[tierOrder.indexOf(t)]),
          borderWidth: 1,
          borderRadius: 3,
          barThickness: 24
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` KES ${fmtNum(ctx.raw)}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: C.text2 } },
          y: {
            grid: { color: C.border },
            ticks: {
              color: C.text2,
              callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v
            }
          }
        }
      }
    });

    // 3. Repayment rate histogram (Gradient-like Emerald Transition)
    const repayLabels = ['0–10','10–20','20–30','30–40','40–50','50–60','60–70','70–80','80–90','90–100'];
    charts.repay = new Chart(document.getElementById('repayChart'), {
      type: 'bar',
      data: {
        labels: repayLabels,
        datasets: [{
          label: 'Members',
          data: s.repayBuckets,
          backgroundColor: repayLabels.map((_, i) => {
            const t = i / 9;
            return `rgba(${Math.round(220*(1-t) + 0*t)}, ${Math.round(38*(1-t) + 135*t)}, ${Math.round(38*(1-t) + 90*t)}, 0.85)`;
          }),
          borderWidth: 0,
          borderRadius: 2,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw} Accounts` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: C.text2, maxRotation: 45 } },
          y: { grid: { color: C.border }, ticks: { color: C.text2 } }
        }
      }
    });

    // 4. Loan size chart (Corporate Blues/Greens Mix)
    charts.loanSize = new Chart(document.getElementById('loanSizeChart'), {
      type: 'doughnut',
      data: {
        labels: s.loanSizes.map(([k]) => k),
        datasets: [{
          data: s.loanSizes.map(([, v]) => v),
          backgroundColor: [C.accent, C.accent2, '#0ea5e9', '#64748b'],
          borderColor: C.bg2,
          borderWidth: 2,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '64%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 8, boxWidth: 6, boxHeight: 6,
              font: { family: "'IBM Plex Sans'", size: 10 },
              color: C.text2,
            }
          },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw} Members` } }
        }
      }
    });

    // 5. Score distribution
    const scoreLabels = ['300–400','400–500','500–600','600–700','700–800','800–900'];
    const scoreColors = [C.danger, '#ea580c', C.warn, '#84cc16', C.accent, C.accent2];
    charts.score = new Chart(document.getElementById('scoreDistributionChart'), {
      type: 'bar',
      data: {
        labels: scoreLabels,
        datasets: [{
          label: 'Members',
          data: s.scoreBuckets,
          backgroundColor: scoreColors.map(c => c + 'cc'),
          borderColor: scoreColors,
          borderWidth: 1,
          borderRadius: 3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw} Members in Range` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: C.text2 } },
          y: { grid: { color: C.border }, ticks: { color: C.text2 } }
        }
      }
    });
  }

  function destroyAll() {
    Object.values(charts).forEach