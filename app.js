/* ══════════════════════════════════════════════
   UNIGATE — Applicazione principale
   Dipende da: config.js, hls.js
   ══════════════════════════════════════════════ */

const params = new URLSearchParams(window.location.search);

/* ── Stazione ospitante (?host=) ──────────────── */
// hostId è a livello di modulo: usato anche da buildGrid/buildPartnerLogos/focus
const hostId = (params.get('host') && HOSTS[params.get('host')])
  ? params.get('host')
  : DEFAULT_HOST;

/* ── Background immagine per host ─────────────── */
function initBackground() {
  const base     = `backgrounds/${hostId}_bg`;
  const fallback = 'backgrounds/default_bg';
  const candidates = [`${base}.png`, `${base}.jpg`, `${fallback}.png`, `${fallback}.jpg`];

  const apply = src => {
    document.body.style.backgroundImage     = `url('${src}')`;
    document.body.style.backgroundSize      = 'auto';
    document.body.style.backgroundPosition  = '0 0';
    document.body.style.backgroundAttachment = 'fixed';
  };

  function tryNext(list) {
    if (!list.length) return;
    const [first, ...rest] = list;
    const img = new Image();
    img.onload  = () => apply(first);
    img.onerror = () => tryNext(rest);
    img.src = first;
  }

  tryNext(candidates);
}

/* ── Sfondo animato (canvas particelle) ───────── */
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Legge una variabile CSS dal root
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Converte colore hex o rgb(...) in [r,g,b]
  function parseColor(str) {
    if (str.startsWith('#')) {
      let h = str.slice(1);
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  }

  const COUNT    = BG_PARTICLES;
  const MAX_DIST = 130;

  const pts = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * window.innerWidth,
    y:  Math.random() * window.innerHeight,
    vx: (Math.random() - .5) * .45,
    vy: (Math.random() - .5) * .45,
    r:  Math.random() * 1.6 + .7,
  }));

  function frame() {
    const accent = parseColor(cssVar('--accent'));

    // Pulisce il frame lasciando trasparente il canvas (mostra il background sotto)
    ctx.clearRect(0, 0, W, H);

    // Aggiorna posizioni (wrap ai bordi)
    for (const p of pts) {
      p.x += p.vx;  p.y += p.vy;
      if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
    }

    // Linee tra particelle vicine
    ctx.lineWidth = .7;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.strokeStyle = `rgba(${accent},${ (1 - d / MAX_DIST) * .22 })`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    // Punti
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent},.55)`;
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  frame();
}

function initHost() {
  const host = HOSTS[hostId];
  if (!host) return;

  const img      = document.querySelector('.host-logo-wrap img');
  const fallback = document.querySelector('.host-logo-fallback');
  const nameEl   = document.querySelector('.host-name');

  if (img) { img.src = host.logo || ''; img.alt = host.name; }
  if (fallback) fallback.textContent = hostId.slice(0, 3).toUpperCase();
  if (nameEl)   nameEl.textContent   = `${host.name} · ${host.subtitle}`;
}


/* ── Tema ─────────────────────────────────────── */
const VALID_THEMES = ['light', 'standard', 'dark'];

function applyTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return;
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.theme === theme)
  );
  const p = new URLSearchParams(window.location.search);
  p.set('theme', theme);
  history.replaceState(null, '', '?' + p.toString());
}

document.querySelectorAll('.theme-btn').forEach(btn =>
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme))
);

/* ── Footer collassabile ──────────────────────── */
(function initFooterToggle() {
  const footer = document.querySelector('footer');
  const toggle = document.getElementById('footer-toggle');
  if (!footer || !toggle) return;
  if (localStorage.getItem('footer-collapsed') === '1') footer.classList.add('collapsed');

  const updateFooterH = () =>
    document.documentElement.style.setProperty('--footer-h', footer.offsetHeight + 'px');

  new ResizeObserver(updateFooterH).observe(footer);
  updateFooterH();

  toggle.addEventListener('click', () => {
    footer.classList.toggle('collapsed');
    localStorage.setItem('footer-collapsed', footer.classList.contains('collapsed') ? '1' : '0');
  });
})();

/* ── Layout ───────────────────────────────────── */
const VALID_LAYOUTS = ['grid', 'featured', 'focus'];
let currentLayout = DEFAULT_LAYOUT;

function applyLayout(layout) {
  currentLayout = layout;
  document.body.setAttribute('data-layout', layout);
  document.querySelectorAll('.layout-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.layout === layout)
  );
  const p = new URLSearchParams(window.location.search);
  p.set('layout', layout);
  history.replaceState(null, '', '?' + p.toString());
  if (layout === 'focus') {
    startFocus();
  } else {
    stopFocus();
  }
}

/* ── Stato camere ─────────────────────────────── */
const hlsInstances = {};
const camStates    = {};
let liveCount = 0, errCount = 0;

function updateFooter() {
  document.getElementById('stat-live').textContent = liveCount;
  document.getElementById('stat-err').textContent  = errCount;
}

function setStatus(idx, state) {
  const prev = camStates[idx];
  if (prev === state) return;
  camStates[idx] = state;
  if (prev === 'live')  liveCount--;
  if (prev === 'error') errCount--;
  if (state === 'live')  liveCount++;
  if (state === 'error') errCount++;
  updateFooter();

  const dot = document.querySelector(`#cell-${idx} .status-dot`);
  if (dot) dot.className = 'status-dot ' + state;

  const card = document.getElementById(`badge-${idx}`);
  if (card) card.setAttribute('data-state', state);

  const cell = document.getElementById(`cell-${idx}`);
  if (cell) cell.classList.toggle('cam-live', state === 'live');
}

/* ── Build: loghi partner in header ──────────── */
function buildPartnerLogos() {
  const container = document.getElementById('partner-logos');
  CAMERAS.forEach((cam, idx) => {
    if (cam.id === hostId) return;  // l'host appare nell'header, non nei badge
    const card = document.createElement('div');
    card.className = 'partner-card d-flex flex-column align-items-center flex-shrink-0';
    card.id = `badge-${idx}`;
    card.setAttribute('data-state', 'loading');
    card.title = cam.label;

    const logoSrc = cam.logo || `logos/${cam.id}.svg`;
    card.innerHTML = `
      <div class="partner-logo-area d-flex align-items-center justify-content-center">
        <img src="${logoSrc}" alt="${cam.id}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <span class="partner-abbr-lg" style="display:none">${cam.id.slice(0, 3).toUpperCase()}</span>
      </div>
      <span class="partner-city-label">${cam.id.toUpperCase()}</span>
      <span class="partner-dot"></span>
    `;
    container.appendChild(card);
  });
}

/* ── Build: griglia celle ─────────────────────── */
function buildGrid() {
  const grid = document.getElementById('grid');
  const visibleCams = CAMERAS.filter(c => c.id !== hostId);

  document.getElementById('stat-total').textContent = visibleCams.length;

  // Camera "featured" — priorità a ?featured=id, poi a featured:true in config, poi prima visibile
  const featuredParam = params.get('featured');
  const featuredId = visibleCams.find(c => c.id === featuredParam)?.id
    ?? visibleCams.find(c => c.featured)?.id
    ?? visibleCams[0]?.id;

  // Camera di partenza per il focus — priorità a ?focus=id, deve essere non-host
  const focusParam = params.get('focus');
  const focusStartIdx = (() => {
    const i = CAMERAS.findIndex(c => c.id === focusParam && c.id !== hostId);
    return i >= 0 ? i : CAMERAS.findIndex(c => c.id !== hostId);
  })();
  focusIdx = Math.max(0, focusStartIdx);

  // CSS custom property per le righe del sidebar in focus mode
  grid.style.setProperty('--cam-count-minus1', visibleCams.length - 1);

  let cellOrder = 0;
  CAMERAS.forEach((cam, idx) => {
    if (cam.id === hostId) return;  // l'host non appare nella griglia
    const cell = document.createElement('div');
    cell.className = 'cam-cell' + (cam.id === featuredId ? ' cam-main' : '');
    cell.id = `cell-${idx}`;
    cell.style.setProperty('--i', cellOrder++);

    cell.innerHTML = `
      <video id="vid-${idx}" autoplay muted playsinline></video>
      <div class="cam-placeholder" id="ph-${idx}" style="display:none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <div class="offline-msg" id="ph-msg-${idx}">CONNESSIONE NON DISPONIBILE</div>
        <div class="err-msg" id="ph-err-${idx}"></div>
        <button class="retry-btn" onclick="initCamera(${idx})">${t('reconnect')}</button>
      </div>
      <div class="hud">
        <div class="hud-top">
          <div class="status-dot loading"></div>
          <div class="cam-label">${cam.id.toUpperCase()}</div>
          <div class="hud-tz" id="tz-${idx}"></div>
        </div>
        <div class="hud-live">${t('live')}</div>
        <div class="hud-bottom">${cam.label}</div>
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
      </div>
    `;

    cell.addEventListener('click', () => {
      if (currentLayout === 'focus') {
        if (cell.classList.contains('focus-active')) {
          openModal(idx);   // clic sulla grande → apre modal
        } else {
          focusIdx = idx;   // clic su thumbnail → sposta il focus
          showFocusCell(idx);
          resetFocusTimer();
        }
        return;
      }
      openModal(idx);
    });

    grid.appendChild(cell);
    camStates[idx] = 'loading';
  });
}

/* ── Init camera ──────────────────────────────── */
function initCamera(idx) {
  const cam   = CAMERAS[idx];
  const video = document.getElementById(`vid-${idx}`);
  const ph    = document.getElementById(`ph-${idx}`);

  if (!video || !ph) return;  // camera non in DOM (es. host corrente)

  if (hlsInstances[idx]) { hlsInstances[idx].destroy(); delete hlsInstances[idx]; }

  ph.style.display    = 'none';
  video.style.display = 'block';
  setStatus(idx, 'loading');

  if (!cam.url) {
    ph.style.display    = 'flex';
    video.style.display = 'none';
    document.getElementById(`ph-msg-${idx}`).textContent = t('url_missing_msg');
    document.getElementById(`ph-err-${idx}`).textContent = t('url_missing_hint', { idx });
    setStatus(idx, 'unconfigured');
    return;
  }

  if (cam.type === 'mjpeg') {
    video.style.display = 'none';
    const img = document.createElement('img');
    img.src = cam.url;
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    img.onload  = () => setStatus(idx, 'live');
    img.onerror = () => { setStatus(idx, 'error'); showOffline(idx, 'Stream non raggiungibile'); };
    document.getElementById(`cell-${idx}`).insertBefore(img, video);
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30 });
    hlsInstances[idx] = hls;
    hls.loadSource(cam.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); setStatus(idx, 'live'); });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      const msg = data.type === 'networkError' ? 'Rete non raggiungibile' : 'Errore stream (' + data.details + ')';
      setStatus(idx, 'error');
      showOffline(idx, msg);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = cam.url;
    video.addEventListener('loadedmetadata', () => { video.play().catch(() => {}); setStatus(idx, 'live'); }, { once: true });
    video.addEventListener('error', () => { setStatus(idx, 'error'); showOffline(idx, 'Errore caricamento stream'); }, { once: true });
  } else {
    showOffline(idx, 'HLS non supportato dal browser');
    setStatus(idx, 'error');
  }
}

function showOffline(idx, msg) {
  const ph    = document.getElementById(`ph-${idx}`);
  const video = document.getElementById(`vid-${idx}`);
  ph.style.display    = 'flex';
  video.style.display = 'none';
  document.getElementById(`ph-msg-${idx}`).textContent = t('offline_msg');
  document.getElementById(`ph-err-${idx}`).textContent = msg || '';
}

/* ── Modalità Focus (rotazione + sidebar + countdown) ── */
let focusIdx         = 0;
let focusTimer       = null;
let focusSecondsLeft = FOCUS_INTERVAL;
let focusLocked      = false;

function setFocusTimerVisible(visible) {
  if (SHOW_FOCUS_BAR)     document.getElementById('focus-timer').style.display     = visible ? '' : 'none';
  if (SHOW_FOCUS_COUNTER) document.getElementById('focus-countdown').style.display = visible ? '' : 'none';
}

function toggleFocusLock() {
  focusLocked = !focusLocked;
  const btn = document.getElementById('focus-lock-btn');
  if (btn) btn.classList.toggle('locked', focusLocked);
  if (focusLocked) {
    if (focusTimer) { clearInterval(focusTimer); focusTimer = null; }
    setFocusTimerVisible(false);
  } else {
    setFocusTimerVisible(true);
    resetFocusTimer();
  }
}

document.getElementById('focus-lock-btn').addEventListener('click', toggleFocusLock);

function startFocus() {
  focusLocked = false;
  const btn = document.getElementById('focus-lock-btn');
  if (btn) btn.classList.remove('locked');
  focusSecondsLeft = FOCUS_INTERVAL;
  showFocusCell(focusIdx);
  resetTimerBar();
  setFocusTimerVisible(true);
  focusTimer = setInterval(() => {
    if (focusLocked) return;
    focusSecondsLeft--;
    updateTimerLabel();
    if (focusSecondsLeft <= 0) advanceFocus();
  }, 1000);
}

function stopFocus() {
  if (focusTimer) { clearInterval(focusTimer); focusTimer = null; }
  focusLocked = false;
  const btn = document.getElementById('focus-lock-btn');
  if (btn) btn.classList.remove('locked');
  document.querySelectorAll('.cam-cell').forEach(c => c.classList.remove('focus-active'));
}

function advanceFocus() {
  if (focusLocked) return;
  do { focusIdx = (focusIdx + 1) % CAMERAS.length; }
  while (CAMERAS[focusIdx].id === hostId);
  focusSecondsLeft = FOCUS_INTERVAL;
  showFocusCell(focusIdx);
  resetTimerBar();
}

const COUNTRY_NAMES = {
  IT: 'Italy', IE: 'Ireland', SE: 'Sweden',  FI: 'Finland',
  FR: 'France', DE: 'Germany', RO: 'Romania', BG: 'Bulgaria',
  ES: 'Spain',  PT: 'Portugal', CZ: 'Czech Republic', CH: 'Switzerland',
  GB: 'United Kingdom', AT: 'Austria', NL: 'Netherlands', BE: 'Belgium',
};

function showFocusCell(idx) {
  document.querySelectorAll('.cam-cell').forEach(c => c.classList.remove('focus-active'));
  document.getElementById(`cell-${idx}`)?.classList.add('focus-active');

  const cam = CAMERAS[idx];
  const el  = document.getElementById('focus-label');
  if (el && cam) {
    const countryName = cam.country ? (COUNTRY_NAMES[cam.country] ?? cam.country) : '';
    el.innerHTML = cam.label
      + (countryName ? `<span class="focus-label-country">\u2014 ${countryName} \u2014</span>` : '');
  }
}

function resetFocusTimer() {
  if (focusTimer) clearInterval(focusTimer);
  focusSecondsLeft = FOCUS_INTERVAL;
  resetTimerBar();
  focusTimer = setInterval(() => {
    focusSecondsLeft--;
    updateTimerLabel();
    if (focusSecondsLeft <= 0) advanceFocus();
  }, 1000);
}

function resetTimerBar() {
  const fill = document.getElementById('focus-bar-fill');
  if (!fill) return;
  fill.style.animation = 'none';
  fill.offsetWidth; // force reflow
  fill.style.animation = `focus-bar-drain ${FOCUS_INTERVAL}s linear forwards`;
  updateTimerLabel();
}

function updateTimerLabel() {
  const secs = Math.max(0, focusSecondsLeft);
  const el = document.getElementById('focus-timer-label');
  if (el) el.textContent = secs + 's';
  const cd = document.getElementById('focus-countdown');
  if (cd) {
    cd.textContent = secs;
    cd.classList.toggle('urgent', secs <= 3);
  }
}

/* ── Modal fullscreen — Bootstrap Modal ───────── */
const modal      = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const modalLabel = document.getElementById('modal-label');
const modalBody  = modal.querySelector('.modal-body');
let   modalHls   = null;

function openModal(idx) {
  const cam = CAMERAS[idx];
  if (!cam.url || camStates[idx] === 'unconfigured') return;

  modalLabel.textContent = `${cam.id.toUpperCase()} — ${cam.label}`;

  if (modalHls) { modalHls.destroy(); modalHls = null; }

  if (cam.type === 'mjpeg') {
    modalVideo.src = '';
    modalVideo.style.display = 'none';
    let mimg = modalBody.querySelector('img.modal-img');
    if (!mimg) {
      mimg = document.createElement('img');
      mimg.className = 'modal-img';
      modalBody.insertBefore(mimg, modalVideo);
    }
    mimg.src = cam.url;
  } else {
    modalVideo.style.display = '';
    modalBody.querySelector('img.modal-img')?.remove();
    if (Hls.isSupported()) {
      modalHls = new Hls({ lowLatencyMode: true });
      modalHls.loadSource(cam.url);
      modalHls.attachMedia(modalVideo);
      modalHls.on(Hls.Events.MANIFEST_PARSED, () => modalVideo.play().catch(() => {}));
    } else {
      modalVideo.src = cam.url;
      modalVideo.play().catch(() => {});
    }
  }

  bootstrap.Modal.getOrCreateInstance(modal).show();
}

const closeModal = () => {
  bootstrap.Modal.getInstance(modal)?.hide();
};

/* Cleanup stream quando il modal è completamente nascosto */
modal.addEventListener('hide.bs.modal', () => {
  if (modalHls) { modalHls.destroy(); modalHls = null; }
  modalVideo.src = '';
  modalVideo.pause();
});

/* ── Layout switcher (pulsanti UI) ───────────── */
document.querySelectorAll('.layout-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLayout(btn.dataset.layout));
});

/* ── Tastiera ─────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (currentLayout === 'focus') {
    if (e.key === 'ArrowLeft') {
      do { focusIdx = (focusIdx - 1 + CAMERAS.length) % CAMERAS.length; }
      while (CAMERAS[focusIdx].id === hostId);
      showFocusCell(focusIdx);
      resetFocusTimer();
    }
    if (e.key === 'ArrowRight') {
      do { focusIdx = (focusIdx + 1) % CAMERAS.length; }
      while (CAMERAS[focusIdx].id === hostId);
      showFocusCell(focusIdx);
      resetFocusTimer();
    }
  }
});

/* ── Orologio + fusi orari locali ─────────────── */
const tzFormatters = {};
function getTzFormatter(tz) {
  if (!tzFormatters[tz]) {
    tzFormatters[tz] = new Intl.DateTimeFormat('it-IT', {
      timeZone: tz, hour: '2-digit', minute: '2-digit'
    });
  }
  return tzFormatters[tz];
}

function tick() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toTimeString().slice(0, 8);
  document.getElementById('date-str').textContent =
    now.toLocaleDateString('it-IT', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();
  CAMERAS.forEach((cam, idx) => {
    if (!cam.tz) return;
    const el = document.getElementById(`tz-${idx}`);
    if (el) el.textContent = getTzFormatter(cam.tz).format(now);
  });
}
tick();
setInterval(tick, 1000);

/* ── Ticker footer ────────────────────────────── */
function buildTicker() {
  const track = document.getElementById('ticker-track');
  if (!track || !TICKER_MESSAGES?.length) return;
  const sep  = '   ✦   ';
  const text = TICKER_MESSAGES.join(sep) + sep + TICKER_MESSAGES.join(sep) + sep;
  track.textContent = text;
  const duration = Math.max(30, Math.round(text.length / 5));
  track.style.animationDuration = `${duration}s`;
}

/* ── Riga sponsor ─────────────────────────────── */
function buildSponsors() {
  const row = document.getElementById('sponsors-row');
  if (!row) return;
  row.innerHTML = '';

  if (!SHOW_SPONSORS) { row.style.display = 'none'; return; }

  row.classList.toggle('label-left', SPONSORS_LABEL_POS === 'left');

  const label = document.createElement('span');
  label.id = 'sponsors-label';
  label.textContent = t('sponsored_by');
  row.appendChild(label);

  const sponsors = HOSTS[hostId]?.sponsors || [];
  if (!sponsors.length) return;

  const logos = document.createElement('div');
  logos.className = 'sponsor-logos';
  row.appendChild(logos);

  sponsors.forEach(s => {
    const item = document.createElement('div');
    item.className = 'sponsor-item';

    let inner;
    if (s.logo) {
      const img = document.createElement('img');
      img.src   = s.logo;
      img.alt   = s.name || '';
      img.title = s.name || '';
      if (s.url) {
        inner = document.createElement('a');
        inner.href   = s.url;
        inner.target = '_blank';
        inner.rel    = 'noopener noreferrer';
        inner.appendChild(img);
      } else {
        inner = img;
      }
    } else if (s.name) {
      inner = document.createElement('span');
      inner.className   = 'sponsor-item-name';
      inner.textContent = s.name;
    }
    if (inner) item.appendChild(inner);
    logos.appendChild(item);
  });
}

/* ── Rimozione overlay intro ──────────────────── */
function removeIntro() {
  const intro = document.getElementById('unigate-intro');
  if (intro) intro.remove();
}
// rimosso con un piccolo buffer dopo la fine dell'animazione CSS (~4s)
setTimeout(removeIntro, 4400);

/* ── Auto-retry errori ogni 30s ──────────────── */
setInterval(() => {
  CAMERAS.forEach((_, idx) => { if (camStates[idx] === 'error') initCamera(idx); });
}, 30000);

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
(function init() {
  const layoutParam = params.get('layout');
  const layout = VALID_LAYOUTS.includes(layoutParam) ? layoutParam : DEFAULT_LAYOUT;

  const themeParam = params.get('theme');
  const theme = VALID_THEMES.includes(themeParam) ? themeParam : DEFAULT_THEME;

  /* ── Stringhe i18n negli elementi statici HTML ── */
  const elSub = document.getElementById('sg-subtitle');
  if (elSub) elSub.textContent = t('intro_subtitle');

  const elConn = document.getElementById('stat-connected-label');
  if (elConn) elConn.firstChild.textContent = t('stat_connected') + ' ';

  const elUnavail = document.getElementById('stat-unavailable-label');
  if (elUnavail) elUnavail.firstChild.textContent = t('stat_unavailable') + ' ';

  const btnGrid     = document.getElementById('btn-layout-grid');
  const btnFeatured = document.getElementById('btn-layout-featured');
  const btnFocus    = document.getElementById('btn-layout-focus');
  if (btnGrid)     btnGrid.title     = t('layout_grid');
  if (btnFeatured) btnFeatured.title = t('layout_featured');
  if (btnFocus)    btnFocus.title    = t('layout_focus');

  const btnLock   = document.getElementById('focus-lock-btn');
  const btnToggle = document.getElementById('footer-toggle');
  if (btnLock)   btnLock.title   = t('lock_rotation');
  if (btnToggle) btnToggle.title = t('toggle_footer');

  document.querySelectorAll('.theme-btn').forEach(btn => {
    const k = 'theme_' + btn.dataset.theme;
    btn.title = t(k);
  });

  initBackground();
  initBgCanvas();
  initHost();
  buildPartnerLogos();
  buildGrid();
  buildTicker();
  buildSponsors();
  if (!SHOW_FOCUS_BAR)     document.getElementById('focus-timer').style.display     = 'none';
  if (!SHOW_FOCUS_COUNTER) document.getElementById('focus-countdown').style.display = 'none';
  applyTheme(theme);
  applyLayout(layout);
  CAMERAS.forEach((cam, idx) => { if (cam.id !== hostId) initCamera(idx); });
})();
