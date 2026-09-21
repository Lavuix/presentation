/**
 * Пролог сборки презентации ТЕХНОНИКОЛЬ.
 *
 * Это НЕ сборщик: он ничего не знает про слайды и не принимает описание деки.
 * Здесь только примитивы — холст, токены и обёртки над pptxgenjs, — чтобы
 * сниппеты макетов из templates/*.md были короткими и совпадали по геометрии.
 *
 * Вставь этот файл в начало своего скрипта сборки (или `require` его),
 * дальше пиши слайды сниппетами из шаблонов.
 *
 * Оформление задаётся темой (`templates/_themes.js`): тема меняет значения
 * токенов, шрифт и обложку, геометрия макетов остаётся прежней.
 *   const p = TN.newDeck({ title: 'Дека', theme: 'digital' });
 *   await TN.prepare();   // фоновая графика темы, если она есть
 *
 * Зависимости: pptxgenjs (обязательно), sharp (только для иконок и белого логотипа).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { THEMES } = require('./_themes');
let sharp = null;
try { sharp = require('sharp'); } catch (_) {}

// ── Холст ────────────────────────────────────────────────────────────────
// Все координаты в сниппетах — в пикселях макета 1920×1080.
// px() переводит их в дюймы (144 px = 1 дюйм), pt() — кегль (2 px = 1 pt).
const W = 1920, H = 1080;
const px = (n) => n / 144;
const pt = (n) => n / 2;

const MX = 88;                 // боковое поле
const MT = 72;                 // верхнее поле
const MB = 72;                 // нижнее поле
const CW = W - MX * 2;         // 1744 — ширина колонки контента
const FOOTER_H = 60;           // зона колонтитула снизу

function newDeck(meta = {}) {
  if (meta.theme) useTheme(meta.theme);
  const p = new PptxGenJS();
  p.defineLayout({ name: 'TN16x9', width: W / 144, height: H / 144 });
  p.layout = 'TN16x9';
  p.author = meta.author || 'ТЕХНОНИКОЛЬ';
  p.company = 'ТЕХНОНИКОЛЬ';
  p.title = meta.title || 'Презентация';

  // Фон слайда по теме — чтобы в тёмной теме не осталось белых слайдов там,
  // где сниппет фон не задаёт. Сниппет всегда может переопределить его сам.
  const add = p.addSlide.bind(p);
  p.addSlide = (...a) => {
    const s = add(...a);
    s.background = { color: hex(C.bg) };
    return s;
  };
  return p;
}

// ── Тема ─────────────────────────────────────────────────────────────────
// Значения токенов живут в теме. `C`, `ACCENTS` и `T` — те же объекты на всём
// протяжении сборки: useTheme() переписывает их содержимое, а не подменяет
// ссылку, поэтому деструктуризация `const { C, T } = TN` продолжает работать.

let ACTIVE = THEMES.brand;
const _art = new Map();        // сгенерированная графика темы: свечение, полоса, знак

/** Токены цвета активной темы. Имя токена — роль, а не цвет (см. _themes.js). */
const C = Object.assign({}, ACTIVE.colors);

/** Акценты активной темы. Первый — основной. */
const ACCENTS = ACTIVE.accents.map((a) => Object.assign({}, a));
/**
 * Акцент по индексу элемента или по имени. Имена `green` и `red` — семантика
 * «лучше / хуже»: в темах, где таких акцентов нет, они берутся из `semantic`,
 * иначе положительная динамика красилась бы случайным цветом.
 */
const accent = (i, name) => (name && (ACCENTS.find((a) => a.key === name) || (ACTIVE.semantic || {})[name]))
  || ACCENTS[(i || 0) % ACCENTS.length];

/** Шкала кеглей активной темы (px по макету 1920×1080). */
const T = Object.assign({}, ACTIVE.type);

let FONT = ACTIVE.font;        // нет шрифта у получателей → замени на 'Arial'
let MONO = ACTIVE.mono;        // моноширинный для надзаголовков, может быть null

/** Активная тема целиком: имя, обложка, полоса, флаг тёмной. */
const theme = () => ACTIVE;

/**
 * Переключает тему. Вызывается до первого слайда — обычно через
 * `TN.newDeck({ theme: 'digital' })`.
 */
function useTheme(key) {
  const th = key && typeof key === 'object' ? key : THEMES[key];
  if (!th) {
    console.warn(`  ! нет темы «${key}»; доступны: ${Object.keys(THEMES).join(', ')}`);
    return ACTIVE;
  }
  ACTIVE = th;
  for (const k of Object.keys(C)) delete C[k];
  Object.assign(C, th.colors);
  ACCENTS.length = 0;
  for (const a of th.accents) ACCENTS.push(Object.assign({}, a));
  for (const k of Object.keys(T)) delete T[k];
  Object.assign(T, th.type);
  FONT = th.font;
  MONO = th.mono;
  _art.clear();
  return th;
}

const hex = (c) => String(c || '').replace('#', '').toUpperCase();
const NOLINE = { width: 0, color: 'FFFFFF', transparency: 100 };
const pad2 = (n) => String(n).padStart(2, '0');

// ── Подгонка кегля ───────────────────────────────────────────────────────
// Средняя ширина символа Inter в долях кегля. Оценка грубая, но её хватает,
// чтобы заголовок не вылез за рамку.
const CHAR_W = (bold) => (bold ? 0.545 : 0.515);

function lines(text, widthPx, sizePx, bold) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const max = Math.max(1, Math.floor(widthPx / (sizePx * CHAR_W(bold))));
  let n = 1, len = 0;
  for (const w of words) {
    const add = len ? w.length + 1 : w.length;
    if (len + add > max && len > 0) { n += 1; len = w.length; } else { len += add; }
  }
  return n;
}

/** Уменьшает кегль, пока текст не уляжется в рамку. → { size, lines } */
function fit(text, { w, h, size, min = 16, bold = false, lh = 1.1 }) {
  let s = size;
  while (s > min) {
    const n = lines(text, w, s, bold);
    if (n * s * lh <= h) return { size: s, lines: n };
    s -= 2;
  }
  return { size: min, lines: lines(text, w, min, bold) };
}

/** Высота блока текста при заданном кегле. */
const blockH = (text, w, size, bold, lh = 1.3) => lines(text, w, size, bold) * size * lh;

// ── Примитивы ────────────────────────────────────────────────────────────

/**
 * Текстовый блок. margin: 0 — обязательно, иначе PowerPoint добавляет
 * внутренние поля и текст перестаёт совпадать с фигурами по координатам.
 * body: строка или массив ранов [{ text, bold, color, size }].
 */
function txt(s, body, o) {
  const runs = Array.isArray(body) ? body : [{ text: String(body == null ? '' : body) }];
  s.addText(runs.map((r) => ({
    text: r.text,
    options: {
      bold: r.bold != null ? r.bold : !!o.bold,
      color: hex(r.color || o.color || C.ink),
      fontSize: pt(r.size || o.size),
      italic: !!r.italic,
    },
  })), {
    x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h),
    isTextBox: true, margin: 0,
    fontFace: o.font || FONT, fontSize: pt(o.size),
    color: hex(o.color || C.ink), bold: !!o.bold,
    align: o.align || 'left', valign: o.valign || 'top',
    lineSpacing: pt(o.size * (o.lh || 1.25)),
    charSpacing: o.spacing,
  });
}

function rect(s, p, o) {
  const opt = {
    x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h),
    fill: o.fill ? { color: hex(o.fill), ...(o.transparency ? { transparency: o.transparency } : {}) }
                 : { color: 'FFFFFF', transparency: 100 },
    line: o.line ? { color: hex(o.line.color), width: o.line.width || 2, dashType: o.line.dash } : NOLINE,
  };
  if (o.r) { opt.rectRadius = px(o.r); return s.addShape(p.ShapeType.roundRect, opt); }
  return s.addShape(p.ShapeType.rect, opt);
}

function ellipse(s, p, o) {
  s.addShape(p.ShapeType.ellipse, {
    x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h),
    fill: { color: hex(o.fill), ...(o.transparency ? { transparency: o.transparency } : {}) },
    line: NOLINE,
  });
}

function hline(s, p, o) {
  s.addShape(p.ShapeType.line, { x: px(o.x), y: px(o.y), w: px(o.w), h: 0, line: { color: hex(o.color || C.line), width: o.width || 2 } });
}

/**
 * Маркированный список. Один элемент — один абзац, без литеральных «•».
 * items: [ "строка" | { title, text } ]
 */
function bullets(s, items, o) {
  const size = o.size || T.body;
  const runs = items.map((it, i) => {
    const obj = it && typeof it === 'object';
    const parts = [];
    if (obj && it.title) parts.push({ t: it.title + (it.text ? ' — ' : ''), b: true });
    if (obj ? it.text : true) parts.push({ t: obj ? it.text : String(it), b: false });
    return parts.map((p2, j) => ({
      text: p2.t,
      options: {
        bold: p2.b, color: hex(o.color || C.ink), fontSize: pt(size),
        bullet: j === 0 ? { code: '2022', color: hex(o.bullet || C.accent) } : false,
        breakLine: j === parts.length - 1 && i < items.length - 1,
        paraSpaceAfter: j === parts.length - 1 ? pt(o.gap == null ? 16 : o.gap) : undefined,
      },
    }));
  }).flat();
  s.addText(runs, {
    x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h),
    isTextBox: true, margin: 0, fontFace: o.font || FONT, fontSize: pt(size),
    color: hex(o.color || C.ink), lineSpacing: pt(size * (o.lh || 1.4)), valign: 'top',
  });
}

/** Колонтитул контентного слайда: подпись слева, номер страницы справа. */
function footer(s, p, { label, no, total, rule = false }) {
  edgeBar(s, p);
  const y = H - MB - 30;
  if (rule) hline(s, p, { x: MX, y: y - 26, w: CW, color: C.n20, width: 2 });
  if (label) txt(s, label, { x: MX, y, w: CW - 320, h: 34, size: T.caption, color: C.soft, font: MONO || FONT });
  if (no) {
    s.addText([
      { text: pad2(no), options: { bold: true, color: hex(C.ink), fontSize: pt(T.caption) } },
      { text: ` / ${total}`, options: { color: hex(C.faint), fontSize: pt(T.caption) } },
    ], { x: px(MX + CW - 320), y: px(y), w: px(320), h: px(34), isTextBox: true, margin: 0, align: 'right', fontFace: MONO || FONT });
  }
}

/** Низ контентной зоны: докуда можно рисовать, чтобы не налезть на колонтитул. */
const contentBottom = (hasFooter = true) => H - MB - (hasFooter ? FOOTER_H : 0);

/**
 * Шапка контентного слайда: надзаголовок, заголовок, лид.
 * Возвращает Y, с которого начинается контент.
 */
function header(s, { eyebrow, title, lead, accentColor, w = CW, maxH = 200 }) {
  accentColor = accentColor || C.accent;
  let y = MT;
  if (eyebrow) {
    txt(s, String(eyebrow).toUpperCase(), { x: MX, y, w, h: 34, size: T.eyebrow, bold: true, color: accentColor, spacing: 2, font: MONO || FONT });
    y += 46;
  }
  if (title) {
    const f = fit(title, { w, h: maxH, size: T.h2, min: 40, bold: true, lh: 1.08 });
    const h = f.lines * f.size * 1.08;
    txt(s, title, { x: MX, y, w, h: h + 8, size: f.size, bold: true, color: C.ink, lh: 1.08 });
    y += h + (lead ? 20 : 40);
  }
  if (lead) {
    const lw = Math.min(w, 1360);
    const f = fit(lead, { w: lw, h: 140, size: T.lead, min: 24, lh: 1.4 });
    const h = f.lines * f.size * 1.4;
    txt(s, lead, { x: MX, y, w: lw, h: h + 6, size: f.size, color: C.muted, lh: 1.4 });
    y += h + 44;
  }
  return y;
}

// ── Ассеты ───────────────────────────────────────────────────────────────
const ASSETS = path.join(__dirname, '..', 'assets');
let _sprite = null;
const _cache = new Map();

const assetPath = (name) => {
  for (const p2 of [name, path.join(ASSETS, name)]) { try { if (fs.statSync(p2).isFile()) return p2; } catch (_) {} }
  return null;
};

/** Иконка из спрайта ТН → data-URL PNG нужного цвета. Имена: assets/icon-names.json */
async function icon(name, color, sizePx) {
  if (!name || !sharp) return null;
  const key = `${name}|${color}|${sizePx}`;
  if (_cache.has(key)) return _cache.get(key);
  if (_sprite === null) { const f = assetPath('tn-icons-sprite.svg'); _sprite = f ? fs.readFileSync(f, 'utf8') : ''; }
  const m = _sprite.match(new RegExp(`<symbol id="icon--${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"([^>]*)>([\\s\\S]*?)</symbol>`));
  if (!m) { console.warn(`  ! нет иконки «${name}» в спрайте`); return null; }
  const vb = (m[1].match(/viewBox="([^"]+)"/) || [, '0 0 24 24'])[1];
  const side = Math.max(64, Math.round(sizePx * 3));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${side}" height="${side}">${m[2].replace(/currentColor/g, color)}</svg>`;
  let out = null;
  try { out = 'image/png;base64,' + (await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64'); } catch (_) {}
  _cache.set(key, out);
  return out;
}

/** Ставит иконку на слайд. Молча пропускает, если иконки нет. */
async function putIcon(s, name, color, o) {
  const d = await icon(name, color, o.w);
  if (d) s.addImage({ data: d, x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h || o.w) });
  return !!d;
}

/** Логотип. mode 'white' — перекрасить в белый для тёмного фона. */
async function logo(file, mode) {
  const f = assetPath(file || 'logo-black-rus.png');
  if (!f) return null;
  if (mode !== 'white' || !sharp) return { path: f };
  const key = `logo|${f}`;
  if (_cache.has(key)) return _cache.get(key);
  let out = { path: f };
  try {
    const { width, height } = await sharp(f).metadata();
    const alpha = await sharp(f).ensureAlpha().extractChannel('alpha').raw().toBuffer();
    const buf = await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
      .joinChannel(alpha, { raw: { width, height, channels: 1 } }).png().toBuffer();
    out = { data: 'image/png;base64,' + buf.toString('base64') };
  } catch (_) {}
  _cache.set(key, out);
  return out;
}

/** Картинка, а если файла нет — пунктирный плейсхолдер с точным размером. */
function picture(s, p, o) {
  const f = o.image ? assetPath(o.image) : null;
  if (f) {
    s.addImage({ path: f, x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h), sizing: { type: o.sizing || 'cover', w: px(o.w), h: px(o.h) } });
    return true;
  }
  const rose = o.tone === 'rose';
  const bg = rose ? C.accentTint : C.surface, bd = rose ? C.red35 : C.lineStrong, fg = rose ? C.red35 : C.soft;
  rect(s, p, { x: o.x, y: o.y, w: o.w, h: o.h, fill: bg, r: o.r == null ? 32 : o.r, line: { color: bd, width: 2, dash: 'dash' } });
  const note = o.note || `вставьте ${Math.round(o.w)}×${Math.round(o.h)}`;
  txt(s, 'Изображение', { x: o.x + 20, y: o.y + o.h / 2 - 40, w: o.w - 40, h: 40, size: 30, bold: true, color: fg, align: 'center' });
  txt(s, note, { x: o.x + 20, y: o.y + o.h / 2 + 4, w: o.w - 40, h: 40, size: 24, color: fg, align: 'center' });
  return false;
}


// ── Графика темы ─────────────────────────────────────────────────────────
// Тёмные темы держатся на свечении и градиенте, а в PPTX градиентной заливки
// нет. Поэтому фоновые слои рисуются один раз в PNG (через sharp) и ставятся
// картинкой. Нет sharp — слои просто не рисуются, дека собирается без них.

async function _png(svg, key) {
  if (!sharp) return null;
  if (key && _art.has(key)) return _art.get(key);
  let out = null;
  try { out = 'image/png;base64,' + (await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64'); }
  catch (_) {}
  if (key) _art.set(key, out);
  return out;
}

/** Слой свечения на всю плашку: радиальные пятна темы по прозрачному фону. */
async function glowLayer() {
  const g = ACTIVE.cover && ACTIVE.cover.glow;
  if (!g || !g.length) return null;
  const w = 960, h = 540;   // половина макета: пятна размытые, деталей нет
  const defs = g.map((it, i) => `<radialGradient id="g${i}" cx="${it.x * 100}%" cy="${it.y * 100}%" r="${it.r * 100}%">` +
    `<stop offset="0" stop-color="${it.color}" stop-opacity="${it.alpha}"/>` +
    `<stop offset="1" stop-color="${it.color}" stop-opacity="0"/></radialGradient>`).join('');
  const rects = g.map((_, i) => `<rect width="${w}" height="${h}" fill="url(#g${i})"/>`).join('');
  return _png(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>${defs}</defs>${rects}</svg>`, `glow|${ACTIVE.key}`);
}

/** Полоса-градиент по нижнему краю слайда. */
async function barImage() {
  const b = ACTIVE.bar;
  if (!b) return null;
  const w = 960, h = Math.max(2, b.h);
  const stops = b.stops.map((c, i) => `<stop offset="${(i / (b.stops.length - 1) * 100).toFixed(0)}%" stop-color="${c}"/>`).join('');
  return _png(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="b" x1="0" y1="0" x2="${w}" y2="0" gradientUnits="userSpaceOnUse">${stops}</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#b)"/></svg>`, `bar|${ACTIVE.key}`);
}

/** Знак темы: шестиугольник-сеть TN Digital. */
async function markImage(side) {
  if (!side) side = typeof (ACTIVE.cover || {}).mark === 'number' ? ACTIVE.cover.mark : 760;
  const b = ACTIVE.bar;
  if (!(ACTIVE.cover && ACTIVE.cover.mark) || !b) return null;
  const stops = b.stops.map((c, i) => `<stop offset="${(i / (b.stops.length - 1) * 100).toFixed(0)}%" stop-color="${c}"/>`).join('');
  const nodes = [[50, 8], [88, 29], [88, 71], [50, 92], [12, 71], [12, 29]]
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="4.4" fill="${ACTIVE.colors.bg}" stroke="url(#m)" stroke-width="0.9"/>`).join('');
  return _png(`<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="-6 -6 112 112">` +
    `<defs><linearGradient id="m" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">${stops}</linearGradient></defs>` +
    `<g fill="none" stroke="url(#m)" stroke-width="0.7" stroke-linejoin="round">` +
    `<path d="M50 8 L88 29 L88 71 L50 92 L12 71 L12 29 Z"/><path d="M50 50 L50 8 M50 50 L88 71 M50 50 L12 71"/></g>` +
    `${nodes}<circle cx="50" cy="50" r="4.6" fill="url(#m)"/></svg>`, `mark|${ACTIVE.key}|${side}`);
}

/**
 * Готовит графику темы до сборки слайдов. Вызывай сразу после newDeck():
 * без этого колонтитул нарисует полосу сплошным цветом вместо градиента.
 */
async function prepare() {
  await Promise.all([glowLayer(), barImage(), markImage()]);
  return ACTIVE;
}

/** Полоса темы по нижнему краю. Ставится колонтитулом на каждый слайд. */
function edgeBar(s, p) {
  const b = ACTIVE.bar;
  if (!b) return false;
  const img = _art.get(`bar|${ACTIVE.key}`);
  if (img) s.addImage({ data: img, x: 0, y: px(H - b.h), w: px(W), h: px(b.h) });
  else rect(s, p, { x: 0, y: H - b.h, w: W, h: b.h, fill: b.stops[0] });
  return true;
}

/**
 * Фон обложки (титул и финал) по активной теме.
 *   'accent' — заливка акцентом во всю плашку, с паттерном или без;
 *   'ink'    — тёмный фон со свечением, знаком и полосой.
 * accentColor — заливка под конкретное подразделение (тема `division`).
 */
async function coverBg(s, p, d = {}) {
  const cv = ACTIVE.cover || {};
  if (cv.kind === 'ink') {
    s.background = { color: hex(C.bg) };
    const glow = await glowLayer();
    if (glow) s.addImage({ data: glow, x: 0, y: 0, w: px(W), h: px(H) });
    if (cv.mark) {
      const side = typeof cv.mark === 'number' ? cv.mark : 760;
      const mk = await markImage(side);
      if (mk) s.addImage({ data: mk, x: px(W - side - 110), y: px((H - side) / 2), w: px(side), h: px(side) });
    }
    edgeBar(s, p);
    return 'ink';
  }
  const fill = d.accentColor || C.accent;
  s.background = { color: hex(fill) };
  if (cv.pattern === 'circle') ellipse(s, p, { x: 1240, y: -220, w: 900, h: 900, fill: C.accentDeep, transparency: 65 });
  edgeBar(s, p);
  return 'accent';
}

/** Цвета текста на обложке активной темы. */
const coverInk = () => ({
  title: C.onCoverInk, lead: C.onCoverDim,
  eyebrow: C.onCoverEyebrow, meta: C.onCoverMeta,
});

module.exports = {
  W, H, px, pt, MX, MT, MB, CW, FOOTER_H, newDeck,
  C, ACCENTS, accent, T, hex, NOLINE, pad2,
  THEMES, theme, useTheme, prepare, coverBg, coverInk, edgeBar,
  glowLayer, barImage, markImage,
  lines, fit, blockH, txt, rect, ellipse, hline, bullets,
  footer, contentBottom, header,
  assetPath, icon, putIcon, logo, picture,
};

// FONT и MONO меняются вместе с темой, поэтому экспортируются геттерами:
// обычное поле замёрзло бы на значении темы, активной в момент загрузки.
Object.defineProperty(module.exports, 'FONT', { enumerable: true, get: () => FONT });
Object.defineProperty(module.exports, 'MONO', { enumerable: true, get: () => MONO });
