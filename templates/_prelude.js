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
 * Зависимости: pptxgenjs (обязательно), sharp (только для иконок и белого логотипа).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
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
  const p = new PptxGenJS();
  p.defineLayout({ name: 'TN16x9', width: W / 144, height: H / 144 });
  p.layout = 'TN16x9';
  p.author = meta.author || 'ТЕХНОНИКОЛЬ';
  p.company = 'ТЕХНОНИКОЛЬ';
  p.title = meta.title || 'Презентация';
  return p;
}

// ── Токены цвета (tokens/colors.css) ─────────────────────────────────────
const C = {
  white: '#ffffff',
  n10: '#f9f9fa', n15: '#f3f5f7', n20: '#e6e8ed', n30: '#c8ccd6',
  n40: '#abb0c1', n50: '#8890a7', n60: '#667387', n65: '#4e5867', n100: '#1e2228',
  red10: '#fdedee', red15: '#fbdbdd', red35: '#f49fa5', red60: '#e11b11', red65: '#ae1603',
  blue10: '#e6f2ff', blue60: '#006ee4', blue65: '#0055af',
  green10: '#dff6e8', green50: '#00a73b', green65: '#006624',
  orange10: '#ffeedc', orange45: '#f37e00', orange65: '#7e4b21',
  purple10: '#f3effd', purple60: '#7e62ba', purple65: '#604b8f',
  yellow10: '#fdf3ac', yellow50: '#b18b2b', yellow65: '#5f5819',
  // на красном фоне
  onRedDim: '#ffe4e2', onRedEyebrow: '#f9cccf', onRedMeta: '#ffd7d4',
};

/** Акценты по порядку. Первый — фирменный красный. */
const ACCENTS = [
  { key: 'red',    solid: C.red60,    tint: C.red10,    deep: C.red65 },
  { key: 'blue',   solid: C.blue60,   tint: C.blue10,   deep: C.blue65 },
  { key: 'green',  solid: C.green50,  tint: C.green10,  deep: C.green65 },
  { key: 'orange', solid: C.orange45, tint: C.orange10, deep: C.orange65 },
  { key: 'purple', solid: C.purple60, tint: C.purple10, deep: C.purple65 },
  { key: 'yellow', solid: C.yellow50, tint: C.yellow10, deep: C.yellow65 },
];
const accent = (i, name) => ACCENTS.find((a) => a.key === name) || ACCENTS[(i || 0) % ACCENTS.length];

// ── Типографика деки (крупнее UI-шкалы; px по макету 1920×1080) ──────────
const FONT = 'Inter';          // нет Inter у получателей → 'Arial'
const T = {
  display: 120,   // титул
  h1: 108,        // разделитель
  h2: 68,         // заголовок контентного слайда
  h3: 36,         // заголовок карточки
  h4: 30,         // заголовок строки
  lead: 32,       // лид-абзац под заголовком
  body: 28,
  small: 24,      // подписи в карточках
  caption: 22,    // колонтитул и сноски
  eyebrow: 28,    // надзаголовок капсом
  metric: 112,    // большая цифра
  quote: 60,
};

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
      color: hex(r.color || o.color || C.n100),
      fontSize: pt(r.size || o.size),
      italic: !!r.italic,
    },
  })), {
    x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h),
    isTextBox: true, margin: 0,
    fontFace: o.font || FONT, fontSize: pt(o.size),
    color: hex(o.color || C.n100), bold: !!o.bold,
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
  s.addShape(p.ShapeType.line, { x: px(o.x), y: px(o.y), w: px(o.w), h: 0, line: { color: hex(o.color || C.n20), width: o.width || 2 } });
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
        bold: p2.b, color: hex(o.color || C.n100), fontSize: pt(size),
        bullet: j === 0 ? { code: '2022', color: hex(o.bullet || C.red60) } : false,
        breakLine: j === parts.length - 1 && i < items.length - 1,
        paraSpaceAfter: j === parts.length - 1 ? pt(o.gap == null ? 16 : o.gap) : undefined,
      },
    }));
  }).flat();
  s.addText(runs, {
    x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h),
    isTextBox: true, margin: 0, fontFace: o.font || FONT, fontSize: pt(size),
    color: hex(o.color || C.n100), lineSpacing: pt(size * (o.lh || 1.4)), valign: 'top',
  });
}

/** Колонтитул контентного слайда: подпись слева, номер страницы справа. */
function footer(s, p, { label, no, total, rule = false }) {
  const y = H - MB - 30;
  if (rule) hline(s, p, { x: MX, y: y - 26, w: CW, color: C.n20, width: 2 });
  if (label) txt(s, label, { x: MX, y, w: CW - 320, h: 34, size: T.caption, color: C.n50 });
  if (no) {
    s.addText([
      { text: pad2(no), options: { bold: true, color: hex(C.n100), fontSize: pt(T.caption) } },
      { text: ` / ${total}`, options: { color: hex(C.n40), fontSize: pt(T.caption) } },
    ], { x: px(MX + CW - 320), y: px(y), w: px(320), h: px(34), isTextBox: true, margin: 0, align: 'right', fontFace: FONT });
  }
}

/** Низ контентной зоны: докуда можно рисовать, чтобы не налезть на колонтитул. */
const contentBottom = (hasFooter = true) => H - MB - (hasFooter ? FOOTER_H : 0);

/**
 * Шапка контентного слайда: надзаголовок, заголовок, лид.
 * Возвращает Y, с которого начинается контент.
 */
function header(s, { eyebrow, title, lead, accentColor = C.red60, w = CW, maxH = 200 }) {
  let y = MT;
  if (eyebrow) {
    txt(s, String(eyebrow).toUpperCase(), { x: MX, y, w, h: 34, size: T.eyebrow, bold: true, color: accentColor, spacing: 2 });
    y += 46;
  }
  if (title) {
    const f = fit(title, { w, h: maxH, size: T.h2, min: 40, bold: true, lh: 1.08 });
    const h = f.lines * f.size * 1.08;
    txt(s, title, { x: MX, y, w, h: h + 8, size: f.size, bold: true, color: C.n100, lh: 1.08 });
    y += h + (lead ? 20 : 40);
  }
  if (lead) {
    const lw = Math.min(w, 1360);
    const f = fit(lead, { w: lw, h: 140, size: T.lead, min: 24, lh: 1.4 });
    const h = f.lines * f.size * 1.4;
    txt(s, lead, { x: MX, y, w: lw, h: h + 6, size: f.size, color: C.n60, lh: 1.4 });
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
  const bg = rose ? '#fdf1f1' : C.n15, bd = rose ? C.red35 : C.n30, fg = rose ? '#c86a70' : C.n50;
  rect(s, p, { x: o.x, y: o.y, w: o.w, h: o.h, fill: bg, r: o.r == null ? 32 : o.r, line: { color: bd, width: 2, dash: 'dash' } });
  const note = o.note || `вставьте ${Math.round(o.w)}×${Math.round(o.h)}`;
  txt(s, 'Изображение', { x: o.x + 20, y: o.y + o.h / 2 - 40, w: o.w - 40, h: 40, size: 30, bold: true, color: fg, align: 'center' });
  txt(s, note, { x: o.x + 20, y: o.y + o.h / 2 + 4, w: o.w - 40, h: 40, size: 24, color: fg, align: 'center' });
  return false;
}

module.exports = {
  W, H, px, pt, MX, MT, MB, CW, FOOTER_H, newDeck,
  C, ACCENTS, accent, FONT, T, hex, NOLINE, pad2,
  lines, fit, blockH, txt, rect, ellipse, hline, bullets,
  footer, contentBottom, header,
  assetPath, icon, putIcon, logo, picture,
};
