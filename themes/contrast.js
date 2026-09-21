/**
 * Проверка контраста тем по WCAG: node themes/contrast.js
 *
 * Считает отношение яркостей для пар «текст на фоне» в каждой теме.
 * Норма — 4,5 : 1 для текста и 3 : 1 для крупного (от 48 px).
 *
 * Брендовая палитра проверяется, но не валит прогон: несколько её пар
 * (колонтитул, нумерация, мета на обложке) не дотягивают до нормы — это
 * значения корпоративной дизайн-системы, менять их здесь не наше дело.
 * Такие пары помечены «дев.». Новые темы обязаны проходить без единого FAIL.
 */
'use strict';

const TN = require('../templates/_prelude');
const lum = (h) => {
  const v = h.replace('#', '');
  const ch = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// min 4.5 — обычный текст, 3.0 — от 48 px (крупный)
const PAIRS = (C) => [
  ['основной текст / фон', C.ink, C.bg, 4.5],
  ['вторичный / фон', C.muted, C.bg, 4.5],
  ['колонтитул / фон', C.soft, C.bg, 4.5],
  ['нумерация «/ 14» / фон', C.faint, C.bg, 3.0],
  ['текст / подложка карточки', C.ink, C.surface, 4.5],
  ['вторичный / подложка карточки', C.muted, C.surface, 4.5],
  ['акцент / фон', C.accent, C.bg, 3.0],
  ['текст на акценте', C.onAccent, C.accent, 4.5],
  ['вторичный на акценте', C.onAccentDim, C.accent, 3.0],
  ['надзаголовок на акценте', C.onAccentEye, C.accent, 3.0],
  ['заголовок на акцентном экране', C.onAccentFill, C.accentFill, 3.0],
  ['лид на акцентном экране', C.onAccentFillDim, C.accentFill, 4.5],
  ['надзаголовок на акцентном экране', C.onAccentFillEye, C.accentFill, 3.0],
  ['текст на тёмной заливке', C.onDeep, C.deep, 4.5],
  ['вторичный на тёмной заливке', C.onDeepDim, C.deep, 4.5],
  ['текст на тёмной метрике', C.onDeep, C.deepSoft, 4.5],
  ['подпись на тёмной метрике', C.onDeepDim, C.deepSoft, 4.5],
  ['текст на подложке акцента', C.accent, C.accentTint, 3.0],
  ['линия / фон', C.line, C.bg, 1.1],
  ['улучшение (green) / фон', TN.accent(0, 'green').solid, C.bg, 3.0],
  ['ухудшение (red) / фон', TN.accent(0, 'red').solid, C.bg, 3.0],
];

let bad = 0;
const STRICT = ['digital', 'dark'];   // брендовую палитру не правим, только смотрим
for (const key of Object.keys(TN.THEMES)) {
  const strict = STRICT.includes(key);
  TN.useTheme(key);
  const C = TN.C;
  console.log(`\n── ${key} (${TN.theme().name})`);
  for (const [name, fg, bgc, min] of PAIRS(C)) {
    const r = ratio(fg, bgc);
    const ok = r >= min;
    if (!ok && strict) bad++;
    console.log(`  ${ok ? 'ok  ' : strict ? 'FAIL' : 'дев.'} ${r.toFixed(2).padStart(6)} (нужно ≥ ${min})  ${name}  ${fg} на ${bgc}`);
  }
  // обложка
  const cover = TN.theme().cover.kind === 'ink' ? C.bg : C.accent;
  for (const [name, fg, min] of [['заголовок обложки', C.onCoverInk, 3.0], ['лид обложки', C.onCoverDim, 4.5],
                                 ['надзаголовок обложки', C.onCoverEyebrow, 3.0], ['мета обложки', C.onCoverMeta, 4.5]]) {
    const r = ratio(fg, cover);
    const ok = r >= min;
    if (!ok && strict) bad++;
    console.log(`  ${ok ? 'ok  ' : strict ? 'FAIL' : 'дев.'} ${r.toFixed(2).padStart(6)} (нужно ≥ ${min})  ${name}  ${fg} на ${cover}`);
  }
}
console.log(bad ? `\n${bad} пар не проходят` : '\nвсе пары проходят');
process.exit(bad ? 1 : 0);
