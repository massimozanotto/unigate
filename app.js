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
const VALID_THEMES = ['dark', 'void', 'blue', 'light', 'steel', 'uda'];

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
    card.className = 'partner-card';
    card.id = `badge-${idx}`;
    card.setAttribute('data-state', 'loading');
    card.title = cam.label;

    const logoSrc = cam.logo || `logos/${cam.id}.svg`;
    card.innerHTML = `
      <div class="partner-logo-area">
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
        <button class="retry-btn" onclick="initCamera(${idx})">↺ RICONNETTI</button>
      </div>
      <div class="hud">
        <div class="hud-top">
          <div class="status-dot loading"></div>
          <div class="cam-label">${cam.id.toUpperCase()}</div>
          <div class="hud-tz" id="tz-${idx}"></div>
        </div>
        <div class="hud-live">IN DIRETTA</div>
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
    document.getElementById(`ph-msg-${idx}`).textContent = 'URL NON CONFIGURATO';
    document.getElementById(`ph-err-${idx}`).textContent = `Inserisci l'URL in CAMERAS[${idx}] in config.js`;
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
  document.getElementById(`ph-msg-${idx}`).textContent = 'CONNESSIONE NON DISPONIBILE';
  document.getElementById(`ph-err-${idx}`).textContent = msg || '';
}

/* ── Modalità Focus (rotazione + sidebar + countdown) ── */
let focusIdx        = 0;
let focusTimer      = null;
let focusSecondsLeft = FOCUS_INTERVAL;

function startFocus() {
  focusSecondsLeft = FOCUS_INTERVAL;
  showFocusCell(focusIdx);
  resetTimerBar();
  focusTimer = setInterval(() => {
    focusSecondsLeft--;
    updateTimerLabel();
    if (focusSecondsLeft <= 0) advanceFocus();
  }, 1000);
}

function stopFocus() {
  if (focusTimer) { clearInterval(focusTimer); focusTimer = null; }
  document.querySelectorAll('.cam-cell').forEach(c => c.classList.remove('focus-active'));
}

function advanceFocus() {
  do { focusIdx = (focusIdx + 1) % CAMERAS.length; }
  while (CAMERAS[focusIdx].id === hostId);
  focusSecondsLeft = FOCUS_INTERVAL;
  showFocusCell(focusIdx);
  resetTimerBar();
}

function showFocusCell(idx) {
  document.querySelectorAll('.cam-cell').forEach(c => c.classList.remove('focus-active'));
  document.getElementById(`cell-${idx}`)?.classList.add('focus-active');
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

/* ── Modal fullscreen ─────────────────────────── */
const modal      = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const modalLabel = document.getElementById('modal-label');
let   modalHls   = null;

function openModal(idx) {
  const cam = CAMERAS[idx];
  if (!cam.url || camStates[idx] === 'unconfigured') return;

  modal.classList.add('open');
  modalLabel.textContent = `${cam.id.toUpperCase()} — ${cam.label}`;

  if (modalHls) { modalHls.destroy(); modalHls = null; }

  if (cam.type === 'mjpeg') {
    modalVideo.src = '';
    modalVideo.style.display = 'none';
    let mimg = modal.querySelector('img.modal-img');
    if (!mimg) {
      mimg = document.createElement('img');
      mimg.className = 'modal-img';
      mimg.style.cssText = 'max-width:90vw;max-height:85vh;border:1px solid var(--accent);border-radius:4px;';
      modal.insertBefore(mimg, modalLabel);
    }
    mimg.src = cam.url;
  } else {
    modalVideo.style.display = '';
    modal.querySelector('img.modal-img')?.remove();
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
}

const closeModal = () => {
  modal.classList.remove('open');
  if (modalHls) { modalHls.destroy(); modalHls = null; }
  modalVideo.src = '';
  modalVideo.pause();
};

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

/* ── Layout switcher (pulsanti UI) ───────────── */
document.querySelectorAll('.layout-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLayout(btn.dataset.layout));
});

/* ── Tastiera ─────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modal.classList.contains('open')) { closeModal(); return; }
  }
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

  initHost();
  buildPartnerLogos();
  buildGrid();
  buildTicker();
  applyTheme(theme);
  applyLayout(layout);
  CAMERAS.forEach((cam, idx) => { if (cam.id !== hostId) initCamera(idx); });
})();
