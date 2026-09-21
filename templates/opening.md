# Открытие, разделители, финал

Макеты без колонтитула и без номера страницы. Они держат ритм деки: с чего начали,
где сменился раздел, чем закончили.

Сниппеты предполагают подключённый пролог — см. [README.md](README.md).

## `title` — титульный слайд

![title](../examples/tn-life-strategy/preview/01-title.jpg)

Первый слайд деки. Красный во всю плашку, логотип белым в левом верхнем углу,
заголовок прижат к нижней трети, служебная строка внизу.

Заголовок — о чём дека, а не её жанр: «TN Life: единая платформа для 12 000 сотрудников»,
а не «Презентация проекта». Кегль подбирается сам от 120 px до 68 px, но три строки —
предел: если не влезает, режь заголовок, а не кегль.

| Поле | Значение |
|---|---|
| `eyebrow` | надзаголовок: тема и год. Необязательно |
| `title` | заголовок деки, до 3 строк |
| `lead` | подзаголовок: о чём пойдёт речь, 1–2 строки |
| `left` | кто выступает — отдел или команда |
| `right` | дата или место |
| `logo` | файл логотипа, по умолчанию `logo-black-rus.png` |
| `notes` | заметки докладчика |

<details><summary>Сниппет</summary>

```js
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
```
</details>

Пример вызова:

```js
await title(p, {
    eyebrow: 'Стратегия продукта · 2026',
    title: 'TN Life: единая платформа для 12 000 сотрудников',
    lead: 'Как мы собрали корпоративный суперапп и что он меняет в работе заводов, продаж и стройплощадок.',
    left: 'Департамент цифровых продуктов',
    right: 'Июль 2026',
    notes: 'Представиться, назвать цель встречи и решение, которое нужно принять.',
  });
```

## `section` — разделитель раздела

![section](../examples/tn-life-strategy/preview/03-section.jpg)

Ставится перед каждым крупным блоком. Даёт паузу и говорит, о чём следующие
несколько слайдов.

Три тона: `red` (по умолчанию), `dark` и `light`. Красный — для главных разделов,
светлый — если красного в деке уже слишком много. Передашь `image` — справа появится
вертикальная панель 44 % ширины под фото; `image: null` оставит плейсхолдер.

| Поле | Значение |
|---|---|
| `number` | номер раздела → «РАЗДЕЛ 03» |
| `eyebrow` | свой надзаголовок вместо номера |
| `title` | название раздела, 1–2 строки |
| `lead` | одно предложение о содержании |
| `tone` | `red` / `dark` / `light` |
| `image` | путь к фото для правой панели |

<details><summary>Сниппет</summary>

```js
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
```
</details>

Пример вызова:

```js
section(p, {
    number: 1,
    title: 'Где мы сейчас',
    lead: 'Инструментов много, но ни один не отвечает на вопрос «что мне делать прямо сейчас».',
  });
```

## `statement` — тезис на весь экран

![statement](../examples/tn-life-strategy/preview/15-statement.jpg)

Один вывод, ради которого собрали встречу. Крупно, по центру, без списков
и иллюстраций. В деке таких слайдов один-два, иначе приём перестаёт работать.

Текст — до 100 знаков. Это утверждение целиком, а не заголовок: «Один вход вместо
пяти систем экономит 40 минут рабочего дня каждому сотруднику».

| Поле | Значение |
|---|---|
| `text` | сам тезис, до 100 знаков |
| `author` | кто это сказал, если это цитата |
| `note` | источник или период замеров |
| `tone` | `red` / `dark` / `light` |

<details><summary>Сниппет</summary>

```js
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
```
</details>

Пример вызова:

```js
statement(p, {
    text: 'Один вход вместо пяти систем экономит 40 минут рабочего дня каждому сотруднику',
    note: 'Замеры на пилотных заводах, апрель — июнь 2026',
  });
```

## `closing` — финальный слайд

![closing](../examples/tn-life-strategy/preview/18-closing.jpg)

Последний слайд. Спасибо плюс конкретика: к кому идти с вопросами. Логотип
внизу слева.

Контакт без подписи бесполезен — у каждого есть `label`, объясняющий, за чем
обращаться.

| Поле | Значение |
|---|---|
| `title` | по умолчанию «Спасибо за внимание» |
| `lead` | с чем можно приходить |
| `contacts` | до 4 элементов `{ label, value }` |
| `tone` | `light` (по умолчанию) / `red` / `dark` |
| `logo` | файл логотипа |

<details><summary>Сниппет</summary>

```js
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
```
</details>

Пример вызова:

```js
await closing(p, {
    title: 'Спасибо за внимание',
    lead: 'Вопросы, доступ к пилоту и запись на демо.',
    contacts: [
      { label: 'ПРОДУКТ', value: 'Анна Соколова' },
      { label: 'ПОЧТА', value: 'tnlife@tn.ru' },
      { label: 'КАНАЛ', value: '#tn-life-product' },
    ],
  });
```
