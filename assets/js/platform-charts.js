/* DeepSeek 开放平台 usage charts — hand-drawn SVG replica of ECharts output */
(function () {
  'use strict';

  var DAYS = 30;
  var MONTHS = { 10: '10', 11: '11' };

  function dates() {
    var out = [];
    for (var i = 0; i < DAYS; i++) {
      var d = new Date(2026, 9, 10 + i);
      out.push(d);
    }
    return out;
  }
  var DATES = dates();

  function shortDate(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }
  function fullDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }
  function fmtInt(n) { return Number(n).toLocaleString('en-US'); }
  function fmtMoney(n) { return '¥' + Number(n).toFixed(2); }
  function fmtTokens(n) {
    if (n >= 1e6) return (Math.round(n / 1e5) / 10) + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return String(n);
  }

  function arr(obj) {
    var a = new Array(DAYS).fill(0);
    Object.keys(obj).forEach(function (k) { a[+k] = obj[k]; });
    return a;
  }

  /* ---------------- data ---------------- */
  var COST_API = [
    { color: '#3B82F6', values: arr({ 3: 0.05, 4: 0, 5: 0, 7: 1.1, 8: 1.0, 9: 0.35, 10: 0.15, 11: 0.1, 12: 0.2, 13: 0.1, 14: 0.08, 15: 0.1, 16: 0.06, 17: 0.12, 18: 0.9, 19: 0.08, 21: 0.06, 23: 0.05, 24: 3.0, 25: 9.1, 26: 0.1, 27: 0.05 }) },
    { color: '#6937E6', values: arr({ 10: 0.08, 12: 0.1, 13: 0.35, 14: 0.2, 17: 2.2, 18: 0.7, 21: 0.1, 22: 0.15 }) },
    { color: '#3FB8E2', values: arr({ 9: 0.15, 10: 0.25, 11: 0.08, 14: 1.0, 15: 0.12 }) }
  ];
  var COST_MODEL = [
    { color: '#3B82F6', values: arr({ 3: 0.05, 4: 0, 5: 0, 7: 1.2, 8: 1.05, 9: 0.4, 10: 0.18, 11: 0.12, 12: 0.25, 13: 0.12, 14: 0.1, 15: 0.12, 16: 0.08, 17: 0.14, 18: 0.95, 19: 0.1, 21: 0.07, 23: 0.05, 24: 3.1, 25: 9.6, 26: 0.12, 27: 0.06 }) },
    { color: '#6937E6', values: arr({ 10: 0.1, 12: 0.12, 13: 0.4, 14: 0.22, 17: 2.4, 18: 0.8, 21: 0.12, 22: 0.16 }) },
    { color: '#3FB8E2', values: arr({ 9: 0.18, 10: 0.28, 11: 0.1, 14: 1.1, 15: 0.14 }) }
  ];

  var FLASH_REQ = arr({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 2, 5: 3, 6: 6, 7: 96, 8: 102, 9: 38, 10: 3, 11: 8, 12: 172, 13: 14, 14: 5, 15: 70, 16: 118, 17: 128, 18: 108, 19: 14, 20: 4, 21: 22, 22: 2, 23: 1, 24: 0, 25: 108, 26: 112, 27: 94, 28: 2, 29: 0 });
  var FLASH_TOK = arr({ 7: 1.2, 8: 1.8, 9: 0.8, 10: 1.9, 11: 2.2, 12: 0.4, 13: 4.0, 14: 1.0, 15: 0.5, 16: 2.0, 17: 12.8, 18: 19.0, 19: 16.0, 20: 0.3, 21: 2.4, 22: 0.2, 23: 0.2, 24: 0.2, 25: 40.4, 26: 0.5, 27: 0.2, 28: 0.1, 29: 0.1 });
  var PRO_REQ = arr({ 15: 2, 25: 23 });
  var PRO_TOK = arr({ 16: 0.6, 25: 11.7 });
  var TOOL_REQ = arr({ 25: 6 });
  var SERVER_REQ = arr({ 25: 1 });

  /* ---------------- smooth path ---------------- */
  function monotonePath(pts) {
    var n = pts.length;
    if (n === 0) return '';
    if (n === 1) return 'M' + pts[0][0] + ',' + pts[0][1];
    var dx = [], dy = [], m = [];
    for (var i = 0; i < n - 1; i++) {
      dx.push(pts[i + 1][0] - pts[i][0]);
      dy.push(pts[i + 1][1] - pts[i][1]);
      m.push(dy[i] / (dx[i] || 1));
    }
    var tangents = [m[0]];
    for (var j = 1; j < n - 1; j++) {
      if (m[j - 1] * m[j] <= 0) tangents.push(0);
      else {
        var w1 = 2 * dx[j] + dx[j - 1], w2 = dx[j] + 2 * dx[j - 1];
        tangents.push((w1 + w2) / (w1 / m[j - 1] + w2 / m[j]));
      }
    }
    tangents.push(m[n - 2]);
    var d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
    for (var k = 0; k < n - 1; k++) {
      var x1 = pts[k][0], y1 = pts[k][1], x2 = pts[k + 1][0], y2 = pts[k + 1][1];
      var h = (x2 - x1) / 3;
      d += 'C' + (x1 + h).toFixed(2) + ',' + (y1 + tangents[k] * h).toFixed(2) + ' ' +
        (x2 - h).toFixed(2) + ',' + (y2 - tangents[k + 1] * h).toFixed(2) + ' ' +
        x2.toFixed(2) + ',' + y2.toFixed(2);
    }
    return d;
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var uid = 0;

  /* ---------------- base chart ---------------- */
  function baseSvg(wrap, cfg) {
    wrap.innerHTML = '';
    var w = Math.max(140, wrap.clientWidth || 320);
    var h = wrap.clientHeight || 272;
    var m = { left: cfg.left || 38, right: 12, top: 8, bottom: 24 };
    var pw = w - m.left - m.right;
    var ph = h - m.top - m.bottom;
    var svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    wrap.appendChild(svg);
    return { svg: svg, w: w, h: h, m: m, pw: pw, ph: ph };
  }

  function drawAxes(g, cfg) {
    var svg = g.svg, m = g.m, pw = g.pw, ph = g.ph;
    var ticks = cfg.ticks;
    var max = cfg.max;
    var axisColor = 'rgba(150,150,150,0.85)';
    var gridColor = 'rgba(255,255,255,0.12)';
    ticks.forEach(function (t) {
      var y = m.top + ph - (t / max) * ph;
      el('line', { x1: m.left, y1: y, x2: m.left + pw, y2: y, stroke: gridColor, 'stroke-width': 1 }, svg);
      var lab = el('text', { x: m.left - 8, y: y + 4, fill: axisColor, 'font-size': 12, 'font-family': 'Inter, sans-serif', 'text-anchor': 'end' }, svg);
      lab.textContent = cfg.yLabel ? cfg.yLabel(t) : String(t);
    });
    // x-axis baseline
    el('line', { x1: m.left, y1: m.top + ph, x2: m.left + pw, y2: m.top + ph, stroke: gridColor, 'stroke-width': 1 }, svg);
    var idxs = cfg.xIndices || [0, 10, 19, 29];
    idxs.forEach(function (i) {
      var x = m.left + (i + 0.5) / DAYS * pw;
      var lab = el('text', { x: x, y: m.top + ph + 18, fill: axisColor, 'font-size': 12, 'font-family': 'Inter, sans-serif', 'text-anchor': 'middle' }, svg);
      lab.textContent = shortDate(DATES[i]);
    });
  }

  function addTooltip(wrap) {
    var tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    wrap.appendChild(tip);
    return tip;
  }

  function tooltipHTML(d, value) {
    return '<span class="tip-date">' + fullDate(d) + '</span><span class="tip-val">' + value + '</span>';
  }

  /* ---------------- stacked bar cost chart ---------------- */
  function renderCost(wrap, mode) {
    var groups = mode === 'model' ? COST_MODEL : COST_API;
    var cfg = { max: 12, ticks: [0, 6, 12], left: 34, yLabel: function (t) { return String(t); } };
    var g = baseSvg(wrap, cfg);
    drawAxes(g, cfg);
    var totals = new Array(DAYS).fill(0);
    var maxTotal = 0;
    for (var i = 0; i < DAYS; i++) {
      var t = 0;
      for (var s = 0; s < groups.length; s++) t += groups[s].values[i];
      totals[i] = t; if (t > maxTotal) maxTotal = t;
    }
    var catW = g.pw / DAYS;
    var barW = Math.min(14, catW * 0.52);
    var svg = g.svg;
    for (var d = 0; d < DAYS; d++) {
      var x = g.m.left + (d + 0.5) * catW - barW / 2;
      var acc = 0;
      for (var si = 0; si < groups.length; si++) {
        var v = groups[si].values[d];
        if (v <= 0) continue;
        var y0 = g.m.top + g.ph - (acc / cfg.max) * g.ph;
        var y1 = g.m.top + g.ph - ((acc + v) / cfg.max) * g.ph;
        var height = Math.max(1, y0 - y1);
        var isTop = si === groups.length - 1;
        el('rect', {
          x: x.toFixed(2), y: y1.toFixed(2), width: barW.toFixed(2), height: height.toFixed(2),
          rx: isTop ? Math.min(3, barW / 3) : 0, fill: groups[si].color
        }, svg);
        acc += v;
      }
    }
    // interactive overlay
    var overlay = el('rect', { x: g.m.left, y: g.m.top, width: g.pw, height: g.ph, fill: 'transparent' }, svg);
    var pointer = el('line', { x1: 0, x2: 0, y1: g.m.top, y2: g.m.top + g.ph, stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0 }, svg);
    var tip = addTooltip(wrap);
    function show(i, clientX) {
      if (i < 0 || i >= DAYS) return;
      var cx = g.m.left + (i + 0.5) * catW;
      pointer.setAttribute('x1', cx); pointer.setAttribute('x2', cx); pointer.setAttribute('opacity', 1);
      tip.innerHTML = tooltipHTML(DATES[i], fmtMoney(totals[i]));
      tip.style.display = 'block';
      tip.style.left = Math.max(8, Math.min(g.w - 180, cx + 14)) + 'px';
      tip.style.top = (g.m.top + g.ph * 0.46) + 'px';
    }
    overlay.addEventListener('pointermove', function (e) {
      var r = svg.getBoundingClientRect();
      var x = e.clientX - r.left;
      var i = Math.floor((x - g.m.left) / catW);
      show(i);
    });
    overlay.addEventListener('pointerleave', function () {
      pointer.setAttribute('opacity', 0); tip.style.display = 'none';
      if (mode === 'apiKey') show(4); else { pointer.setAttribute('opacity', 0); tip.style.display = 'none'; }
    });
    if (mode === 'apiKey') show(4);
    wrap._resize = function () { renderCost(wrap, mode); };
  }

  /* ---------------- area chart ---------------- */
  function renderArea(wrap, cfg) {
    var g = baseSvg(wrap, cfg);
    drawAxes(g, cfg);
    var svg = g.svg;
    var pts = cfg.values.map(function (v, i) {
      return [g.m.left + (i + 0.5) / DAYS * g.pw, g.m.top + g.ph - (v / cfg.max) * g.ph];
    });
    var id = 'grad' + (++uid);
    var defs = el('defs', {}, svg);
    var grad = el('linearGradient', { id: id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': cfg.fillColor || '#3B82F6', 'stop-opacity': '0.62' }, grad);
    el('stop', { offset: '100%', 'stop-color': cfg.fillColor || '#3B82F6', 'stop-opacity': '0.04' }, grad);
    var line = monotonePath(pts);
    var area = line + 'L' + (g.m.left + g.pw).toFixed(2) + ',' + (g.m.top + g.ph) + 'L' + g.m.left + ',' + (g.m.top + g.ph) + 'Z';
    el('path', { d: area, fill: 'url(#' + id + ')', stroke: 'none' }, svg);
    el('path', { d: line, fill: 'none', stroke: cfg.lineColor || '#2B6FE8', 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);

    var overlay = el('rect', { x: g.m.left, y: g.m.top, width: g.pw, height: g.ph, fill: 'transparent' }, svg);
    var pointer = el('line', { x1: 0, x2: 0, y1: g.m.top, y2: g.m.top + g.ph, stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0 }, svg);
    var dot = el('circle', { r: 3.5, fill:cfg.lineColor || '#2B6FE8', stroke:'#fff', 'stroke-width': 1, opacity: 0 }, svg);
    var tip = addTooltip(wrap);
    var catW = g.pw / DAYS;
    overlay.addEventListener('pointermove', function (e) {
      var r = svg.getBoundingClientRect();
      var x = e.clientX - r.left;
      var i = Math.floor((x - g.m.left) / catW);
      if (i < 0 || i >= DAYS) return;
      var cx = g.m.left + (i + 0.5) * catW;
      pointer.setAttribute('x1', cx); pointer.setAttribute('x2', cx); pointer.setAttribute('opacity', 1);
      dot.setAttribute('cx', cx); dot.setAttribute('cy', pts[i][1]); dot.setAttribute('opacity', 1);
      tip.innerHTML = tooltipHTML(DATES[i], cfg.valueLabel(cfg.values[i]));
      tip.style.display = 'block';
      tip.style.left = Math.max(8, Math.min(g.w - 180, cx + 14)) + 'px';
      tip.style.top = (g.m.top + g.ph * 0.42) + 'px';
    });
    overlay.addEventListener('pointerleave', function () {
      pointer.setAttribute('opacity', 0); dot.setAttribute('opacity', 0); tip.style.display = 'none';
    });
    wrap._resize = function () { renderArea(wrap, cfg); };
  }

  /* ---------------- stacked bars (tokens) ---------------- */
  function renderTokenBars(wrap, cfg) {
    var g = baseSvg(wrap, cfg);
    drawAxes(g, cfg);
    var svg = g.svg;
    var catW = g.pw / DAYS;
    var barW = Math.min(8, catW * 0.34);
    var split = [0.16, 0.46, 0.38];
    var colors = ['#0C70F3', '#60B3FE', '#A0DCFD'];
    cfg.values.forEach(function (v, i) {
      if (v <= 0) return;
      var x = g.m.left + (i + 0.5) * catW - barW / 2;
      var acc = 0;
      for (var s = 0; s < 3; s++) {
        var sv = v * split[s];
        var y0 = g.m.top + g.ph - (acc / cfg.max) * g.ph;
        var y1 = g.m.top + g.ph - ((acc + sv) / cfg.max) * g.ph;
        el('rect', {
          x: x.toFixed(2), y: y1.toFixed(2), width: barW.toFixed(2), height: Math.max(1, y0 - y1).toFixed(2),
          rx: s === 2 ? 3 : 0, fill: colors[s]
        }, svg);
        acc += sv;
      }
    });
    var overlay = el('rect', { x: g.m.left, y: g.m.top, width: g.pw, height: g.ph, fill: 'transparent' }, svg);
    var pointer = el('line', { x1: 0, x2: 0, y1: g.m.top, y2: g.m.top + g.ph, stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0 }, svg);
    var tip = addTooltip(wrap);
    overlay.addEventListener('pointermove', function (e) {
      var r = svg.getBoundingClientRect(); var x = e.clientX - r.left;
      var i = Math.floor((x - g.m.left) / catW); if (i < 0 || i >= DAYS) return;
      var cx = g.m.left + (i + 0.5) * catW;
      pointer.setAttribute('x1', cx); pointer.setAttribute('x2', cx); pointer.setAttribute('opacity', 1);
      tip.innerHTML = tooltipHTML(DATES[i], cfg.valueLabel(cfg.values[i]));
      tip.style.display = 'block'; tip.style.left = Math.max(8, Math.min(g.w - 180, cx + 14)) + 'px'; tip.style.top = (g.m.top + g.ph * 0.42) + 'px';
    });
    overlay.addEventListener('pointerleave', function () { pointer.setAttribute('opacity', 0); tip.style.display = 'none'; });
    wrap._resize = function () { renderTokenBars(wrap, cfg); };
  }

  /* ---------------- chart registry ---------------- */
  var CONFIGS = {
    flashRequests: { type: 'area', values: FLASH_REQ, max: 180, ticks: [0, 90, 180], left: 38, yLabel: function (t) { return String(t); }, valueLabel: function (v) { return fmtInt(v); } },
    flashTokens: { type: 'tokenBars', values: FLASH_TOK, max: 50, ticks: [0, 25, 50], left: 42, yLabel: function (t) { return t === 0 ? '0' : t + 'M'; }, valueLabel: function (v) { return fmtTokens(v * 1e6); } },
    proRequests: { type: 'area', values: PRO_REQ, max: 28, ticks: [0, 14, 28], left: 34, yLabel: function (t) { return String(t); }, valueLabel: function (v) { return fmtInt(v); } },
    proTokens: { type: 'tokenBars', values: PRO_TOK, max: 16, ticks: [0, 8, 16], left: 38, yLabel: function (t) { return t === 0 ? '0' : t + 'M'; }, valueLabel: function (v) { return fmtTokens(v * 1e6); } },
    toolSearch: { type: 'area', values: TOOL_REQ, max: 8, ticks: [0, 4, 8], left: 30, yLabel: function (t) { return String(t); }, valueLabel: function (v) { return fmtInt(v); } },
    serverToolSearch: { type: 'area', values: SERVER_REQ, max: 2, ticks: [0, 1, 2], left: 30, yLabel: function (t) { return String(t); }, valueLabel: function (v) { return fmtInt(v); } }
  };

  var currentMode = 'apiKey';

  function renderOne(wrap) {
    var key = wrap.getAttribute('data-chart');
    if (key === 'cost') return renderCost(wrap, currentMode);
    var cfg = CONFIGS[key];
    if (!cfg) return;
    if (cfg.type === 'area') renderArea(wrap, cfg);
    else renderTokenBars(wrap, cfg);
  }

  function renderAll() {
    document.querySelectorAll('.chart-wrap[data-chart]').forEach(function (w) {
      // avoid recursive resize loops
      if (w._resize) { w._resize = null; }
      renderOne(w);
    });
  }

  window.DeepSeekCharts = {
    renderAll: renderAll,
    setCostMode: function (mode) { currentMode = mode; var w = document.querySelector('[data-chart="cost"]'); if (w) renderCost(w, mode); }
  };

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      document.querySelectorAll('.chart-wrap[data-chart]').forEach(function (w) {
        var key = w.getAttribute('data-chart');
        if (key === 'cost') renderCost(w, currentMode);
        else if (CONFIGS[key]) {
          if (CONFIGS[key].type === 'area') renderArea(w, CONFIGS[key]);
          else renderTokenBars(w, CONFIGS[key]);
        }
      });
    }, 120);
  });
})();
