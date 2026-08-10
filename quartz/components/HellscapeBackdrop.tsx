/**
 * The infernal backdrop.
 *
 * A fixed, non-interactive layer pinned to the bottom of every page: a city
 * skyline in silhouette, brickwork, glow pooling in the mortar, crack veins
 * climbing out of the joints, drifting embers, and a doubled skyline a few
 * pixels out of register so the city reads subtly wrong.
 *
 * Geometry is copied verbatim from the design reference
 * (design_handoff_avernus_theme/Hellscape Backdrop.dc.html), not redrawn.
 * Styling lives in quartz/styles/custom.scss under "7. Infernal backdrop".
 *
 * Everything dynamic is a CSS custom property set imperatively on the wrapper
 * by the inline script below. Nothing re-renders on scroll, and every var()
 * carries a fallback so the layer degrades to a static graphic without JS.
 */

/* The corruption dial: raise this by one after a session that made things worse.
   Range 0-9. Nothing below 3 shows the doubled-skyline effect, which is on
   purpose; it should arrive as a surprise mid-campaign. */
const CORRUPTION = 2

/* far skyline, drawn behind and skewed as corruption rises */
const SKYLINE_FAR =
  "M0,270 L0,236 L70,236 L70,206 L96,206 L102,176 L108,206 L134,206 L134,236 L210,236 L210,212 L250,212 L250,182 L288,182 L288,212 L360,212 L360,240 L430,240 L430,200 L450,200 L456,166 L462,200 L482,200 L482,240 L560,240 L560,218 L604,218 L604,188 L644,188 L644,218 L720,218 L720,242 L790,242 L790,204 L810,204 L816,172 L822,204 L842,204 L842,242 L920,242 L920,220 L964,220 L964,190 L1004,190 L1004,220 L1080,220 L1080,244 L1150,244 L1150,206 L1170,206 L1176,174 L1182,206 L1202,206 L1202,244 L1280,244 L1280,222 L1324,222 L1324,192 L1364,192 L1364,222 L1440,222 L1440,246 L1520,246 L1520,208 L1540,208 L1546,176 L1552,208 L1572,208 L1572,246 L1600,246 L1600,270 Z"

/* near skyline, also used for the out-of-register ghost */
const SKYLINE_NEAR =
  "M0,270 L0,214 L54,214 L54,190 L86,190 L86,214 L130,214 L130,172 L146,172 L152,142 L158,172 L176,172 L176,214 L222,214 L222,196 L254,196 L254,160 L286,160 L286,196 L330,196 L330,224 L384,224 L384,178 L404,178 L404,150 L416,128 L428,150 L428,178 L452,178 L452,224 L502,224 L502,200 L542,200 L542,168 L578,168 L578,200 L620,200 L620,228 L678,228 L678,182 L694,182 L700,146 L706,182 L722,182 L722,228 L776,228 L776,204 L816,204 L816,172 L850,172 L850,204 L892,204 L892,230 L948,230 L948,186 L964,186 L970,152 L976,186 L992,186 L992,230 L1044,230 L1044,206 L1082,206 L1082,174 L1116,174 L1116,206 L1158,206 L1158,232 L1212,232 L1212,188 L1228,188 L1234,154 L1240,188 L1256,188 L1256,232 L1308,232 L1308,208 L1346,208 L1346,176 L1380,176 L1380,208 L1422,208 L1422,234 L1478,234 L1478,190 L1494,190 L1500,156 L1506,190 L1522,190 L1522,234 L1600,234 L1600,270 Z"

/* [path, pulse animation, optional branch] per vein */
const VEINS: [string, string, string?][] = [
  ["M120,320 L124,286 L112,262 L120,238", "afa-pulse 9s ease-in-out infinite", "M124,286 L142,278"],
  [
    "M430,320 L426,290 L440,268 L434,240 L446,214",
    "afa-pulse 12s ease-in-out infinite 1.4s",
    "M440,268 L418,258",
  ],
  [
    "M760,320 L764,292 L750,270 L758,246 L746,222 L754,196",
    "afa-pulse 10.5s ease-in-out infinite 0.6s",
    "M758,246 L780,236",
  ],
  ["M1180,320 L1176,288 L1190,266 L1182,242", "afa-pulse 13s ease-in-out infinite 2.2s"],
  [
    "M290,320 L286,296 L298,274 L292,252 L302,230 L296,206 L306,182",
    "afa-pulse 11.5s ease-in-out infinite 3s",
    "M292,252 L270,242",
  ],
  ["M980,320 L984,294 L972,272 L980,250 L970,228", "afa-pulse 9.5s ease-in-out infinite 1.9s"],
  [
    "M600,320 L604,298 L592,276 L600,254 L590,232 L598,208 L588,184 L596,160",
    "afa-pulse 14s ease-in-out infinite 0.9s",
    "M590,232 L614,222",
  ],
  ["M1420,320 L1416,292 L1428,270 L1420,246 L1430,222", "afa-pulse 12.5s ease-in-out infinite 2.7s"],
]

const JOINT_CRACKS = [
  "M96,294 L168,294",
  "M404,308 L468,308",
  "M736,282 L792,282",
  "M1152,300 L1214,300",
  "M556,296 L628,296",
  "M948,312 L1016,312",
]

/* left %, bottom %, size px, hot/glow, duration s, delay s */
const EMBERS: [number, number, number, 0 | 1, number, number][] = [
  [7, 2, 3, 0, 13, 0],
  [14, 1, 2, 1, 17, 2.4],
  [22, 3, 2, 0, 15, 5.1],
  [31, 1, 3, 1, 19, 1.2],
  [38, 2, 2, 0, 14, 7.3],
  [46, 1, 2, 1, 16.5, 3.6],
  [54, 3, 3, 0, 18, 0.5],
  [62, 1, 2, 1, 13.5, 6.2],
  [70, 2, 2, 0, 20, 4.4],
  [78, 1, 3, 1, 15.5, 8.1],
  [86, 3, 2, 0, 17.5, 1.8],
  [93, 1, 2, 1, 14.5, 5.7],
]

const script = `
(function () {
  var VEINS = [-0.04, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84];
  var raf = 0;
  function node() { return document.querySelector(".hellscape"); }
  function apply() {
    var n = node();
    if (!n) return;
    var lvl = Math.min(9, Math.max(0, Number(n.getAttribute("data-corruption") || 2)));
    var c = lvl / 9;
    var doc = document.documentElement;
    var span = doc.scrollHeight - window.innerHeight;
    var d = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
    /* scrolling deepens the seep: the further down the page, the closer Avernus */
    var deep = Math.min(1, c + d * 0.35 * (0.45 + c));
    function set(k, v) { n.style.setProperty(k, String(v)); }
    set("--afa-corrupt", (0.07 + deep * 0.32).toFixed(3));
    set("--afa-glow", (0.06 + deep * 0.34).toFixed(3));
    set("--afa-brick", (0.07 + deep * 0.1).toFixed(3));
    set("--afa-ghost", (Math.max(0, deep - 0.3) * 0.4).toFixed(3));
    set("--afa-skew", (deep * 1.6).toFixed(2) + "deg");
    set("--afa-par1", (d * 16).toFixed(1) + "px");
    set("--afa-par2", (d * -12).toFixed(1) + "px");
    set("--afa-embers", Math.min(1, Math.max(0, (deep - 0.08) * 1.6)).toFixed(3));
    for (var i = 0; i < VEINS.length; i++) {
      set("--afa-v" + (i + 1), (Math.min(1, Math.max(0, (deep - VEINS[i]) / 0.22)) * 0.8).toFixed(3));
    }
    set("--afa-vjoint", (Math.min(1, Math.max(0, (deep - 0.3) / 0.3)) * 0.55).toFixed(3));
  }
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; apply(); });
  }
  if (!window.__afaBound) {
    window.__afaBound = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("nav", apply);
  }
  apply();
})();
`

export default function HellscapeBackdrop() {
  return (
    <>
      <div class="hellscape" aria-hidden="true" data-corruption={String(CORRUPTION)}>
        <div class="hellscape-band">
          <div class="hellscape-glow"></div>
          <svg class="hellscape-svg" viewBox="0 0 1600 320" preserveAspectRatio="none">
            <defs>
              <pattern id="afa-brick" width="64" height="26" patternUnits="userSpaceOnUse">
                <rect class="hs-brickface" x="0" y="0" width="62" height="11" rx="1"></rect>
                <rect class="hs-brickface" x="-32" y="13" width="62" height="11" rx="1"></rect>
                <rect class="hs-brickface" x="34" y="13" width="62" height="11" rx="1"></rect>
              </pattern>
              <linearGradient id="afa-seepgrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" class="hs-stop-glow"></stop>
                <stop offset="45%" class="hs-stop-hot"></stop>
                <stop offset="100%" class="hs-stop-base" stop-opacity="0"></stop>
              </linearGradient>
              <radialGradient id="afa-jointglow" cx="50%" cy="100%" r="70%">
                <stop offset="0%" class="hs-stop-hot" stop-opacity="0.85"></stop>
                <stop offset="100%" class="hs-stop-hot" stop-opacity="0"></stop>
              </radialGradient>
            </defs>

            <g class="hs-far">
              <path class="hs-far-fill" d={SKYLINE_FAR}></path>
            </g>

            <g class="hs-near">
              <path class="hs-near-fill" d={SKYLINE_NEAR}></path>
              <g class="hs-masts">
                <path d="M1024,270 L1024,196"></path>
                <path d="M1012,214 L1036,208"></path>
                <path d="M1078,270 L1078,186"></path>
                <path d="M1064,206 L1092,200"></path>
                <path d="M1136,270 L1136,204"></path>
                <path d="M1124,220 L1148,215"></path>
                <path d="M1196,270 L1196,192"></path>
                <path d="M1182,212 L1210,206"></path>
              </g>
            </g>

            <path class="hs-brick" d="M0,268 L1600,268 L1600,320 L0,320 Z" fill="url(#afa-brick)"></path>
            <path class="hs-brickline" d="M0,268 L1600,268"></path>

            <g class="hs-joints">
              <ellipse cx="124" cy="320" rx="120" ry="58" fill="url(#afa-jointglow)"></ellipse>
              <ellipse cx="600" cy="320" rx="150" ry="66" fill="url(#afa-jointglow)"></ellipse>
              <ellipse cx="984" cy="320" rx="130" ry="54" fill="url(#afa-jointglow)"></ellipse>
              <ellipse cx="1420" cy="320" rx="140" ry="60" fill="url(#afa-jointglow)"></ellipse>
            </g>

            <g class="hs-veins">
              {VEINS.map(([d, anim, branch], i) => (
                <g class={`hs-v hs-v${i + 1}`}>
                  <path d={d} style={{ animation: anim }}></path>
                  {branch && <path class="hs-branch" d={branch}></path>}
                </g>
              ))}
              <g class="hs-vjoint">
                {JOINT_CRACKS.map((d) => (
                  <path d={d}></path>
                ))}
              </g>
            </g>

            <g class="hs-ghost">
              <path transform="translate(4,-3)" d={SKYLINE_NEAR}></path>
            </g>
          </svg>

          <div class="hellscape-embers">
            {EMBERS.map(([left, bottom, size, tone, dur, delay]) => (
              <span
                class={tone === 1 ? "is-glow" : "is-hot"}
                style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                }}
              ></span>
            ))}
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }}></script>
    </>
  )
}
