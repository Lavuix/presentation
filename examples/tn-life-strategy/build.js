/**
 * Пример сборки деки ТЕХНОНИКОЛЬ. 17 слайдов — по одному на каждый макет.
 *
 *   npm install pptxgenjs sharp
 *   node examples/tn-life-strategy/build.js
 *
 * Каждая функция ниже — это сниппет из templates/*.md, вставленный как есть.
 * Так и собирается дека: копируешь нужные сниппеты, подставляешь свой контент.
 * Содержание здесь вымышленное, оно нужно только чтобы показать макеты.
 */
'use strict';

const path = require('path');
const TN = require('../../templates/_prelude');
const { C, T, MX, MT, MB, CW, W, H, px } = TN;

const FOOTER = 'TN Life · Стратегия продукта 2026';
let no = 0;                               // сквозной номер контентного слайда
const TOTAL = 13;                         // столько слайдов с колонтитулом
const chrome = (s, p) => TN.footer(s, p, { label: FOOTER, no: ++no, total: TOTAL });

// ─────────────────────────────────────────────────────────── title ──
async function title(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(C.red60) };
  TN.ellipse(s, p, { x: 1240, y: -220, w: 900, h: 900, fill: C.red65, transparency: 65 });

  const lg = await TN.logo(d.logo || 'logo-black-rus.png', 'white');
  if (lg) s.addImage({ ...lg, x: px(MX), y: px(MT), w: px(426), h: px(72), sizing: { type: 'contain', w: px(426), h: px(72) } });

  const metaY = H - MB - 44;
  const bottom = metaY - 56;
  const ft = TN.fit(d.title, { w: 1380, h: 400, size: T.display, min: 68, bold: true, lh: 1.04 });
  const th = ft.lines * ft.size * 1.04;
  const fl = d.lead ? TN.fit(d.lead, { w: 1180, h: 160, size: 38, min: 26, lh: 1.35 }) : null;
  const lh = fl ? fl.lines * fl.size * 1.35 + 34 : 0;

  let y = Math.max(MT + 120, bottom - ((d.eyebrow ? 60 : 0) + th + lh));
  if (d.eyebrow) { TN.txt(s, d.eyebrow, { x: MX, y, w: 1400, h: 44, size: 32, bold: true, color: C.onRedEyebrow }); y += 60; }
  TN.txt(s, d.title, { x: MX, y, w: 1380, h: th + 10, size: ft.size, bold: true, color: C.white, lh: 1.04 });
  y += th + 34;
  if (fl) TN.txt(s, d.lead, { x: MX, y, w: 1180, h: fl.lines * fl.size * 1.35 + 8, size: fl.size, color: C.onRedDim, lh: 1.35 });

  if (d.left) TN.txt(s, d.left, { x: MX, y: metaY, w: 1000, h: 44, size: 28, bold: true, color: C.white });
  if (d.right) TN.txt(s, d.right, { x: MX + CW - 700, y: metaY, w: 700, h: 44, size: 28, color: C.onRedMeta, align: 'right' });
  if (d.notes) s.addNotes(d.notes);
}

// ───────────────────────────────────────────────────────── section ──
function section(p, d) {
  const s = p.addSlide();
  const tone = d.tone || 'red';
  s.background = { color: TN.hex(tone === 'dark' ? C.n100 : tone === 'light' ? C.n15 : C.red60) };
  const onDark = tone !== 'light';

  const hasArt = 'image' in d;
  const tw = hasArt ? Math.round(W * 0.56) : W;
  if (hasArt) TN.picture(s, p, { x: tw, y: 0, w: W - tw, h: H, image: d.image, r: 0, note: `${W - tw}×${H}, кадр вертикальный` });

  const pw = tw - MX - (hasArt ? 72 : 488);
  const eyebrow = d.eyebrow || (d.number ? `Раздел ${TN.pad2(d.number)}` : null);
  const ft = TN.fit(d.title, { w: pw, h: 380, size: T.h1, min: 62, bold: true, lh: 1.05 });
  const th = ft.lines * ft.size * 1.05;
  const lw = Math.min(pw, 900);
  const lh = d.lead ? TN.blockH(d.lead, lw, 36, false, 1.4) + 44 : 0;

  let y = Math.max(MT, (H - ((eyebrow ? 76 : 0) + th + lh)) / 2);
  if (eyebrow) {
    TN.txt(s, String(eyebrow).toUpperCase(), { x: MX, y, w: pw, h: 44, size: 30, bold: true, spacing: 3,
      color: tone === 'red' ? '#ffd2d0' : tone === 'dark' ? C.n40 : C.red60 });
    y += 76;
  }
  TN.txt(s, d.title, { x: MX, y, w: pw, h: th + 10, size: ft.size, bold: true, color: onDark ? C.white : C.n100, lh: 1.05 });
  y += th + 44;
  if (d.lead) TN.txt(s, d.lead, { x: MX, y, w: lw, h: lh, size: 36, lh: 1.4,
    color: tone === 'red' ? C.onRedDim : tone === 'dark' ? C.n40 : C.n60 });
}

// ─────────────────────────────────────────────────────── statement ──
function statement(p, d) {
  const s = p.addSlide();
  const tone = d.tone || 'red';
  s.background = { color: TN.hex(tone === 'dark' ? C.n100 : tone === 'light' ? C.white : C.red60) };
  if (tone === 'red') TN.ellipse(s, p, { x: -260, y: 620, w: 760, h: 760, fill: C.red65, transparency: 70 });

  const w = 1520, x = (W - w) / 2;
  const ft = TN.fit(d.text, { w, h: 560, size: 88, min: 46, bold: true, lh: 1.14 });
  const th = ft.lines * ft.size * 1.14;
  let y = (H - th - (d.author || d.note ? 120 : 0)) / 2;
  TN.txt(s, d.text, { x, y, w, h: th + 12, size: ft.size, bold: true, align: 'center', lh: 1.14,
    color: tone === 'light' ? C.n100 : C.white });
  y += th + 48;
  if (d.author) TN.txt(s, d.author, { x, y, w, h: 44, size: 30, bold: true, align: 'center', color: tone === 'light' ? C.n100 : C.white });
  if (d.note) TN.txt(s, d.note, { x, y: y + (d.author ? 46 : 0), w, h: 44, size: 26, align: 'center',
    color: tone === 'light' ? C.n60 : tone === 'red' ? C.onRedMeta : C.n40 });
}

// ───────────────────────────────────────────────────────── closing ──
async function closing(p, d) {
  const s = p.addSlide();
  const tone = d.tone || 'light';
  const onDark = tone !== 'light';
  s.background = { color: TN.hex(tone === 'red' ? C.red60 : tone === 'dark' ? C.n100 : C.n15) };
  if (tone === 'red') TN.ellipse(s, p, { x: 1280, y: 560, w: 880, h: 880, fill: C.red65, transparency: 65 });

  const t = d.title || 'Спасибо за внимание';
  const ft = TN.fit(t, { w: 1300, h: 260, size: 104, min: 56, bold: true, lh: 1.08 });
  const th = ft.lines * ft.size * 1.08;
  let y = 300;
  TN.txt(s, t, { x: MX, y, w: 1300, h: th + 10, size: ft.size, bold: true, lh: 1.08, color: onDark ? C.white : C.n100 });
  y += th + 32;
  if (d.lead) {
    const h = TN.blockH(d.lead, 1080, T.lead, false, 1.4);
    TN.txt(s, d.lead, { x: MX, y, w: 1080, h: h + 8, size: T.lead, lh: 1.4, color: onDark ? C.onRedDim : C.n60 });
    y += h + 56;
  } else y += 24;

  const contacts = (d.contacts || []).slice(0, 4);
  const step = Math.min(440, Math.floor(CW / Math.max(contacts.length, 1)));
  contacts.forEach((it, i) => {
    TN.txt(s, it.label, { x: MX + i * step, y, w: 420, h: 34, size: 22, bold: true, spacing: 2, color: onDark ? '#ffc9c6' : C.n50 });
    TN.txt(s, it.value, { x: MX + i * step, y: y + 38, w: 420, h: 44, size: 28, bold: true, color: onDark ? C.white : C.n100 });
  });

  const lg = await TN.logo(d.logo || 'logo-black-rus.png', onDark ? 'white' : 'dark');
  if (lg) s.addImage({ ...lg, x: px(MX), y: px(H - MB - 72), w: px(380), h: px(64), sizing: { type: 'contain', w: px(380), h: px(64) } });
}

// ────────────────────────────────────────────────────────── agenda ──
function agenda(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(C.white) };
  const y0 = TN.header(s, d);

  const items = d.items;
  const cols = d.columns || (items.length > 5 ? 2 : 1);
  const gap = 72, colW = Math.floor((CW - gap * (cols - 1)) / cols);
  const rows = Math.ceil(items.length / cols);
  const avail = TN.contentBottom() - y0;
  const rowH = Math.max(96, Math.min(168, Math.floor(avail / rows)));
  const top = y0 + Math.max(0, (avail - rowH * rows) / 2);

  items.forEach((it, i) => {
    const a = TN.accent(i, it.tone);
    const x = MX + (i % cols) * (colW + gap);
    const y = top + Math.floor(i / cols) * rowH;
    TN.txt(s, TN.pad2(it.number || i + 1), { x, y: y + 2, w: 70, h: 44, size: 32, bold: true, color: a.solid });
    TN.txt(s, it.title, { x: x + 86, y, w: colW - 86, h: 42, size: 30, bold: true, lh: 1.15 });
    if (it.note) TN.txt(s, it.note, { x: x + 86, y: y + 46, w: colW - 86, h: rowH - 74, size: 23, color: C.n60, lh: 1.35 });
    TN.hline(s, p, { x, y: y + rowH - 24, w: colW });
  });
  chrome(s, p);
}

// ───────────────────────────────────────────────────────── bullets ──
function bulletsSlide(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, d);

  const cols = d.columns || 1;
  const gap = 80, colW = Math.floor((CW - gap * (cols - 1)) / cols);
  const per = Math.ceil(d.items.length / cols);
  const size = d.items.length > 8 ? 26 : T.body;
  for (let c = 0; c < cols; c++) {
    const part = d.items.slice(c * per, (c + 1) * per);
    if (part.length) TN.bullets(s, part, { x: MX + c * (colW + gap), y: y0, w: colW, h: TN.contentBottom() - y0, size });
  }
  chrome(s, p);
}

// ──────────────────────────────────────────────────────── features ──
async function features(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, d);

  const items = d.items.slice(0, 6);
  const avail = TN.contentBottom() - y0;
  const rowH = Math.max(104, Math.min(190, Math.floor(avail / items.length)));
  const top = y0 + Math.max(0, (avail - rowH * items.length) / 2);
  const tile = Math.min(88, rowH - 34);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const a = TN.accent(d.mono ? 0 : i, it.tone);
    const y = top + i * rowH;
    TN.rect(s, p, { x: MX, y, w: tile, h: tile, fill: a.tint, r: 20 });
    const ok = await TN.putIcon(s, it.icon, a.solid, { x: MX + tile * 0.24, y: y + tile * 0.24, w: tile * 0.52 });
    if (!ok) TN.txt(s, TN.pad2(i + 1), { x: MX, y: y + tile / 2 - 20, w: tile, h: 40, size: 30, bold: true, color: a.solid, align: 'center' });
    const tx = MX + tile + 28, tw = CW - tile - 28;
    TN.txt(s, it.title, { x: tx, y: y + 2, w: tw, h: 42, size: T.h4, bold: true, lh: 1.15 });
    if (it.text) TN.txt(s, it.text, { x: tx, y: y + 46, w: tw, h: rowH - 60, size: T.small, color: C.n60, lh: 1.4 });
  }
  chrome(s, p);
}

// ─────────────────────────────────────────────────────────── cards ──
async function cards(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, d);

  const items = d.items.slice(0, 8);
  const cols = d.columns || (items.length <= 2 ? 2 : items.length <= 4 ? Math.min(items.length, 4) : 3);
  const rows = Math.ceil(items.length / cols);
  const gap = 32, pdx = 40, pdy = 36;
  const cw = Math.floor((CW - gap * (cols - 1)) / cols);
  const availH = TN.contentBottom() - y0;

  // высота карточки — по самому длинному контенту, чтобы ряд был ровным
  let need = 0;
  for (const it of items) {
    const tH = TN.blockH(it.title, cw - pdx * 2, T.h3, true, 1.15);
    const xH = it.text ? TN.blockH(it.text, cw - pdx * 2, T.small, false, 1.42) + 12 : 0;
    need = Math.max(need, pdy * 2 + (it.icon ? 62 : 0) + tH + xH);
  }
  const slot = Math.floor((availH - gap * (rows - 1)) / rows);
  const ch = Math.min(slot, Math.max(need, Math.round(slot * 0.72)));

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const a = TN.accent(d.mono ? 0 : i, it.tone);
    const x = MX + (i % cols) * (cw + gap);
    const y = y0 + Math.floor(i / cols) * (ch + gap);
    const solid = it.fill === 'solid';
    TN.rect(s, p, { x, y, w: cw, h: ch, r: 28, fill: solid ? a.solid : it.fill === 'plain' ? C.n15 : a.tint });

    let cy = y + pdy;
    if (it.icon && await TN.putIcon(s, it.icon, solid ? C.white : a.solid, { x: x + pdx, y: cy, w: 44 })) cy += 62;
    const tH = TN.blockH(it.title, cw - pdx * 2, T.h3, true, 1.15);
    TN.txt(s, it.title, { x: x + pdx, y: cy, w: cw - pdx * 2, h: tH + 6, size: T.h3, bold: true, lh: 1.15, color: solid ? C.white : C.n100 });
    cy += tH + 10;
    if (it.text) TN.txt(s, it.text, { x: x + pdx, y: cy, w: cw - pdx * 2, h: Math.max(30, y + ch - pdy - cy), size: T.small, lh: 1.42, color: solid ? C.onRedDim : C.n60 });
  }
  chrome(s, p);
}

// ─────────────────────────────────────────────────────────── quote ──
function quote(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const w = 1440, x = (W - w) / 2;

  const ft = TN.fit(d.text, { w: w - 40, h: 420, size: T.quote, min: 38, bold: true, lh: 1.25 });
  const th = ft.lines * ft.size * 1.25;
  let y = Math.max(230, (H - th - (d.author ? 120 : 0) - 150) / 2 + 150);

  TN.txt(s, '“', { x: x + 12, y: y - 190, w: 300, h: 220, size: 220, bold: true, color: C.red15, lh: 1 });
  TN.txt(s, d.text, { x: x + 20, y, w: w - 40, h: th + 10, size: ft.size, bold: true, lh: 1.25 });
  y += th + 56;

  if (d.author) {
    let tx = x + 20;
    if (d.avatar && TN.assetPath(d.avatar)) {
      s.addImage({ path: TN.assetPath(d.avatar), x: px(tx), y: px(y - 6), w: px(88), h: px(88), sizing: { type: 'cover', w: px(88), h: px(88) }, rounding: true });
      tx += 112;
    }
    TN.txt(s, d.author, { x: tx, y, w: 900, h: 42, size: 30, bold: true });
    if (d.role) TN.txt(s, d.role, { x: tx, y: y + 44, w: 900, h: 38, size: 25, color: C.n60 });
  }
  chrome(s, p);
}

// ───────────────────────────────────────────────────────── metrics ──
async function metrics(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, d);

  const items = d.items.slice(0, 4);
  const gap = 40, pdx = 48, pdy = 48, chip = 88;
  const cw = Math.floor((CW - gap * (items.length - 1)) / items.length);
  const chH = TN.contentBottom() - y0;

  // единая высота нижнего блока — иначе подписи в ряду разъедутся
  let blockHeight = 0;
  for (const it of items) {
    const tH = TN.blockH(it.title, cw - pdx * 2, 34, true, 1.15);
    const nH = it.note ? TN.blockH(it.note, cw - pdx * 2, T.small, false, 1.45) + 14 : 0;
    blockHeight = Math.max(blockHeight, tH + nH);
  }

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const a = TN.accent(i, it.tone);
    const dark = it.fill === 'dark';
    const x = MX + i * (cw + gap);
    TN.rect(s, p, { x, y: y0, w: cw, h: chH, r: 32, fill: dark ? C.n60 : i === 0 && !it.tone ? C.n15 : a.tint });

    if (it.icon) {
      TN.rect(s, p, { x: x + pdx, y: y0 + pdy, w: chip, h: chip, r: 24, fill: dark ? '#7f8a9b' : C.white });
      await TN.putIcon(s, it.icon, dark ? C.white : a.solid, { x: x + pdx + 22, y: y0 + pdy + 22, w: 44 });
    }

    const by = y0 + chH - pdy - blockHeight;
    const vf = TN.fit(String(it.value), { w: cw - pdx * 2, h: 150, size: T.metric, min: 64, bold: true, lh: 1 });
    const zoneTop = y0 + pdy + (it.icon ? chip + 16 : 0);
    const vy = Math.max(zoneTop, zoneTop + (by - 28 - zoneTop - vf.size * 1.05) / 2);
    s.addText([
      { text: String(it.value), options: { bold: true, fontSize: TN.pt(vf.size), color: TN.hex(dark ? C.white : a.solid) } },
      ...(it.unit ? [{ text: ' ' + it.unit, options: { bold: true, fontSize: TN.pt(vf.size * 0.48), color: TN.hex(dark ? C.white : a.solid) } }] : []),
    ], { x: px(x + pdx), y: px(vy), w: px(cw - pdx * 2), h: px(vf.size * 1.15), isTextBox: true, margin: 0, fontFace: TN.FONT, valign: 'bottom', lineSpacing: TN.pt(vf.size) });

    const tH = TN.blockH(it.title, cw - pdx * 2, 34, true, 1.15);
    TN.txt(s, it.title, { x: x + pdx, y: by, w: cw - pdx * 2, h: tH + 4, size: 34, bold: true, lh: 1.15, color: dark ? C.white : C.n100 });
    if (it.note) TN.txt(s, it.note, { x: x + pdx, y: by + tH + 14, w: cw - pdx * 2, h: blockHeight - tH - 10, size: T.small, lh: 1.45, color: dark ? C.n30 : C.n60 });
  }
  chrome(s, p);
}

// ─────────────────────────────────────────────────────────── table ──
function table(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(C.white) };
  const y0 = TN.header(s, d);
  const bottom = TN.contentBottom();

  const head = d.columns.map((c) => ({
    text: typeof c === 'string' ? c : c.title,
    options: { bold: true, color: TN.hex(C.white), fill: { color: TN.hex(C.n100) }, fontSize: TN.pt(25),
      align: (c.align) || 'left', valign: 'middle', margin: [TN.pt(18), TN.pt(22), TN.pt(18), TN.pt(22)] },
  }));
  const body = d.rows.map((r, ri) => r.map((cell, ci) => {
    const col = d.columns[ci];
    const obj = cell && typeof cell === 'object';
    const a = obj && cell.tone ? TN.accent(0, cell.tone) : null;
    return {
      text: String(obj ? cell.text : cell),
      options: {
        color: TN.hex(a ? a.solid : (col.strong || ci === 0) ? C.n100 : C.n60),
        bold: !!(col.strong || ci === 0 || (obj && cell.bold)),
        fill: { color: TN.hex(ri % 2 ? C.n10 : C.white) },
        fontSize: TN.pt(d.dense ? 22 : 25), align: col.align || 'left', valign: 'middle',
        margin: [TN.pt(16), TN.pt(22), TN.pt(16), TN.pt(22)],
      },
    };
  }));

  const widths = d.columns.map((c) => c.w || null);
  const known = widths.filter(Boolean).reduce((a, b) => a + b, 0);
  const rest = (CW - CW * known / 100) / Math.max(widths.filter((x) => !x).length, 1);
  s.addTable([head, ...body], {
    x: px(MX), y: px(y0), w: px(CW),
    colW: widths.map((w) => (w ? px(CW * w / 100) : px(rest))),
    border: { type: 'solid', color: TN.hex(C.n20), pt: 1 },
    autoPage: false, fontFace: TN.FONT,
    rowH: px(Math.min(86, Math.max(58, (bottom - y0 - 70) / d.rows.length))),
  });
  if (d.note) TN.txt(s, d.note, { x: MX, y: bottom - 30, w: CW, h: 34, size: T.caption, color: C.n50 });
  chrome(s, p);
}

// ─────────────────────────────────────────────────────────── chart ──
function chart(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(C.white) };
  const y0 = TN.header(s, d);
  const bottom = TN.contentBottom();
  const cfg = d.chart;
  const kind = cfg.kind || 'column';

  // у горизонтальных баров PowerPoint рисует первую категорию снизу — разворачиваем
  const flip = kind === 'bar';
  const cats = flip ? cfg.categories.slice().reverse() : cfg.categories;
  const series = cfg.series.map((sr) => ({ name: sr.name || '', labels: cats, values: flip ? sr.values.slice().reverse() : sr.values }));

  const round = kind === 'pie' || kind === 'doughnut';
  const palette = [C.red60, C.blue60, C.green50, C.orange45, C.purple60, C.yellow50];
  const colors = (cfg.colors || (series.length === 1 && !round ? [C.red60] : palette)).map(TN.hex);
  const type = { column: p.ChartType.bar, bar: p.ChartType.bar, line: p.ChartType.line,
    area: p.ChartType.area, pie: p.ChartType.pie, doughnut: p.ChartType.doughnut }[kind];

  s.addChart(type, series, {
    x: px(MX), y: px(y0), w: px(CW), h: px(bottom - y0 - (d.note ? 40 : 0)),
    chartColors: colors, varyColors: round,
    barDir: kind === 'bar' ? 'bar' : 'col', barGapWidthPct: 60,
    ...(cfg.stacked ? { barGrouping: 'stacked' } : {}),
    showLegend: series.length > 1 || round, legendPos: 'b', legendFontSize: TN.pt(24), legendColor: TN.hex(C.n60), legendFontFace: TN.FONT,
    showValue: cfg.showValue !== false && kind !== 'line' && kind !== 'area',
    dataLabelPosition: round ? 'bestFit' : cfg.stacked ? 'ctr' : 'outEnd',
    dataLabelFontSize: TN.pt(22), dataLabelFontFace: TN.FONT,
    dataLabelColor: TN.hex(round ? C.white : C.n60),
    dataLabelFormatCode: cfg.format,
    catAxisLabelColor: TN.hex(C.n60), catAxisLabelFontSize: TN.pt(23), catAxisLabelFontFace: TN.FONT,
    valAxisLabelColor: TN.hex(C.n60), valAxisLabelFontSize: TN.pt(23), valAxisLabelFontFace: TN.FONT,
    catGridLine: { style: 'none' }, valGridLine: { color: TN.hex(C.n20), size: 1 },
    catAxisLineShow: false, valAxisLineShow: false,
    ...(kind === 'line' ? { lineSize: 4, lineSmooth: false, showMarker: true, markerSize: 8 } : {}),
    ...(kind === 'doughnut' ? { holeSize: 60 } : {}),
  });
  if (d.note) TN.txt(s, d.note, { x: MX, y: bottom - 32, w: CW, h: 34, size: T.caption, color: C.n50 });
  chrome(s, p);
}

// ───────────────────────────────────────────────────────── process ──
function process(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, d);

  const steps = d.steps.slice(0, 6);
  const gap = 28, pd = 40;
  const cw = Math.floor((CW - gap * (steps.length - 1)) / steps.length);
  const avail = TN.contentBottom() - y0;

  let need = 0;
  for (const it of steps) {
    const tH = TN.blockH(it.title, cw - pd * 2, T.h4, true, 1.15);
    const xH = it.text ? TN.blockH(it.text, cw - pd * 2, T.small, false, 1.42) + 16 : 0;
    need = Math.max(need, pd * 2 + 106 + tH + xH);
  }
  const chH = Math.min(avail, Math.max(need, Math.round(avail * 0.62)));

  steps.forEach((it, i) => {
    const a = TN.accent(i, it.tone);
    const x = MX + i * (cw + gap);
    TN.rect(s, p, { x, y: y0, w: cw, h: chH, r: 28, fill: C.n15 });
    TN.ellipse(s, p, { x: x + pd, y: y0 + pd, w: 76, h: 76, fill: a.solid });
    TN.txt(s, TN.pad2(i + 1), { x: x + pd, y: y0 + pd + 18, w: 76, h: 44, size: 32, bold: true, color: C.white, align: 'center' });

    let cy = y0 + pd + 106;
    const tH = TN.blockH(it.title, cw - pd * 2, T.h4, true, 1.15);
    TN.txt(s, it.title, { x: x + pd, y: cy, w: cw - pd * 2, h: tH + 6, size: T.h4, bold: true, lh: 1.15 });
    cy += tH + 16;
    if (it.text) TN.txt(s, it.text, { x: x + pd, y: cy, w: cw - pd * 2, h: Math.max(30, y0 + chH - pd - cy), size: T.small, color: C.n60, lh: 1.42 });

    if (i < steps.length - 1) s.addShape(p.ShapeType.chevron, {
      x: px(x + cw + gap / 2 - 11), y: px(y0 + chH / 2 - 18), w: px(22), h: px(36),
      fill: { color: TN.hex(C.n30) }, line: TN.NOLINE,
    });
  });
  chrome(s, p);
}

// ──────────────────────────────────────────────────────── timeline ──
function timeline(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(C.white) };
  const y0 = TN.header(s, d);

  const labelW = d.labelW || 460;
  const gridX = MX + labelW;
  const colW = (CW - labelW) / d.periods.length;
  const gy = y0 + 56;
  const rowH = Math.max(70, Math.min(130, Math.floor((TN.contentBottom() - gy) / d.rows.length)));
  const gridBottom = gy + rowH * d.rows.length;

  d.periods.forEach((per, i) => {
    TN.txt(s, per, { x: gridX + i * colW, y: y0, w: colW, h: 36, size: T.small, bold: true, color: C.n60, align: 'center' });
    if (i) s.addShape(p.ShapeType.line, { x: px(gridX + i * colW), y: px(y0 + 44), w: 0, h: px(gridBottom - y0 - 44), line: { color: TN.hex(C.n20), width: 1 } });
  });

  d.rows.forEach((r, i) => {
    const y = gy + i * rowH;
    TN.txt(s, r.title, { x: MX, y: y + (rowH - 40) / 2, w: labelW - 24, h: 44, size: T.small, bold: true, lh: 1.2 });
    (r.bars || []).forEach((b, j) => {
      const a = TN.accent(i + j, b.tone);
      const from = Math.max(0, b.from - 1), to = Math.min(d.periods.length, b.to || b.from);
      const bx = gridX + from * colW + 6, bw = (to - from) * colW - 12;
      const bh = Math.min(52, rowH - 26);
      const tint = b.fill === 'tint';
      TN.rect(s, p, { x: bx, y: y + (rowH - bh) / 2, w: bw, h: bh, r: bh / 2, fill: tint ? a.tint : a.solid });
      if (b.label) TN.txt(s, b.label, { x: bx + 20, y: y + (rowH - bh) / 2 + (bh - 28) / 2, w: bw - 40, h: 30, size: 21, bold: true, color: tint ? a.deep : C.white });
    });
    if (i < d.rows.length - 1) TN.hline(s, p, { x: MX, y: y + rowH, w: CW, width: 1 });
  });
  chrome(s, p);
}

// ───────────────────────────────────────────────────────── compare ──
function compare(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, d);

  const cols = d.columns.slice(0, 4);
  const gap = 36;
  const cw = Math.floor((CW - gap * (cols.length - 1)) / cols.length);
  const chH = TN.contentBottom() - y0;

  cols.forEach((col, i) => {
    const a = TN.accent(i, col.tone);
    const x = MX + i * (cw + gap);
    const hi = !!col.highlight;
    TN.rect(s, p, { x, y: y0, w: cw, h: chH, r: 28, fill: hi ? a.tint : C.n15, line: hi ? { color: a.solid, width: 2 } : null });
    // шапка колонки: скруглённый прямоугольник + прямоугольник-«подбородок»
    TN.rect(s, p, { x, y: y0, w: cw, h: 116, r: 28, fill: hi ? a.solid : C.n20 });
    TN.rect(s, p, { x, y: y0 + 88, w: cw, h: 28, fill: hi ? a.solid : C.n20 });
    TN.txt(s, col.title, { x: x + 32, y: y0 + 24, w: cw - 64, h: 44, size: T.h4, bold: true, align: 'center', color: hi ? C.white : C.n100 });
    if (col.subtitle) TN.txt(s, col.subtitle, { x: x + 32, y: y0 + 68, w: cw - 64, h: 34, size: 22, align: 'center', color: hi ? C.onRedMeta : C.n60 });
    TN.bullets(s, col.items, { x: x + 36, y: y0 + 150, w: cw - 72, h: chH - 180, size: T.small, lh: 1.42, gap: 14, bullet: a.solid });
  });
  chrome(s, p);
}

// ─────────────────────────────────────────────────────────── split ──
async function split(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(C.white) };
  const artRight = (d.side || 'right') === 'right';
  const artW = Math.round(W * (d.ratio || 0.46));
  const txW = W - artW;
  const ax = artRight ? txW : 0;

  TN.rect(s, p, { x: ax, y: 0, w: artW, h: H, fill: C.n15 });
  TN.picture(s, p, { x: ax + 64, y: 72, w: artW - 128, h: H - 144, image: d.image, note: d.imageNote, r: 32 });

  const tx = artRight ? MX : artW + 64;
  const tw = txW - MX - 64;
  const items = d.items || [];
  const ft = TN.fit(d.title, { w: tw, h: 300, size: 76, min: 44, bold: true, lh: 1.1 });
  const th = ft.lines * ft.size * 1.1;
  const ldh = d.lead ? TN.blockH(d.lead, tw, T.lead, false, 1.45) + 44 : 0;

  let y = Math.max(MT, (H - ((d.eyebrow ? 60 : 0) + th + 36 + ldh + items.length * 96)) / 2);
  if (d.eyebrow) { TN.txt(s, d.eyebrow.toUpperCase(), { x: tx, y, w: tw, h: 40, size: 28, bold: true, color: C.red60, spacing: 2.6 }); y += 60; }
  TN.txt(s, d.title, { x: tx, y, w: tw, h: th + 8, size: ft.size, bold: true, lh: 1.1 });
  y += th + 36;
  if (d.lead) { TN.txt(s, d.lead, { x: tx, y, w: tw, h: ldh, size: T.lead, color: C.n60, lh: 1.45 }); y += ldh; }

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const a = TN.accent(d.mono === false ? i : 0, it.tone);
    const iy = y + i * 96;
    TN.rect(s, p, { x: tx, y: iy, w: 64, h: 64, r: 18, fill: a.tint });
    if (!await TN.putIcon(s, it.icon, a.solid, { x: tx + 15, y: iy + 15, w: 34 })) TN.ellipse(s, p, { x: tx + 24, y: iy + 24, w: 16, h: 16, fill: a.solid });
    TN.txt(s, [
      ...(it.title ? [{ text: it.title + (it.text ? ' — ' : ''), bold: true }] : []),
      ...(it.text ? [{ text: it.text }] : []),
    ], { x: tx + 84, y: iy + 6, w: tw - 84, h: 84, size: T.body, lh: 1.35 });
  }
}

// ─────────────────────────────────────────────────────────── image ──
function image(p, d) {
  const s = p.addSlide();
  s.background = { color: TN.hex(d.tone === 'light' ? C.n15 : C.white) };
  const y0 = TN.header(s, { ...d, maxH: 90 });
  const bottom = TN.contentBottom();
  const avail = bottom - y0;

  if (d.frame === 'laptop') {
    const lw = 1024, sw = 984, sh = Math.min(639, avail - 80);
    const x = (W - lw) / 2;
    TN.rect(s, p, { x, y: y0, w: lw, h: sh + 42, r: 22, fill: C.n100 });
    TN.ellipse(s, p, { x: W / 2 - 4, y: y0 + 12, w: 8, h: 8, fill: '#4d5666' });
    TN.picture(s, p, { x: x + 20, y: y0 + 28, w: sw, h: sh, image: d.image, tone: 'rose', r: 4, note: d.imageNote });
    TN.rect(s, p, { x: (W - 1160) / 2, y: y0 + sh + 42, w: 1160, h: 26, r: 8, fill: C.n30 });
  } else if (d.frame === 'phone') {
    const ph = Math.min(858, avail), pw = Math.round(ph * 0.48);
    const x = (W - pw) / 2;
    TN.rect(s, p, { x, y: y0, w: pw, h: ph, r: 58, fill: C.n100 });
    TN.picture(s, p, { x: x + 16, y: y0 + 16, w: pw - 32, h: ph - 32, image: d.image, tone: 'rose', r: 44, note: d.imageNote });
  } else {
    TN.picture(s, p, { x: MX, y: y0, w: CW, h: avail, image: d.image, note: d.imageNote, r: 32 });
  }
  if (d.caption) TN.txt(s, d.caption, { x: MX, y: bottom + 6, w: CW, h: 34, size: T.caption, color: C.n50 });
  chrome(s, p);
}

// ──────────────────────────────────────────────────────────── дека ──
async function main() {
  const p = TN.newDeck({ title: 'TN Life: единая платформа', author: 'Департамент цифровых продуктов' });

  await title(p, {
    eyebrow: 'Стратегия продукта · 2026',
    title: 'TN Life: единая платформа для 12 000 сотрудников',
    lead: 'Как мы собрали корпоративный суперапп и что он меняет в работе заводов, продаж и стройплощадок.',
    left: 'Департамент цифровых продуктов',
    right: 'Июль 2026',
    notes: 'Представиться, назвать цель встречи и решение, которое нужно принять.',
  });

  agenda(p, {
    title: 'Что обсудим',
    items: [
      { title: 'Где мы сейчас', note: 'Пять несвязанных систем и 40 минут в день на переключение.' },
      { title: 'Что говорят сотрудники', note: '120 интервью на пяти площадках.' },
      { title: 'Продукт', note: 'Единый вход, чаты, задачи, документы, сервисы заводов.' },
      { title: 'Результаты пилота', note: 'Три завода, 1 400 пользователей, четыре месяца.' },
      { title: 'План до конца года', note: 'Шесть потоков работ, июль — декабрь.' },
      { title: 'Что нужно от команд', note: 'Люди, данные и решения, которые ждём сегодня.' },
    ],
  });

  section(p, {
    number: 1,
    title: 'Где мы сейчас',
    lead: 'Инструментов много, но ни один не отвечает на вопрос «что мне делать прямо сейчас».',
  });

  await metrics(p, {
    title: 'Цена разрозненности',
    lead: 'Замеры на трёх заводах в апреле 2026 года.',
    items: [
      { value: '40', unit: 'мин', title: 'в день на переключение', note: 'Между почтой, ERP, мессенджером и таск-трекером.', icon: 'clock-light' },
      { value: '5', title: 'систем на одну задачу', note: 'Заявка на отпуск проходит через четыре интерфейса.', icon: 'applications-light', tone: 'blue' },
      { value: '31', unit: '%', title: 'сотрудников на смене', note: 'Не имеют рабочего доступа с телефона.', icon: 'phone-light', fill: 'dark' },
    ],
  });

  await split(p, {
    eyebrow: 'Продукт',
    title: 'Один вход во всё рабочее',
    lead: 'TN Life собирает задачи, документы, чаты и сервисы заводов в одном приложении — на телефоне и на компьютере.',
    items: [
      { icon: 'user-light', title: 'Единый профиль', text: 'доступы подтягиваются из HR-системы автоматически.' },
      { icon: 'phone-light', title: 'Работа со смены', text: 'офлайн-режим и сканер документов в мобильном.' },
      { icon: 'document-light', title: 'Сервисы заводов', text: 'заявки, пропуска и охрана труда без бумаги.' },
    ],
  });

  await features(p, {
    title: 'Что получает сотрудник',
    lead: 'Четыре сценария закрывают 80 % ежедневных обращений в поддержку.',
    items: [
      { icon: 'calendar', title: 'Заявка на отпуск за 40 секунд', text: 'Форма подставляет остаток дней и руководителя из SAP HR.' },
      { icon: 'channel', title: 'Каналы завода', text: 'Объявления смены, инциденты и охрана труда в одной ленте.' },
      { icon: 'document', title: 'Документы без VPN', text: 'Просмотр и подпись с телефона через корпоративный ID.' },
      { icon: 'protect', title: 'Единый доступ', text: 'Одна учётная запись вместо пяти паролей.' },
    ],
  });

  await cards(p, {
    title: 'Модули платформы',
    lead: 'Шесть модулей в проде, ещё два — в разработке.',
    items: [
      { icon: 'channel', title: 'Сообщения', text: 'Чаты, каналы, треды. 9 400 активных в месяц.' },
      { icon: 'calendar', title: 'Календарь', text: 'Переговорные, смены, отпуска в одной сетке.' },
      { icon: 'people', title: 'Адресная книга', text: '12 000 карточек с оргструктурой из SAP HR.' },
      { icon: 'request', title: 'Заявки', text: '38 типов сервисных заявок заводов и офиса.' },
      { icon: 'document', title: 'Диск', text: 'Облачные документы с подписью на телефоне.' },
      { icon: 'widget', title: 'Витрина сервисов', text: 'Точка входа во внутренние системы компании.' },
    ],
  });

  chart(p, {
    title: 'Рост активной аудитории',
    lead: 'Уникальные пользователи в неделю, тысяч человек.',
    chart: {
      kind: 'line',
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
      series: [
        { name: 'Заводы', values: [1.1, 1.8, 2.9, 4.2, 5.6, 7.1] },
        { name: 'Офис', values: [2.4, 2.9, 3.4, 3.8, 4.1, 4.4] },
      ],
    },
    note: 'Источник: продуктовая аналитика TN Life, июнь 2026.',
  });

  chart(p, {
    title: 'Куда уходит рабочее время',
    chart: {
      kind: 'bar',
      categories: ['Переключение между системами', 'Поиск документов', 'Согласования', 'Отчётность'],
      series: [{ name: 'минут в день', values: [40, 27, 22, 18] }],
    },
  });

  process(p, {
    title: 'Как устроено внедрение',
    lead: 'Один завод проходит цикл за восемь недель.',
    steps: [
      { title: 'Аудит процессов', text: 'Две недели наблюдений в цехах и интервью с мастерами.' },
      { title: 'Настройка', text: 'Оргструктура, права, справочники и интеграция с MES.' },
      { title: 'Пилот смены', text: 'Одна смена работает в TN Life под присмотром команды.' },
      { title: 'Раскатка', text: 'Обучение, амбассадоры, переход всех смен завода.' },
    ],
  });

  timeline(p, {
    title: 'План до конца года',
    lead: 'Шесть потоков работ, июль — декабрь 2026.',
    periods: ['Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    rows: [
      { title: 'Мобильный офлайн-режим', bars: [{ from: 1, to: 3, label: 'разработка' }, { from: 3, to: 4, label: 'пилот', fill: 'tint' }] },
      { title: 'Интеграция с MES', bars: [{ from: 2, to: 5, label: 'три завода', tone: 'blue' }] },
      { title: 'Электронная подпись', bars: [{ from: 3, to: 6, label: 'с юр. блоком', tone: 'green' }] },
      { title: 'Витрина сервисов 2.0', bars: [{ from: 4, to: 7, label: 'редизайн', tone: 'orange' }] },
      { title: 'Раскатка на 9 заводов', bars: [{ from: 5, to: 7, label: 'волнами', tone: 'purple' }] },
    ],
  });

  table(p, {
    title: 'Результаты пилота',
    lead: 'Три завода, 1 400 пользователей, четыре месяца.',
    columns: [
      { title: 'Показатель', w: 40 },
      { title: 'До', align: 'center' },
      { title: 'После', align: 'center', strong: true },
      { title: 'Изменение', align: 'center' },
    ],
    rows: [
      ['Время на заявку об отпуске', '18 мин', '40 сек', { text: '− 96 %', tone: 'green' }],
      ['Обращений в ИТ-поддержку в месяц', '740', '310', { text: '− 58 %', tone: 'green' }],
      ['Доля сотрудников с мобильным доступом', '31 %', '88 %', { text: '+57 п.п.', tone: 'green' }],
      ['Согласование документа', '2,4 дня', '6 часов', { text: '− 75 %', tone: 'green' }],
      ['Стоимость лицензий на сотрудника', '1 840 ₽', '1 210 ₽', { text: '− 34 %', tone: 'green' }],
    ],
    note: 'Замеры: март — июнь 2026, заводы в Рязани, Учалах и Юрге.',
  });

  compare(p, {
    title: 'Приоритеты следующего полугодия',
    lead: 'Три сценария развития — выбираем второй.',
    columns: [
      { title: 'Только поддержка', subtitle: '0,5 команды', items: [
        { title: 'Плюс', text: 'минимальные затраты' },
        { title: 'Минус', text: 'заводы остаются без офлайна' },
        { title: 'Риск', text: 'отток активных пользователей' }] },
      { title: 'Фокус на заводах', subtitle: '2 команды', highlight: true, tone: 'red', items: [
        { title: 'Плюс', text: 'офлайн и MES закрывают 80 % боли' },
        { title: 'Плюс', text: 'раскатка на 9 площадок до декабря' },
        { title: 'Минус', text: 'витрина сервисов сдвигается на Q1' }] },
      { title: 'Всё сразу', subtitle: '4 команды', tone: 'blue', items: [
        { title: 'Плюс', text: 'закрываем весь бэклог' },
        { title: 'Минус', text: 'нет людей и бюджета в этом году' },
        { title: 'Риск', text: 'качество на всех потоках' }] },
    ],
  });

  bulletsSlide(p, {
    title: 'Что нужно от команд',
    lead: 'Решения, которые ждём на этой встрече.',
    columns: 2,
    items: [
      { title: 'HR', text: 'выгрузка оргструктуры раз в сутки вместо недели' },
      { title: 'ИТ-инфраструктура', text: 'два стенда под офлайн-синхронизацию до 15 августа' },
      { title: 'Юридический блок', text: 'согласование сценария электронной подписи' },
      { title: 'Заводы', text: 'по одному амбассадору на площадку' },
      { title: 'Безопасность', text: 'политика доступа с личных устройств' },
      { title: 'Финансы', text: 'бюджет на 2 команды в H2' },
    ],
  });

  statement(p, {
    text: 'Один вход вместо пяти систем экономит 40 минут рабочего дня каждому сотруднику',
    note: 'Замеры на пилотных заводах, апрель — июнь 2026',
  });

  quote(p, {
    text: 'Раньше заявку на пропуск я нёс в другой корпус. Теперь это два тапа в телефоне прямо из цеха.',
    author: 'Алексей Ремизов',
    role: 'Мастер смены, завод в Рязани',
  });

  image(p, {
    title: 'Веб-кабинет на десктопе',
    lead: 'Рабочий день руководителя: лента, задачи и согласования на одном экране.',
    frame: 'laptop',
    imageNote: 'MacBook Pro 14" → вставьте 984×639',
  });

  await closing(p, {
    title: 'Спасибо за внимание',
    lead: 'Вопросы, доступ к пилоту и запись на демо.',
    contacts: [
      { label: 'ПРОДУКТ', value: 'Анна Соколова' },
      { label: 'ПОЧТА', value: 'tnlife@tn.ru' },
      { label: 'КАНАЛ', value: '#tn-life-product' },
    ],
  });

  const out = path.join(__dirname, 'tn-life-strategy.pptx');
  await p.writeFile({ fileName: out });
  console.log('✓ ' + out);
}

main().catch((e) => { console.error(e.stack); process.exit(1); });
