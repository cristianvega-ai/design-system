import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from './contrast.mjs';

// The rendered check. Two passes share one Chromium browser and one problems list. The first
// opens the sheet at 1280 wide and looks at five things, one section each: the page layout, the
// tab order, the keyboard interactions, the rendered boundaries per ground, and the frame's
// modes. The second opens the product document and checks the tab bar's own
// keyboard behavior, a deep link's starting tab, the pictures' inert boundary, and every frame's
// default-mode grounds, the first screen, and OpenWrite's reading widths.
// Each pass is a function that takes a page and adds to problems; every
// mismatch is a problem, and the script lists them all and exits 1 if any.

const tokens = resolve(JSON.parse(readFileSync('tokens.json', 'utf8')));
const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
// Both sides of every color comparison pass through rgba(): no spaces, and ".35" for "0.35".
const rgba = (s) => s.replace(/\s+/g, '').replace('0.', '.');
// A token is a hex or an rgba string. A hex becomes the rgb() form Chromium reports; an rgba
// string (ink's --g-line-control is --mast-line-strong) is compared as written.
const color = (key) => { const v = tokens.get(key); return v.startsWith('#') ? hex2rgb(v) : v; };
// Expected rendered colors per ground: the boundary at rest and on select hover, the error
// border, and the focus border.
const expect = {
  surface: { rest: color('line-control'), error: color('red'), focus: color('signal') },
  well: { rest: color('line-control'), error: color('red'), focus: color('signal') },
  ink: { rest: color('mast-line-strong'), error: color('red-on-ink'), focus: color('sky') },
};

const problems = [];

// The sheet pass: the five checks the file has always run, now taking its page (already opened
// at 1280 wide, with reduced motion emulated) as a parameter so a second pass can share the
// browser.
async function checkSheet(page, problems) {
  await page.goto(pathToFileURL('cristian-vega-design-system.html').href);

  // 1. layout at 1280 wide: the masthead starts at the top of the page, the hidden icon sprite
  // does not lay out, and the page does not scroll sideways.
  const layout = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const sprite = document.querySelector('svg[hidden]');
    return {
      mastTop: document.querySelector('.d-mast').getBoundingClientRect().top,
      sprite: sprite ? getComputedStyle(sprite).display : 'missing',
      scrollWidth: document.scrollingElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
  if (layout.mastTop !== 0) problems.push(`layout: .d-mast sits at ${layout.mastTop}px at scroll 0, expected 0`);
  if (layout.sprite !== 'none') problems.push(`layout: the hidden icon sprite has display ${layout.sprite}, expected none`);
  if (layout.scrollWidth > layout.innerWidth) problems.push(`layout: the page is ${layout.scrollWidth}px wide in a ${layout.innerWidth}px window`);
  console.log(`layout: masthead at ${layout.mastTop}, sprite ${layout.sprite}, page ${layout.scrollWidth} wide in ${layout.innerWidth}`);

  // 2. tab order: every stop, the ring, pictures, and dialogs
  const counts = await page.evaluate(() => {
    const main = document.getElementById('main');
    const notInert = (el) => !el.closest('[inert]');
    const ok = (el) => !el.matches(':disabled') && notInert(el);
    const count = (sel) => [...main.querySelectorAll(sel)].filter(ok).length;
    const radios = [...main.querySelectorAll('input[type="radio"]')].filter(ok);
    const radioGroups = new Set(radios.map((r) => r.name)).size;
    const controls = count('button') + count('input:not([type="radio"])') + count('textarea') + count('select') + count('a[href]') + radioGroups;
    // Chromium makes a scroll container keyboard-focusable when it overflows and holds no focusable
    // element, so such a container is one more expected stop. A control that scrolls on its own,
    // such as a textarea, is already counted above.
    const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]';
    const scrolls = (v) => v === 'auto' || v === 'scroll';
    const scrollContainers = [...main.querySelectorAll('*')].filter((el) => {
      if (!ok(el) || el.closest('.picture') || el.matches(FOCUSABLE)) return false;
      const cs = getComputedStyle(el);
      if (!scrolls(cs.overflowX) && !scrolls(cs.overflowY)) return false;
      if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return false;
      return ![...el.querySelectorAll(FOCUSABLE)].some(ok);
    }).length;
    const disabled = [...main.querySelectorAll('button, input, textarea, select')].filter((el) => el.matches(':disabled') && notInert(el)).length;
    return { expected: controls + scrollContainers, scrollContainers, disabled };
  });

  const seen = new Set();
  let stopsInMain = 0, ringMissing = 0;
  for (let i = 0; i < counts.expected + counts.disabled + 50; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // Keyed by identity: surface and ink frames repeat the same classes and text, which would
      // dedupe two different elements onto the same key and end the loop early.
      const key = Array.prototype.indexOf.call(document.querySelectorAll('*'), el);
      const ownText = el.textContent.trim();
      const labelText = ownText || (el.closest('label') ? el.closest('label').textContent.trim() : '');
      const label = `${el.tagName}|${el.id || el.getAttribute('aria-label') || labelText.slice(0, 20)}`;
      let ring;
      if (el.matches('.input input, .select select, .composer__field')) {
        const ringEl = el.closest('.input, .select, .composer');
        ring = !!ringEl && getComputedStyle(ringEl).boxShadow !== 'none';
      } else if (el.matches('.textarea')) {
        ring = getComputedStyle(el).boxShadow !== 'none';
      } else if (el.matches('.switch input, .check input, .radio input')) {
        const ringEl = el.nextElementSibling;
        const cs = ringEl && getComputedStyle(ringEl);
        ring = !!cs && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
      } else {
        const cs = getComputedStyle(el);
        ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
      }
      return {
        key, label,
        disabled: el.disabled === true,
        inMain: !!el.closest('main'),
        inPicture: !!el.closest('.picture'),
        isDialog: el.tagName === 'DIALOG',
        ring,
      };
    });
    if (!info) break;
    if (seen.has(info.key)) break;
    seen.add(info.key);
    if (info.disabled) problems.push(`disabled control received focus: ${info.label}`);
    if (info.inPicture) problems.push(`tab stop inside a picture: ${info.label}`);
    if (info.isDialog) problems.push(`tab stop is a dialog: ${info.label}`);
    if (info.inMain) {
      stopsInMain++;
      if (!info.ring) { ringMissing++; problems.push(`no focus ring on ${info.label}`); }
    }
  }
  console.log(`tab order: ${stopsInMain} stops, ${counts.expected} expected, ${counts.disabled} disabled skipped, ${ringMissing} without a ring`);
  console.log(`tab order: the expected count includes ${counts.scrollContainers} keyboard-focusable scroll container(s)`);
  // A shortfall means a control Tab cannot reach; a surplus means a stop the count did not
  // foresee, such as a stray tabindex. Both are problems.
  if (stopsInMain !== counts.expected) problems.push(`${stopsInMain} tab stops in main, expected ${counts.expected}`);

  // 3. interactions: switch and check flip on Space, a radio group moves on ArrowDown
  async function testToggle(kind, selector, keyName) {
    const idx = await page.evaluate((sel) => {
      const main = document.getElementById('main');
      return [...main.querySelectorAll(sel)].findIndex((el) => !el.disabled && !el.closest('[inert]'));
    }, selector);
    if (idx === -1) { problems.push(`${kind}: no enabled control in main to test`); return; }
    const loc = page.locator(`main ${selector}`).nth(idx);
    const label = await loc.evaluate((el) => el.id || el.getAttribute('aria-label') || (el.closest('label') ? el.closest('label').textContent.trim().slice(0, 20) : ''));
    const before = await loc.isChecked();
    await loc.focus();
    await page.keyboard.press(keyName);
    const after = await loc.isChecked();
    if (after === before) problems.push(`${kind} did not flip on ${keyName}: ${label}`);
  }
  await testToggle('switch', '.switch input', 'Space');
  await testToggle('check', '.check input', 'Space');

  const radioInfo = await page.evaluate(() => {
    const main = document.getElementById('main');
    const all = [...main.querySelectorAll('.radio input')];
    const enabled = all.filter((el) => !el.disabled && !el.closest('[inert]'));
    if (!enabled.length) return null;
    const groupName = enabled[0].name;
    const group = enabled.filter((r) => r.name === groupName);
    const checkedIdx = group.findIndex((r) => r.checked);
    const from = checkedIdx === -1 ? 0 : checkedIdx;
    const to = (from + 1) % group.length;
    const label = (el) => el.id || el.getAttribute('aria-label') || (el.closest('label') ? el.closest('label').textContent.trim().slice(0, 20) : '');
    return { groupName, fromIdx: all.indexOf(group[from]), toIdx: all.indexOf(group[to]), fromLabel: label(group[from]), toLabel: label(group[to]) };
  });
  if (!radioInfo) {
    problems.push('radio: no enabled radio group in main to test');
  } else {
    const fromLoc = page.locator('main .radio input').nth(radioInfo.fromIdx);
    const toLoc = page.locator('main .radio input').nth(radioInfo.toIdx);
    await fromLoc.focus();
    await page.keyboard.press('ArrowDown');
    if (!(await toLoc.isChecked())) problems.push(`radio did not move with ArrowDown: ${radioInfo.groupName} from ${radioInfo.fromLabel} to ${radioInfo.toLabel}`);
  }

  // The switch/check presses above flip live state; reload so the boundary section below (which
  // reads a checked switch's track color) sees the sheet's resting markup, not our mutations.
  await page.reload();

  // 4. rendered boundaries per ground and state, each compared to its token
  // ':has(.input)' alone also matches frames with no real field: the Focus section's decorative
  // .input--specimen (earliest in document order, so '.first()' lands there) and an inert popover
  // picture's filter box further down. Neither has a nested <input>, so .focus() below would hang.
  // ':has(.input input)' requires a real, focusable field, which is what this check needs to focus.
  // The well frame holds one field and no error field, select, textarea, or composer; a state
  // a frame does not show is skipped.
  for (const [ground, sel] of [['surface', '.spec.g--surface:has(.input input)'], ['ink', '.spec.g--ink:has(.input input)'], ['well', '.ground-test .g--well']]) {
    const want = expect[ground];
    const frame = page.locator(sel).first();
    const compare = (what, got, wanted) => { if (rgba(got) !== rgba(wanted)) problems.push(`${ground} ${what}: ${got}, expected ${wanted}`); };

    // the boundary at rest
    const input = frame.locator('.input').first();
    const rest = await input.evaluate((e) => getComputedStyle(e).borderTopColor);
    compare('input border at rest', rest, want.rest);

    // a checked switch's track is the signal color
    const sw = frame.locator('.switch:has(:checked) i').first();
    if (await sw.count()) { const bg = await sw.evaluate((e) => getComputedStyle(e).backgroundColor); compare('checked switch track', bg, color('azure')); }

    // an error field's border is red
    const err = frame.locator('.input:has([aria-invalid="true"])').first();
    if (await err.count()) {
      const b = await err.evaluate((e) => getComputedStyle(e).borderTopColor);
      console.log(`${ground} error border: ${b}`);
      compare('error border', b, want.error);
    }

    // the select's border stays the boundary color on hover
    const select = frame.locator('.select:has(select)').first();
    if (await select.count()) {
      await select.hover();
      const b = await select.evaluate((e) => getComputedStyle(e).borderTopColor);
      console.log(`${ground} select hover border: ${b}`);
      compare('select hover border', b, want.rest);
      await page.mouse.move(0, 0);
    }

    // focus: the wrapper takes the focus color and draws the ring
    await input.locator('input').focus();
    const focus = await input.evaluate((e) => ({ b: getComputedStyle(e).borderTopColor, s: getComputedStyle(e).boxShadow }));
    compare('input border on focus', focus.b, want.focus);
    if (focus.s === 'none') problems.push(`${ground} input focus: no ring`);
    console.log(`${ground} input border at rest: ${rest}; on focus: ${focus.b}`);

    // one ring: the control inside a wrapper, and the textarea, draw no outline of their own
    for (const controlSel of ['.input input', '.select select', '.textarea', '.composer__field']) {
      const control = frame.locator(`${controlSel}:not(:disabled)`).first();
      if (!(await control.count())) continue;
      await control.focus();
      const outline = await control.evaluate((e) => getComputedStyle(e).outlineStyle);
      if (outline !== 'none') problems.push(`${ground} ${controlSel}: outline ${outline} on focus, expected none (the ring is the wrapper's)`);
    }
  }

  // 5. Modes: each figure.picture .frame[data-mode] maps its edge (the aside) and its main region
  // to the mode's grounds. A component inside a region reads that ground: the input in the main
  // region paints ink-well in dark mode and surface in default and light mode. The three pictures
  // sit in document order: default, dark, light; a missing or an extra picture is a problem.
  // Reading them positionally (not by re-querying [data-mode="..."]) is what lets the fault proof
  // below surface as a mismatch instead of a missing-element crash.
  const frameModes = [
    { mode: 'default', edge: color('ink-deep'), main: color('surface'), input: color('surface') },
    { mode: 'dark', edge: color('ink-deep'), main: color('ink'), input: color('ink-well') },
    { mode: 'light', edge: color('surface-well'), main: color('surface'), input: color('surface') },
  ];
  const modeFrames = page.locator('figure.picture .frame[data-mode]');
  const modeCount = await modeFrames.count();
  if (modeCount !== frameModes.length) problems.push(`modes: ${modeCount} mode pictures, expected ${frameModes.length}`);
  for (let i = 0; i < Math.min(modeCount, frameModes.length); i++) {
    const { mode, edge, main, input } = frameModes[i];
    const modeFrame = modeFrames.nth(i);
    const edgeBg = await modeFrame.locator('aside.frame__edge').evaluate((e) => getComputedStyle(e).backgroundColor);
    const mainBg = await modeFrame.locator('.frame__main').evaluate((e) => getComputedStyle(e).backgroundColor);
    const inputBg = await modeFrame.locator('.frame__main .input').evaluate((e) => getComputedStyle(e).backgroundColor);
    if (rgba(edgeBg) !== rgba(edge)) problems.push(`${mode} edge: ${edgeBg}, expected ${edge}`);
    if (rgba(mainBg) !== rgba(main)) problems.push(`${mode} main: ${mainBg}, expected ${main}`);
    if (rgba(inputBg) !== rgba(input)) problems.push(`${mode} input: ${inputBg}, expected ${input}`);
    console.log(`${mode} mode: edge ${edgeBg}, main ${mainBg}, input ${inputBg}`);
  }
}

// The document pass: cristian-vega-products.html has its own tab bar, deep links, and eighteen
// frames drawn on the built system. Four checks, one line each: the tab bar's own keyboard
// behavior, a deep link's starting tab, the pictures' inert boundary (the sheet's own tab-walk
// method, section 2 above), and every frame's default-mode grounds.
async function checkDocument(page, problems) {
  const url = pathToFileURL('cristian-vega-products.html').href;
  const PRODUCTS = ['openbuild', 'openwrite', 'opendictate'];
  // What the document holds. The counts are asserted, not just printed: a screen that loses its
  // drawing, or a figure that goes missing, is a silent loss otherwise.
  const FIGURES = 21, FRAMES = 18;

  // A goto() straight from one hash to another is a same-document navigation here: the file
  // does not change, so the script does not re-run, only its hashchange listener does. "Loading
  // the document with #x" means a real load, so about:blank first forces every open() below to
  // be one, with the hash already in the URL when the script's own startup code reads it. Then
  // the document's own stage script needs document.fonts.ready and a resize before anything is
  // fitted and safe to measure.
  async function open(hash) {
    await page.goto('about:blank');
    await page.goto(hash ? `${url}#${hash}` : url);
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  }
  const activeId = () => page.evaluate(() => (document.activeElement ? document.activeElement.id : null));
  const panelState = () => page.evaluate(
    (ids) => Object.fromEntries(ids.map((id) => [id, document.getElementById(id).hidden])),
    PRODUCTS,
  );
  // One panel showing and the other two hidden, for a given target. Shared by the tabs check
  // (activation ought to show the tab's own panel) and the deep-link check (so ought a load).
  function checkPanels(label, state, targetId) {
    let ok = true;
    if (state[targetId]) { problems.push(`${label}: #${targetId} is hidden, expected visible`); ok = false; }
    for (const other of PRODUCTS.filter((id) => id !== targetId)) {
      if (!state[other]) { problems.push(`${label}: #${other} is visible too, expected hidden`); ok = false; }
    }
    return ok;
  }

  // 1. Tabs: the roving-tabindex tablist gives only the selected tab a place in the sequential
  // Tab order; ArrowRight moves that place and, in this script, activates the panel in the same
  // call. Enter on the first tab exercises the click-activated path too, since a button's native
  // Enter behavior is a click, which is what the script's own listener answers.
  await open();
  let reached = null;
  for (let i = 0; i < 15 && reached === null; i++) {
    await page.keyboard.press('Tab');
    if ((await activeId()) === 'tab-openbuild') reached = 'tab-openbuild';
  }
  if (reached !== 'tab-openbuild') problems.push('tabs: keyboard Tab never reached tab-openbuild');
  await page.keyboard.press('Enter');
  let tabsOk = 0;
  if (checkPanels('tabs', await panelState(), 'openbuild')) tabsOk++;

  await page.keyboard.press('ArrowRight');
  if ((await activeId()) !== 'tab-openwrite') problems.push('tabs: ArrowRight from tab-openbuild did not move focus to tab-openwrite');
  if (checkPanels('tabs', await panelState(), 'openwrite')) tabsOk++;

  await page.keyboard.press('ArrowRight');
  if ((await activeId()) !== 'tab-opendictate') problems.push('tabs: ArrowRight from tab-openwrite did not move focus to tab-opendictate');
  if (checkPanels('tabs', await panelState(), 'opendictate')) tabsOk++;

  console.log(`tabs: 3 tabs reached by keyboard (Tab, then ArrowRight), ${tabsOk} of 3 activations showed their own panel and hid the other two`);

  // 2, 3, and 4: open each product by the deep link a shared URL would use, then check that
  // load, the picture tab-stops, and the frame grounds while that product's own tab is the one
  // showing — the other two panels are hidden, and hold most of the eighteen frames until their
  // own tab is chosen.
  const deepLinkLine = [];
  let pictureStops = 0, figuresSeen = 0, drawingMisses = 0;
  let groundMismatches = 0, framesSeen = 0;
  const edgeExpect = color('ink-deep'), mainExpect = color('surface');

  for (const id of PRODUCTS) {
    await open(id);

    // 2. deep link: loading with #id shows that product's panel and hides the other two.
    const shown = checkPanels(`deep link #${id}`, await panelState(), id);
    deepLinkLine.push(`#${id} -> ${shown ? 'its panel' : 'wrong panel'}`);

    // 3. pictures: walk the tab order (the sheet's own method above) and flag any stop that
    // sits inside a picture's div.picture__body, which is what the document's facts name as the
    // inert element (and what the fault proof below un-inerts) — not the whole figure.s-screen,
    // which also holds the figure's own real, readable table of what each numbered region does.
    // That table is not a picture: at 1280px, seven of it in OpenBuild are their own deliberate
    // overflow-x: auto (#openbuild .s-spec table has a wider min-width than fits), and Chromium
    // makes an overflowing container with no focusable content of its own a keyboard tab stop so
    // a keyboard reader can scroll it — the same allowance the sheet's own tab-order count (the
    // scrollContainers term above) gives outside a picture.
    // Ruling R29 puts the image role and the label on the drawing, so the figure's heading,
    // caption, and region table stay ordinary content. The named element is the stage that wraps
    // the drawing; two figures draw a flowing strip with no stage, and there the drawing itself
    // is named and its own child carries inert. A browser drops an inert subtree from the
    // accessibility tree, so the named element must never be inert: that is the assertion that
    // catches a role put on the inert body. A miss is named by the figure's id, or by its
    // caption when it has no id.
    const drawings = await page.evaluate((id) => {
      const out = [];
      for (const fig of document.getElementById(id).querySelectorAll('figure.s-screen')) {
        const caption = fig.querySelector('figcaption');
        const name = fig.id || (caption ? caption.textContent.trim().slice(0, 40) : '') || '(figure with no id and no caption)';
        if (fig.hasAttribute('role')) out.push({ name, miss: `the figure still carries role="${fig.getAttribute('role')}"` });
        const body = fig.querySelector('.picture__body');
        if (!body) { out.push({ name, miss: 'no drawing' }); continue; }
        const named = body.closest('.stage') || body;
        if (named.getAttribute('role') !== 'img') out.push({ name, miss: 'the drawing has no role="img"' });
        if (!(named.getAttribute('aria-label') || '').trim()) out.push({ name, miss: 'the drawing has no label' });
        if (named.closest('[inert]')) out.push({ name, miss: 'the role sits on an inert element, so no browser announces it' });
        if (!body.hasAttribute('inert') && !body.querySelector('[inert]')) out.push({ name, miss: 'nothing inside the drawing is inert' });
      }
      return { count: document.getElementById(id).querySelectorAll('figure.s-screen').length, out };
    }, id);
    figuresSeen += drawings.count;
    drawingMisses += drawings.out.length;
    for (const miss of drawings.out) problems.push(`pictures: ${miss.name}: ${miss.miss}`);
    const seen = new Set();
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const key = Array.prototype.indexOf.call(document.querySelectorAll('*'), el);
        const ownText = el.textContent.trim();
        const label = `${el.tagName}|${el.id || el.getAttribute('aria-label') || ownText.slice(0, 20)}`;
        return { key, label, inPicture: !!el.closest('.picture__body') };
      });
      if (!info) break;
      if (seen.has(info.key)) break;
      seen.add(info.key);
      if (info.inPicture) { pictureStops++; problems.push(`pictures: tab stop inside a picture on #${id}: ${info.label}`); }
    }

    // 4. modes: every frame in this panel paints ink-deep on its edge region(s) and surface on
    // its main region(s); a frame can hold more than one of each (a title bar and a sidebar are
    // both edges). The selector reads any data-mode value, not just "default": re-querying for
    // "default" specifically would let a frame that no longer says "default" drop out of the
    // count instead of surfacing as a mismatch (the sheet's section 5 above makes the same
    // choice, positionally, for the same reason).
    const { frameCount, checks } = await page.evaluate((id) => {
      const panel = document.getElementById(id);
      const out = [];
      const frames = [...panel.querySelectorAll('.frame[data-mode]')];
      for (const frame of frames) {
        const body = frame.closest('.picture__body');
        const drawing = body ? (body.closest('.stage') || body) : null;
        const label = drawing ? drawing.getAttribute('aria-label') : '(frame outside a drawing)';
        for (const edge of frame.querySelectorAll('.frame__edge')) out.push({ label, part: 'edge', bg: getComputedStyle(edge).backgroundColor });
        for (const main of frame.querySelectorAll('.frame__main')) out.push({ label, part: 'main', bg: getComputedStyle(main).backgroundColor });
      }
      return { frameCount: frames.length, checks: out };
    }, id);
    framesSeen += frameCount;
    for (const c of checks) {
      const want = c.part === 'edge' ? edgeExpect : mainExpect;
      if (rgba(c.bg) !== rgba(want)) { groundMismatches++; problems.push(`modes: ${c.label}: ${c.part} ${c.bg}, expected ${want}`); }
    }
  }

  if (figuresSeen !== FIGURES) problems.push(`pictures: ${figuresSeen} figures across 3 panels, expected ${FIGURES}`);
  if (framesSeen !== FRAMES) problems.push(`modes: ${framesSeen} frames across 3 panels, expected ${FRAMES}`);

  console.log(`deep links: ${deepLinkLine.join('; ')}`);
  console.log(`pictures: ${pictureStops} tab stop(s) inside a picture, ${figuresSeen} of ${FIGURES} figures across 3 panels, ${drawingMisses} drawing(s) without the role and the label`);
  console.log(`modes: ${groundMismatches} mismatch(es) across ${framesSeen} frames' edge (ink-deep ${edgeExpect}) and main (surface ${mainExpect}) regions`);

  // Measure the unscaled CSS layout, including the frame border and every ancestor's padding.
  // These are inert drawings. The closed state is simulated by removing the agent's grid track;
  // this checks the available prose width, not a working native pane toggle.
  await open('openwrite');
  const readerWidths = await page.evaluate(() => [...document.querySelectorAll('#openwrite .sk-reader')].map(reader => {
    const pane = reader.parentElement, grid = pane.parentElement, agent = grid.lastElementChild;
    const prose = reader.querySelector('.prose');
    const width = node => parseFloat(getComputedStyle(node).width);
    const beforeGrid = grid.getAttribute('style'), beforeAgent = agent.getAttribute('style');
    const result = { openPane: width(pane), openProse: width(prose) };
    try {
      grid.style.gridTemplateColumns = '218px 292px minmax(0, 1fr)';
      agent.style.display = 'none';
      result.closedPane = width(pane);
      result.closedProse = width(prose);
    } finally {
      if (beforeGrid === null) grid.removeAttribute('style'); else grid.setAttribute('style', beforeGrid);
      if (beforeAgent === null) agent.removeAttribute('style'); else agent.setAttribute('style', beforeAgent);
    }
    return result;
  }));
  if (readerWidths.length !== 3) problems.push(`OpenWrite: ${readerWidths.length} Note drawings, expected 3`);
  for (const [index, widths] of readerWidths.entries()) {
    for (const [key, wanted] of Object.entries({ openPane: 628, openProse: 516, closedPane: 928, closedProse: 760 })) {
      if (Math.abs(widths[key] - wanted) > 0.1) problems.push(`OpenWrite drawing ${index + 1}: ${key} ${widths[key]}, expected ${wanted}`);
    }
  }
  const readerCopy = await page.locator('#openwrite').textContent();
  if (!readerCopy.includes('At 1440 the prose column is 516 px wide') || !readerCopy.includes('It is 760 px wide with the pane closed.')) {
    problems.push('OpenWrite: the ship check must state the measured prose widths');
  }
  console.log(`OpenWrite reader widths (CSS px, closed state simulated): ${JSON.stringify(readerWidths)}`);

  // 5. The first screen and the bar. The masthead and the tab bar together fill the viewport, so a
  // person lands on the whole masthead with the bar at its foot. The bar then pins to the top, and
  // the page script marks it, so the pinned form can differ from the resting one.
  //
  // The three tabs are the only buttons in the document that no ground holds, so the system's own
  // button reset (:where(.g, .frame__edge, .frame__main) button) never reaches them. The document
  // resets them itself. Native button chrome here is the regression this section catches: it
  // painted the tabs grey, in the browser's own face, with white text that could not be read.
  await open('openbuild');
  const first = await page.evaluate(() => {
    const mast = document.querySelector('.s-mast'), bar = document.querySelector('.s-tabs');
    const cs = getComputedStyle(document.querySelector('.s-tab:not([aria-selected="true"])'));
    const on = getComputedStyle(document.querySelector('.s-tab[aria-selected="true"]'));
    return {
      mast: mast.getBoundingClientRect().height,
      bar: bar.getBoundingClientRect().height,
      viewport: window.innerHeight,
      appearance: cs.appearance,
      background: cs.backgroundColor,
      font: cs.fontFamily,
      selectedBackground: on.backgroundColor,
      marked: bar.classList.contains('is-pinned'),
    };
  });
  const firstScreen = Math.round(first.mast + first.bar);
  if (Math.abs(firstScreen - first.viewport) > 2) {
    problems.push(`first screen: masthead ${Math.round(first.mast)} and bar ${Math.round(first.bar)} make ${firstScreen}, expected the viewport ${first.viewport}`);
  }
  if (first.appearance !== 'none') problems.push(`tabs: a tab keeps the browser's own button look (appearance: ${first.appearance})`);
  if (rgba(first.background) !== 'rgba(0,0,0,0)') problems.push(`tabs: a tab paints ${first.background} at rest, expected no background of its own`);
  if (!first.font.startsWith('"IBM Plex Sans"')) problems.push(`tabs: a tab reads ${first.font}, expected the document's own body face`);
  if (rgba(first.selectedBackground) === 'rgba(0,0,0,0)') problems.push('tabs: the selected tab paints no background, expected the raised tint');
  if (first.marked) problems.push('tabs: the bar is marked pinned before any scroll');

  const pinned = await page.evaluate(async () => {
    const bar = document.querySelector('.s-tabs');
    const settle = () => new Promise((r) => setTimeout(r, 150));
    window.scrollTo({ top: window.innerHeight * 2, behavior: 'instant' }); await settle();
    const out = { marked: bar.classList.contains('is-pinned'), top: bar.getBoundingClientRect().top };
    window.scrollTo({ top: 0, behavior: 'instant' }); await settle();
    out.back = bar.classList.contains('is-pinned');
    return out;
  });
  if (!pinned.marked) problems.push('tabs: the bar is not marked pinned after a scroll');
  if (Math.round(pinned.top) !== 0) problems.push(`tabs: the bar sits at ${Math.round(pinned.top)} once scrolled, expected the top of the screen`);
  if (pinned.back) problems.push('tabs: the bar stays marked pinned after the scroll returns to the top');

  console.log(`first screen: masthead ${Math.round(first.mast)} and bar ${Math.round(first.bar)} fill ${firstScreen} of ${first.viewport}; the tabs carry no native button look`);
  console.log(`tabs: at rest ${first.background} in ${first.font.split(',')[0]}; selected ${first.selectedBackground}`);
  console.log(`bar: unmarked at rest, marked and at the top once scrolled, unmarked again on return`);
}

let browser;
try {
  browser = await chromium.launch();
} catch {
  console.error('browser: Chromium is missing. Run: npx playwright install chromium');
  process.exit(1);
}

const sheetPage = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
// The sheet's own @media (prefers-reduced-motion: reduce) block sets transition-duration: 0s.
// Without it, border-color/box-shadow reads taken right after a focus change land mid-transition
// (--dur-hover is 150ms) instead of at the rendered target value.
await sheetPage.emulateMedia({ reducedMotion: 'reduce' });
await checkSheet(sheetPage, problems);

// The document pass reuses the same browser, on its own page, so it starts its own tab order
// fresh from the top. The document is much larger than the sheet, so its page gets a generous
// default timeout.
const docPage = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await docPage.emulateMedia({ reducedMotion: 'reduce' });
docPage.setDefaultTimeout(60000);
await checkDocument(docPage, problems);

await browser.close();
for (const p of problems) console.error('browser:', p);
console.log(problems.length ? `browser: ${problems.length} problem(s)` : 'browser: ok');
process.exit(problems.length ? 1 : 0);
