# Mejoras aplicadas a la web de Frima ✨

Revisión completa como rediseño de e-commerce (julio 2026). Todo está en `index.html` — solo vuelve a subir la carpeta a Netlify.

## Diseño
- **Hero nuevo con foto real**: texto a la izquierda, foto de marca a la derecha con marco elegante (`fotos/frima-hero.jpg`, recortada de tu foto de Instagram sin los íconos).
- **Sección "Nosotros" con foto** (`fotos/frima-nosotros.jpg`) y firma "Emily · Fundadora" — genera confianza y cercanía.
- **Sello de confianza** bajo el botón principal: envíos, Yape/tarjeta, WhatsApp.
- **Barra superior rotativa**: alterna 4 mensajes (envío gratis, pago seguro, tiempos de envío, cambios).

## Móvil (donde compra la mayoría)
- **Menú hamburguesa nuevo**: antes los enlaces (Tienda, Tallas, Envíos, Nosotros) desaparecían en celular sin alternativa. Ahora hay un panel lateral con todo + WhatsApp.
- El fondo ya no se desplaza cuando hay un panel o modal abierto.

## Conversión (para vender más)
- **Talla única se selecciona sola**: si una prenda solo tiene una talla disponible, ya viene marcada — un toque menos para comprar.
- **Aviso de pocas unidades**: "¡Última unidad!" / "Últimas 2-3 unidades" cuando la hoja de Google trae stock bajo (urgencia real, no inventada).
- **Agotados al final** del catálogo (antes se mezclaban con lo disponible).
- Carrito vacío ahora tiene botón "Ver colección".
- El checkout muestra cuántos artículos llevas.
- Mensajes al volver de Mercado Pago ahora son un modal bonito (antes era un alert() feo del navegador).

## SEO y compartir por WhatsApp/redes
- **Favicon** con la F de Frima (antes no había).
- **og:image corregida**: antes era una ruta relativa y al compartir el link en WhatsApp/Facebook NO salía imagen. Ahora sí.
- Etiquetas Twitter card, og:url y datos de negocio actualizados.

## Rendimiento
- QR de Yape optimizado: 237 KB → 112 KB (idéntico a la vista, escanea igual).
- El QR solo se carga cuando se abre el modal de pago.
- Foto del hero con precarga (`preload` + `fetchpriority`) para que aparezca al instante.

## Accesibilidad y robustez
- Chips de talla ahora son botones reales (funcionan con teclado y lector de pantalla).
- Etiquetas `aria` en modales, carrito, menú y buscador; foco visible al navegar con teclado.
- Tecla Escape cierra todo (también el chat y el menú).
- Nombres de producto escapados en el HTML (un nombre con comillas en la hoja de Google ya no rompe la página).
- Se quitó la referencia a `p21b.jpg` (foto que no existe).
- Respeta la preferencia "reducir movimiento" del sistema.

## Archivos
- `fotos/frima-hero.jpg` y `fotos/frima-nosotros.jpg` — nuevas (recortes limpios).
- `respaldo-fotos-originales.zip` — respaldo de tus fotos originales. Puedes borrarlo si quieres, o guardarlo fuera de la carpeta antes de subir a Netlify.
- Las funciones de pago de Netlify **no se tocaron** (ya estaban bien hechas).

## Verificado
- Sintaxis JavaScript ✓ · Todas las imágenes existen ✓ · Sin errores en consola ✓
- Probado en resolución de escritorio (1366px) y móvil (390px): hero, catálogo, vista rápida, carrito, checkout y menú móvil ✓
