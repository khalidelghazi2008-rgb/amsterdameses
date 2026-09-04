# Vanguard — Tema Shopify de moda urbana

Tema Shopify **Online Store 2.0** construido desde cero en Liquid para una
tienda de moda/streetwear. Arquitectura limpia basada en secciones y
snippets reutilizables, 100% editable desde el Theme Editor, sin
dependencias externas, mobile-first y optimizado para conversión y
rendimiento.

> Inspirado en la lógica de navegación y merchandising de un ecommerce de
> moda (header con mega menú, colecciones visuales, PDP orientada a
> conversión, cart drawer, filtros nativos...), con un sistema de diseño,
> copy, código y branding propios.

## Stack

- Shopify Online Store 2.0 (JSON templates, secciones y bloques)
- Liquid + HTML5 semántico
- CSS con custom properties (design tokens desde `settings_schema.json`)
- JavaScript vanilla (sin jQuery, sin frameworks)
- Sin dependencias externas

## Estructura

```
layout/theme.liquid            Layout principal, SEO, JSON-LD, design tokens

templates/                     Plantillas JSON (OS 2.0)
  index.json  product.json  collection.json  cart.json  search.json
  page.json  404.json  customers/account.json  customers/login.json

sections/                      Todas las secciones son 100% configurables
  announcement-bar · header · hero · featured-collections
  featured-products · new-arrivals · bestseller-products · image-text
  value-propositions · faq · newsletter · footer
  main-product · main-collection · main-cart · main-search
  main-page · main-404 · main-account · main-login

snippets/                      Piezas reutilizables
  product-card · price · sale-badge · product-form · icon
  responsive-image · breadcrumbs · cart-drawer · quantity-selector
  variant-picker · facets

assets/
  theme.css   Design system + estilos de todos los componentes
  theme.js    Cart AJAX, drawers, variant picker, quick add, búsqueda...

config/settings_schema.json    Colores, tipografía, layout, header, cart...
locales/                       es.json (por defecto) + en.default.json
```

## Personalización desde el Theme Editor

Todo el contenido visible (textos, imágenes, colecciones, productos,
colores, tipografía, espaciados, radios de borde...) se edita desde
**Tienda online → Personalizar**. No hay contenido de la home ni de las
secciones hardcodeado en el código: cada sección tiene su propio
`{% schema %}` con settings y bloques.

La navegación (incluido el mega menú) se gestiona 100% desde
**Tienda online → Navegación**: el header no tiene categorías fijas en el
código, lee el menú que asignes en la sección "Cabecera".

## Desarrollo local

```bash
shopify theme dev --store tu-tienda.myshopify.com
```

## Funcionalidad incluida

- Header sticky con mega menú (2 niveles + destacado visual configurable)
- Drawer de menú móvil, carrito y búsqueda (búsqueda predictiva AJAX)
- Cart drawer + página de carrito, actualización AJAX de cantidades
- Barra de progreso de envío gratis configurable
- Product cards con imagen hover, badges (SALE/NEW/SOLD OUT/Más vendido),
  swatches de color y quick add
- PDP con galería, selector de variantes reactivo (precio/disponibilidad/
  imagen sin recargar), acordeones editables, sticky add-to-cart en móvil
  y recomendaciones de producto
- Colección con filtros nativos de Shopify (Search & Discovery), orden,
  paginación y estado vacío
- FAQ, propuestas de valor y newsletter totalmente editables por bloques
- SEO: title/meta dinámicos, canonical, Open Graph, Twitter Cards,
  JSON-LD (Organization, Product, BreadcrumbList)
- Accesibilidad: skip link, focus trap en drawers, cierre con ESC,
  aria-labels, navegación por teclado
- Rendimiento: imágenes responsive con `srcset`/`sizes`, lazy loading,
  `width`/`height` explícitos, CSS/JS propios sin librerías pesadas

## Licencia

Ver [LICENSE.md](/LICENSE.md).
