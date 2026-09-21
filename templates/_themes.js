/**
 * Темы оформления.
 *
 * Тема — это значения токенов, шрифт и обложка. Макеты из templates/*.md
 * написаны на ролевых токенах (`C.bg`, `C.ink`, `C.onAccent`, …), поэтому один
 * и тот же сниппет собирается в любой теме без правок геометрии.
 *
 * Подключается прологом, напрямую его require не нужен:
 *   TN.useTheme('digital');
 *
 * Как добавить свою тему — см. themes/README.md.
 */
'use strict';

// ── Ролевые токены ───────────────────────────────────────────────────────
// Имя токена — это РОЛЬ, а не цвет. `bg` — фон слайда, каким бы он ни был;
// `ink` — основной текст. В тёмной теме `bg` тёмный, `ink` светлый.
//
//   bg          фон контентного слайда
//   surface     подложка карточки
//   surfaceAlt  чётная строка таблицы, второй фон
//   line        разделительная линия, сетка
//   lineStrong  рамка плейсхолдера
//   ink         основной текст и заголовки
//   muted       вторичный текст: лид, подписи
//   soft        колонтитул, сноски
//   faint       «/ 14» в нумерации, третьестепенное
//   accent      акцент №1 (в брендовой теме — фирменный красный)
//   accentDeep  затемнение акцента: декор на обложке
//   accentTint  подложка акцентного цвета
//   accentFill  заливка акцентного тона во весь экран: разделитель, тезис, финал
//   onAccentFill / ...Dim / ...Eye   текст на такой заливке
//   onAccent    текст и иконки на заливке акцентом (карточка, кружок, полоса)
//   onAccentDim вторичный текст на заливке акцентом
//   onAccentEye надзаголовок на заливке акцентом
//   deep        тёмная заливка: шапка таблицы, тёмный разделитель
//   deepSoft    тёмная заливка помягче: тёмная метрика
//   onDeep      текст на тёмной заливке
//   onDeepDim   вторичный текст на тёмной заливке
//   chip        плитка под иконкой на тёмной заливке
//   frame       корпус устройства в макете `image`
//
// Отдельно от акцентов тема задаёт семантику: `green` — улучшение,
// `red` — ухудшение. Их берут `tone: 'green'` в таблицах и диаграммах.
//   onCover*    текст на обложке (титул и финал)

/** Брендовая палитра ТЕХНОНИКОЛЬ — база остальных тем. */
const BRAND = {
  white: '#ffffff',
  n10: '#f9f9fa', n15: '#f3f5f7', n20: '#e6e8ed', n30: '#c8ccd6',
  n40: '#abb0c1', n50: '#8890a7', n60: '#667387', n65: '#4e5867', n100: '#1e2228',
  red10: '#fdedee', red15: '#fbdbdd', red35: '#f49fa5', red60: '#e11b11', red65: '#ae1603',
  blue10: '#e6f2ff', blue60: '#006ee4', blue65: '#0055af',
  green10: '#dff6e8', green50: '#00a73b', green65: '#006624',
  orange10: '#ffeedc', orange45: '#f37e00', orange65: '#7e4b21',
  purple10: '#f3effd', purple60: '#7e62ba', purple65: '#604b8f',
  yellow10: '#fdf3ac', yellow50: '#b18b2b', yellow65: '#5f5819',
  onRedDim: '#ffe4e2', onRedEyebrow: '#f9cccf', onRedMeta: '#ffd7d4',

  // роли
  bg: '#ffffff', surface: '#f3f5f7', surfaceAlt: '#f9f9fa',
  line: '#e6e8ed', lineStrong: '#c8ccd6',
  ink: '#1e2228', muted: '#667387', soft: '#8890a7', faint: '#abb0c1',
  accent: '#e11b11', accentDeep: '#ae1603', accentTint: '#fdedee',
  onAccent: '#ffffff', onAccentDim: '#ffe4e2', onAccentEye: '#f9cccf',
  accentFill: '#e11b11', onAccentFill: '#ffffff', onAccentFillDim: '#ffe4e2', onAccentFillEye: '#f9cccf',
  deep: '#1e2228', deepSoft: '#667387', onDeep: '#ffffff', onDeepDim: '#c8ccd6', chip: '#7f8a9b',
  frame: '#1e2228',
  onCoverInk: '#ffffff', onCoverDim: '#ffe4e2', onCoverEyebrow: '#f9cccf', onCoverMeta: '#ffd7d4',
};

/** Семантика «лучше / хуже». Берётся по `tone: 'green' | 'red'`. */
const BRAND_SEMANTIC = {
  green: { key: 'green', solid: '#00a73b', tint: '#dff6e8', deep: '#006624' },
  red:   { key: 'red',   solid: '#e11b11', tint: '#fdedee', deep: '#ae1603' },
};

const BRAND_ACCENTS = [
  { key: 'red',    solid: '#e11b11', tint: '#fdedee', deep: '#ae1603' },
  { key: 'blue',   solid: '#006ee4', tint: '#e6f2ff', deep: '#0055af' },
  { key: 'green',  solid: '#00a73b', tint: '#dff6e8', deep: '#006624' },
  { key: 'orange', solid: '#f37e00', tint: '#ffeedc', deep: '#7e4b21' },
  { key: 'purple', solid: '#7e62ba', tint: '#f3effd', deep: '#604b8f' },
  { key: 'yellow', solid: '#b18b2b', tint: '#fdf3ac', deep: '#5f5819' },
];

/** Шкала кеглей в px макета 1920×1080. */
const BRAND_TYPE = {
  display: 120, h1: 108, h2: 68, h3: 36, h4: 30,
  lead: 32, body: 28, small: 24, caption: 22, eyebrow: 28,
  metric: 112, quote: 60,
};

// ── TN Digital ───────────────────────────────────────────────────────────
// Источник: дека «Гильдия аналитиков TN Digital». Почти чёрный фон, градиент
// фиолетовый → голубой → мятный, Mulish, моноширинный надзаголовок.
const DIGITAL = Object.assign({}, BRAND, {
  n10: '#1a1b1f', n15: '#1b1c20', n20: '#2c2d33', n30: '#3a3c44',
  n40: '#6e727b', n50: '#8a8d94', n60: '#a8aab1', n65: '#c6c7cc', n100: '#fafaf8',
  red10: '#33243f', red15: '#3d2a4d', red35: '#7d5a99', red60: '#cc66ff', red65: '#9a2fd6',
  onRedDim: '#c6c7cc', onRedEyebrow: '#a8aab1', onRedMeta: '#a8aab1',

  bg: '#16171a', surface: '#1b1c20', surfaceAlt: '#1a1b1f',
  line: '#2c2d33', lineStrong: '#3a3c44',
  ink: '#fafaf8', muted: '#a8aab1', soft: '#8a8d94', faint: '#6e727b',
  accent: '#cc66ff', accentDeep: '#9a2fd6', accentTint: '#33243f',
  onAccent: '#16171a', onAccentDim: '#3b2b47', onAccentEye: '#4a3358',
  // разделитель во весь экран — глубокий фиолетовый, а не чистый акцент
  accentFill: '#2b1440', onAccentFill: '#fafaf8', onAccentFillDim: '#d3c2e0', onAccentFillEye: '#cc66ff',
  deep: '#0f1013', deepSoft: '#2d2e36', onDeep: '#fafaf8', onDeepDim: '#c6c7cc', chip: '#3a3c44',
  frame: '#2c2d33',
  onCoverInk: '#fafaf8', onCoverDim: '#c6c7cc', onCoverEyebrow: '#8a8d94', onCoverMeta: '#a8aab1',
});

// Акцентов три — это цвета фирменного градиента. Больше не выдумываем.
const DIGITAL_ACCENTS = [
  { key: 'purple', solid: '#cc66ff', tint: '#33243f', deep: '#e0a3ff' },
  { key: 'blue',   solid: '#00aeff', tint: '#122f3f', deep: '#7fd6ff' },
  { key: 'mint',   solid: '#8effba', tint: '#293c34', deep: '#b6ffd4' },
];

// Зелёного и красного в палитре Digital нет, а показывать динамику чем-то надо:
// «лучше» — мятный из градиента, «хуже» — розово-красный той же светлоты.
const DIGITAL_SEMANTIC = {
  green: { key: 'green', solid: '#8effba', tint: '#293c34', deep: '#b6ffd4' },
  red:   { key: 'red',   solid: '#ff6b81', tint: '#3a1d25', deep: '#ff9fb0' },
};

// ── TN Life Dark ─────────────────────────────────────────────────────────
// Источник: лендинг «TN Life — экосистема ТЕХНОНИКОЛЬ». Почти чёрный фон,
// коралловый акцент, Inter. Полупрозрачные токены лендинга сведены к сплошным
// цветам поверх фона #08080a.
const DARK = Object.assign({}, BRAND, {
  n10: '#0f0f11', n15: '#111113', n20: '#1c1c1e', n30: '#2b2b2c',
  n40: '#666667', n50: '#808082', n60: '#969698', n65: '#c4c4c6', n100: '#f4f4f5',
  red10: '#2f1315', red15: '#3a191c', red35: '#8e3740', red60: '#ff4e5b', red65: '#c93a45',
  onRedDim: '#ffe0e2', onRedEyebrow: '#ffc2c7', onRedMeta: '#ffd5d8',

  bg: '#08080a', surface: '#111113', surfaceAlt: '#0f0f11',
  line: '#1c1c1e', lineStrong: '#2b2b2c',
  ink: '#f4f4f5', muted: '#969698', soft: '#808082', faint: '#666667',
  accent: '#ff4e5b', accentDeep: '#c93a45', accentTint: '#2f1315',
  // на коралловом акценте текст тёмный: белый даёт всего 3,2 : 1
  onAccent: '#14060a', onAccentDim: '#3d1218', onAccentEye: '#4a161d',
  // но экран целиком коралловым не заливаем — в тёмной деке это слепит
  accentFill: '#1f0709', onAccentFill: '#f4f4f5', onAccentFillDim: '#e3c9cc', onAccentFillEye: '#ff4e5b',
  deep: '#101012', deepSoft: '#26262b', onDeep: '#f4f4f5', onDeepDim: '#c4c4c6', chip: '#2b2b2c',
  frame: '#1c1c1e',
  onCoverInk: '#f4f4f5', onCoverDim: '#c4c4c6', onCoverEyebrow: '#808082', onCoverMeta: '#969698',
});

const DARK_SEMANTIC = {
  green: { key: 'green', solid: '#5ef2a0', tint: '#0f2a1c', deep: '#a5f8ca' },
  red:   { key: 'red',   solid: '#ff4e5b', tint: '#2f1315', deep: '#ff8a93' },
};

const DARK_ACCENTS = [
  { key: 'coral',  solid: '#ff4e5b', tint: '#2f1315', deep: '#ff8a93' },
  { key: 'amber',  solid: '#ff8a66', tint: '#2f1d17', deep: '#ffb49c' },
  { key: 'pink',   solid: '#ff3c78', tint: '#2f101a', deep: '#ff86ab' },
];

// ── Темы ─────────────────────────────────────────────────────────────────
// cover.kind: 'accent' — заливка акцентом во всю плашку;
//             'ink'    — тёмная обложка со свечением.
// cover.pattern: 'circle' — декоративный круг; 'none' — чистый экран.
// bar — полоса-градиент по нижнему краю каждого слайда (идентичность Digital).

const THEMES = {
  brand: {
    key: 'brand',
    name: 'Брендовая ТЕХНОНИКОЛЬ',
    dark: false,
    font: 'Inter',
    mono: null,
    colors: BRAND,
    accents: BRAND_ACCENTS,
    semantic: BRAND_SEMANTIC,
    type: BRAND_TYPE,
    logo: 'logo-black-rus.png',
    cover: { kind: 'accent', pattern: 'circle' },
    bar: null,
  },

  division: {
    key: 'division',
    name: 'Подразделение',
    dark: false,
    font: 'Inter',
    mono: null,
    colors: BRAND,
    accents: BRAND_ACCENTS,
    semantic: BRAND_SEMANTIC,
    type: BRAND_TYPE,
    logo: 'logo-black-rus.png',
    // то же, что брендовая, но обложка — чистый цветной экран без паттерна
    cover: { kind: 'accent', pattern: 'none' },
    bar: null,
  },

  digital: {
    key: 'digital',
    name: 'TN Digital',
    dark: true,
    font: 'Mulish',
    mono: 'JetBrains Mono',
    colors: DIGITAL,
    accents: DIGITAL_ACCENTS,
    semantic: DIGITAL_SEMANTIC,
    // Крупные кегли — свои: они подбираются fit()-ом и всегда укладываются.
    // Основной текст (body, small, h3, h4) остаётся брендовым: под него
    // выверена геометрия карточек, и увеличение кегля ломает вёрстку.
    type: Object.assign({}, BRAND_TYPE, {
      display: 112, h1: 96, h2: 66, caption: 24, eyebrow: 24, quote: 58,
    }),
    logo: 'logo-black-rus.png',
    cover: {
      kind: 'ink',
      mark: 620,
      glow: [
        { x: 0.88, y: 0.50, r: 0.62, color: '#cc66ff', alpha: 0.30 },
        { x: 1.00, y: 0.88, r: 0.45, color: '#8effba', alpha: 0.20 },
        { x: 0.72, y: 0.20, r: 0.40, color: '#00aeff', alpha: 0.18 },
      ],
    },
    bar: { h: 6, stops: ['#cc66ff', '#00aeff', '#8effba'] },
  },

  dark: {
    key: 'dark',
    name: 'TN Life Dark',
    dark: true,
    font: 'Inter',
    mono: null,
    colors: DARK,
    accents: DARK_ACCENTS,
    semantic: DARK_SEMANTIC,
    type: BRAND_TYPE,
    logo: 'logo-black-rus.png',
    cover: {
      kind: 'ink',
      mark: false,
      glow: [
        { x: 0.86, y: 0.28, r: 0.52, color: '#ff4e5b', alpha: 0.50 },
        { x: 0.98, y: 0.78, r: 0.40, color: '#ff8a66', alpha: 0.38 },
        { x: 0.58, y: 1.02, r: 0.38, color: '#ff3c78', alpha: 0.30 },
      ],
    },
    bar: { h: 6, stops: ['#ff4e5b', '#ff8a66'] },
  },
};

module.exports = { THEMES, BRAND, BRAND_ACCENTS, BRAND_TYPE };
