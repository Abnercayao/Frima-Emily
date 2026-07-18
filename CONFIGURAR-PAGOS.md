# Cómo activar el pago con Yape + Tarjetas (Mercado Pago)

Tu web ya tiene TODO el código listo. Solo falta conectar tu cuenta de Mercado Pago.
Sigue estos pasos una sola vez.

---

## 1. Crea tu cuenta de Mercado Pago
- Entra a **https://www.mercadopago.com.pe** y crea una cuenta (gratis).
- Completa la **verificación de identidad** (te la pedirán para poder cobrar y retirar dinero a tu banco).

## 2. Obtén tu clave secreta (Access Token)
- Ve al panel de desarrolladores: **https://www.mercadopago.com.pe/developers/panel**
- Entra a **"Tus integraciones"** → crea una aplicación (ponle "Frima").
- En **Credenciales de producción**, copia el **Access Token** (empieza con `APP_USR-...`).

> ⚠️ NUNCA pegues ese token dentro del código ni del HTML. Solo va en Netlify (paso 3).

## 3. Pega el token en Netlify (de forma segura)
- En Netlify, abre tu sitio → **Site configuration** → **Environment variables** → **Add a variable**.
- Key: `MP_ACCESS_TOKEN`
- Value: tu Access Token (el `APP_USR-...`)
- Guarda.

## 4. Sube el proyecto COMPLETO y publica
Arrastra a Netlify la carpeta completa, que debe incluir:
```
index.html
netlify.toml
package.json
netlify/functions/crear-pago.js
netlify/functions/webhook-mp.js
netlify/lib/pedido.js
fotos/...
yape-qr.png
```
Netlify instalará solo la librería de Mercado Pago y activará la función. Listo: el botón
**"Pagar con Yape o Tarjeta"** abrirá el checkout con Yape, Visa, Mastercard, etc.

---

## Probar antes de cobrar de verdad
Si quieres probar sin dinero real, en el paso 2 usa las **Credenciales de PRUEBA**
(Access Token que empieza con `TEST-...`) y paga con las
[tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.pe/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards).
Cuando todo funcione, cambia el token por el de **producción**.

---

## 5. Recibir los datos de envío por correo (Resend)
Cuando un cliente paga con Mercado Pago, ahora tu web le pide **nombre, DNI, dirección,
distrito, provincia, ciudad, teléfono y correo** antes de enviarlo a pagar. Esos datos te
llegan automáticamente por email. Para activarlo (una sola vez):

1. Entra a **https://resend.com** y crea una cuenta gratis. Verifica tu correo.
2. Ve a **API Keys → Create API Key**, ponle un nombre (ej. "Frima") y **copia la clave**
   (empieza con `re_...`).
3. En Netlify → **Site configuration → Environment variables → Add a variable**, agrega DOS:
   - Key: `RESEND_API_KEY`  · Value: la clave `re_...`
   - Key: `ORDER_EMAIL`  · Value: el correo donde quieres recibir los pedidos.
4. Guarda y vuelve a publicar (**Deploys → Trigger deploy**).

> Sin pagar dominio, los correos llegan desde `onboarding@resend.dev` y solo al correo de tu
> cuenta Resend (ponlo en `ORDER_EMAIL`). Si más adelante verificas tu dominio en Resend,
> puedes agregar la variable opcional `ORDER_FROM` con tu propia dirección.

- El correo de confirmación llega **solo cuando Mercado Pago aprueba el pago** (no antes), así
  evitas pedidos a medias. Lo envía automáticamente la función `webhook-mp`: Mercado Pago la
  llama solo, **no tienes que configurar nada en su panel**.
- ¿Quieres además un aviso apenas el cliente inicia el pago (aunque no lo termine)? Agrega en
  Netlify la variable opcional `NOTIFY_ON_CREATE` con valor `1`.
- Los pedidos por **Yape manual** te siguen llegando por WhatsApp, ahora también con la
  dirección completa.

> Nota: en raras ocasiones Mercado Pago puede enviar la notificación dos veces y llegar un
> correo duplicado del mismo pedido (se reconoce por la misma referencia). No afecta el cobro.

---

## Notas
- **Comisión:** Mercado Pago descuenta una comisión por cada venta (aprox. 3–4% + IGV).
  El dinero queda en tu cuenta Mercado Pago y lo retiras a tu banco.
- **Yape del cliente:** quien pague con Yape debe tener activada la opción
  *"Compras por internet"* en su app (la misma nota que sale en la pantalla de pago).
- **Si aún no configuras Mercado Pago:** abre `index.html`, busca `mpHabilitado: true`
  y ponlo en `false`. Así solo se mostrará el Yape manual + WhatsApp.
- El Yape manual (QR + comprobante por WhatsApp) sigue disponible como respaldo siempre.
