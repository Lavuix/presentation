/**
 * Образцы тем: по деке на каждую тему, в каждой — все 17 макетов.
 *
 *   node examples/themes/build.js            # все темы
 *   node examples/themes/build.js digital    # только одна
 *
 * Деки складываются рядом со скриптом: examples/themes/tn-<тема>.pptx.
 * Открой их и выбери тему — дальше собирай свою деку с этой темой.
 *
 * Особенность этого примера: макеты и данные он берёт прямо из templates/*.md —
 * и сниппеты, и блоки «Пример вызова». Так образец не расходится с шаблонами:
 * поправили шаблон — пересобрали, и видно ровно то, что там написано.
 * В своей деке так не делай: копируй нужные сниппеты в свой build.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const TN = require('../../templates/_prelude');
const { C, T, MX, MT, MB, CW, W, H, px, pt } = TN;

const TPL = path.join(__dirname, '..', '..', 'templates');
const FILES = ['opening', 'text', 'data', 'flow', 'visual'];

/** Собирает из markdown код макетов и примеры их вызова. */
function readTemplates() {
  let defs = '', calls = '';
  for (const f of FILES) {
    const md = fs.readFileSync(path.join(TPL, f + '.md'), 'utf8');
    let m;
    const reDef = /<details><summary>Сниппет<\/summary>\s*```js\n([\s\S]*?)```/g;
    while ((m = reDef.exec(md))) defs += m[1] + '\n';
    const reCall = /Пример вызова:\s*```js\n([\s\S]*?)```/g;
    while ((m = reCall.exec(md))) calls += m[1] + '\n';
  }
  return { defs, calls };
}

async function buildTheme(key) {
  const { defs, calls } = readTemplates();

  const p = TN.newDeck({ title: `Образец темы «${TN.THEMES[key].name}»`, theme: key });
  await TN.prepare();                       // фоновая графика темы

  const label = `Образец темы · ${TN.theme().name}`;
  let no = 0;
  const total = 13;                          // столько слайдов с колонтитулом
  const chrome = (s, pp) => TN.footer(s, pp, { label, no: ++no, total });

  await new Function('TN', 'C', 'T', 'MX', 'MT', 'MB', 'CW', 'W', 'H', 'px', 'pt', 'p', 'chrome',
    `return (async () => {\n${defs}\n${calls}\n})();`
  )(TN, C, T, MX, MT, MB, CW, W, H, px, pt, p, chrome);

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
