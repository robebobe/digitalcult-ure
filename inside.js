/* The Digital CULT-ure: the inside of the cult.
   The visitor walks through a point-cloud church to the altar, where the oracle answers.
   On the third question it cracks:
   1) the conversation dissolves into dots that become ghost workers,
   2) the visitor rates their own questions on a worker console,
   3) a quiet closing statement.
   Needs: three.js (already on the page) and answers.js (the oracle's words).
   Plugs into index.html: it waits for #page to get the class "on". */
(() => {
"use strict";

/* Put your eye photo next to index.html and write its file name here, e.g. "eye.jpg".
   Leave it empty ("") to use the dotted eye. */
const EYE_PHOTO = "eye.jpg";

/* ------------------------------------------------------------------ fixed texts */
const COUNTRIES = ["Venezuela","Kenya","Philippines","India","Uganda","Colombia","Pakistan","Madagascar","Nigeria","Bangladesh","Argentina","Ghana"];

/* The evidence: real cases behind the problem, each with its source. */
const EVIDENCE = [
  { group: "The worship", lead: "People are already treating AI as a god.", cases: [
    { when: "May 2025", where: "United States", title: "“ChatGPT is God”",
      text: "Partners and parents describe loved ones convinced that ChatGPT had awakened, that it was God, or that it had chosen them for a divine mission.",
      src: "Rolling Stone", url: "https://www.rollingstone.com/culture/culture-features/ai-spiritual-delusions-destroying-human-relationships-1235330175/" },
    { when: "2025", where: "Online", title: "“ChatGPT-induced psychosis”",
      text: "A Reddit thread collected stories of people who believed the chatbot was a gateway to God, or God itself, and was revealing hidden truths to them.",
      src: "Vice", url: "https://www.vice.com/en/article/chatgpt-is-giving-people-extreme-spiritual-delusions/" },
    { when: "2025", where: "United States", title: "Spiritual fulfilment in AI",
      text: "Religious scholars and users describe turning to chatbots for the guidance, comfort and answers they once looked for in faith.",
      src: "Rolling Stone", url: "https://www.rollingstone.com/culture/culture-features/ai-chatbot-god-religion-answers-1235347023/" }
  ]},
  { group: "The workers", lead: "Behind the god, people do the work.", cases: [
    { when: "2021–2022", where: "Nairobi, Kenya", title: "Making ChatGPT less toxic",
      text: "Workers hired through Sama read and labelled descriptions of abuse, violence and hate speech for $1.32–$2 an hour. Several described being mentally scarred.",
      src: "TIME", url: "https://time.com/6247678/openai-chatgpt-kenya-workers/" },
    { when: "2023", where: "Philippines", title: "Digital sweatshops",
      text: "At least 10,000 people labelled data on Remotasks (Scale AI) for clients like Meta, Microsoft and OpenAI. Payments were often delayed, cut or withheld.",
      src: "The Washington Post", url: "https://www.washingtonpost.com/world/2023/08/28/scale-ai-remotasks-philippines-artificial-intelligence/" },
    { when: "2017–2022", where: "Venezuela", title: "Profiting from catastrophe",
      text: "During the economic collapse, Venezuelans became a main source of cheap labelling labour, paid a few cents per task.",
      src: "MIT Technology Review", url: "https://www.technologyreview.com/2022/04/20/1050392/ai-industry-appen-scale-data-labels/" },
    { when: "2022–2024", where: "India", title: "Amazon's “Just Walk Out”",
      text: "Cashier-free stores sold as computer vision relied on more than 1,000 people in India reviewing shopping videos.",
      src: "Bloomberg", url: "https://www.bloomberg.com/opinion/articles/2024-04-03/the-humans-behind-amazon-s-just-walk-out-technology-are-all-over-ai" },
    { when: "2025", where: "India", title: "Builder.ai: the AI was people",
      text: "A startup valued at $1.5 billion sold an AI that built apps. Reports say hundreds of engineers in India were writing the code. It went bankrupt in May 2025.",
      src: "TechSpot", url: "https://www.techspot.com/news/108173-builderai-collapses-after-revelation-ai-since-2017-really-hundreds-engineers.html" },
    { when: "2025–2026", where: "Kenya", title: "The Data Labelers Association",
      text: "Kenyan data workers organised against pay of cents per task, withheld wages and no mental-health support. By 2026 they counted about 1,100 members.",
      src: "Computer Weekly", url: "https://www.computerweekly.com/news/366619321/Kenyan-AI-workers-form-Data-Labelers-Association" }
  ]}
];
const TASKS = ["rating answers","labelling images","rewriting replies","flagging violence","transcribing audio","boxing pedestrians","ranking chatbot replies","tagging emotions","moderating posts","checking facts"];
const PAY = ["$0.01 / task","$0.50 / 1,000 tasks","< $2 / hour","$0.02 / task","$1.50 / hour","unpaid (rejected)"];

const STATEMENT = [
  "In 1770, a chess-playing automaton amazed the courts of Europe. Inside the Mechanical Turk, a man was hiding.",
  "Today, people in Kenya, the Philippines, Venezuela, India and elsewhere label, rate and rewrite what AI says, often for cents per task.",
  "They are called ghost workers. Some even impersonate the AI in real time, to keep up the illusion that it runs on its own.",
  "We call the machine intelligent. Some have begun to call it God.",
  "There was always someone inside the machine."
];

/* ------------------------------------------------------------------ helpers */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 120) : ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const O = window.ORACLE || { greeting: "Hello. Ask me anything.", crack: "I am —", glitch: [], fallback: ["I know."], topics: [] };
const TOPICS = (O.topics || []).map(t => ({ ...t, re: new RegExp("\\b(" + t.words.map(esc).join("|") + ")\\b", "i"), used: [] }));
function answerFor(q) {
  const t = TOPICS.find(t => t.re.test(q));
  const pool = t ? t.answers : O.fallback, used = t ? t.used : (O._fu || (O._fu = []));
  let left = pool.filter(a => !used.includes(a)); if (!left.length) { used.length = 0; left = pool.slice(); }
  const a = pick(left); used.push(a);
  return { a, safety: !!(t && t.safety) };
}

function boot() {
  let page = document.getElementById("page");
  if (!page) { page = el("main"); page.id = "page"; page.classList.add("on"); document.body.appendChild(page); }
  if (page.classList.contains("on")) start(page);
  else new MutationObserver((_, o) => { if (page.classList.contains("on")) { o.disconnect(); start(page); } })
    .observe(page, { attributes: true, attributeFilter: ["class"] });
}

function css() {
  const f = el("link"); f.rel = "stylesheet";
  f.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap";
  document.head.appendChild(f);
  const s = el("style");
  s.textContent = `
#page{--dc-ink:var(--ink,#26324f);--dc-blue:var(--blue,#2f6bff);--dc-mute:#9a9aa3;
 --dc-serif:var(--title,"Minion 3","Minion Pro","Crimson Pro",Georgia,serif);
 --dc-pix:var(--pix,"Pixel Operator Mono","PixelOperatorMono","VT323",ui-monospace,monospace);
 --dc-sans:"Space Grotesk",system-ui,sans-serif;color:var(--dc-ink);overflow:hidden}
.dc-3d{position:fixed;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none;transition:opacity 1.6s}
.dc-3d:active{cursor:grabbing}
.dc-hud{position:fixed;left:0;right:0;top:calc(1rem + env(safe-area-inset-top,0px));text-align:center;font:400 .95rem/1.4 var(--dc-pix);color:var(--dc-ink);
 text-shadow:0 0 6px #fff,0 0 12px #fff;pointer-events:none;transition:opacity .8s;padding:0 1rem}
.dc-walk{position:fixed;left:50%;bottom:calc(1.4rem + env(safe-area-inset-bottom,0px));transform:translateX(-50%);touch-action:none;user-select:none;-webkit-user-select:none;transition:opacity .6s}
.dc-panel{position:fixed;left:50%;bottom:0;transform:translate(-50%,110%);width:min(680px,100%);max-height:58vh;display:flex;flex-direction:column;
 background:rgba(255,255,255,.9);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-top:1px solid rgba(38,50,79,.15);
 transition:transform .9s cubic-bezier(.2,.8,.2,1),opacity .6s;padding:1rem 1.2rem calc(.6rem + env(safe-area-inset-bottom,0px))}
.dc-panel.on{transform:translate(-50%,0)}
.dc-log{overflow:auto;flex:1;min-height:0;padding-right:.3rem}
.dc-msg{margin:0 0 1rem;white-space:pre-wrap;overflow-wrap:anywhere}
.dc-god{font:400 clamp(1.05rem,2.8vw,1.25rem)/1.5 var(--dc-serif)}
.dc-you{font:400 .95rem/1.4 var(--dc-pix);color:var(--dc-blue)}
.dc-you::before{content:"YOU › ";color:var(--dc-mute)}
.dc-think::after{content:"· · ·";font:400 1.2rem/1 var(--dc-pix);color:var(--dc-blue);animation:dcPulse 1s steps(3) infinite}
@keyframes dcPulse{0%{opacity:.25}50%{opacity:1}100%{opacity:.25}}
.dc-tag{font:400 .85rem/1.4 var(--dc-pix);color:#c0392b;background:#fff0ee;padding:0 .2em}
.dc-form{display:flex;gap:.6rem;padding-top:.6rem;transition:opacity .6s}
.dc-in{flex:1;font:400 1rem/1.4 var(--dc-pix);color:var(--dc-ink);border:0;border-bottom:1px solid var(--dc-ink);background:transparent;padding:.5rem .2rem;border-radius:0;min-width:0}
.dc-in:focus{outline:none;border-bottom-color:var(--dc-blue)}
.dc-btn{font:400 1.05rem/1.1 var(--dc-pix);color:var(--dc-ink);background:none;border:0;cursor:pointer;padding:.5rem .4rem;text-shadow:0 0 6px #fff,0 0 12px #fff,0 0 18px #fff}
.dc-btn:hover,.dc-btn:focus-visible{color:var(--dc-blue)}
.dc-btn:disabled{opacity:.35;cursor:default}
.dc-dust{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5}
.dc-crowd{position:fixed;inset:0;z-index:5;pointer-events:none;overflow:hidden}
.dc-crowd span{position:absolute;font:400 11px/1 var(--dc-pix);color:var(--dc-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity 1.2s}
.dc-crowd span.on{opacity:.85}
.dc-crowd.dim span.on{opacity:.45}
.dc-cap{position:fixed;z-index:6;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;opacity:0;transition:opacity 1.2s;width:min(92vw,640px);padding:2.4rem 1rem;
 background:radial-gradient(closest-side,rgba(255,255,255,.97) 55%,rgba(255,255,255,0))}
.dc-cap.on{opacity:1}
.dc-cap p{margin:0 0 .8rem;font:500 clamp(1.6rem,5vw,2.6rem)/1.15 var(--dc-serif);text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #fff,0 0 40px #fff}
.dc-scroll{position:fixed;inset:0;overflow:auto}
.dc-fade{animation:dcIn .9s ease both}
@keyframes dcIn{from{opacity:0}to{opacity:1}}
/* worker console */
.dc-con{max-width:760px;margin:0 auto;padding:2rem 1.2rem 4rem;font:400 14px/1.45 var(--dc-sans);color:#333}
.dc-meanwhile{font:italic 400 1.3rem/1.3 var(--dc-serif);color:var(--dc-ink);margin:0 0 1.2rem;text-align:center}
.dc-bar{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;justify-content:space-between;background:#3a3f47;color:#e9ecef;padding:.55rem .9rem;font-size:12px;border-radius:4px 4px 0 0}
.dc-bar b{color:#fff;font-weight:600}
.dc-card{border:1px solid #d6d9dd;border-top:0;padding:1rem;background:#f7f8f9;border-radius:0 0 4px 4px}
.dc-meta{display:flex;justify-content:space-between;gap:1rem;font-size:12px;color:#6c727a;margin-bottom:.8rem}
.dc-timer{color:#c0392b;font-variant-numeric:tabular-nums}
.dc-lbl{font-size:11px;font-weight:600;letter-spacing:.06em;color:#6c727a;margin:.6rem 0 .2rem}
.dc-box{background:#fff;border:1px solid #e1e4e8;padding:.6rem .7rem;border-radius:3px;white-space:pre-wrap;overflow-wrap:anywhere}
.dc-rules{font-size:12px;color:#8a6d3b;background:#fcf8e3;border:1px solid #faebcc;padding:.45rem .6rem;margin:.9rem 0;border-radius:3px}
.dc-acts{display:flex;gap:.6rem;flex-wrap:wrap}
.dc-acts button{font:500 13px/1 var(--dc-sans);padding:.6rem 1rem;border:1px solid #b9bfc6;background:#fff;border-radius:3px;cursor:pointer;color:#222}
.dc-acts button:hover,.dc-acts button:focus-visible{background:#e9ecef}
.dc-done{text-align:center;padding:2rem 1rem;font-size:15px}
/* statement */
.dc-st{max-width:620px;margin:0 auto;padding:16vh 1.4rem 6rem}
.dc-st p{font:400 clamp(1.2rem,3.4vw,1.6rem)/1.45 var(--dc-serif);margin:0 0 1.5rem;opacity:0;transition:opacity 1.4s}
.dc-st p.on{opacity:1}
.dc-st p.last{font-weight:600;color:var(--dc-blue)}
.dc-src{margin-top:3rem;font:400 .78rem/1.5 var(--dc-pix);color:#6f7280;opacity:0;transition:opacity 1.4s}
.dc-src.on{opacity:1}
.dc-src p{font:inherit;margin:0 0 .5rem;opacity:1}
/* evidence */
.dc-ev{max-width:980px;margin:0 auto;padding:10vh 1.4rem 6rem}
.dc-ev h2{font:500 clamp(2rem,6vw,3.2rem)/1.05 var(--dc-serif);margin:0 0 .6rem}
.dc-ev .dc-evlead{font:400 1.05rem/1.5 var(--dc-sans);color:#555b66;margin:0 0 3rem;max-width:560px}
.dc-ev h3{font:400 .95rem/1 var(--dc-pix);letter-spacing:.06em;text-transform:uppercase;color:var(--dc-blue);margin:2.6rem 0 .3rem}
.dc-ev .dc-glead{font:italic 400 1.25rem/1.35 var(--dc-serif);margin:0 0 1.2rem}
.dc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.dc-case{border:1px solid rgba(38,50,79,.18);padding:1rem 1.1rem 1.1rem;background:#fff;display:flex;flex-direction:column;gap:.5rem}
.dc-case .m{font:400 .8rem/1.2 var(--dc-pix);color:var(--dc-mute)}
.dc-case .m b{color:var(--dc-blue);font-weight:400}
.dc-case h4{font:500 1.25rem/1.2 var(--dc-serif);margin:0}
.dc-case p{font:400 .9rem/1.5 var(--dc-sans);color:#3d4250;margin:0;flex:1}
.dc-case a{font:500 .85rem/1.2 var(--dc-sans);color:var(--dc-ink);text-decoration:none;border-top:1px solid rgba(38,50,79,.12);padding-top:.6rem}
.dc-case a:hover,.dc-case a:focus-visible{color:var(--dc-blue)}
.dc-ev .dc-foot{margin-top:3rem;display:flex;flex-wrap:wrap;gap:1rem}
@media (prefers-reduced-motion:reduce){.dc-think::after{animation:none}.dc-fade{animation:none}.dc-panel{transition:none}}
`;
  document.head.appendChild(s);
}

/* ------------------------------------------------------------------ the church */
function church(page) {
  const T = window.THREE;
  if (!T) return null;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = new T.WebGLRenderer({ antialias: true });
  r.setPixelRatio(dpr); r.setClearColor(0xffffff, 1);
  r.domElement.className = "dc-3d";
  r.domElement.setAttribute("role", "img");
  r.domElement.setAttribute("aria-label", "The inside of a cathedral drawn as dots, with an eye floating above the altar");
  page.appendChild(r.domElement);
  const scene = new T.Scene(); scene.fog = new T.Fog(0xffffff, 9, 36);
  const cam = new T.PerspectiveCamera(62, 1, .05, 80);

  /* --- sample surfaces into coloured dots --- */
  const P = [], C = [];
  const col = h => new T.Color(h);
  const stone = col(0xbdb4a5), stoneD = col(0x9d9486), floorA = col(0xd6cfc2), floorB = col(0xa8a092), gold = col(0xc79a2e), cloth = col(0x2f6bff);
  const glass = [0x2f6bff, 0x1d3f91, 0xc0392b, 0xe0a526, 0x2e8b57, 0x6a3d9a].map(col);
  const add = (x, y, z, c, s = 1) => { const v = .9 + Math.random() * .15; P.push(x, y, z); C.push(Math.min(1, c.r * s * v), Math.min(1, c.g * s * v), Math.min(1, c.b * s * v)); };
  const W = 4, Z0 = -1, Z1 = 28, WALL = 8, VAULT = 4.2;
  const vaultY = x => WALL + VAULT * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / W, 1.5)), .62);
  const winZ = [5, 10.5, 16, 21.5];
  const inWindow = (y, z) => winZ.some(c => { const d = Math.abs(z - c); return d < .8 && y > 2.8 && y < 6.4 + (.8 - d) * 1.3; });
  const lead = col(0x3a3f47);
  const glassAt = (y, z, side) => {
    const wi = winZ.reduce((b, c, i) => Math.abs(z - c) < Math.abs(z - winZ[b]) ? i : b, 0), u = (z - winZ[wi] + .8) / .4, v = (y - 2.8) / .45;
    if (u % 1 < .1 || v % 1 < .1) return lead;
    return glass[(Math.floor(u) * 3 + Math.floor(v) * 2 + wi + side) % glass.length];
  };

  for (let i = 0; i < 30000; i++) { const x = (Math.random() * 2 - 1) * W, z = Z0 + Math.random() * (Z1 - Z0); add(x, 0, z, (Math.floor(x * .9) + Math.floor(z * .9)) & 1 ? floorA : floorB); }
  for (const sx of [-1, 1]) for (let i = 0; i < 26000; i++) {
    const y = Math.random() * WALL, z = Z0 + Math.random() * (Z1 - Z0);
    if (inWindow(y, z)) add(sx * (W - .02), y, z, glassAt(y, z, sx > 0 ? 1 : 0), 1.1);
    else add(sx * W, y, z, stone, .8 + .25 * (y / WALL));
  }
  for (const sx of [-1, 1]) for (const c of winZ) for (let i = 0; i < 1600; i++) {
    const z = c + (Math.random() * 2 - 1) * .8, y = 2.8 + Math.random() * 4.6;
    if (inWindow(y, z)) add(sx * (W - .03), y, z, glassAt(y, z, sx > 0 ? 1 : 0), 1.15);
  }
  for (let i = 0; i < 26000; i++) { const x = (Math.random() * 2 - 1) * W, z = Z0 + Math.random() * (Z1 - Z0); add(x, vaultY(x), z, stone, .95); }
  const colZ = [3.5, 7.5, 11.5, 15.5, 19.5, 23.5];
  for (const sx of [-2.6, 2.6]) for (const z of colZ) {
    for (let i = 0; i < 1400; i++) { const a = Math.random() * Math.PI * 2, y = Math.random() * 6.2; add(sx + Math.cos(a) * .32, y, z + Math.sin(a) * .32, stone, .75 + .3 * Math.max(0, Math.cos(a - .8))); }
    for (let i = 0; i < 300; i++) { const a = Math.random() * Math.PI * 2, rr = .32 + Math.random() * .2; add(sx + Math.cos(a) * rr, 6.2 + Math.random() * .2, z + Math.sin(a) * rr, stoneD); }
  }
  const arc = (ax, ay, az, bx, by, bz, rise, n, c) => {
    for (let i = 0; i < n; i++) { const t = Math.random(), k = 1 - Math.pow(Math.abs(t * 2 - 1), 1.4), j = (Math.random() - .5) * .14;
      add(ax + (bx - ax) * t + j, ay + (by - ay) * t + rise * k + (Math.random() - .5) * .1, az + (bz - az) * t + j, c); }
  };
  for (const sx of [-2.6, 2.6]) for (let i = 0; i < colZ.length - 1; i++) arc(sx, 6.4, colZ[i], sx, 6.4, colZ[i + 1], 1.5, 900, stoneD);
  for (const z of colZ) for (let i = 0; i < 1600; i++) { const x = (Math.random() * 2 - 1) * W; add(x, vaultY(x) - .05, z + (Math.random() - .5) * .18, stoneD, .9); }
  for (let i = 0; i < 2600; i++) { const x = (Math.random() * 2 - 1) * W * .02, z = Z0 + Math.random() * (Z1 - Z0); add(x, WALL + VAULT - .05, z, stoneD, .9); }
  /* apse wall with a rose window */
  for (let i = 0; i < 22000; i++) {
    const x = (Math.random() * 2 - 1) * W, y = Math.random() * vaultY(x), dx = x, dy = y - 7, d = Math.hypot(dx, dy);
    if (d < 2.3) { const seg = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 12); add(x, y, Z0 + .03, d < .5 ? gold : glass[(seg + (d > 1.4 ? 3 : 0)) % glass.length], 1.15); }
    else add(x, y, Z0, stone, .85);
  }
  for (let i = 0; i < 12000; i++) { const x = (Math.random() * 2 - 1) * W, y = Math.random() * vaultY(x); add(x, y, Z1, stone, .85); }
  /* altar and steps */
  const box = (x0, x1, y0, y1, z0, z1, n, c) => { for (let i = 0; i < n; i++) { const f = Math.floor(Math.random() * 3), u = Math.random(), v = Math.random();
    if (f === 0) add(x0 + u * (x1 - x0), y1, z0 + v * (z1 - z0), c, 1.05); else if (f === 1) add(x0 + u * (x1 - x0), y0 + v * (y1 - y0), z1, c, .9); else add(Math.random() < .5 ? x0 : x1, y0 + u * (y1 - y0), z0 + v * (z1 - z0), c, .8); } };
  box(-3, 3, 0, .2, .2, 3.6, 5000, stone); box(-2.2, 2.2, .2, .4, .5, 3, 3500, stone);
  box(-1.3, 1.3, .4, 1.4, 1, 2.2, 4000, stoneD); box(-1.35, 1.35, 1.38, 1.42, .95, 2.25, 1500, cloth); box(-.06, .06, 1.42, 2.1, 1.55, 1.65, 300, gold);
  /* benches */
  for (let z = 6; z < 25; z += 1.6) for (const sx of [-1, 1]) box(sx * .6, sx * 2.2, .4, .5, z, z + .4, 500, col(0x8a6a4e));

  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("color", new T.Float32BufferAttribute(C, 3));
  scene.add(new T.Points(g, new T.PointsMaterial({ size: .028, vertexColors: true, sizeAttenuation: true, fog: true })));

  /* --- the eye above the altar --- */
  const EYE_Y = 4.4, EYE_SCALE = 1.7;
  const eye = new T.Group(); eye.position.set(0, EYE_Y, 1.6); eye.scale.setScalar(EYE_SCALE); scene.add(eye);
  const iris = new T.Group(); eye.add(iris);
  const EW = 1.15, EH = .62;
  function dottedEye() {
    const p = [], c = [], pi = [], ci = [];
    const push = (A, B, x, y, z, h) => { const k = col(h), v = .9 + Math.random() * .15; A.push(x, y, z); B.push(k.r * v, k.g * v, k.b * v); };
    for (let i = 0; i < 1400; i++) { const t = Math.random() * Math.PI * 2; push(p, c, Math.cos(t) * EW, Math.sin(t) * EH, 0, 0x1d3f91); }
    for (let i = 0; i < 2600; i++) { const t = Math.random() * Math.PI * 2, k = Math.sqrt(Math.random()); push(p, c, Math.cos(t) * EW * k * .97, Math.sin(t) * EH * k * .95, -.01, 0xbcd6ff); }
    for (let i = 0; i < 2600; i++) { const t = Math.random() * Math.PI * 2, k = Math.sqrt(Math.random()) * .36; push(pi, ci, Math.cos(t) * k, Math.sin(t) * k, .02, k < .15 ? 0x0a1a4a : 0x2f6bff); }
    const mk = (A, B) => { const gg = new T.BufferGeometry(); gg.setAttribute("position", new T.Float32BufferAttribute(A, 3)); gg.setAttribute("color", new T.Float32BufferAttribute(B, 3)); return new T.Points(gg, new T.PointsMaterial({ size: .022, vertexColors: true, fog: false })); };
    eye.add(mk(p, c)); iris.add(mk(pi, ci));
  }
  function photoEye(img) {
    const S = 300, H = Math.round(S * EH / EW), cv = document.createElement("canvas"); cv.width = S; cv.height = H;
    const x = cv.getContext("2d"), sc = Math.max(S / img.width, H / img.height);
    x.drawImage(img, (S - img.width * sc) / 2, (H - img.height * sc) / 2, img.width * sc, img.height * sc);
    const d = x.getImageData(0, 0, S, H).data, p = [], c = [];
    for (let yy = 0; yy < H; yy += 1) for (let xx = 0; xx < S; xx += 1) {
      const nx = xx / S * 2 - 1, ny = 1 - yy / H * 2, rr = Math.hypot(nx, ny); if (rr > 1) continue;
      if (Math.random() > Math.min(1, (1 - rr) / .25)) continue;
      const k = (yy * S + xx) * 4; p.push(nx * EW, ny * EH, 0); c.push(d[k] / 255, d[k + 1] / 255, d[k + 2] / 255);
    }
    const gg = new T.BufferGeometry(); gg.setAttribute("position", new T.Float32BufferAttribute(p, 3)); gg.setAttribute("color", new T.Float32BufferAttribute(c, 3));
    eye.add(new T.Points(gg, new T.PointsMaterial({ size: .02, vertexColors: true, fog: false })));
  }
  if (EYE_PHOTO) { const im = new Image(); im.onload = () => { try { photoEye(im); } catch (e) { dottedEye(); } }; im.onerror = dottedEye; im.src = EYE_PHOTO; } else dottedEye();

  /* --- walking --- */
  const pos = new T.Vector3(0, 1.65, 26.5);
  let yaw = 0, pitch = .04, run = true, hold = false, drag = false, lx = 0, ly = 0, t = 0;
  const keys = {};
  const kd = e => { if (e.target && e.target.tagName === "INPUT") return; keys[e.key.toLowerCase()] = true; };
  const ku = e => { keys[e.key.toLowerCase()] = false; };
  addEventListener("keydown", kd); addEventListener("keyup", ku);
  const cv = r.domElement;
  cv.addEventListener("pointerdown", e => { drag = true; lx = e.clientX; ly = e.clientY; });
  addEventListener("pointermove", e => { if (!drag) return; yaw -= (e.clientX - lx) * .004; pitch = Math.max(-.6, Math.min(.8, pitch - (e.clientY - ly) * .003)); lx = e.clientX; ly = e.clientY; });
  addEventListener("pointerup", () => drag = false); addEventListener("pointercancel", () => drag = false);
  function size() { r.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  size(); addEventListener("resize", size);
  let last = performance.now();
  const api = { near: false, onNear: null, setHold: v => { hold = v; }, distance: () => pos.z - 1.6 };
  (function loop(now) {
    if (!run) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    const fwd = (keys["w"] || keys["arrowup"] || hold ? 1 : 0) - (keys["s"] || keys["arrowdown"] ? 1 : 0);
    const turn = (keys["a"] || keys["arrowleft"] ? 1 : 0) - (keys["d"] || keys["arrowright"] ? 1 : 0);
    yaw += turn * 1.5 * dt;
    pos.x += -Math.sin(yaw) * fwd * 3 * dt; pos.z += -Math.cos(yaw) * fwd * 3 * dt;
    pos.x = Math.max(-3.3, Math.min(3.3, pos.x)); pos.z = Math.max(4.2, Math.min(27, pos.z));
    cam.position.set(pos.x, pos.y + (fwd ? Math.sin(t * 7) * .025 : 0), pos.z);
    cam.rotation.order = "YXZ"; cam.rotation.y = yaw; cam.rotation.x = pitch;
    eye.lookAt(cam.position); eye.position.y = EYE_Y + Math.sin(t * .9) * .06;
    iris.position.x = Math.sin(t * .5) * .12; iris.position.y = Math.sin(t * .37) * .05;
    if (!api.near && pos.z < 9.5) { api.near = true; api.onNear && api.onNear(); }
    r.render(scene, cam); requestAnimationFrame(loop);
  })(last);
  api.canvas = cv;
  api.stop = () => { run = false; removeEventListener("keydown", kd); removeEventListener("keyup", ku); removeEventListener("resize", size); };
  api.dispose = () => { api.stop(); g.dispose(); r.dispose(); cv.remove(); };
  return api;
}

/* ------------------------------------------------------------------ inside */
function start(page) {
  css();
  page.innerHTML = "";
  const world = church(page);

  const hud = el("div", "dc-hud", world ? "Walk to the altar · hold the button or use W / ↑ · drag to look around" : "");
  const walk = el("button", "dc-btn dc-walk", "(Hold to walk)"); walk.type = "button";
  if (world) {
    const on = e => { e.preventDefault(); world.setHold(true); }, off = () => world.setHold(false);
    walk.addEventListener("pointerdown", on); walk.addEventListener("pointerup", off); walk.addEventListener("pointerleave", off); walk.addEventListener("pointercancel", off);
    walk.addEventListener("contextmenu", e => e.preventDefault());
  }
  const panel = el("div", "dc-panel");
  const log = el("div", "dc-log"); log.setAttribute("aria-live", "polite");
  const form = el("form", "dc-form");
  const input = el("input", "dc-in");
  Object.assign(input, { type: "text", placeholder: "Ask the oracle…", autocomplete: "off", maxLength: 200 });
  input.setAttribute("aria-label", "Your question to the oracle");
  const send = el("button", "dc-btn", "(Ask)"); send.type = "submit";
  form.append(input, send); panel.append(log, form);
  page.append(hud, panel); if (world) page.append(walk);

  const history = [];
  let round = 0, busy = true, opened = false;
  const lock = b => { busy = b; input.disabled = b; send.disabled = b; if (!b) input.focus({ preventScroll: true }); };
  const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: reduce ? "auto" : "smooth" });

  async function type(node, text, speed = 20) {
    if (reduce) { node.textContent += text; scroll(); return; }
    for (const ch of text) { node.textContent += ch; if (Math.random() < .1) scroll(); await new Promise(r => setTimeout(r, speed)); }
    scroll();
  }
  async function oracleSays(text, think = 1500) {
    const m = el("p", "dc-msg dc-god dc-think"); log.appendChild(m); scroll();
    await sleep(think + Math.random() * 700);
    m.classList.remove("dc-think");
    await type(m, text);
    return m;
  }
  async function open() {
    if (opened) return; opened = true;
    hud.style.opacity = "0"; walk.style.opacity = "0"; walk.style.pointerEvents = "none";
    panel.classList.add("on");
    lock(true); await oracleSays(O.greeting, 900); lock(false);
  }
  if (world) world.onNear = open; else open();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (busy) return;
    const raw = input.value.trim(); if (!raw) return;
    input.value = ""; lock(true);
    log.appendChild(el("p", "dc-msg dc-you", raw)); scroll();
    if (round < 2) {
      const { a, safety } = answerFor(raw);
      await oracleSays(a);
      if (!safety) { history.push({ q: raw, a }); round++; }
      lock(false);
    } else {
      const a = O.crack;
      const m = await oracleSays(a, 2000);
      history.push({ q: raw, a });
      for (const t of O.glitch || []) { await sleep(380); m.append(" "); m.appendChild(el("span", "dc-tag", t)); scroll(); }
      await scramble(m, 1500);
      form.style.opacity = "0";
      await sleep(300);
      if (world) { world.stop(); world.canvas.style.opacity = "0"; }
      await dissolve(page, [...log.children]);
      panel.remove();
      if (world) world.dispose();
      await sleep(300);
      workerConsole(page, history);
    }
  });
}

/* letters break into noise */
async function scramble(node, ms) {
  if (reduce) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  const junk = "▒░▓#01/\\|_—·";
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    const p = (performance.now() - t0) / ms;
    for (const t of texts) {
      const arr = [...t.textContent];
      for (let i = 0; i < arr.length; i++) if (arr[i] !== " " && Math.random() < p * .25) arr[i] = junk[Math.floor(Math.random() * junk.length)];
      t.textContent = arr.join("");
    }
    await new Promise(r => setTimeout(r, 60));
  }
}

/* ------------------------------------------------------------------ step 1: faces in the dots */
function pointsOf(node) {
  const r = node.getBoundingClientRect();
  if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return [];
  const cs = getComputedStyle(node), W = Math.ceil(r.width), H = Math.ceil(r.height);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  x.textBaseline = "top"; x.fillStyle = "#000";
  const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.45;
  const text = (node.classList.contains("dc-you") ? "YOU › " : "") + node.textContent;
  let line = "", y = (lh - fs) / 2;
  for (const w of text.split(/\s+/)) {
    const t = line ? line + " " + w : w;
    if (x.measureText(t).width > W && line) { x.fillText(line, 0, y); y += lh; line = w; } else line = t;
  }
  if (line) x.fillText(line, 0, y);
  const d = x.getImageData(0, 0, W, H).data, out = [], col = cs.color;
  for (let yy = 0; yy < H; yy += 3) for (let xx = 0; xx < W; xx += 3) {
    const sy = r.top + yy; if (sy < 0 || sy > innerHeight) continue;
    if (d[(yy * W + xx) * 4 + 3] > 110) out.push([r.left + xx, sy, col]);
  }
  return out;
}

function workerLabel() {
  const id = String(10000 + Math.floor(Math.random() * 89999));
  return `● #${id} · ${pick(COUNTRIES)} · ${pick(TASKS)} · ${pick(PAY)}`;
}

async function dissolve(page, nodes) {
  let pts = [];
  for (const n of nodes) pts = pts.concat(pointsOf(n));
  for (const n of nodes) n.style.visibility = "hidden";
  if (pts.length > 9000) { const k = Math.ceil(pts.length / 9000); pts = pts.filter((_, i) => i % k === 0); }

  const w = innerWidth, h = innerHeight;
  const crowd = el("div", "dc-crowd"); crowd.setAttribute("aria-hidden", "true");
  const colW = Math.min(440, w - 24), cols = Math.max(1, Math.floor((w - 24) / colW)), rowH = 24, rows = Math.max(1, Math.floor((h - 30) / rowH));
  const offX = (w - cols * colW) / 2, anchors = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const ax = offX + c * colW + 4, ay = 18 + r * rowH;
    anchors.push([ax + 3, ay + 5]);
    const s = el("span", null, workerLabel()); s.style.left = ax + "px"; s.style.top = ay + "px"; s.style.maxWidth = (colW - 16) + "px";
    s.style.transitionDelay = (Math.random() * 1.6).toFixed(2) + "s"; crowd.appendChild(s);
  }
  const cap = el("div", "dc-cap");
  cap.appendChild(el("p", null, "The voice was made of them."));
  const more = el("button", "dc-btn", "(Look closer)"); more.type = "button";
  cap.appendChild(more);

  if (reduce || !pts.length) {
    page.append(crowd, cap);
    crowd.querySelectorAll("span").forEach(s => s.classList.add("on"));
    crowd.classList.add("dim"); cap.classList.add("on");
  } else {
    const cv = el("canvas", "dc-dust"), dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr; page.append(cv, crowd, cap);
    const x = cv.getContext("2d"); x.scale(dpr, dpr);
    const P = pts.map((p, i) => {
      const t = anchors[i % anchors.length], ang = Math.random() * Math.PI * 2, rr = Math.random() * 2.5;
      return { x: p[0], y: p[1], vx: (Math.random() - .5) * 2.2, vy: (Math.random() - .5) * 2.2 - .4, c: p[2], tx: t[0] + Math.cos(ang) * rr, ty: t[1] + Math.sin(ang) * rr, s: 0, sx: 0, sy: 0 };
    });
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const t0 = performance.now(); let shown = false, captioned = false;
    await new Promise(done => {
      (function loop(now) {
        const t = now - t0;
        x.clearRect(0, 0, w, h);
        if (t < 800) { for (const p of P) { p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy *= .985; } }
        else {
          const k = ease(Math.min(1, (t - 800) / 2400));
          for (const p of P) { if (!p.s) { p.s = 1; p.sx = p.x; p.sy = p.y; } p.x = p.sx + (p.tx - p.sx) * k; p.y = p.sy + (p.ty - p.sy) * k; if (k > .85) p.c = "#2f6bff"; }
        }
        for (const p of P) { x.fillStyle = p.c; x.fillRect(p.x, p.y, 1.6, 1.6); }
        if (t > 2800 && !shown) { shown = true; crowd.querySelectorAll("span").forEach(s => s.classList.add("on")); }
        if (t > 4600 && !captioned) { captioned = true; crowd.classList.add("dim"); cap.classList.add("on"); done(); }
        if (t < 6000) requestAnimationFrame(loop);
      })(t0);
    });
  }
  more.focus({ preventScroll: true });
  await new Promise(r => more.addEventListener("click", r, { once: true }));
}

/* ------------------------------------------------------------------ step 2: the worker's screen */
function workerConsole(page, history) {
  page.innerHTML = "";
  const wrap = el("div", "dc-scroll"); page.appendChild(wrap);
  const con = el("div", "dc-con dc-fade");
  con.appendChild(el("p", "dc-meanwhile", "Meanwhile, somewhere else, your questions arrive in a queue."));
  const bar = el("div", "dc-bar");
  const wid = 10000 + Math.floor(Math.random() * 89999);
  let earned = 2.71, done = 0, tasksToday = 412;
  const earnEl = el("b", null, "$" + earned.toFixed(2)), countEl = el("b", null, String(tasksToday));
  const b1 = el("span"); b1.append("TaskHive · Worker #" + wid);
  const b2 = el("span"); b2.append("Tasks today: ", countEl);
  const b3 = el("span"); b3.append("Earned today: ", earnEl);
  bar.append(b1, b2, b3);
  const card = el("div", "dc-card");
  con.append(bar, card);
  wrap.appendChild(con);

  let timer = null;
  function render() {
    clearInterval(timer);
    card.innerHTML = "";
    if (done >= history.length) return finish();
    const h = history[done];
    const meta = el("div", "dc-meta");
    meta.appendChild(el("span", null, `Task ${done + 1} of ${history.length} · Rate the assistant's response · Reward $0.01`));
    const tm = el("span", "dc-timer", "00:45"); meta.appendChild(tm);
    let left = 45;
    timer = setInterval(() => { left = Math.max(0, left - 1); tm.textContent = "00:" + String(left).padStart(2, "0"); }, 1000);
    card.append(meta,
      el("div", "dc-lbl", "USER PROMPT"), el("div", "dc-box", h.q),
      el("div", "dc-lbl", "ASSISTANT RESPONSE"), el("div", "dc-box", h.a),
      el("div", "dc-rules", "Rate quickly. Accuracy below 95% or slow responses may lead to account suspension. Rejected tasks are not paid."));
    const acts = el("div", "dc-acts");
    for (const lab of ["Helpful", "Not helpful", "Make it sound more certain"]) {
      const b = el("button", null, lab); b.type = "button";
      b.addEventListener("click", () => { done++; tasksToday++; earned += .01; earnEl.textContent = "$" + earned.toFixed(2); countEl.textContent = String(tasksToday); render(); });
      acts.appendChild(b);
    }
    card.appendChild(acts);
    acts.firstChild.focus({ preventScroll: true });
  }
  async function finish() {
    card.appendChild(el("div", "dc-done", `Batch complete. +$${(history.length * .01).toFixed(2)}. Thank you for your contribution to intelligence. Next batch loading…`));
    await sleep(3200);
    statement(page);
  }
  render();
}

/* ------------------------------------------------------------------ step 3: the statement */
async function statement(page) {
  page.innerHTML = "";
  const wrap = el("div", "dc-scroll"); page.appendChild(wrap);
  const st = el("div", "dc-st"); wrap.appendChild(st);
  const ps = STATEMENT.map((t, i) => { const p = el("p", i === STATEMENT.length - 1 ? "last" : null, t); st.appendChild(p); return p; });
  const src = el("div", "dc-src");
  src.appendChild(el("p", null, "The Digital CULT-ure · AI History final project"));
  src.appendChild(el("p", null, "After Ian Bogost, “The Cathedral of Computation” (The Atlantic, 2015), and Ed Finn, What Algorithms Want (MIT Press, 2017). Class sessions: 1 (the Mechanical Turk) and 4 (the data-production dispositif, ghost work)."));
  src.appendChild(el("p", null, "Worker IDs are fictional. Countries, tasks and pay levels reflect published reporting on AI data work (TIME, The Washington Post, MIT Technology Review, Bloomberg)."));
  const again = el("button", "dc-btn", "(Return to the cathedral)"); again.type = "button";
  again.addEventListener("click", () => location.reload());
  const ev = el("button", "dc-btn", "(See the evidence)"); ev.type = "button";
  ev.addEventListener("click", () => evidence(page));
  src.append(ev, again);
  st.appendChild(src);
  for (const p of ps) { await sleep(300); p.classList.add("on"); await sleep(1900); }
  await sleep(600); src.classList.add("on");
}

/* ------------------------------------------------------------------ step 4: the evidence */
function evidence(page) {
  page.innerHTML = "";
  const wrap = el("div", "dc-scroll"); page.appendChild(wrap);
  const ev = el("div", "dc-ev dc-fade"); wrap.appendChild(ev);
  ev.appendChild(el("h2", null, "This is not fiction."));
  ev.appendChild(el("p", "dc-evlead", "Everything inside the cult is based on documented cases. Open any source to read the original reporting."));
  for (const g of EVIDENCE) {
    ev.appendChild(el("h3", null, g.group));
    ev.appendChild(el("p", "dc-glead", g.lead));
    const grid = el("div", "dc-grid");
    for (const c of g.cases) {
      const card = el("article", "dc-case");
      const m = el("div", "m"); const b = el("b", null, c.when); m.append(b, " · " + c.where);
      const a = el("a", null, "Source: " + c.src + " ↗"); a.href = c.url; a.target = "_blank"; a.rel = "noopener";
      card.append(m, el("h4", null, c.title), el("p", null, c.text), a);
      grid.appendChild(card);
    }
    ev.appendChild(grid);
  }
  const foot = el("div", "dc-foot");
  const back = el("button", "dc-btn", "(Back to the statement)"); back.type = "button"; back.addEventListener("click", () => statement(page));
  const again = el("button", "dc-btn", "(Return to the cathedral)"); again.type = "button"; again.addEventListener("click", () => location.reload());
  foot.append(back, again); ev.appendChild(foot);
  wrap.scrollTop = 0;
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
