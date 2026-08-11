document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  var header = document.querySelector('header.site');
  
  if (toggle && nav && header) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      header.classList.toggle('menu-open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { 
        nav.classList.remove('open'); 
        header.classList.remove('menu-open');
      });
    });
  }
  
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ---------- Gallery lightbox ----------
  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery-grid button'));
  if (galleryButtons.length) {
    var lightbox = document.querySelector('.lightbox');
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCount = lightbox.querySelector('.lightbox-count');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var current = 0;

    function show(index) {
      current = (index + galleryButtons.length) % galleryButtons.length;
      var btn = galleryButtons[current];
      lightboxImg.src = btn.getAttribute('data-full');
      lightboxImg.alt = btn.getAttribute('data-alt') || '';
      lightboxCount.textContent = (current + 1) + ' / ' + galleryButtons.length;
    }

    function open(index) {
      show(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    galleryButtons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // ---------- Pre-check requested package(s) from URL ----------
  var packageChecks = document.getElementById('package-checks');
  if (packageChecks) {
    var params = new URLSearchParams(window.location.search);
    var requested = params.getAll('package').flatMap(function (v) {
      return v.split(',');
    }).map(function (v) { return v.trim().toLowerCase(); });

    if (requested.length) {
      packageChecks.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
        if (requested.indexOf(box.value.trim().toLowerCase()) !== -1) {
          box.checked = true;
        }
      });
    }
  }

  // ---------- Open Now indicator ----------
  var hoursStatus = document.getElementById('hours-status');
  if (hoursStatus) {
    var dot = hoursStatus.querySelector('.status-dot');
    var text = document.getElementById('hours-status-text');
    var now = new Date();
    var hour = now.getHours() + now.getMinutes() / 60;
    var isOpen = hour >= 10 && hour < 18;
    dot.classList.add(isOpen ? 'is-open' : 'is-closed');
    text.textContent = isOpen ? 'Open Now' : 'Closed Now';
  }

  // ---------- Hero video toggle ----------
  var videoToggle = document.querySelector('.hero-video-toggle');
  var heroVideo = document.querySelector('.hero-video--main');
  var iconPause = document.querySelector('.icon-pause');
  var iconPlay = document.querySelector('.icon-play');
  
  if (videoToggle && heroVideo) {
    videoToggle.addEventListener('click', function () {
      if (heroVideo.paused) {
        heroVideo.play();
        iconPause.style.display = 'block';
        iconPlay.style.display = 'none';
        videoToggle.setAttribute('aria-label', 'Pause video');
      } else {
        heroVideo.pause();
        iconPause.style.display = 'none';
        iconPlay.style.display = 'block';
        videoToggle.setAttribute('aria-label', 'Play video');
      }
    });
  }

  // ---------- Menu estimator / receipt ----------
  (function () {
    function parsePrice(text) {
      if (!text) return 0;
      var m = text.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)/);
      return m ? parseFloat(m[1]) : 0;
    }

    function formatCurrency(n) { return '$' + n.toFixed(2); }

    // Do NOT persist the on-page estimate across refreshes. Start with an empty cart.
    var cart = {};

    function saveCart() { renderReceipt(); }

    function createEstimatorControls(itemEl) {
      var nameEl = itemEl.querySelector('h3');
      if (!nameEl) return;
      var name = nameEl.textContent.trim();
      var priceTextEl = itemEl.querySelector('.price');
      var price = priceTextEl ? parsePrice(priceTextEl.textContent) : 0;
      // prefer explicit data-price attributes when present
      var dp = itemEl.dataset.price ? parseFloat(itemEl.dataset.price) : null;
      var priceSmall = itemEl.dataset.priceSmall ? parseFloat(itemEl.dataset.priceSmall) : null;
      var priceLarge = itemEl.dataset.priceLarge ? parseFloat(itemEl.dataset.priceLarge) : null;
      if (dp) price = dp;
      // parse a minimum people count from price text, like "minimum 35 people"
      var min = 0;
      if (priceTextEl && priceTextEl.textContent) {
        var mm = priceTextEl.textContent.match(/minimum\s*(?:of\s*)?(?:[:\-\s]*)?(\d+)/i) || priceTextEl.textContent.match(/min(?:imum)?\s*(?:[:\-\s]*)?(\d+)/i);
        if (mm) min = parseInt(mm[1], 10) || 0;
      }
      itemEl.dataset.name = name;
      itemEl.dataset.price = price;
      var imgSrc = '';
      var imgEl = itemEl.querySelector('img');
      if (imgEl) imgSrc = imgEl.src;
      itemEl.dataset.min = min;

      var controls = document.createElement('div');
      controls.className = 'estimator-controls';
      // build size selector if needed
      var sizeHTML = '';
      if (priceSmall && priceLarge) {
        sizeHTML = '<label class="estimator-size-label">Size <select class="estimator-size"><option value="small">Small ($' + priceSmall + ')</option><option value="large">Large ($' + priceLarge + ')</option></select></label>';
      }
      // include stepper buttons
      controls.innerHTML = sizeHTML + '<div class="qty-wrap"><button class="qty-btn qty-decrease" type="button">−</button>' +
                           '<label class="estimator-label">Qty <input type="number" min="0" value="0" class="menu-qty" aria-label="Quantity for '+name+'"></label>' +
                           '<button class="qty-btn qty-increase" type="button">+</button></div>' +
                           '<div class="estimator-price" aria-hidden="true">' + formatCurrency(price) + '</div>' +
                           '<div class="estimator-error" role="alert" aria-live="assertive"></div>';
      var body = itemEl.querySelector('.menu-item-body');
      // append controls at the bottom of the package body (better for min errors)
      if (body) body.appendChild(controls);

      var input = controls.querySelector('.menu-qty');
      var err = controls.querySelector('.estimator-error');
      var priceDisplay = controls.querySelector('.estimator-price');
      // ensure numeric step and allow zero to clear
      input.setAttribute('min', '0');
      input.setAttribute('step', '1');
      // preload quantity if present in cart, and enforce minimum if saved qty is below min
      var selectedSize = (priceSmall && priceLarge) ? 'small' : null;
      var sizeSelect = controls.querySelector('.estimator-size');
      if (sizeSelect) {
        sizeSelect.value = selectedSize;
      }
      if (cart[name]) {
        var saved = parseInt(cart[name].qty, 10) || 0;
        if (saved > 0 && min > 0 && saved < min) saved = min;
        input.value = saved;
        if (cart[name].size) selectedSize = cart[name].size;
        cart[name].qty = saved;
      } else {
        input.value = 0;
      }

      // auto-update cart when qty changes; show error if below minimum
      function currentPriceForSelection() {
        if (sizeSelect) {
          return (sizeSelect.value === 'large') ? priceLarge : priceSmall;
        }
        return price;
      }

      input.addEventListener('input', function (e) {
        var v = parseInt(e.target.value, 10) || 0;
        if (v > 0 && min > 0 && v < min) {
          if (err) { err.textContent = 'MINIMUM VALUE ' + min; err.classList.add('visible'); }
          delete cart[name];
        } else {
          if (err) { err.textContent = ''; err.classList.remove('visible'); }
          if (v === 0) delete cart[name]; else {
            cart[name] = { name: name, price: currentPriceForSelection(), qty: v, img: imgSrc };
            if (sizeSelect) cart[name].size = sizeSelect.value;
          }
        }
        saveCart();
      });

      if (sizeSelect) {
        sizeSelect.addEventListener('change', function () {
          // update displayed unit price
          if (priceDisplay) priceDisplay.textContent = formatCurrency(currentPriceForSelection());
          // when size changes update stored price if qty > 0
          var v = parseInt(input.value, 10) || 0;
          if (v > 0) {
            cart[name] = { name: name, price: currentPriceForSelection(), qty: v, size: sizeSelect.value, img: imgSrc };
            saveCart();
          }
        });
      }

      // stepper handlers
      var dec = controls.querySelector('.qty-decrease');
      var inc = controls.querySelector('.qty-increase');
      // add accessible labels and keyboard support
      dec.setAttribute('aria-label', 'Decrease quantity for ' + name);
      inc.setAttribute('aria-label', 'Increase quantity for ' + name);
      dec.addEventListener('click', function () {
        var val = parseInt(input.value, 10) || 0; val = Math.max(0, val - 1); input.value = val; input.dispatchEvent(new Event('input'));
      });
      inc.addEventListener('click', function () {
        var val = parseInt(input.value, 10) || 0; val = val + 1; input.value = val; input.dispatchEvent(new Event('input'));
      });
      // keyboard handling on the numeric input
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); inc.click(); }
        if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); dec.click(); }
      });
      // update price display on init
      if (priceDisplay) priceDisplay.textContent = formatCurrency(currentPriceForSelection());
    }

    function generateReceiptText() {
      var lines = [];
      var total = 0;
      Object.keys(cart).forEach(function (k) {
        var it = cart[k];
        var lineTotal = (it.price || 0) * it.qty;
        total += lineTotal;
        lines.push(it.qty + ' x ' + it.name + ' @ ' + formatCurrency(it.price || 0) + ' = ' + formatCurrency(lineTotal));
      });
      lines.push('Total: ' + formatCurrency(total));
      lines.push('Phone: (224) 436-2509');
      return lines.join('\n');
    }

    function renderReceipt() {
      var panel = document.querySelector('.receipt-panel');
      if (!panel) {
        panel = document.createElement('aside');
          panel.className = 'receipt-panel';
          panel.innerHTML = '<div class="receipt-header"><h4>Your Estimate</h4><div class="receipt-header-tools">' +
            '<button class="receipt-close" aria-label="Close">×</button></div></div>' +
            '<div class="receipt-body"></div>' +
            '<div class="receipt-footer"><div class="receipt-total">Total: <strong class="receipt-total-value">$0.00</strong></div>' +
            '<div class="receipt-disclaimer">*** THIS IS JUST AN ESTIMATE ***<br>Taxes &amp; fees are estimates — call (224) 436-2509 for a more accurate estimate.</div>' +
            '<div class="receipt-actions"><button class="btn btn--white receipt-clear" type="button">Clear</button>' +
            '<a class="btn btn--ink receipt-request" href="receipt.html">View Receipt</a></div></div>';
        document.body.appendChild(panel);

        // create a top-right cart toggle button if needed
        var cartToggle = document.querySelector('.receipt-cart-toggle');
        if (!cartToggle) {
          cartToggle = document.createElement('button');
          cartToggle.className = 'receipt-cart-toggle';
          cartToggle.type = 'button';
          cartToggle.setAttribute('aria-label', 'Toggle estimate cart');
          cartToggle.setAttribute('aria-pressed', 'false');
          cartToggle.innerHTML = '<svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12l1 3H5l1-3zm0 5h14v14H5V7zm3 2a3 3 0 0 1 6 0v1h-2V9a1 1 0 0 0-2 0v1H9V9z"/></svg><span class="receipt-badge" aria-hidden="true">0</span>';
          document.body.appendChild(cartToggle);
          cartToggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            cartToggle.setAttribute('aria-pressed', open ? 'true' : 'false');
          });
        }

        // header tools: close
        var closeBtn = panel.querySelector('.receipt-close');
        closeBtn.addEventListener('click', function () { panel.classList.toggle('open'); });

        panel.querySelector('.receipt-clear').addEventListener('click', function () { cart = {}; saveCart(); });
        panel.querySelector('.receipt-request').addEventListener('click', function (e) {
          try { localStorage.setItem('qc_last_cart', JSON.stringify(cart || {})); } catch (er) {}
          window.open('receipt.html', '_blank');
          e.preventDefault();
        });
        var clearBtn = panel.querySelector('.receipt-clear');
        var reqBtn = panel.querySelector('.receipt-request');
        if (clearBtn) clearBtn.setAttribute('role','button');
        if (reqBtn) reqBtn.setAttribute('role','button');
      }

      var body = panel.querySelector('.receipt-body');
      body.innerHTML = '';
      var total = 0;
      Object.keys(cart).forEach(function (k) {
        var it = cart[k];
        var lineTotal = (it.price || 0) * it.qty;
        total += lineTotal;
        var row = document.createElement('div');
        row.className = 'receipt-row';
        row.innerHTML = '<div class="receipt-row-name">' + it.name + '</div>' +
                        '<div class="receipt-row-qty"><input type="number" min="1" value="' + it.qty + '" data-name="' + it.name + '"></div>' +
                        '<div class="receipt-row-price">' + formatCurrency(lineTotal) + '</div>' +
                        '<button class="receipt-row-remove" data-name="' + it.name + '" aria-label="Remove">×</button>';
        body.appendChild(row);
        row.querySelector('input').addEventListener('change', function (e) {
          var n = parseInt(e.target.value, 10) || 1;
          cart[it.name].qty = n;
          saveCart();
        });
        row.querySelector('.receipt-row-remove').addEventListener('click', function () {
          delete cart[it.name];
          saveCart();
        });
      });
      var totalEl = panel.querySelector('.receipt-total-value');
      if (totalEl) totalEl.textContent = formatCurrency(total || 0);
      // update cart badge (sum of quantities)
      var uniqueCount = Object.keys(cart).filter(function (n) { return (parseInt(cart[n].qty,10) || 0) > 0; }).length;
      var badge = panel.querySelector('.receipt-badge');
      if (badge) {
        badge.textContent = uniqueCount || '';
        badge.style.display = uniqueCount ? 'inline-block' : 'none';
      }
      var cartToggle = document.querySelector('.receipt-cart-toggle');
      if (cartToggle) {
        var toggleBadge = cartToggle.querySelector('.receipt-badge');
        if (toggleBadge) {
          toggleBadge.textContent = uniqueCount || '';
          toggleBadge.style.display = uniqueCount ? 'inline-block' : 'none';
        }
        cartToggle.style.display = uniqueCount ? 'inline-flex' : 'none';
      }
      // open panel when there are items
      if (Object.keys(cart).length) panel.classList.add('open'); else panel.classList.remove('open');
    }

    // Inject controls for each menu item
      var menuItems = Array.prototype.slice.call(document.querySelectorAll('.menu-item'));
    var hasMenu = menuItems.length > 0;
    if (hasMenu) {
      menuItems.forEach(function (mi) { createEstimatorControls(mi); });
      // Initial render only on menu page
      renderReceipt();
    }
  })();
});
