/**
 * wishlist.js
 * ------------------------------------------------------------------------
 * Sistema de wishlist ("favoritos") 100% en el cliente, sin apps ni
 * metafields de cliente: se guarda en localStorage del navegador.
 *
 * Piezas:
 * 1) AmstershopWishlist: almacén con la lista de handles de producto
 *    guardados. Emite el evento "wishlist:updated" en `document` cada vez
 *    que cambia, con el detalle { handles, count }, para que cualquier
 *    parte de la tienda (contador del header, corazones de las tarjetas,
 *    página de wishlist) se mantenga sincronizada al instante.
 * 2) <wishlist-button>: botón de corazón reutilizable. Se coloca en las
 *    tarjetas de producto y en la ficha de producto con:
 *      <wishlist-button data-product-handle="{{ product.handle }}">
 * 3) Actualización automática del contador del header (#wishlist-icon-bubble).
 */
(function () {
  const STORAGE_KEY = 'amstershop:wishlist';

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
      // localStorage no disponible (modo privado, cuota superada, etc.):
      // la wishlist simplemente no persistirá en este caso.
    }
  }

  function notify(handles) {
    document.dispatchEvent(
      new CustomEvent('wishlist:updated', {
        detail: { handles, count: handles.length },
      })
    );
  }

  const AmstershopWishlist = {
    getAll() {
      return readHandles();
    },
    has(handle) {
      return readHandles().includes(handle);
    },
    add(handle) {
      const handles = readHandles();
      if (!handles.includes(handle)) {
        handles.push(handle);
        writeHandles(handles);
        notify(handles);
      }
      return handles;
    },
    remove(handle) {
      const handles = readHandles().filter((item) => item !== handle);
      writeHandles(handles);
      notify(handles);
      return handles;
    },
    toggle(handle) {
      return this.has(handle) ? this.remove(handle) : this.add(handle);
    },
  };

  window.AmstershopWishlist = AmstershopWishlist;

  /**
   * Botón de corazón para añadir/quitar un producto de la wishlist.
   * Uso: <wishlist-button data-product-handle="air-force-1"><button>...</button></wishlist-button>
   */
  class WishlistButton extends HTMLElement {
    connectedCallback() {
      this.handle = this.dataset.productHandle;
      this.button = this.querySelector('button') || this;
      this.updateState();

      this.onClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        AmstershopWishlist.toggle(this.handle);
      };
      this.addEventListener('click', this.onClick);

      this.onWishlistUpdated = () => this.updateState();
      document.addEventListener('wishlist:updated', this.onWishlistUpdated);
    }

    disconnectedCallback() {
      document.removeEventListener('wishlist:updated', this.onWishlistUpdated);
    }

    updateState() {
      const active = AmstershopWishlist.has(this.handle);
      this.classList.toggle('is-active', active);
      if (this.button) {
        this.button.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
    }
  }

  if (!customElements.get('wishlist-button')) {
    customElements.define('wishlist-button', WishlistButton);
  }

  /**
   * Contador de la wishlist en el icono del header (#wishlist-icon-bubble).
   */
  function updateHeaderBubble() {
    const bubble = document.querySelector('#wishlist-icon-bubble .wishlist-count-bubble');
    if (!bubble) return;
    const count = AmstershopWishlist.getAll().length;
    const countLabel = bubble.querySelector('[aria-hidden="true"]');
    if (countLabel) countLabel.textContent = count;
    bubble.hidden = count === 0;
  }

  document.addEventListener('wishlist:updated', updateHeaderBubble);
  document.addEventListener('DOMContentLoaded', updateHeaderBubble);
  // Por si el script carga después del DOMContentLoaded (defer + secciones dinámicas)
  if (document.readyState !== 'loading') updateHeaderBubble();
})();
