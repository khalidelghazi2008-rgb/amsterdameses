/* ==========================================================================
   VANGUARD THEME — theme.js
   Vanilla JS. No frameworks, no jQuery. Progressive enhancement over
   server-rendered Liquid markup + Shopify AJAX API (/cart/add.js, etc).
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------------- */
  /* Utilities                                                               */
  /* ---------------------------------------------------------------------- */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function fetchConfig(type = 'json') {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: `application/${type}` }
    };
  }

  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    const value = (cents / 100).toFixed(2).replace('.', ',');
    return (format || window.themeSettings?.moneyFormat || '{{amount}}€').replace(/\{\{\s*amount\s*\}\}/, value);
  }

  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let trappedContainer = null;
  function trapFocus(container, initialFocus) {
    trappedContainer = container;
    const focusable = qsa(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    (initialFocus || first).focus();

    function handleKeydown(evt) {
      if (evt.key !== 'Tab') return;
      if (evt.shiftKey && document.activeElement === first) {
        evt.preventDefault();
        last.focus();
      } else if (!evt.shiftKey && document.activeElement === last) {
        evt.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', handleKeydown);
    container._trapHandler = handleKeydown;
  }
  function removeTrapFocus(container) {
    if (container && container._trapHandler) {
      container.removeEventListener('keydown', container._trapHandler);
    }
    trappedContainer = null;
  }

  /* ---------------------------------------------------------------------- */
  /* Drawers (mobile menu / cart / search) — generic open/close             */
  /* ---------------------------------------------------------------------- */
  function openDrawer(drawer, opener) {
    if (!drawer) return;
    const overlay = qs(`[data-drawer-overlay="${drawer.id}"]`) || qs('.drawer-overlay');
    drawer.classList.add('is-open');
    drawer.removeAttribute('hidden');
    if (overlay) overlay.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    drawer.setAttribute('aria-hidden', 'false');
    if (opener) drawer._opener = opener;
    trapFocus(drawer);
  }

  function closeDrawer(drawer) {
    if (!drawer) return;
    const overlay = qs(`[data-drawer-overlay="${drawer.id}"]`) || qs('.drawer-overlay');
    drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    drawer.setAttribute('aria-hidden', 'true');
    removeTrapFocus(drawer);
    if (drawer._opener) drawer._opener.focus();
    setTimeout(() => {
      if (!drawer.classList.contains('is-open')) drawer.setAttribute('hidden', '');
    }, 300);
  }

  document.addEventListener('click', (evt) => {
    const opener = evt.target.closest('[data-drawer-open]');
    if (opener) {
      evt.preventDefault();
      const drawer = document.getElementById(opener.getAttribute('data-drawer-open'));
      openDrawer(drawer, opener);
      return;
    }
    const closer = evt.target.closest('[data-drawer-close]');
    if (closer) {
      evt.preventDefault();
      closeDrawer(closer.closest('.drawer'));
      return;
    }
    if (evt.target.classList && evt.target.classList.contains('drawer-overlay')) {
      qsa('.drawer.is-open').forEach(closeDrawer);
    }
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      qsa('.drawer.is-open').forEach(closeDrawer);
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Header: sticky + shrink on scroll                                      */
  /* ---------------------------------------------------------------------- */
  const headerWrapper = qs('.header-wrapper');
  if (headerWrapper && headerWrapper.classList.contains('is-sticky')) {
    let lastScroll = 0;
    window.addEventListener(
      'scroll',
      debounce(() => {
        const current = window.scrollY;
        headerWrapper.classList.toggle('is-scrolled', current > 8);
        lastScroll = current;
      }, 50),
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Announcement bar: dismiss + rotate multiple slides                     */
  /* ---------------------------------------------------------------------- */
  const announcementBar = qs('.announcement-bar');
  if (announcementBar) {
    const closeBtn = qs('.announcement-bar__close', announcementBar);
    const storageKey = 'vanguard:announcement-closed';
    if (closeBtn) {
      if (sessionStorage.getItem(storageKey) === '1') announcementBar.setAttribute('hidden', '');
      closeBtn.addEventListener('click', () => {
        announcementBar.setAttribute('hidden', '');
        sessionStorage.setItem(storageKey, '1');
      });
    }
    const slides = qsa('.announcement-bar__slide', announcementBar);
    if (slides.length > 1) {
      let index = 0;
      slides.forEach((s, i) => { s.style.display = i === 0 ? '' : 'none'; });
      setInterval(() => {
        slides[index].style.display = 'none';
        index = (index + 1) % slides.length;
        slides[index].style.display = '';
      }, 4500);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Mobile nav accordion (submenus inside drawer)                          */
  /* ---------------------------------------------------------------------- */
  document.addEventListener('click', (evt) => {
    const toggle = evt.target.closest('[data-mobile-nav-toggle]');
    if (!toggle) return;
    evt.preventDefault();
    const item = toggle.closest('.mobile-nav__item');
    item.classList.toggle('is-open');
  });

  /* ---------------------------------------------------------------------- */
  /* Cart: state, rendering, AJAX add/update/remove                         */
  /* ---------------------------------------------------------------------- */
  const CartAPI = {
    async getState() {
      const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      return res.json();
    },
    async add(items) {
      const res = await fetch('/cart/add.js', {
        ...fetchConfig(),
        body: JSON.stringify({ items })
      });
      return res.json();
    },
    async change(line, quantity) {
      const res = await fetch('/cart/change.js', {
        ...fetchConfig(),
        body: JSON.stringify({ line, quantity })
      });
      return res.json();
    }
  };

  function updateCartCount(count) {
    qsa('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.classList.toggle('is-empty', count === 0);
      el.hidden = count === 0;
    });
  }

  async function refreshCartDrawer() {
    // The cart-drawer snippet is rendered on every page from live cart state,
    // so re-fetching the current URL and lifting its #CartDrawer-content is
    // enough to sync the drawer without a dedicated section-rendering endpoint.
    const drawer = qs('#CartDrawer');
    if (drawer) {
      try {
        const res = await fetch(window.location.pathname + window.location.search, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newContent = qs('#CartDrawer-content', doc);
        const oldContent = qs('#CartDrawer-content', drawer);
        if (newContent && oldContent) oldContent.innerHTML = newContent.innerHTML;
      } catch (err) {
        /* silently keep old drawer content on network error */
      }
    }
    const state = await CartAPI.getState();
    updateCartCount(state.item_count);
    updateFreeShippingBars(state);
  }

  function updateFreeShippingBars(cart) {
    qsa('[data-free-shipping-bar]').forEach((bar) => {
      const threshold = parseInt(bar.getAttribute('data-threshold'), 10) || 0;
      if (!threshold) return;
      const remaining = Math.max(threshold - cart.total_price, 0);
      const pct = Math.min((cart.total_price / threshold) * 100, 100);
      const fill = qs('.free-shipping-bar__fill', bar);
      const text = qs('.free-shipping-bar__text', bar);
      if (fill) fill.style.width = `${pct}%`;
      if (text) {
        text.textContent = remaining === 0
          ? text.getAttribute('data-reached-text')
          : (text.getAttribute('data-remaining-template') || '').replace('{{ amount }}', formatMoney(remaining));
      }
    });
  }

  // Add to cart (product form + quick add forms), delegated
  document.addEventListener('submit', async (evt) => {
    const form = evt.target.closest('form[data-type="add-to-cart-form"]');
    if (!form) return;
    evt.preventDefault();
    const submitBtn = qs('[type="submit"]', form);
    const errorEl = qs('[data-form-error]', form);
    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('is-loading'); }
    if (errorEl) errorEl.textContent = '';

    const formData = new FormData(form);
    const body = { items: [{ id: formData.get('id'), quantity: parseInt(formData.get('quantity') || '1', 10) }] };
    // support product properties[] / selling_plan if present
    const properties = {};
    formData.forEach((value, key) => {
      if (key.startsWith('properties[')) {
        properties[key.slice(11, -1)] = value;
      }
    });
    if (Object.keys(properties).length) body.items[0].properties = properties;

    try {
      const result = await CartAPI.add(body.items);
      if (result.status) {
        if (errorEl) errorEl.textContent = result.description || result.message;
        else alert(result.description || result.message);
      } else {
        await refreshCartDrawer();
        const cartType = document.body.getAttribute('data-cart-type') || 'drawer';
        if (cartType === 'drawer') {
          const drawer = qs('#CartDrawer');
          const opener = qs('[data-drawer-open="CartDrawer"]');
          openDrawer(drawer, opener);
        } else {
          window.location.href = window.themeRoutes?.cart_url || '/cart';
        }
      }
    } catch (err) {
      if (errorEl) errorEl.textContent = window.themeStrings?.cartError || 'An error occurred, please try again.';
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('is-loading'); }
    }
  });

  // Cart line quantity change / remove, delegated (drawer + page)
  document.addEventListener('click', async (evt) => {
    const btn = evt.target.closest('[data-cart-qty-change]');
    if (btn) {
      evt.preventDefault();
      const line = parseInt(btn.getAttribute('data-line'), 10);
      const input = qs(`[data-cart-qty-input][data-line="${line}"]`);
      let qty = parseInt(input.value, 10) || 1;
      qty += btn.getAttribute('data-cart-qty-change') === 'increase' ? 1 : -1;
      qty = Math.max(qty, 0);
      input.value = qty;
      await CartAPI.change(line, qty);
      await refreshCartDrawer();
      if (qs('[data-cart-page]')) window.location.reload();
      return;
    }
    const removeBtn = evt.target.closest('[data-cart-remove]');
    if (removeBtn) {
      evt.preventDefault();
      const line = parseInt(removeBtn.getAttribute('data-line'), 10);
      await CartAPI.change(line, 0);
      await refreshCartDrawer();
      if (qs('[data-cart-page]')) window.location.reload();
    }
  });

  document.addEventListener(
    'change',
    debounce(async (evt) => {
      const input = evt.target.closest('[data-cart-qty-input]');
      if (!input) return;
      const line = parseInt(input.getAttribute('data-line'), 10);
      const qty = Math.max(parseInt(input.value, 10) || 0, 0);
      await CartAPI.change(line, qty);
      await refreshCartDrawer();
      if (qs('[data-cart-page]')) window.location.reload();
    }, 400),
    true
  );

  // init count + free shipping bar on load
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const state = await CartAPI.getState();
      updateFreeShippingBars(state);
    } catch (e) { /* noop */ }
  });

  /* ---------------------------------------------------------------------- */
  /* Quick add from product card                                            */
  /* ---------------------------------------------------------------------- */
  document.addEventListener('click', async (evt) => {
    const btn = evt.target.closest('[data-quick-add]');
    if (!btn) return;
    evt.preventDefault();
    const variantId = btn.getAttribute('data-quick-add-variant-id');
    const productUrl = btn.getAttribute('data-quick-add-url');
    if (!variantId) {
      window.location.href = productUrl;
      return;
    }
    btn.disabled = true;
    btn.classList.add('is-loading');
    try {
      const result = await CartAPI.add([{ id: variantId, quantity: 1 }]);
      if (result.status) {
        window.location.href = productUrl;
        return;
      }
      await refreshCartDrawer();
      openDrawer(qs('#CartDrawer'), btn);
    } catch (err) {
      window.location.href = productUrl;
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Quantity selector (product page / cart)                                */
  /* ---------------------------------------------------------------------- */
  document.addEventListener('click', (evt) => {
    const btn = evt.target.closest('.quantity-selector__btn');
    if (!btn) return;
    const wrapper = btn.closest('.quantity-selector');
    const input = qs('input', wrapper);
    let value = parseInt(input.value, 10) || 1;
    const min = parseInt(input.min, 10) || 1;
    if (btn.dataset.action === 'increase') value += 1;
    if (btn.dataset.action === 'decrease') value = Math.max(min, value - 1);
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------------------------------------------------------------------- */
  /* Variant picker: sync price / availability / image / URL                */
  /* ---------------------------------------------------------------------- */
  class VariantPicker {
    constructor(root) {
      this.root = root;
      this.productId = root.dataset.productId;
      this.data = JSON.parse(qs(`#ProductJSON-${this.productId}`).textContent);
      this.form = qs('form[data-type="add-to-cart-form"]', root.closest('.product') || document);
      root.addEventListener('change', this.onChange.bind(this));
      this.onChange();
    }

    getSelectedOptions() {
      return qsa('input:checked, select', this.root).map((el) => el.value);
    }

    getVariant(options) {
      return this.data.variants.find((v) => v.options.every((opt, i) => opt === options[i]));
    }

    onChange() {
      const options = this.getSelectedOptions();
      const variant = this.getVariant(options);
      qsa('.variant-picker__group', this.root).forEach((group) => {
        const valueLabel = qs('.variant-picker__value', group);
        const checked = qs('input:checked', group);
        if (valueLabel && checked) valueLabel.textContent = checked.value;
      });
      this.updateAvailability(options);
      if (!variant) {
        this.setUnavailable();
        return;
      }
      this.updatePrice(variant);
      this.updateAddToCart(variant);
      this.updateImage(variant);
      this.updateSku(variant);
      this.updateURL(variant);
    }

    updateAvailability(selectedOptions) {
      // disable option pills that would result in no matching variant
      qsa('input[type="radio"], input[type="checkbox"]', this.root).forEach((input) => {
        const testOptions = [...selectedOptions];
        const group = input.closest('.variant-picker__group');
        const groupIndex = parseInt(group.dataset.optionIndex, 10);
        testOptions[groupIndex] = input.value;
        const match = this.getVariant(testOptions);
        input.disabled = !match;
      });
    }

    updatePrice(variant) {
      const priceWrap = qs('[data-product-price]');
      if (!priceWrap) return;
      const regular = qs('.price__regular .money', priceWrap);
      const sale = qs('.price__sale .money', priceWrap);
      priceWrap.classList.toggle('price--on-sale', variant.compare_at_price > variant.price);
      if (regular) regular.textContent = formatMoney(variant.compare_at_price > variant.price ? variant.compare_at_price : variant.price);
      if (sale) sale.textContent = formatMoney(variant.price);
      const discount = qs('[data-discount-percent]');
      if (discount) {
        if (variant.compare_at_price > variant.price) {
          const pct = Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100);
          discount.textContent = `-${pct}%`;
          discount.hidden = false;
        } else {
          discount.hidden = true;
        }
      }
    }

    updateAddToCart(variant) {
      const idInput = qs('input[name="id"]', this.form);
      const submitBtn = qs('[type="submit"]', this.form);
      const availability = qs('[data-product-availability]');
      if (idInput) idInput.value = variant.id;
      if (submitBtn) {
        submitBtn.disabled = !variant.available;
        submitBtn.querySelector('[data-btn-text]').textContent = variant.available
          ? submitBtn.getAttribute('data-add-text')
          : submitBtn.getAttribute('data-soldout-text');
      }
      if (availability) {
        availability.classList.toggle('product__availability--out', !variant.available);
        qs('[data-availability-text]', availability).textContent = variant.available
          ? availability.getAttribute('data-in-stock-text')
          : availability.getAttribute('data-out-stock-text');
      }
    }

    updateImage(variant) {
      if (!variant.featured_image) return;
      const main = qs('.product__gallery-main img');
      if (main) main.src = variant.featured_image.src.replace(/(\.[a-z]{3,4})(\?.*)?$/i, '_800x$1');
      const thumb = qs(`.product__gallery-thumb[data-media-id="${variant.featured_media_id}"]`);
      if (thumb) thumb.click();
    }

    updateSku(variant) {
      const sku = qs('[data-product-sku]');
      if (sku) sku.textContent = variant.sku || '';
    }

    updateURL(variant) {
      if (!this.root.dataset.updateUrl) return;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }

    setUnavailable() {
      const submitBtn = qs('[type="submit"]', this.form);
      if (submitBtn) submitBtn.disabled = true;
    }
  }

  qsa('[data-variant-picker]').forEach((el) => new VariantPicker(el));

  /* ---------------------------------------------------------------------- */
  /* Product gallery thumbnails                                             */
  /* ---------------------------------------------------------------------- */
  document.addEventListener('click', (evt) => {
    const thumb = evt.target.closest('.product__gallery-thumb');
    if (!thumb) return;
    evt.preventDefault();
    const gallery = thumb.closest('.product__gallery');
    const main = qs('.product__gallery-main img', gallery);
    const fullSrc = thumb.getAttribute('data-full-src');
    if (main && fullSrc) main.src = fullSrc;
    qsa('.product__gallery-thumb', gallery).forEach((t) => t.classList.remove('is-active'));
    thumb.classList.add('is-active');
  });

  /* ---------------------------------------------------------------------- */
  /* Sticky add-to-cart (mobile)                                            */
  /* ---------------------------------------------------------------------- */
  const stickyAtc = qs('.sticky-atc');
  const atcAnchor = qs('[data-atc-anchor]');
  if (stickyAtc && atcAnchor && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyAtc.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(atcAnchor);
    stickyAtc.addEventListener('click', (evt) => {
      if (evt.target.closest('[data-sticky-add]')) {
        evt.preventDefault();
        const mainForm = qs('form[data-type="add-to-cart-form"]');
        if (mainForm) mainForm.requestSubmit();
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Predictive search                                                      */
  /* ---------------------------------------------------------------------- */
  const searchInput = qs('[data-predictive-search-input]');
  if (searchInput) {
    const resultsEl = qs('[data-predictive-search-results]');
    const emptyEl = qs('[data-predictive-search-empty]');
    const idleEl = qs('[data-predictive-search-idle]');

    const runSearch = debounce(async (term) => {
      if (!term) {
        resultsEl.innerHTML = '';
        resultsEl.hidden = true;
        emptyEl.hidden = true;
        idleEl.hidden = false;
        return;
      }
      idleEl.hidden = true;
      try {
        const res = await fetch(
          `/search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product,collection,page,article&resources[limit]=6&resources[options][unavailable_products]=last`
        );
        const data = await res.json();
        renderResults(data.resources.results, term);
      } catch (err) {
        resultsEl.hidden = true;
      }
    }, 300);

    function renderResults(results, term) {
      const groups = [
        { key: 'products', label: window.themeStrings?.searchProducts || 'Products' },
        { key: 'collections', label: window.themeStrings?.searchCollections || 'Collections' },
        { key: 'pages', label: window.themeStrings?.searchPages || 'Pages' },
        { key: 'articles', label: window.themeStrings?.searchArticles || 'Articles' }
      ];
      const hasResults = groups.some((g) => results[g.key] && results[g.key].length);
      emptyEl.hidden = hasResults;
      resultsEl.hidden = !hasResults;
      if (!hasResults) {
        const termEl = qs('[data-search-term]', emptyEl);
        const template = window.themeStrings?.noResultsTemplate || 'No results for "__TERM__"';
        if (termEl) termEl.textContent = template.replace('__TERM__', term);
        return;
      }
      resultsEl.innerHTML = groups
        .filter((g) => results[g.key] && results[g.key].length)
        .map((g) => {
          const items = results[g.key]
            .map((item) => {
              const image = item.featured_image ? item.featured_image.url : item.image || '';
              return `<a class="predictive-search__item" href="${item.url}">
                ${image ? `<img src="${image}" alt="" width="48" height="60" loading="lazy">` : ''}
                <span class="predictive-search__item-title">${item.title}</span>
              </a>`;
            })
            .join('');
          return `<div class="predictive-search__group">
            <p class="predictive-search__group-title">${g.label}</p>
            ${items}
          </div>`;
        })
        .join('');
    }

    searchInput.addEventListener('input', (evt) => runSearch(evt.target.value.trim()));
  }

  /* ---------------------------------------------------------------------- */
  /* Newsletter inline confirmation                                         */
  /* ---------------------------------------------------------------------- */
  qsa('[data-newsletter-form]').forEach((form) => {
    if (window.location.search.includes('customer_posted=true') && form.contains(document.activeElement) === false) {
      const success = qs('[data-newsletter-success]', form.closest('.newsletter') || form.parentElement);
      if (success) success.hidden = false;
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Reveal-on-scroll (subtle entrance animation, respects reduced motion)  */
  /* ---------------------------------------------------------------------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    qsa('[data-animate]').forEach((el) => revealObserver.observe(el));
  }
})();
