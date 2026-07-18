# Maneja tu catálogo desde Google Sheets 🧵

Con esto controlas precios, stock, tallas y prendas nuevas **sin tocar código**.
Editas una hoja y la web se actualiza sola al recargar.

---

## Configuración (solo una vez)

1. **Sube la plantilla a Google Sheets**
   Abre Google Drive → **Nuevo → Subir archivo** → sube
   `Frima - Catalogo (subir a Google Sheets).xlsx`.
   Haz clic derecho sobre él → **Abrir con → Hojas de cálculo de Google**.

2. **Publica la hoja como CSV**
   Dentro de la hoja: **Archivo → Compartir → Publicar en la web**.
   - En "Vínculo", elige la pestaña **Catálogo**.
   - Cambia el formato de *Página web* a **Valores separados por comas (.csv)**.
   - Clic en **Publicar** y copia el enlace que aparece
     (se ve como `https://docs.google.com/spreadsheets/d/e/….../pub?...output=csv`).

3. **Pega el enlace en la web**
   Abre `index.html`, busca `catalogoCSV: ""` y pega el enlace entre las comillas:
   `catalogoCSV: "https://docs.google.com/…output=csv"`.
   Vuelve a subir `index.html` a Netlify. ¡Listo! Desde ahora solo editas la hoja.

---

## Uso diario

**Agregar una prenda nueva**
1. Nueva fila al final, con un **ID** nuevo (el siguiente número).
2. Llena **Producto**, **Categoria** y **Precio**.
3. En **Foto** escribe el nombre del archivo (ej. `p41.jpg`) y sube esa foto a la
   carpeta `fotos/catalogo` de tu web. *(O pega un link de imagen que empiece con `http`.)*
4. En las columnas de talla escribe el stock.

**Manejar stock y tallas** (columnas S, M, L, XL, 26, 28, 30, 32)
- Celda **vacía** = esa prenda no viene en esa talla.
- Un **número** (ej. `3`) = tienes 3 unidades → se muestra disponible.
- **0** = esa talla aparece **tachada** ("no disponible").
- Si **todas** las tallas están en 0 → la prenda se marca **"Agotado"** sola.
- Para reponer: cambia el número.

**Destacar una prenda**: escribe `SI` en la columna **Destacado** (sale en "Lo más querido").

---

## Notas
- Los cambios en la hoja aparecen al **recargar** la web (puede tardar unos minutos por el caché de Google).
- Las **fotos** nuevas sí se suben una vez a `fotos/catalogo` (es el único paso fuera de la hoja).
- Si dejas `catalogoCSV` vacío, la web usa el catálogo interno que ya tiene cargado.
- Mientras no publiques la hoja, todo sigue funcionando con el catálogo actual.
