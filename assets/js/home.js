(function () {
  'use strict';

  function toast(msg) {
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;bottom:42px;transform:translateX(-50%) translateY(16px);background:rgba(30,32,36,.94);color:#f4f6f8;padding:10px 18px;border-radius:10px;font:13px/20px "DM Sans","PingFang SC","Microsoft YaHei",sans-serif;z-index:9999;opacity:0;transition:all .22s ease;box-shadow:0 10px 30px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);pointer-events:none;white-space:nowrap';
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(16px)';
      setTimeout(function () { el.remove(); }, 260);
    }, 1800);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // QR popover for download app
    var qrTrigger = document.querySelector('.ds-qr-trigger');
    if (qrTrigger) {
      var menu = qrTrigger.querySelector('.ds-qr-menu');
      if (menu) {
        menu.style.display = 'none';
        menu.style.opacity = '0';
        menu.style.transition = 'opacity .18s ease, transform .18s ease';
        menu.style.transform = 'translateY(-4px)';
        qrTrigger.addEventListener('mouseenter', function () {
          menu.style.display = 'block';
          requestAnimationFrame(function () {
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
          });
        });
        qrTrigger.addEventListener('mouseleave', function () {
          menu.style.opacity = '0';
          menu.style.transform = 'translateY(-4px)';
          setTimeout(function () { menu.style.display = 'none'; }, 180);
        });
      }
    }

    // prompt send
    var send = document.querySelector('.ds-hero-send-btn');
    var input = document.querySelector('.hero-input');
    function submitPrompt() {
      var value = input && input.value.trim();
      if (!value) { if (input) input.focus(); return; }
      toast('演示页面：已收到「' + (value.length > 18 ? value.slice(0, 18) + '…' : value) + '」');
      input.value = '';
      input.style.height = '';
    }
    if (send) send.addEventListener('click', submitPrompt);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitPrompt(); }
      });
      input.addEventListener('input', function () {
        input.style.height = 'auto';
        input.style.height = Math.min(200, input.scrollHeight) + 'px';
      });
    }

    // language toggle visual
    document.querySelectorAll('.ds-locale-toggle').forEach(function (t) {
      t.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          t.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-active'); });
          b.classList.add('is-active');
          if (b.textContent.trim() === 'EN') toast('演示页面：英文版暂未包含');
        });
      });
    });

    // mobile menu placeholder
    document.querySelectorAll('button.md\\:hidden').forEach(function (b) {
      b.addEventListener('click', function () { toast('演示页面：菜单'); });
    });
  });
})();
