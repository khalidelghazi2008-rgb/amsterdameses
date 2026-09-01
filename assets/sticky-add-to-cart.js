/**
 * sticky-add-to-cart.js
 * ------------------------------------------------------------------------
 * Barra de "Añadir al carrito" fija en la parte inferior de la pantalla.
 * Aparece cuando el botón real de compra deja de estar visible al hacer
 * scroll hacia abajo, y desaparece de nuevo al llegar al final de la ficha
 * de producto (para no quedarse flotando sobre el footer).
 *
 * El botón de esta barra NO añade el producto al carrito por sí mismo:
 * simplemente pulsa el botón de compra real, así se respeta siempre la
 * variante y la cantidad que el cliente ya tenga seleccionadas, sin
 * duplicar la lógica de carrito de Dawn.
 */
class StickyAddToCart extends HTMLElement {
  connectedCallback() {
    this.submitButton = document.getElementById(this.dataset.submitId);
    this.priceSource = document.getElementById(this.dataset.priceId);
    this.observeTarget = document.getElementById(this.dataset.observeId) || this.submitButton;
    this.priceDisplay = this.querySelector('[data-sticky-price]');
    this.ownButton = this.querySelector('[data-sticky-submit]');

    if (this.ownButton && this.submitButton) {
      this.ownButton.addEventListener('click', () => {
        this.submitButton.click();
      });
    }

    this.syncPrice();
    if (this.priceSource) {
      this.priceObserver = new MutationObserver(() => this.syncPrice());
      this.priceObserver.observe(this.priceSource, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // Aparece cuando el botón de compra real deja de verse por arriba;
    // desaparece cuando se llega al final de toda la ficha de producto.
    if (this.submitButton) {
      this.buttonObserver = new IntersectionObserver(
        (entries) => this.handleButtonVisibility(entries),
        { threshold: 0 }
      );
      this.buttonObserver.observe(this.submitButton);
    }

    if (this.observeTarget) {
      this.sectionObserver = new IntersectionObserver(
        (entries) => this.handleSectionVisibility(entries),
        { threshold: 0, rootMargin: '0px 0px -10% 0px' }
      );
      this.sectionObserver.observe(this.observeTarget);
    }
  }

  disconnectedCallback() {
    this.priceObserver?.disconnect();
    this.buttonObserver?.disconnect();
    this.sectionObserver?.disconnect();
  }

  syncPrice() {
    if (this.priceSource && this.priceDisplay) {
      this.priceDisplay.innerHTML = this.priceSource.innerHTML;
    }
  }

  handleButtonVisibility(entries) {
    const entry = entries[0];
    if (!entry) return;
    // Solo se considera "pasado" cuando ha quedado por encima del viewport,
    // no cuando todavía no se ha llegado a él (carga inicial de la página).
    this.buttonScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    this.updateVisibility();
  }

  handleSectionVisibility(entries) {
    const entry = entries[0];
    if (!entry) return;
    // Si toda la ficha de producto ha quedado por encima del viewport,
    // dejamos de mostrar la barra (evita solaparse con el footer).
    this.pastProductSection = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
    this.updateVisibility();
  }

  updateVisibility() {
    const shouldShow = Boolean(this.buttonScrolledPast) && !this.pastProductSection;
    this.classList.toggle('is-visible', shouldShow);
  }
}

if (!customElements.get('sticky-add-to-cart')) {
  customElements.define('sticky-add-to-cart', StickyAddToCart);
}
