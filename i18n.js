/* ══════════════════════════════════════════════
   UNIGATE — Internazionalizzazione (i18n)
   Aggiungi nuove lingue copiando il blocco 'en'
   e traducendo i valori.
   Lingua di fallback: 'en'
   ══════════════════════════════════════════════ */

const I18N = {

  en: {
    live:               'LIVE',
    sponsored_by:       'SPONSORED BY',
    stat_connected:     'CONNECTED',
    stat_unavailable:   'UNAVAIL.',
    offline_msg:        'CONNECTION UNAVAILABLE',
    url_missing_msg:    'URL NOT CONFIGURED',
    url_missing_hint:   'Add the URL in CAMERAS[{idx}] in config.js',
    reconnect:          '↺ RECONNECT',
    intro_subtitle:     'INITIALIZING CONNECTION',
    theme_light:        'Light',
    theme_standard:     'Standard',
    theme_dark:         'Dark',
    layout_grid:        'Grid 3×3',
    layout_featured:    'Featured — 1 large + 8 small',
    layout_focus:       'Focus — 1 large + sidebar',
    lock_rotation:      'Lock / Unlock rotation',
    toggle_footer:      'Collapse / Expand bar',
  },

  it: {
    live:               'IN DIRETTA',
    sponsored_by:       'SPONSORIZZATO DA',
    stat_connected:     'CONNESSE',
    stat_unavailable:   'NON DISP.',
    offline_msg:        'CONNESSIONE NON DISPONIBILE',
    url_missing_msg:    'URL NON CONFIGURATO',
    url_missing_hint:   'Inserisci l\'URL in CAMERAS[{idx}] in config.js',
    reconnect:          '↺ RICONNETTI',
    intro_subtitle:     'INIZIALIZZAZIONE CONNESSIONE',
    theme_light:        'Chiaro',
    theme_standard:     'Standard',
    theme_dark:         'Scuro',
    layout_grid:        'Griglia 3×3',
    layout_featured:    'In evidenza — 1 grande + 8 piccoli',
    layout_focus:       'Rotazione — 1 grande + sidebar',
    lock_rotation:      'Blocca / Sblocca rotazione',
    toggle_footer:      'Comprimi / Espandi barra',
  },

};

/* ── Lingua attiva ───────────────────────────────
   Priorità: ?lang= → config DEFAULT_LANG → 'en'
   ─────────────────────────────────────────────── */
const _langParam = new URLSearchParams(location.search).get('lang');
const LANG = (I18N[_langParam] ? _langParam : null)
          || (typeof DEFAULT_LANG !== 'undefined' && I18N[DEFAULT_LANG] ? DEFAULT_LANG : null)
          || 'en';

function t(key, vars) {
  const str = (I18N[LANG]?.[key] ?? I18N['en']?.[key]) || key;
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
