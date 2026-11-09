(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(el._timer);
    el._timer = setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 1800);
  }

  ready(function () {
    if (window.DeepSeekCharts) window.DeepSeekCharts.renderAll();

    // banner close
    var banner = document.getElementById('topBanner');
    var close = document.getElementById('bannerClose');
    if (close) close.addEventListener('click', function () {
      banner.style.display = 'none';
      document.querySelector('.sidebar').style.top = '0px';
      document.querySelector('.app').style.minHeight = '100vh';
    });

    // sidebar nav
    document.querySelectorAll('.nav-item[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var nav = btn.getAttribute('data-nav');
        if (['usage', 'keys', 'topup', 'billing'].indexOf(nav) >= 0) {
          document.querySelectorAll('.side-nav:not(.bottom) .nav-item').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        }
        if (nav !== 'usage') toast('演示页面：' + btn.textContent.trim());
      });
    });

    // cost grouping toggle
    var group = document.getElementById('costGroup');
    if (group) {
      group.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          group.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          if (window.DeepSeekCharts) window.DeepSeekCharts.setCostMode(b.getAttribute('data-group'));
        });
      });
    }

    // top-up
    var topup = document.getElementById('topupBtn');
    if (topup) topup.addEventListener('click', function () { toast('演示页面：充值功能未接入'); });

    // export summary CSV
    var exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', function () {
      var rows = [
        ['时间维度', '近 30 天'],
        ['API Key', '全部'],
        ['消费金额', '¥18.51 CNY'],
        ['API 请求次数', '954'],
        ['Tokens', '119,848,955'],
        ['充值余额', '¥3.86 CNY'],
        ['累计消费金额', '¥48.13 CNY']
      ];
      var csv = '\uFEFF' + rows.map(function (r) { return r.join(','); }).join('\n');
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'deepseek-usage.csv';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
      toast('已导出用量数据');
    });

    // filter pills (visual only)
    document.querySelectorAll('.filter-pill').forEach(function (p) {
      p.addEventListener('click', function () { toast('演示页面：筛选菜单未接入'); });
    });

    // mobile drawer
    var hamburger = document.querySelector('.hamburger');
    var sidebar = document.getElementById('sidebar');
    if (hamburger && sidebar) {
      hamburger.addEventListener('click', function () {
        var open = sidebar.classList.toggle('mobile-open');
        var ov = document.querySelector('.drawer-overlay');
        if (open && !ov) {
          ov = document.createElement('button');
          ov.className = 'drawer-overlay';
          ov.setAttribute('aria-label', '关闭菜单');
          document.body.appendChild(ov);
          ov.addEventListener('click', function () {
            sidebar.classList.remove('mobile-open');
            ov.remove();
          });
        } else if (!open && ov) ov.remove();
      });
    }

    // keyboard focus styles for pills
    document.querySelectorAll('.filter-pill').forEach(function (p) {
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); }
      });
    });
  });
})();
