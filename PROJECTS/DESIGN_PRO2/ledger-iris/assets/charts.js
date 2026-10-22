/* Ledger charts — a small SVG renderer for the four charts we actually use.
   Markup:
     <figure class="figure" data-chart="bar|line|stack|waterfall">
       <script type="application/json">{ ...data... }</script>
     </figure>
   The renderer adds the SVG, a legend (2+ series), a hover tooltip and a
   "Show as table" disclosure, so no chart relies on colour alone. */

(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function fmt(v, d) {
    var u = d.unit || '', p = d.prefix || '';
    var a = Math.abs(v), s = v < 0 ? '−' : '';
    if (d.compact && a >= 1e6) return s + p + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'm' + u;
    if (d.compact && a >= 1e3) return s + p + Math.round(a / 1e3) + 'k' + u;
    return s + p + a.toLocaleString('en-GB', { maximumFractionDigits: d.decimals || 0 }) + u;
  }
  /* Round the axis to 4–5 friendly ticks */
  function niceTicks(min, max, n) {
    var span = max - min || 1, step = Math.pow(10, Math.floor(Math.log10(span / n)));
    var err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
    for (var v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
    return out;
  }
  /* Bar with only the data end rounded: anchored flat on the baseline */
  function barPath(x, y0, w, y1, r) {
    var up = y1 < y0, h = Math.abs(y1 - y0);
    r = Math.min(r, w / 2, h);
    if (h < 0.5) return '';
    if (up) return 'M' + x + ',' + y0 + 'V' + (y1 + r) + 'Q' + x + ',' + y1 + ' ' + (x + r) + ',' + y1 + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y1 + ' ' + (x + w) + ',' + (y1 + r) + 'V' + y0 + 'Z';
    return 'M' + x + ',' + y0 + 'V' + (y1 - r) + 'Q' + x + ',' + y1 + ' ' + (x + r) + ',' + y1 + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y1 + ' ' + (x + w) + ',' + (y1 - r) + 'V' + y0 + 'Z';
  }

  function tooltip(fig) {
    var t = document.createElement('div');
    t.className = 'chart-tip';
    t.hidden = true;
    fig.appendChild(t);
    return {
      show: function (html, x, y) {
        t.innerHTML = html; t.hidden = false;
        var fw = fig.clientWidth, tw = t.offsetWidth;
        t.style.left = Math.max(0, Math.min(fw - tw, x - tw / 2)) + 'px';
        t.style.top = (y - t.offsetHeight - 10) + 'px';
      },
      hide: function () { t.hidden = true; }
    };
  }
  function tipRows(rows) {
    return rows.map(function (r) {
      return '<div class="chart-tip__row"><i style="background:' + r.c + '"></i><span>' + r.n + '</span><b>' + r.v + '</b></div>';
    }).join('');
  }

  function legend(fig, series, kind) {
    if (series.length < 2) return;
    var l = document.createElement('div');
    l.className = 'legend';
    l.innerHTML = series.map(function (s, i) {
      return '<span><i class="' + (kind === 'line' ? 'line' : '') + '" style="--c:' + (s.color || COLORS[i]) + '"></i>' + s.name + '</span>';
    }).join('');
    fig.insertBefore(l, fig.querySelector('svg'));
  }

  function table(fig, d) {
    var det = document.createElement('details');
    det.className = 'chart-table';
    var head = '<tr><th></th>' + d.series.map(function (s) { return '<th class="num">' + s.name + '</th>'; }).join('') + '</tr>';
    var rows = d.labels.map(function (lab, i) {
      return '<tr><td>' + lab + '</td>' + d.series.map(function (s) { return '<td class="num">' + fmt(s.values[i], d) + '</td>'; }).join('') + '</tr>';
    }).join('');
    det.innerHTML = '<summary>Show as table</summary><div class="table-wrap" style="margin-top:10px"><table class="table table--dense"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
    fig.appendChild(det);
  }

  function frame(fig, d, H) {
    var W = 640, padL = d.padLeft || 52, padR = 16, padT = 14, padB = 28;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: 'chart', role: 'img', 'aria-label': d.title || '' });
    fig.appendChild(svg);
    return { svg: svg, W: W, H: H, x0: padL, x1: W - padR, y0: H - padB, y1: padT };
  }
  function yAxis(f, d, lo, hi) {
    var ticks = niceTicks(lo, hi, 4);
    var min = ticks[0], max = ticks[ticks.length - 1];
    var y = function (v) { return f.y0 - (v - min) / (max - min) * (f.y0 - f.y1); };
    var g = el('g', { class: 'grid' }, f.svg);
    ticks.forEach(function (t) {
      el('line', { x1: f.x0, x2: f.x1, y1: y(t), y2: y(t), class: t === 0 ? 'zero' : '' }, g);
      var tx = el('text', { x: f.x0 - 8, y: y(t) + 4, 'text-anchor': 'end' }, f.svg);
      tx.textContent = fmt(t, Object.assign({}, d, { compact: true }));
    });
    return y;
  }
  function xLabels(f, labels, cx, every) {
    labels.forEach(function (lab, i) {
      if (every && i % every) return;
      var t = el('text', { x: cx(i), y: f.y0 + 18, 'text-anchor': 'middle' }, f.svg);
      t.textContent = lab;
    });
  }

  /* ---------- Grouped bars ---------- */
  function bar(fig, d) {
    var f = frame(fig, d, d.height || 260);
    var all = [].concat.apply([], d.series.map(function (s) { return s.values; }));
    var y = yAxis(f, d, Math.min(0, Math.min.apply(null, all)), Math.max.apply(null, all));
    var n = d.labels.length, slot = (f.x1 - f.x0) / n, gap = 2;
    var groupW = Math.min(slot * 0.62, 26 * d.series.length), bw = (groupW - gap * (d.series.length - 1)) / d.series.length;
    var cx = function (i) { return f.x0 + slot * i + slot / 2; };
    var tip = tooltip(fig);
    d.labels.forEach(function (lab, i) {
      var gx = cx(i) - groupW / 2;
      d.series.forEach(function (s, j) {
        el('path', { d: barPath(gx + j * (bw + gap), y(0), bw, y(s.values[i]), 4), fill: s.color || COLORS[j], class: 'bar' }, f.svg);
      });
      var hit = el('rect', { x: f.x0 + slot * i, y: f.y1, width: slot, height: f.y0 - f.y1, fill: 'transparent' }, f.svg);
      hit.addEventListener('mousemove', function () {
        var r = fig.querySelector('svg').getBoundingClientRect(), k = r.width / f.W;
        tip.show('<div class="chart-tip__t">' + lab + '</div>' + tipRows(d.series.map(function (s, j) { return { n: s.name, v: fmt(s.values[i], d), c: s.color || COLORS[j] }; })),
          cx(i) * k + (r.left - fig.getBoundingClientRect().left), y(Math.max.apply(null, d.series.map(function (s) { return s.values[i]; }))) * k + (r.top - fig.getBoundingClientRect().top));
      });
      hit.addEventListener('mouseleave', tip.hide);
    });
    xLabels(f, d.labels, cx);
    legend(fig, d.series, 'bar');
    table(fig, d);
  }

  /* ---------- Lines ---------- */
  function line(fig, d) {
    var f = frame(fig, d, d.height || 260);
    var all = [].concat.apply([], d.series.map(function (s) { return s.values; }));
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var y = yAxis(f, d, d.zero ? Math.min(0, lo) : lo - (hi - lo) * 0.1, hi + (hi - lo) * 0.05);
    var n = d.labels.length;
    var cx = function (i) { return f.x0 + 8 + (f.x1 - f.x0 - 16) * i / (n - 1); };
    d.series.forEach(function (s, j) {
      var c = s.color || COLORS[j];
      var pts = s.values.map(function (v, i) { return cx(i) + ',' + y(v); });
      if (d.area && j === 0) el('path', { d: 'M' + pts.join('L') + 'L' + cx(n - 1) + ',' + f.y0 + 'L' + cx(0) + ',' + f.y0 + 'Z', fill: c, opacity: '.08' }, f.svg);
      el('path', { d: 'M' + pts.join('L'), stroke: c, class: 'line', 'stroke-dasharray': s.dashed ? '5 4' : '' }, f.svg);
      /* direct label at the line's end when there are few series */
      if (d.series.length > 1 && d.series.length <= 4) {
        var t = el('text', { x: f.x1 + 6, y: y(s.values[n - 1]) + 4, class: 'axis-label' }, f.svg);
        t.textContent = s.name;
      }
    });
    if (d.series.length > 1) { f.svg.setAttribute('viewBox', '0 0 ' + (f.W + 70) + ' ' + f.H); f.svg.setAttribute('width', f.W + 70); }
    (d.annotations || []).forEach(function (a) {
      var x = cx(a.at), v = d.series[0].values[a.at];
      el('line', { x1: x, x2: x, y1: f.y1, y2: f.y0, class: 'annot-line' }, f.svg);
      el('circle', { cx: x, cy: y(v), r: 4.5, fill: d.series[0].color || COLORS[0], class: 'dot' }, f.svg);
      var t = el('text', { x: x + 8, y: f.y1 + 10, class: 'annot' }, f.svg);
      t.textContent = a.text;
    });
    xLabels(f, d.labels, cx, d.labelEvery);
    var tip = tooltip(fig);
    var cross = el('line', { y1: f.y1, y2: f.y0, stroke: 'var(--ink-3)', 'stroke-width': 1, opacity: 0 }, f.svg);
    var dots = d.series.map(function (s, j) { return el('circle', { r: 4.5, fill: s.color || COLORS[j], class: 'dot', opacity: 0 }, f.svg); });
    var hit = el('rect', { x: f.x0, y: f.y1, width: f.x1 - f.x0, height: f.y0 - f.y1, fill: 'transparent' }, f.svg);
    hit.addEventListener('mousemove', function (e) {
      var r = f.svg.getBoundingClientRect(), k = r.width / parseFloat(f.svg.getAttribute('viewBox').split(' ')[2]);
      var px = (e.clientX - r.left) / k, i = Math.max(0, Math.min(n - 1, Math.round((px - cx(0)) / (cx(1) - cx(0)))));
      cross.setAttribute('x1', cx(i)); cross.setAttribute('x2', cx(i)); cross.setAttribute('opacity', .5);
      dots.forEach(function (dt, j) { dt.setAttribute('cx', cx(i)); dt.setAttribute('cy', y(d.series[j].values[i])); dt.setAttribute('opacity', 1); });
      var fr = fig.getBoundingClientRect();
      tip.show('<div class="chart-tip__t">' + d.labels[i] + '</div>' + tipRows(d.series.map(function (s, j) { return { n: s.name, v: fmt(s.values[i], d), c: s.color || COLORS[j] }; })),
        cx(i) * k + r.left - fr.left, Math.min.apply(null, d.series.map(function (s) { return y(s.values[i]); })) * k + r.top - fr.top);
    });
    hit.addEventListener('mouseleave', function () { tip.hide(); cross.setAttribute('opacity', 0); dots.forEach(function (dt) { dt.setAttribute('opacity', 0); }); });
    legend(fig, d.series, 'line');
    table(fig, d);
  }

  /* ---------- Horizontal 100% stacked bars ---------- */
  function stack(fig, d) {
    var rowH = 26, gapR = 18, labW = 130, W = 640;
    var H = d.labels.length * (rowH + gapR) + 6;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: 'chart', role: 'img', 'aria-label': d.title || '' });
    fig.appendChild(svg);
    var tip = tooltip(fig);
    d.labels.forEach(function (lab, i) {
      var tot = d.series.reduce(function (a, s) { return a + s.values[i]; }, 0);
      var y0 = i * (rowH + gapR) + 3, x = labW;
      var t = el('text', { x: 0, y: y0 + rowH / 2 + 4, class: 'axis-label' }, svg); t.textContent = lab;
      d.series.forEach(function (s, j) {
        var w = (W - labW) * s.values[i] / tot, c = s.color || COLORS[j];
        var segW = Math.max(0, w - 2);
        var r = el('rect', { x: x, y: y0, width: segW, height: rowH, rx: j === 0 || j === d.series.length - 1 ? 3 : 0, fill: c, class: 'bar' }, svg);
        if (segW > 42) {
          /* ochre (slot 5) is too light for white text */
          var ink = j === 4 ? '#1C1A15' : '#fff';
          var lt = el('text', { x: x + 8, y: y0 + rowH / 2 + 4, style: 'fill:' + ink + ';font-weight:500' }, svg);
          lt.textContent = Math.round(s.values[i] / tot * 100) + '%';
        }
        r.addEventListener('mousemove', function () {
          var sr = svg.getBoundingClientRect(), k = sr.width / W, fr = fig.getBoundingClientRect();
          tip.show('<div class="chart-tip__t">' + lab + '</div>' + tipRows([{ n: s.name, v: fmt(s.values[i], d) + ' · ' + Math.round(s.values[i] / tot * 100) + '%', c: c }]),
            (+r.getAttribute('x') + segW / 2) * k + sr.left - fr.left, y0 * k + sr.top - fr.top);
        });
        r.addEventListener('mouseleave', tip.hide);
        x += w;
      });
    });
    legend(fig, d.series, 'bar');
    table(fig, d);
  }

  /* ---------- Waterfall: start, steps, end ---------- */
  function waterfall(fig, d) {
    var f = frame(fig, d, d.height || 280);
    var run = 0, bars = d.steps.map(function (s) {
      if (s.total) { var b = { from: 0, to: s.value, s: s }; run = s.value; return b; }
      var b2 = { from: run, to: run + s.value, s: s }; run += s.value; return b2;
    });
    var all = [].concat.apply([], bars.map(function (b) { return [b.from, b.to]; }));
    var y = yAxis(f, d, Math.min(0, Math.min.apply(null, all)), Math.max.apply(null, all));
    var n = bars.length, slot = (f.x1 - f.x0) / n, bw = Math.min(slot * 0.62, 44);
    var cx = function (i) { return f.x0 + slot * i + slot / 2; };
    var tip = tooltip(fig);
    bars.forEach(function (b, i) {
      var c = b.s.total ? 'var(--ink-2)' : b.s.value >= 0 ? 'var(--d1)' : 'var(--d3)';
      var top = Math.min(y(b.from), y(b.to)), h = Math.max(1, Math.abs(y(b.from) - y(b.to)));
      var r = el('rect', { x: cx(i) - bw / 2, y: top, width: bw, height: h, rx: 2, fill: c, class: 'bar' }, f.svg);
      if (i < n - 1) el('line', { x1: cx(i) + bw / 2, x2: cx(i + 1) - bw / 2, y1: y(b.to), y2: y(b.to), stroke: 'var(--rule-ink)', 'stroke-dasharray': '2 2' }, f.svg);
      var vt = el('text', { x: cx(i), y: top - 6, 'text-anchor': 'middle', class: 'annot' }, f.svg);
      vt.textContent = b.s.total ? fmt(b.s.value, Object.assign({}, d, { compact: true })) : (b.s.value >= 0 ? '+' : '') + fmt(b.s.value, Object.assign({}, d, { compact: true }));
      r.addEventListener('mousemove', function () {
        var sr = f.svg.getBoundingClientRect(), k = sr.width / f.W, fr = fig.getBoundingClientRect();
        tip.show('<div class="chart-tip__t">' + b.s.label + '</div>' + tipRows([{ n: b.s.total ? 'Total' : b.s.value >= 0 ? 'Increase' : 'Decrease', v: fmt(b.s.value, d), c: c }]), cx(i) * k + sr.left - fr.left, top * k + sr.top - fr.top);
      });
      r.addEventListener('mouseleave', tip.hide);
    });
    xLabels(f, d.steps.map(function (s) { return s.label; }), cx);
    var l = document.createElement('div'); l.className = 'legend';
    l.innerHTML = '<span><i style="--c:var(--ink-2)"></i>Total</span><span><i style="--c:var(--d1)"></i>Increase</span><span><i style="--c:var(--d3)"></i>Decrease</span>';
    fig.insertBefore(l, f.svg);
    table(fig, { labels: d.steps.map(function (s) { return s.label; }), series: [{ name: d.valueName || 'Value', values: d.steps.map(function (s) { return s.value; }) }], prefix: d.prefix, unit: d.unit });
  }

  var R = { bar: bar, line: line, stack: stack, waterfall: waterfall };
  document.querySelectorAll('[data-chart]').forEach(function (fig) {
    var src = fig.querySelector('script[type="application/json"]');
    if (!src) return;
    var d = JSON.parse(src.textContent);
    R[fig.getAttribute('data-chart')](fig, d);
  });
})();
