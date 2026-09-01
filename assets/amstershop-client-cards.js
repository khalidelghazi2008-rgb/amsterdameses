/**
 * amstershop-client-cards.js
 * ------------------------------------------------------------------------
 * Utilidades compartidas para las funciones que se renderizan en el
 * cliente a partir de datos obtenidos por fetch (no por Liquid), como la
 * página de Wishlist y la sección "Vistos recientemente":
 *
 * 1) AmstershopMoney.format(cents): formatea un precio en céntimos usando
 *    el formato de moneda real de la tienda (window.AmstershopMoneyFormat,
 *    definido en layout/theme.liquid a partir de shop.money_format).
 * 2) AmstershopProductCard.render(product): crea el nodo DOM de una
 *    tarjeta de producto compacta (imagen, título, precio, wishlist)
 *    a partir del JSON público de un producto (`/products/{handle}.js`).
 *
 * Sin dependencias externas: JS vanilla.
 */
(function () {
  // Mismo icono que assets/icon-heart.svg, incrustado aquí porque las
  // tarjetas de este módulo se generan en el cliente (no via Liquid) y no
  // pueden usar el filtro inline_asset_content.
  const HEART_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-heart" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5.24 8.515 3.773a4.433 4.433 0 0 0-6.21 0 4.293 4.293 0 0 0 0 6.128L10 17.495l7.695-7.593a4.293 4.293 0 0 0 0-6.128 4.433 4.433 0 0 0-6.21 0zm.765-2.177c2.113-2.084 5.538-2.084 7.65 0a5.29 5.29 0 0 1 0 7.55l-7.695 7.593a1.03 1.03 0 0 1-1.44 0l-7.696-7.594a5.29 5.29 0 0 1 0-7.549C3.697.98 7.122.98 9.234 3.063l.766.755z"/></svg>';

  const AmstershopMoney = {
    format(cents) {
      const format = window.AmstershopMoneyFormat || '${{amount}}';
      const amount = (cents / 100).toFixed(2);
      const amountNoDecimals = Math.round(cents / 100).toString();
      const parts = amount.split('.');
      const amountWithComma = `${parts[0]},${parts[1]}`;
      const amountNoDecimalsWithComma = parts[0];

      return format
        .replace(/\{\{\s*amount\s*\}\}/, amount)
        .replace(/\{\{\s*amount_no_decimals\s*\}\}/, amountNoDecimals)
        .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, amountWithComma)
        .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, amountNoDecimalsWithComma);
    },
  };

  /**
   * Crea la tarjeta compacta de un producto a partir de su JSON público.
   * `product` es la respuesta de `/products/{handle}.js`.
   */
  function render(product) {
    const article = document.createElement('article');
    article.className = 'amstershop-js-card';

    const price = product.price;
    const compareAtPrice = product.compare_at_price;
    const onSale = compareAtPrice && compareAtPrice > price;
    const image = product.featured_image || (product.images && product.images[0]) || null;

    article.innerHTML = `
      <a href="${product.url}" class="amstershop-js-card__media-link" aria-hidden="true" tabindex="-1">
        ${
          image
            ? `<img
                class="amstershop-js-card__image"
                src="${image}"
                width="600"
                height="600"
                loading="lazy"
                alt="${(product.featured_image_alt || product.title || '').replace(/"/g, '&quot;')}"
              >`
            : ''
        }
        ${onSale ? '<span class="amstershop-js-card__badge">%</span>' : ''}
      </a>
      <div class="amstershop-js-card__content">
        <h3 class="amstershop-js-card__title">
          <a href="${product.url}">${product.title}</a>
        </h3>
        <div class="amstershop-js-card__price">
          <span class="amstershop-js-card__price-current">${AmstershopMoney.format(price)}</span>
          ${
            onSale
              ? `<span class="amstershop-js-card__price-compare">${AmstershopMoney.format(compareAtPrice)}</span>`
              : ''
          }
        </div>
      </div>
      <wishlist-button
        class="amstershop-js-card__wishlist is-active"
        data-product-handle="${product.handle}"
      >
        <button type="button" class="amstershop-js-card__wishlist-button" aria-pressed="true">
          <span class="svg-wrapper">${HEART_ICON_SVG}</span>
        </button>
      </wishlist-button>
    `;

    return article;
  }

  window.AmstershopMoney = AmstershopMoney;
  window.AmstershopProductCard = { render };
})();
