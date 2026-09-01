/**
 * wishlist-page.js
 * ------------------------------------------------------------------------
 * Pinta el contenido de la sección "main-wishlist" (templates/page.wishlist.json)
 * a partir de los handles guardados en localStorage (assets/wishlist.js).
 * Cada producto se obtiene con un fetch público a /products/{handle}.js
 * (Shopify no permite consultar varios productos por ID desde Liquid con
 * datos que solo existen en el navegador).
 */
(function () {
  function init() {
    const root = document.querySelector('[data-amstershop-wishlist-page]');
    if (!root) return;

    const grid = root.querySelector('.amstershop-js-card-grid');
    const emptyState = root.querySelector('.amstershop-empty-state');
    const loading = root.querySelector('[data-wishlist-loading]');

    async function renderWishlist() {
      const handles = window.AmstershopWishlist.getAll();

      if (handles.length === 0) {
        grid.hidden = true;
        emptyState.hidden = false;
        if (loading) loading.hidden = true;
        return;
      }

      emptyState.hidden = true;
      if (loading) loading.hidden = false;

      const products = await Promise.all(
        handles.map((handle) =>
          fetch(`/products/${handle}.js`)
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null)
        )
      );

      grid.innerHTML = '';
      const validProducts = products.filter(Boolean);

      if (validProducts.length === 0) {
        grid.hidden = true;
        emptyState.hidden = false;
      } else {
        validProducts.forEach((product) => {
          grid.appendChild(window.AmstershopProductCard.render(product));
        });
        grid.hidden = false;
      }

      if (loading) loading.hidden = true;
    }

    document.addEventListener('wishlist:updated', renderWishlist);
    renderWishlist();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
