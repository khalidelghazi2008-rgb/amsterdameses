/**
 * recently-viewed.js
 * ------------------------------------------------------------------------
 * "Vistos recientemente": guarda en localStorage los últimos productos que
 * el visitante ha abierto (sin cuentas de cliente ni apps) y pinta la
 * sección "recently-viewed" reutilizando el mismo renderer de tarjetas que
 * la Wishlist (assets/amstershop-client-cards.js).
 *
 * Dos partes independientes en este mismo archivo:
 * 1) AmstershopRecentlyViewed.track(handle): se llama desde la ficha de
 *    producto (snippets/recently-viewed-tracker.liquid) para registrar el
 *    producto que se está viendo.
 * 2) El render de la sección: lee la lista (excluyendo el producto actual)
 *    y pinta las tarjetas, u oculta la sección si no hay nada que mostrar.
 */
(function () {
  const STORAGE_KEY = 'amstershop:recently-viewed';
  const MAX_ITEMS = 12;

  function readHandles() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeHandles(handles) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
    } catch (error) {
      // localStorage no disponible: no persiste, pero no rompe la página.
    }
  }

  const AmstershopRecentlyViewed = {
    getAll() {
      return readHandles();
    },
    track(handle) {
      if (!handle) return;
      let handles = readHandles().filter((item) => item !== handle);
      handles.unshift(handle);
      handles = handles.slice(0, MAX_ITEMS);
      writeHandles(handles);
    },
  };

  window.AmstershopRecentlyViewed = AmstershopRecentlyViewed;

  function initSection() {
    const root = document.querySelector('[data-amstershop-recently-viewed]');
    if (!root) return;

    const grid = root.querySelector('.amstershop-js-card-grid');
    const currentHandle = root.dataset.currentProductHandle || '';
    const maxProducts = parseInt(root.dataset.maxProducts, 10) || 4;

    const handles = AmstershopRecentlyViewed.getAll()
      .filter((handle) => handle !== currentHandle)
      .slice(0, maxProducts);

    if (handles.length === 0) {
      root.hidden = true;
      return;
    }

    Promise.all(
      handles.map((handle) =>
        fetch(`/products/${handle}.js`)
          .then((response) => (response.ok ? response.json() : null))
          .catch(() => null)
      )
    ).then((products) => {
      const validProducts = products.filter(Boolean);
      if (validProducts.length === 0) {
        root.hidden = true;
        return;
      }
      validProducts.forEach((product) => {
        grid.appendChild(window.AmstershopProductCard.render(product));
      });
      root.hidden = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSection);
  } else {
    initSection();
  }
})();
