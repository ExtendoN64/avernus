---
title: Map of Baldur's Gate
publish: true
tags:
  - locations
  - baldurs-gate
  - map
---

# Map of Baldur's Gate

Drag to pan, scroll to zoom, click a district to open its page. Nine gates, three cities, one river.

<div id="bg-map" class="bg-map">
<div class="bg-map-controls">
<button type="button" data-map="in" aria-label="Zoom in">+</button>
<button type="button" data-map="out" aria-label="Zoom out">&minus;</button>
<button type="button" data-map="reset" aria-label="Reset view">Reset</button>
</div>
<svg viewBox="0 0 1200 830" role="img" aria-label="Stylised map of Baldur's Gate showing the Upper City, Lower City, Outer City, Gray Harbor and the River Chionthar">
<defs>
<pattern id="bgm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="6" class="bgm-hatchline"/>
</pattern>
<pattern id="bgm-wave" width="34" height="16" patternUnits="userSpaceOnUse">
<path d="M0,8 q8.5,-6 17,0 q8.5,6 17,0" fill="none" class="bgm-waveline"/>
</pattern>
</defs>
<g id="bg-map-viewport">
<rect x="0" y="0" width="1200" height="830" class="bgm-land"/>
<rect x="0" y="0" width="1200" height="830" fill="url(#bgm-hatch)" opacity="0.3"/>
<path class="bgm-water" d="M0,632 Q140,626 262,636 Q320,642 356,614 Q382,556 448,544 Q516,534 566,558 Q606,578 620,636 Q664,650 726,648 Q880,652 1030,670 Q1120,682 1200,692 L1200,742 Q1040,716 880,722 Q700,730 520,738 Q300,746 0,736 Z"/>
<path class="bgm-waterfx" d="M0,632 Q140,626 262,636 Q320,642 356,614 Q382,556 448,544 Q516,534 566,558 Q606,578 620,636 Q664,650 726,648 Q880,652 1030,670 Q1120,682 1200,692 L1200,742 Q1040,716 880,722 Q700,730 520,738 Q300,746 0,736 Z" fill="url(#bgm-wave)"/>
<a href="../03-locations/outer-city">
<g class="bgm-region bgm-outer">
<path d="M730,380 L796,430 Q824,520 790,600 L726,648 Q880,652 1030,670 Q1120,682 1200,692 L1200,214 Q1030,184 890,216 Q790,240 740,330 Z"/>
<path d="M0,736 Q300,746 520,738 Q700,730 880,722 Q1040,716 1200,742 L1200,830 L0,830 Z"/>
</g>
</a>
<a href="../03-locations/lower-city">
<g class="bgm-region bgm-lower">
<path d="M300,380 L252,412 Q224,486 244,548 L262,636 Q320,642 356,614 Q382,556 448,544 Q516,534 566,558 Q606,578 620,636 Q664,650 726,648 L790,600 Q824,520 796,430 L730,380 Z"/>
</g>
</a>
<a href="../03-locations/upper-city">
<g class="bgm-region bgm-upper">
<path d="M300,380 L282,296 Q286,228 350,194 Q440,158 560,158 Q664,165 714,224 Q746,278 740,340 L730,380 Z"/>
</g>
</a>
<path class="bgm-road" d="M452,158 L448,80 Q446,40 452,8"/>
<path class="bgm-road" d="M812,466 Q950,488 1080,518 Q1150,534 1200,548"/>
<path class="bgm-road" d="M786,566 Q832,598 884,626"/>
<path class="bgm-road" d="M884,742 Q890,780 896,824"/>
<path class="bgm-road" d="M505,380 L505,452"/>
<path class="bgm-wall bgm-oldwall" d="M300,380 L282,296 Q286,228 350,194 Q440,158 560,158 Q664,165 714,224 Q746,278 740,340 L730,380 Z"/>
<path class="bgm-wall" d="M300,380 L252,412 Q224,486 244,548 L262,636"/>
<path class="bgm-wall" d="M730,380 L796,430 Q824,520 790,600 L726,648"/>
<g class="bgm-hill">
<path d="M1042,446 q28,-42 56,0 q22,34 -56,0 Z"/>
<path d="M1026,466 q42,-56 84,0 q30,42 -84,0 Z"/>
<text x="1068" y="498">Dusthawk Hill</text>
</g>
<g class="bgm-bridge">
<rect x="866" y="624" width="36" height="120" rx="3"/>
<line x1="866" y1="654" x2="902" y2="654"/>
<line x1="866" y1="684" x2="902" y2="684"/>
<line x1="866" y1="714" x2="902" y2="714"/>
</g>
<g class="bgm-gate">
<circle class="bgm-ring" data-gate="blackdragon" cx="452" cy="158" r="15"/>
<circle class="bgm-ring" data-gate="patriar" cx="318" cy="214" r="15"/>
<circle class="bgm-ring" data-gate="patriar" cx="284" cy="300" r="15"/>
<circle class="bgm-ring" data-gate="baldurs" cx="505" cy="380" r="15"/>
<circle class="bgm-ring" data-gate="patriar" cx="672" cy="380" r="15"/>
<circle class="bgm-ring" data-gate="citadel" cx="742" cy="326" r="15"/>
<circle class="bgm-ring" data-gate="sea" cx="246" cy="524" r="15"/>
<circle class="bgm-ring" data-gate="basilisk" cx="812" cy="466" r="15"/>
<circle class="bgm-ring" data-gate="cliffgate" cx="786" cy="566" r="15"/>
<circle cx="452" cy="158" r="6"/><text x="452" y="138">Black Dragon Gate</text>
<circle cx="318" cy="214" r="6"/><text x="268" y="200">Manor Gate</text>
<circle cx="284" cy="300" r="6"/><text x="230" y="296">Gond Gate</text>
<circle cx="505" cy="380" r="6"/><text x="505" y="404">Baldur's Gate</text>
<circle cx="672" cy="380" r="6"/><text x="692" y="404">Heap Gate</text>
<circle cx="742" cy="326" r="6"/><text x="800" y="320">Citadel Gate</text>
<circle cx="246" cy="524" r="6"/><text x="196" y="530">Sea Gate</text>
<circle cx="812" cy="466" r="6"/><text x="872" y="462">Basilisk Gate</text>
<circle cx="786" cy="566" r="6"/><text x="826" y="588">Cliffgate</text>
</g>
<g class="bgm-label">
<text class="bgm-district" x="510" y="284">UPPER CITY</text>
<text class="bgm-sub" x="510" y="224">The Wide</text>
<text class="bgm-sub" x="372" y="328">Manorborn</text>
<text class="bgm-sub" x="644" y="246">Citadel Streets</text>
<text class="bgm-sub" x="628" y="332">Temples</text>
<text class="bgm-district" x="486" y="472">LOWER CITY</text>
<text class="bgm-sub" x="330" y="442">Seatower</text>
<text class="bgm-sub" x="310" y="506">The Steeps</text>
<text class="bgm-sub" x="318" y="582">Bloomridge</text>
<text class="bgm-sub" x="654" y="444">Eastway</text>
<text class="bgm-sub" x="714" y="506">Heapside</text>
<text class="bgm-sub" x="678" y="580">Brampton</text>
<text class="bgm-district" x="990" y="320">OUTER CITY</text>
<text class="bgm-sub" x="868" y="266">Blackgate</text>
<text class="bgm-sub" x="1098" y="392">Twin Songs</text>
<text class="bgm-sub" x="902" y="430">Tumbledown</text>
<text class="bgm-sub" x="1004" y="552">Stonyeyes</text>
<text class="bgm-sub" x="1136" y="590">Whitkeep</text>
<text class="bgm-sub" x="830" y="662">Sow's Foot</text>
<text class="bgm-sub" x="978" y="640">Wyrm's Crossing</text>
<text class="bgm-sub" x="330" y="794">Rivington</text>
<text class="bgm-sub" x="640" y="800">Little Calimshan</text>
<text class="bgm-sub" x="1046" y="790">Norchapel</text>
<text class="bgm-road-label" x="512" y="60">the north road, to Waterdeep</text>
<text class="bgm-road-label" x="1104" y="566">the Coast Way</text>
<text class="bgm-water-label" x="486" y="602">GRAY HARBOR</text>
<text class="bgm-water-label" x="196" y="694">RIVER CHIONTHAR</text>
</g>
<g class="bgm-compass" transform="translate(1112,92)">
<circle r="34"/>
<path d="M0,-30 L8,0 L0,30 L-8,0 Z"/>
<path d="M0,-30 L8,0 L-8,0 Z" class="bgm-compass-n"/>
<text y="-42">N</text>
</g>
<g class="bgm-cartouche" transform="translate(56,64)">
<text class="bgm-title" x="0" y="0">BALDUR'S GATE</text>
<text class="bgm-subtitle" x="0" y="28">on the Chionthar</text>
<line x1="0" y1="44" x2="252" y2="44"/>
</g>
</g>
</svg>
<div class="bg-map-legend">
<b>Key</b>
<ul>
<li><i class="k-oldwall"></i>The Old Wall</li>
<li><i class="k-wall"></i>City walls</li>
<li><span class="k-gate"></span>Gates (nine)</li>
<li><i class="k-road"></i>Roads</li>
</ul>
</div>
</div>
<script>
(function () {
  function initMap() {
    var wrap = document.getElementById("bg-map");
    if (!wrap || wrap.dataset.ready === "1") return;
    var svg = wrap.querySelector("svg");
    var g = wrap.querySelector("#bg-map-viewport");
    if (!svg || !g) return;
    wrap.dataset.ready = "1";
    var s = 1, tx = 0, ty = 0, MIN = 0.7, MAX = 8;
    function apply() {
      g.setAttribute("transform", "translate(" + tx + " " + ty + ") scale(" + s + ")");
    }
    function toSvg(evt) {
      var r = svg.getBoundingClientRect();
      var vb = svg.viewBox.baseVal;
      return {
        x: (evt.clientX - r.left) * (vb.width / r.width),
        y: (evt.clientY - r.top) * (vb.height / r.height)
      };
    }
    function zoomAt(cx, cy, factor) {
      var ns = Math.min(MAX, Math.max(MIN, s * factor));
      var k = ns / s;
      tx = cx - k * (cx - tx);
      ty = cy - k * (cy - ty);
      s = ns;
      apply();
    }
    svg.addEventListener("wheel", function (e) {
      e.preventDefault();
      var p = toSvg(e);
      zoomAt(p.x, p.y, e.deltaY < 0 ? 1.16 : 1 / 1.16);
    }, { passive: false });
    var drag = false, lx = 0, ly = 0, moved = 0;
    svg.addEventListener("pointerdown", function (e) {
      drag = true; moved = 0;
      var p = toSvg(e); lx = p.x; ly = p.y;
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
      wrap.classList.add("is-dragging");
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var p = toSvg(e);
      tx += p.x - lx; ty += p.y - ly;
      moved += Math.abs(p.x - lx) + Math.abs(p.y - ly);
      lx = p.x; ly = p.y;
      apply();
    });
    function endDrag(e) {
      if (!drag) return;
      drag = false;
      try { svg.releasePointerCapture(e.pointerId); } catch (err) {}
      wrap.classList.remove("is-dragging");
    }
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    svg.addEventListener("pointerleave", endDrag);
    svg.addEventListener("click", function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    var btns = wrap.querySelectorAll(".bg-map-controls button");
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener("click", function (e) {
          e.preventDefault();
          var vb = svg.viewBox.baseVal;
          var act = b.getAttribute("data-map");
          if (act === "in") zoomAt(vb.width / 2, vb.height / 2, 1.35);
          else if (act === "out") zoomAt(vb.width / 2, vb.height / 2, 1 / 1.35);
          else { s = 1; tx = 0; ty = 0; apply(); }
        });
      })(btns[i]);
    }
  }
  /* Cross-reference the nine-gates table with the map: hovering a row rings
     that gate. The three patriar gates share one key, so they light together.
     Keyed off the row's first cell rather than data attributes, so the table
     stays an ordinary Markdown table. */
  var GATE_KEYS = [
    [/black dragon/i, "blackdragon"],
    [/baldur/i, "baldurs"],
    [/citadel/i, "citadel"],
    [/gond|heap|manor/i, "patriar"],
    [/sea gate/i, "sea"],
    [/basilisk/i, "basilisk"],
    [/cliffgate/i, "cliffgate"]
  ];

  function initGateTable() {
    var wrap = document.getElementById("bg-map");
    if (!wrap) return;
    var article = wrap.closest("article") || document;
    var rows = article.querySelectorAll("table tbody tr");
    for (var i = 0; i < rows.length; i++) {
      (function (row) {
        if (row.dataset.gateBound) return;
        var cell = row.cells && row.cells[0];
        if (!cell) return;
        var text = cell.textContent || "";
        var key = null;
        for (var k = 0; k < GATE_KEYS.length; k++) {
          if (GATE_KEYS[k][0].test(text)) { key = GATE_KEYS[k][1]; break; }
        }
        if (!key) return;
        row.dataset.gateBound = "1";
        row.setAttribute("data-gate", key);
        function light(on) {
          var rings = wrap.querySelectorAll('.bgm-ring[data-gate="' + key + '"]');
          for (var r = 0; r < rings.length; r++) {
            rings[r].classList.toggle("is-lit", on);
          }
        }
        row.addEventListener("mouseenter", function () { light(true); });
        row.addEventListener("mouseleave", function () { light(false); });
        row.addEventListener("focusin", function () { light(true); });
        row.addEventListener("focusout", function () { light(false); });
      })(rows[i]);
    }
  }

  function init() { initMap(); initGateTable(); }
  if (document.readyState !== "loading") init();
  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("nav", init);
})();
</script>

## Reading the map

- **Inside the Old Wall** is the [[Upper City]], on the high ground. Six gates pierce it, and four of those are patriar gates that ordinary people cannot use.
- **Between the Old Wall and the water** is the [[Lower City]], wrapped around Gray Harbor.
- **Everything outside the city wall** is the [[Outer City]], including the far bank and Wyrm's Crossing.

## The nine gates

| Gate | Where | Who holds it |
|---|---|---|
| **Baldur's Gate** | Old Wall, facing the harbor | The Watch. The oldest gate, and the only one through the Old Wall an ordinary person may use |
| **Black Dragon Gate** | Old Wall, north | The Watch. Faces the road north toward Waterdeep. Guards here rarely take bribes |
| **Citadel Gate** | Old Wall, east | The Watch. The only way into their fortress |
| **Gond Gate**, **Heap Gate**, **Manor Gate** | Old Wall | The Watch. Patriar gates. Livery or a letter, or you walk the long way |
| **Sea Gate** | Harbour front | Patriar gate, serving the docks |
| **Basilisk Gate** | East wall | Flaming Fist. Opens onto the Coast Way toward Amn and Calimshan |
| **Cliffgate** | Southeast wall | Flaming Fist. Foggy, minor, opens toward Tumbledown and the graveyards |

Entry costs **5 cp** at any gate. It is a small sum, and it is the entire point: it keeps the destitute outside, which is where most of the Elturan refugees now are.

The gates close at dusk. At nightfall the Watch clears the Upper City of anyone who is not a patriar, in patriar livery, or carrying a Watch token.

> [!note] Where you are from
> Baldurians often name themselves by their nearest gate rather than their crew or family. "Gondgater" and "Dragongater" are understood as neighborhood identities, and as a polite way of not answering the question. Worth picking one for your character.

## See also

[[Upper City]] · [[Lower City]] · [[Outer City]] · [[Elturel]] · [[The Flaming Fist]]
