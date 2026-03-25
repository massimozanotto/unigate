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
  { id: 'uda',        label: "Università D'Annunzio",                  country: 'IT', tz: 'Europe/Rome',     featured: true, url: 'https://cdn-006.whatsupcams.com/hls/it_kronplatz07.m3u8' },
  { id: 'cork',       label: 'Munster Technological University',        country: 'IE', tz: 'Europe/Dublin',           url: 'https://cdn-008.whatsupcams.com/hls/it_gorizia06.m3u8' },
  { id: 'skovde',     label: 'University of Skövde',                   country: 'SE', tz: 'Europe/Stockholm',        url: 'https://5e0add8153fcd.streamlock.net:1936/vedetta/levanto.stream/playlist.m3u8' },
  { id: 'mikkeli',    label: 'South-Eastern Finland University',        country: 'FI', tz: 'Europe/Helsinki',         url: 'https://cdn-008.whatsupcams.com/hls/si_ngorica03.m3u8' },
  { id: 'rouen',      label: 'University of Rouen',                    country: 'FR', tz: 'Europe/Paris',            url: 'https://cdn-007.whatsupcams.com/hls/hr_bol05.m3u8' },
  { id: 'karlsruhe',  label: 'University of Applied Sciences',         country: 'DE', tz: 'Europe/Berlin',           url: 'https://cdn-006.whatsupcams.com/hls/si_ngbevkovtrg.m3u8' },
  { id: 'lasi',       label: 'Gheorghe Asachi Technical University',   country: 'RO', tz: 'Europe/Bucharest',        url: 'https://cdn-002.whatsupcams.com/hls/hr_bol04.m3u8' },
  { id: 'sofia',      label: 'Medical University Sofia',               country: 'BG', tz: 'Europe/Sofia',            url: 'https://cdn-008.whatsupcams.com/hls/it_anterselva04.m3u8' },
  { id: 'oviedo',     label: 'University of Oviedo',                   country: 'ES', tz: 'Europe/Madrid',           url: 'https://cdn-005.whatsupcams.com/hls/it_palau05.m3u8' },
  { id: 'crete',      label: 'University of Crete',                    country: 'GR', tz: 'Europe/Athens',           url: '' },
];

/* ── Stazioni ospitanti ──────────────────────────
   Ogni chiave DEVE corrispondere a un id in CAMERAS.
   Selezionabile con ?host=<id>
   sponsors : lista sponsor visibili nella riga sponsor
     name  : nome testuale (fallback se no logo)
     logo  : percorso immagine
     url   : link al click (opzionale)
   ─────────────────────────────────────────────── */
const HOSTS = {
  uda: {
    name:     "Università D'Annunzio",
    subtitle: 'Chieti · Pescara',
    logo:     'https://www.unich.it/sites/default/files/logouda_bordooro_bis.png',
    sponsors: [
      { name: 'Regione Abruzzo', logo: 'sponsors/regione-abruzzo.png',  url: 'https://www.regione.abruzzo.it' },
      { name: 'Regione Abruzzo', logo: 'sponsors/provincia-chieti.png',  url: 'https://www.regione.abruzzo.it' },
      { name: 'Regione Abruzzo', logo: 'sponsors/provincia-pescara.png',  url: 'https://www.regione.abruzzo.it' },
      { name: 'Biblos',          logo: 'sponsors/logo-biblos.png',           url: 'https://www.bibloservice.com' },
      { name: 'B-Link',          logo: 'sponsors/logo-b-link.png',           url: 'https://www.b-link.it' },
    ],
  },
  cork: {
    name:     'Munster Technological University',
    subtitle: 'Cork, Ireland',
    logo:     'logos/cork.svg',
    sponsors: [],
  },
  skovde: {
    name:     'University of Skövde',
    subtitle: 'Skövde, Sweden',
    logo:     'logos/skovde.svg',
    sponsors: [],
  },
  mikkeli: {
    name:     'South-Eastern Finland University',
    subtitle: 'Mikkeli, Finland',
    logo:     'logos/mikkeli.svg',
    sponsors: [],
  },
  rouen: {
    name:     'University of Rouen',
    subtitle: 'Rouen, France',
    logo:     'logos/rouen.svg',
    sponsors: [],
  },
  karlsruhe: {
    name:     'University of Applied Sciences',
    subtitle: 'Karlsruhe, Germany',
    logo:     'logos/karlsruhe.svg',
    sponsors: [],
  },
  lasi: {
    name:     'Gheorghe Asachi Technical University',
    subtitle: 'Iași, Romania',
    logo:     'logos/lasi.svg',
    sponsors: [],
  },
  sofia: {
    name:     'Medical University Sofia',
    subtitle: 'Sofia, Bulgaria',
    logo:     'logos/sofia.svg',
    sponsors: [],
  },
  oviedo: {
    name:     'University of Oviedo',
    subtitle: 'Oviedo, Spain',
    logo:     'logos/oviedo.svg',
    sponsors: [],
  },
  crete: {
    name:     'University of Crete',
    subtitle: 'Heraklion, Greece',
    logo:     'logos/crete.svg',
    sponsors: [],
  },
};

/* ── Partner universitari ────────────────────────
   Ogni chiave DEVE corrispondere a un id in CAMERAS.
   logo : percorso o URL del logo da mostrare nell'header
   abbr : sigla di fallback se il logo non si carica
   city : etichetta sotto il logo
   ─────────────────────────────────────────────── */
const PARTNERS = {
  uda:       { logo: 'https://www.unich.it/sites/default/files/logouda_bordooro_bis.png', abbr: 'UDA',  city: "D'ANNUNZIO" },
  cork:      { logo: 'logos/mtu.svg',       abbr: 'MTU',  city: 'CORK'       },
  skovde:    { logo: 'logos/skovde.svg',     abbr: 'HiS',  city: 'SKÖVDE'     },
  mikkeli:   { logo: 'logos/xamk.svg',    abbr: 'SEF',  city: 'MIKKELI'    },
  rouen:     { logo: 'logos/rouen.svg',      abbr: 'URO',  city: 'ROUEN'      },
  karlsruhe: { logo: 'logos/karlsruhe.svg',  abbr: 'HKA',  city: 'KARLSRUHE'  },
  lasi:      { logo: 'logos/lasi.svg',       abbr: 'TUIA', city: 'IAȘI'       },
  sofia:     { logo: 'logos/sofia.svg',      abbr: 'MUS',  city: 'SOFIA'      },
  oviedo:    { logo: 'logos/oviedo.svg',     abbr: 'UOV',  city: 'OVIEDO'     },
  crete:     { logo: 'logos/crete.svg',      abbr: 'UOC',  city: 'CRETE'      },
};

/* ── Messaggi ticker footer ─────────────────────── */
const TICKER_MESSAGES = [
  'Benvenuti nella Rete UNIGATE — Connettere le università europee dal campus di Chieti · Pescara',
  'Progetto UNIGATE — Cooperazione accademica e mobilità internazionale',
  'Università degli Studi «G. d\'Annunzio» — Chieti · Pescara',
  'Rete UNIGATE: Cork · Skövde · Mikkeli · Rouen · Karlsruhe · Iași · Sofia · Oviedo · Crete',
];

/* ── Parametri layout ────────────────────────────
   DEFAULT_HOST       : stazione ospitante  (?host=)
   DEFAULT_THEME      : tema colori         (?theme=)
   DEFAULT_LAYOUT     : layout griglia      (?layout=)
   FOCUS_INTERVAL     : secondi per camera in modalità rotazione
   BG_PARTICLES       : numero di punti animati sullo sfondo (max ~150)
   SHOW_FOCUS_BAR        : mostra la barra di avanzamento in modalità focus
   SHOW_FOCUS_COUNTER    : mostra la cifra countdown in modalità focus
   SHOW_SPONSORS         : mostra la riga sponsor
   SPONSORS_LABEL_POS    : posizione label "SPONSOR" — 'top' | 'left'
   ─────────────────────────────────────────────── */
const DEFAULT_HOST       = 'uda';
const DEFAULT_THEME      = 'standard';
const DEFAULT_LAYOUT     = 'grid';
const FOCUS_INTERVAL     = 20;
const BG_PARTICLES       = 500;
const SHOW_FOCUS_BAR     = true;
const SHOW_FOCUS_COUNTER = true;
const SHOW_SPONSORS      = true;
const SPONSORS_LABEL_POS = 'top';   // 'top' | 'left'
const DEFAULT_LANG       = 'it';    // 'en' | 'it' | ... (vedi i18n.js)
