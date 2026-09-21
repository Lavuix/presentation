/**
 * Образцы тем: по деке на каждую тему, в каждой — все макеты из templates/.
 *
 *   node examples/themes/build.js            # все темы
 *   node examples/themes/build.js digital    # только одна
 *
 * Деки складываются рядом со скриптом: examples/themes/tn-<тема>.pptx.
 * Открой их и выбери тему — дальше собирай свою деку с этой темой.
 *
 * Макеты и данные берутся прямо из templates/*.md — и сниппеты, и блоки
 * «Пример вызова». Так образец не расходится с шаблонами: поправили шаблон —
 * пересобрали, и видно ровно то, что там написано. В своей деке так не делай:
 * копируй нужные сниппеты в свой build.js.
 */
'use strict';

const path = require('path');
const TN = require('../../templates/_prelude');
const snippets = require('../../templates/_snippets');

/**
 * Сколько слайдов получат колонтитул. Номер в колонтитуле пишется в момент
 * сборки слайда, поэтому общее число нужно знать заранее — считаем его
 * черновым прогоном. Иначе при каждом новом макете в нумерации остаётся
 * старое «19 / 13».
 */
async function countFooters(key) {
  const p = TN.newDeck({ title: 'счёт слайдов', theme: key });
  await TN.prepare();
  let n = 0;
  await snippets.demo(TN, p, () => { n += 1; });
  return n;
}

async function buildTheme(key) {
  const total = await countFooters(key);

  const p = TN.newDeck({ title: `Образец темы «${TN.THEMES[key].name}»`, theme: key });
  await TN.prepare();                       // фоновая графика темы

  const label = `Образец темы · ${TN.theme().name}`;
  let no = 0;
  const chrome = (s, pp) => TN.footer(s, pp, { label, no: ++no, total });

  await snippets.demo(TN, p, chrome);

  const file = path.join(__dirname, `tn-${key}.pptx`);
  await p.writeFile({ fileName: file });
  console.log(`  ${TN.theme().name.padEnd(26)} → ${path.relative(process.cwd(), file)}`);
}

(async () => {
  const only = process.argv[2];
  const keys = only ? [only] : Object.keys(TN.THEMES);
  for (const k of keys) {
    if (!TN.THEMES[k]) { console.error(`нет темы «${k}»; есть: ${Object.keys(TN.THEMES).join(', ')}`); process.exit(1); }
    await buildTheme(k);
  }
})().catch((e) => { console.error(e); process.exit(1); });
