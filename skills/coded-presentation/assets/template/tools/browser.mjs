#!/usr/bin/env node
/**
 * Check the deck in a real, windowless browser.
 *
 *   node tools/browser.mjs screenshots         one PNG per slide and per step, at 1920×1080
 *   node tools/browser.mjs measure --slide 12 --script measure.js
 *                                              runs a script inside the slide and prints what it returns
 *
 * Why this tool: a scaled-down screenshot hides defects that are a few pixels wide (a clipped
 * letter, an offset dot), and a hidden browser pauses animations. Here the browser really runs,
 * at full size. No dependencies: Node 22 or later, and Chrome, Chromium, Edge or Brave
 * (otherwise, give its path in the CHROME_PATH environment variable).
 *
 * Common options
 *   --dist <folder>    serve this folder (the output of `vite build`); default: dist
 *   --url <address>    or use a server that is already running, e.g. http://localhost:5180
 *   --size 1920x1080   window size (also try 2560x1080 and 1280x800)
 *
 * screenshots
 *   --out <folder>     where to write the images; default: screenshots
 *   --slides 3,7-9     only capture these slides (numbered from 1)
 *   --steps final      a single image per slide, at its last step (default: every step)
 *   --wait 3500        milliseconds given to animations before each image
 *
 * measure
 *   --slide 12 --step 1    where to go (step 1 is the first one)
 *   --script <file>        file holding a JavaScript expression, often `(async () => {…})()`
 *   --wait 1500            milliseconds to wait before running the script
 */
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const [command, ...rest] = process.argv.slice(2);
const opt = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) opt[rest[i].slice(2)] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
}
if (!['screenshots', 'measure'].includes(command)) {
  console.error(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''));
  process.exit(command ? 1 : 0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [width, height] = String(opt.size ?? '1920x1080').split('x').map(Number);

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error('No Chromium browser found. Set its path in the CHROME_PATH environment variable.');
  return found;
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4' };

/** Serves the built folder for the duration of the check. */
function serve(dir) {
  const root = resolve(dir);
  if (!existsSync(join(root, 'index.html'))) throw new Error(`No index.html in ${root}. Run the build first (vite build).`);
  return new Promise((done) => {
    const server = createServer((req, res) => {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
      let file = join(root, path);
      if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => done({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() }));
  });
}

function freePort() {
  return new Promise((done) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => done(port));
    });
  });
}

async function openBrowser() {
  const port = await freePort();
  const profile = mkdtempSync(join(tmpdir(), 'deck-browser-'));
  const chrome = spawn(
    findChrome(),
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      `--window-size=${width},${height}`,
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      // The deck must run as it would in front of a room: no throttling of animations.
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      // WebGL even when no GPU is available.
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(200);
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
    } catch {
      /* the browser is still starting */
    }
  }
  if (!target) {
    chrome.kill();
    throw new Error('The browser is not responding.');
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, ko) => {
    ws.onopen = ok;
    ws.onerror = () => ko(new Error('Could not connect to the browser.'));
  });
  let id = 0;
  const pending = new Map();
  const problems = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method === 'Runtime.exceptionThrown') {
      problems.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      problems.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
  };
  const send = (method, params = {}) =>
    new Promise((ok, ko) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? ko(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  /** Evaluates an expression in the page and returns its value (promises are awaited). */
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  return {
    send,
    evaluate,
    problems,
    close: async () => {
      ws.close();
      // Wait until the browser has really stopped before deleting its temporary profile.
      const gone = new Promise((done) => chrome.once('exit', done));
      chrome.kill();
      await Promise.race([gone, sleep(3000)]);
      try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch {
        /* harmless: the system will clean up the temp folder */
      }
    },
  };
}

/** "3,7-9" → [3, 7, 8, 9] */
function parseSlides(spec, count) {
  if (!spec || spec === true) return Array.from({ length: count }, (_, i) => i + 1);
  return String(spec)
    .split(',')
    .flatMap((part) => {
      const [a, b = a] = part.split('-').map(Number);
      return Array.from({ length: b - a + 1 }, (_, i) => a + i);
    })
    .filter((n) => n >= 1 && n <= count);
}

const site = opt.url ? { url: String(opt.url).replace(/\/?$/, '/'), close() {} } : await serve(opt.dist === true || !opt.dist ? 'dist' : opt.dist);
const browser = await openBrowser();
let failed = false;

try {
  // ?capture keeps the WebGL image in memory: without it, the background can come out black in a screenshot.
  await browser.send('Page.navigate', { url: `${site.url}?capture#/1/0` });
  for (let i = 0; i < 50 && !(await browser.evaluate('!!window.__deck')); i++) await sleep(200);
  const slides = await browser.evaluate('window.__deck.slides');
  if (!slides) throw new Error('The page does not expose window.__deck: is this really a deck built from the template?');
  await browser.evaluate('document.fonts.ready.then(() => true)');

  if (command === 'screenshots') {
    const out = resolve(opt.out === true || !opt.out ? 'screenshots' : opt.out);
    mkdirSync(out, { recursive: true });
    const wait = Number(opt.wait ?? 3500);
    const finalOnly = opt.steps === 'final';
    const shot = async (file) => {
      const { data } = await browser.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(out, file), Buffer.from(data, 'base64'));
      console.log(`  ${file}`);
    };
    const list = parseSlides(opt.slides, slides.length);
    console.log(`${list.length} slide(s) → ${out}`);
    for (const n of list) {
      const s = slides[n - 1];
      const base = `${String(n).padStart(2, '0')}-${s.id}`;
      if (finalOnly) {
        await browser.evaluate(`window.__deck.goto(${n - 1}, ${s.steps - 1})`);
        await sleep(wait + 1500);
        await shot(`${base}.png`);
        continue;
      }
      // Steps are played one by one, as in a live talk: that is how intermediate states show up
      // (a text overlapping another for the length of one step, for instance).
      await browser.evaluate(`window.__deck.goto(${n - 1}, 0)`);
      for (let step = 0; step < s.steps; step++) {
        if (step > 0) await browser.evaluate('window.__deck.next()');
        await sleep(wait);
        await shot(s.steps > 1 ? `${base}-s${step + 1}.png` : `${base}.png`);
      }
    }
  } else {
    if (!opt.script || opt.script === true) throw new Error('measure: give the file to run with --script.');
    const n = Number(opt.slide ?? 1);
    const step = Number(opt.step ?? 1);
    await browser.evaluate(`window.__deck.goto(${n - 1}, ${step - 1})`);
    await sleep(Number(opt.wait ?? 1500));
    const value = await browser.evaluate(readFileSync(resolve(opt.script), 'utf8'));
    console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }

  if (browser.problems.length) {
    failed = true;
    console.error(`\n${browser.problems.length} error(s) in the browser console:`);
    for (const p of [...new Set(browser.problems)].slice(0, 12)) console.error(`  ${String(p).split('\n')[0]}`);
  }
} catch (e) {
  failed = true;
  console.error(e.message);
} finally {
  await browser.close();
  site.close();
}
process.exit(failed ? 1 : 0);
