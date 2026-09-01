/**
 * announcement-bar-fade.js
 * ------------------------------------------------------------------------
 * Web component vanilla (sin dependencias externas) que hace rotar
 * automáticamente los mensajes de la barra de anuncios usando una
 * transición de fundido (fade), en lugar del slider horizontal por
 * defecto de Dawn.
 *
 * Lee la velocidad de rotación (en segundos) del atributo
 * "data-speed" del propio elemento, que a su vez viene del ajuste
 * "change_slides_speed" configurado en el editor de temas.
 *
 * Accesibilidad:
 * - Se pausa la rotación al pasar el ratón o al recibir el foco
 *   (teclado / lectores de pantalla), y se reanuda al salir.
 * - Solo un mensaje es visible/enfocable a la vez (el resto queda con
 *   aria-hidden="true" para que no interfiera con la navegación por teclado).
 */
class AnnouncementBarFade extends HTMLElement {
  constructor() {
    super();
    this.slides = Array.from(this.querySelectorAll('.announcement-bar-fade__slide'));
    this.currentIndex = this.slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (this.currentIndex === -1) this.currentIndex = 0;
    this.timer = null;

    // Velocidad de rotación en milisegundos (por defecto 4 segundos)
    const speedInSeconds = parseFloat(this.dataset.speed) || 4;
    this.speed = speedInSeconds * 1000;

    // Ajuste "Rotar automáticamente" del editor de temas. Si el
    // comercio lo desactiva, se muestra solo el primer mensaje.
    this.autoplayEnabled = this.dataset.autoplay !== 'false';
  }

  connectedCallback() {
    if (this.slides.length < 2 || !this.autoplayEnabled) {
      this.updateAriaHidden();
      return;
    }

    this.updateAriaHidden();
    this.play();

    // Pausar la rotación automática al interactuar (accesibilidad: el
    // usuario debe poder "parar" contenido en movimiento, WCAG 2.2.2)
    this.addEventListener('mouseenter', () => this.pause());
    this.addEventListener('mouseleave', () => this.play());
    this.addEventListener('focusin', () => this.pause());
    this.addEventListener('focusout', () => this.play());

    // Pausar cuando la pestaña no está visible, para no seguir
    // acumulando cambios de mensaje en segundo plano
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.play();
      }
    });
  }

  disconnectedCallback() {
    this.pause();
  }

  play() {
    if (this.slides.length < 2 || !this.autoplayEnabled || document.hidden) return;
    this.pause();
    this.timer = setInterval(() => this.next(), this.speed);
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  goToSlide(index) {
    const current = this.slides[this.currentIndex];
    const next = this.slides[index];
    if (!next || next === current) return;

    current.classList.remove('is-active');
    next.classList.add('is-active');
    this.currentIndex = index;
    this.updateAriaHidden();
  }

  updateAriaHidden() {
    this.slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index === this.currentIndex ? 'false' : 'true');
    });
  }
}

customElements.define('announcement-bar-fade', AnnouncementBarFade);
