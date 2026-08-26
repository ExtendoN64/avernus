/* Pan and zoom for the campaign maps.
   Shared by every page that drops in a .bg-map block, rather than living
   inline on one of them. Keyed off the class, so a page may hold more than one.

   Per map, optional attributes on .bg-map:
     data-min   minimum scale (default 0.9)
     data-max   maximum scale (default 6)

   Re-runs on `nav`, which Quartz fires on first load and after every SPA
   navigation, and each pass is idempotent via the data-ready flag. */
(function () {
  if (window.__afaMaps) return;
  window.__afaMaps = true;

  function initMap(wrap) {
    if (wrap.dataset.ready === "1") return;
    var svg = wrap.querySelector("svg");
    var g = wrap.querySelector(".bg-map-viewport");
    if (!svg || !g) return;
    wrap.dataset.ready = "1";

    var MIN = parseFloat(wrap.getAttribute("data-min")) || 0.9;
    var MAX = parseFloat(wrap.getAttribute("data-max")) || 6;
    var s = 1, tx = 0, ty = 0;

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

    /* How far the pointer may travel and still count as a click rather than a
       drag. This MUST be measured in screen pixels: an earlier version
       measured it in viewBox units, which on the 5250-wide city map worked
       out to under three screen pixels, so ordinary hand jitter silently
       swallowed real clicks on the pins.

       Displacement from where the press started, not distance travelled, so
       a shaky hand that ends up back where it began is still a click. */
    var DRAG_PX = 8;
    var drag = false, captured = false, lx = 0, ly = 0, sx = 0, sy = 0, movedPx = 0;

    svg.addEventListener("pointerdown", function (e) {
      drag = true; captured = false; movedPx = 0;
      sx = e.clientX; sy = e.clientY;
      var p = toSvg(e); lx = p.x; ly = p.y;
      /* Deliberately NOT capturing the pointer here. Pointer capture retargets
         every later event to the capturing element, INCLUDING the click the
         browser synthesises on pointerup. Capturing on pointerdown therefore
         made every click land on the <svg> with no <a> in its path, so the
         pins silently did nothing. Capture is taken below, once movement
         proves this is a drag and no click should result anyway. */
      wrap.classList.add("is-dragging");
    });

    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var p = toSvg(e);
      tx += p.x - lx; ty += p.y - ly;
      /* Displacement from where the press started, in SCREEN pixels: viewBox
         units mean different things on screen from one map to the next. */
      var d = Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy);
      if (d > movedPx) movedPx = d;
      if (!captured && movedPx > DRAG_PX) {
        /* Now it is a real drag: take the pointer so panning survives leaving
           the map, and so the release cannot be read as a click on a pin. */
        try { svg.setPointerCapture(e.pointerId); captured = true; } catch (err) {}
      }
      lx = p.x; ly = p.y;
      apply();
    });

    function endDrag(e) {
      if (!drag) return;
      drag = false;
      if (captured) {
        try { svg.releasePointerCapture(e.pointerId); } catch (err) {}
        captured = false;
      }
      wrap.classList.remove("is-dragging");
    }
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    svg.addEventListener("pointerleave", endDrag);
    /* A real drag that happens to end on a pin must not navigate. */
    svg.addEventListener("click", function (e) {
      if (movedPx > DRAG_PX) { e.preventDefault(); e.stopPropagation(); }
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
  function initGateTable(wrap) {
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
          for (var r = 0; r < rings.length; r++) rings[r].classList.toggle("is-lit", on);
        }
        row.addEventListener("mouseenter", function () { light(true); });
        row.addEventListener("mouseleave", function () { light(false); });
        row.addEventListener("focusin", function () { light(true); });
        row.addEventListener("focusout", function () { light(false); });
      })(rows[i]);
    }
  }

  /* Hovering a district in the legend lights every pin belonging to it. The
     legend sits outside the <svg>, so this cannot be done in CSS alone. */
  function initLegend(wrap) {
    var items = wrap.querySelectorAll(".bg-map-legend li[data-district]");
    for (var i = 0; i < items.length; i++) {
      (function (li) {
        if (li.dataset.bound) return;
        li.dataset.bound = "1";
        var key = li.getAttribute("data-district");
        function light(on) {
          var sel = key === "gates" ? ".bgm-ring" : '.bgm-pin[data-district="' + key + '"]';
          var els = wrap.querySelectorAll(sel);
          for (var n = 0; n < els.length; n++) els[n].classList.toggle("is-lit", on);
        }
        li.addEventListener("mouseenter", function () { light(true); });
        li.addEventListener("mouseleave", function () { light(false); });
        li.addEventListener("focusin", function () { light(true); });
        li.addEventListener("focusout", function () { light(false); });
      })(items[i]);
    }
  }

  function init() {
    var maps = document.querySelectorAll(".bg-map");
    for (var i = 0; i < maps.length; i++) {
      initMap(maps[i]);
      initGateTable(maps[i]);
      initLegend(maps[i]);
    }
  }
  if (document.readyState !== "loading") init();
  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("nav", init);
})();
