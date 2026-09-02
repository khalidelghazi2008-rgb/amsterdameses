/**
 * parallax-showcase.js
 * ------------------------------------------------------------------------
 * Anima la sección "Parallax Showcase" con GSAP + ScrollTrigger:
 * - Cada panel de imagen ([data-media]) pasa de tarjeta pequeña y
 *   redondeada a pantalla completa animando clip-path (barato para el
 *   navegador, sin reflow ni necesidad de "pin").
 * - Las capas [data-parallax] (número gigante y rayas diagonales) se
 *   mueven a distinta velocidad que su panel, dando profundidad.
 * - El texto de cada ficha (.drop__copy) se revela una vez, al entrar en
 *   pantalla.
 *
 * Nunca deja contenido invisible si algo falla: el estado de reposo en
 * CSS ya es una tarjeta legible, y aquí solo se ocultan los textos justo
 * antes de animarlos (con GSAP), nunca por CSS puro — así una carga
 * fallida de GSAP, un bloqueador de scripts o prefers-reduced-motion
 * simplemente dejan la sección estática y perfectamente legible.
 *
 * Este script se incluye una vez por cada instancia de la sección en la
 * página, así que si hay más de una, el archivo se ejecuta varias veces:
 * el atributo "data-parallax-initialized" evita procesar dos veces la
 * misma sección (y por tanto, duplicar sus animaciones de ScrollTrigger).
 */
(function () {
  function init() {
    var sections = document.querySelectorAll('.parallax-showcase:not([data-parallax-initialized])');
    if (!sections.length) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    sections.forEach(function (section) {
      section.setAttribute('data-parallax-initialized', 'true');

      gsap.utils.toArray(section.querySelectorAll('[data-media]')).forEach(function (media) {
        gsap.fromTo(
          media,
          { clipPath: 'inset(11% 14% round 1.75rem)' },
          {
            clipPath: 'inset(0% 0% round 0rem)',
            ease: 'none',
            scrollTrigger: {
              trigger: media,
              start: 'top 88%',
              end: 'top 15%',
              scrub: 0.6,
            },
          }
        );
      });

      gsap.utils.toArray(section.querySelectorAll('[data-parallax]')).forEach(function (layer) {
        var speed = parseFloat(layer.dataset.parallaxSpeed) || 0.3;
        gsap.to(layer, {
          yPercent: -100 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: layer.closest('.drop__media-stage'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });

      gsap.utils.toArray(section.querySelectorAll('.drop__copy')).forEach(function (copy) {
        gsap.set(copy, { opacity: 0, y: '1.25rem' });
        gsap.to(copy, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: copy,
            start: 'top 82%',
          },
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
