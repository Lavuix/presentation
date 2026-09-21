/**
 * Загрузчик сниппетов из templates/*.md.
 *
 * Шаблоны — единственный источник правды: и документация, и код макетов лежат
 * в markdown. Примеры в `examples/` не копируют этот код, а берут его отсюда,
 * поэтому превью всегда показывают ровно то, что написано в шаблонах.
 *
 * В своей деке так делать не нужно: копируй нужные сниппеты в свой build.js —
 * их там видно и можно править под конкретную презентацию.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const TPL = __dirname;
const FILES = ['opening', 'text', 'data', 'flow', 'visual', 'diagram'];

/** Достаёт из markdown код макетов и блоки «Пример вызова». */
function source() {
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

/**
 * Выполняет определения макетов и возвращает их функциями.
 *   const L = snippets.load(TN, p, chrome);
 *   await L.title(p, { … });
 */
function load(TN, p, chrome) {
  const { C, T, MX, MT, MB, CW, W, H, px, pt } = TN;
  const { defs } = source();
  const names = [...defs.matchAll(/^(?:async )?function (\w+)/gm)].map((m) => m[1]);
  return new Function('TN', 'C', 'T', 'MX', 'MT', 'MB', 'CW', 'W', 'H', 'px', 'pt', 'p', 'chrome',
    `${defs}\nreturn { ${names.join(', ')} };`
  )(TN, C, T, MX, MT, MB, CW, W, H, px, pt, p, chrome);
}

/** Собирает деку из всех примеров вызова — по слайду на макет. */
async function demo(TN, p, chrome) {
  const fns = load(TN, p, chrome);
  const { calls } = source();
  const names = Object.keys(fns);
  await new Function(...names, 'p', `return (async () => {\n${calls}\n})();`)(...names.map((n) => fns[n]), p);
  return fns;
}

module.exports = { source, load, demo, FILES };
