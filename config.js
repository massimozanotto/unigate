/* ══════════════════════════════════════════════
   UNIGATE — Configurazione
   Modifica questo file per aggiornare sedi,
   stazione ospitante, messaggi e parametri.
   ══════════════════════════════════════════════ */

/* ── Università partner ──────────────────────────
   tz    : timezone IANA (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   url   : stream HLS (.m3u8) o MJPEG (+ type:'mjpeg')
   logo  : percorso logo (opzionale, default logos/{id}.svg)
   featured: true → questa camera è quella "grande" nel layout featured
             (solo una dovrebbe averlo, altrimenti vince la prima trovata)
   ─────────────────────────────────────────────── */
const CAMERAS = [
  { id: 'parigi',    label: 'Université Paris Cité',     tz: 'Europe/Paris',     featured: true,  url: 'https://cdn-008.whatsupcams.com/hls/it_gorizia06.m3u8' },
  { id: 'uda',       label: 'Università DAnnunzio',   tz: 'Europe/Rome',                       url: 'https://cdn-006.whatsupcams.com/hls/it_kronplatz07.m3u8' },
  { id: 'madrid',    label: 'Universidad Complutense',   tz: 'Europe/Madrid',                     url: 'https://5e0add8153fcd.streamlock.net:1936/vedetta/levanto.stream/playlist.m3u8' },
  { id: 'stoccolma', label: 'Stockholm University',      tz: 'Europe/Stockholm',                  url: 'https://cdn-008.whatsupcams.com/hls/si_ngorica03.m3u8' },
  { id: 'berlino',   label: 'Freie Universität Berlin',  tz: 'Europe/Berlin',                     url: 'https://cdn-007.whatsupcams.com/hls/hr_bol05.m3u8' },
  { id: 'praga',     label: 'Charles University',        tz: 'Europe/Prague',                     url: 'https://cdn-006.whatsupcams.com/hls/si_ngbevkovtrg.m3u8' },
  { id: 'lisbona',   label: 'Universidade de Lisboa',    tz: 'Europe/Lisbon',                     url: 'https://cdn-002.whatsupcams.com/hls/hr_bol04.m3u8' },
  { id: 'zurigo',    label: 'Universität Zürich',        tz: 'Europe/Zurich',                     url: 'https://cdn-008.whatsupcams.com/hls/it_anterselva04.m3u8' },
  { id: 'london',    label: 'University College London', tz: 'Europe/London',                     url: 'https://cdn-005.whatsupcams.com/hls/it_palau05.m3u8' },
  { id: 'dublin',    label: 'University College Dublin', tz: 'Europe/Dublin',                     url: 'https://cdn-005.whatsupcams.com/hls/it_caorle10.m3u8' },
];

/* ── Stazioni ospitanti ──────────────────────────
   Selezionabile con ?host=<id>
   Ogni record definisce il logo e il nome
   che appaiono a SINISTRA nell'header.
   ─────────────────────────────────────────────── */
/* ── Stazioni ospitanti ──────────────────────────
   Ogni chiave DEVE corrispondere a un id in CAMERAS
   (o a 'uda' per la sede host del progetto).
   Selezionabile con ?host=<id>
   ─────────────────────────────────────────────── */
const HOSTS = {
  uda: {
    name:     "Università D'Annunzio",
    subtitle: 'Chieti · Pescara',
    logo:     'https://www.unich.it/sites/default/files/logouda_bordooro_bis.png',
  },
  parigi: {
    name:     'Université Paris Cité',
    subtitle: 'Paris, France',
    logo:     'logos/parigi.svg',
  },
  madrid: {
    name:     'Universidad Complutense',
    subtitle: 'Madrid, España',
    logo:     'logos/madrid.svg',
  },
  stoccolma: {
    name:     'Stockholm University',
    subtitle: 'Stockholm, Sverige',
    logo:     'logos/stoccolma.svg',
  },
  berlino: {
    name:     'Freie Universität Berlin',
    subtitle: 'Berlin, Deutschland',
    logo:     'logos/berlino.svg',
  },
  praga: {
    name:     'Charles University',
    subtitle: 'Prague, Česká republika',
    logo:     'logos/praga.svg',
  },
  lisbona: {
    name:     'Universidade de Lisboa',
    subtitle: 'Lisboa, Portugal',
    logo:     'logos/lisbona.svg',
  },
  zurigo: {
    name:     'Universität Zürich',
    subtitle: 'Zürich, Schweiz',
    logo:     'logos/zurigo.svg',
  },
  london: {
    name:     'University College London',
    subtitle: 'London, UK',
    logo:     'logos/london.svg',
  },
  dublin: {
    name:     'University College Dublin',
    subtitle: 'Dublin, Ireland',
    logo:     'logos/dublin.svg',
  },
};

/* ── Messaggi ticker footer ─────────────────────── */
const TICKER_MESSAGES = [
  'Benvenuti nella Rete UNIGATE — Connettere le università europee dal campus di Chieti · Pescara',
  'Progetto UNIGATE — Cooperazione accademica e mobilità internazionale',
  'Università degli Studi «G. d\'Annunzio» — Chieti · Pescara',
  'Rete UNIGATE: Parigi · Madrid · Stoccolma · Berlino · Praga · Lisbona · Zurigo · Londra · Dublino',
];

/* ── Parametri layout ────────────────────────────
   DEFAULT_HOST     : stazione ospitante  (?host=)
   DEFAULT_THEME    : tema colori         (?theme=)
   DEFAULT_LAYOUT   : layout griglia      (?layout=)
   FOCUS_INTERVAL   : secondi per camera in modalità rotazione
   ─────────────────────────────────────────────── */
const DEFAULT_HOST    = 'uda';
const DEFAULT_THEME   = 'steel';
const DEFAULT_LAYOUT  = 'grid';
const FOCUS_INTERVAL  = 20;
