// ============================================================
// Función serverless: crea una preferencia de pago en Mercado Pago
// Devuelve el "init_point" (URL del checkout con Yape + tarjetas).
//
// El correo con los datos de envío se envía cuando el pago queda APROBADO,
// a través de la función webhook-mp (registrada aquí en notification_url).
//
// Variables de entorno en Netlify (Site settings → Environment variables):
//   MP_ACCESS_TOKEN  → Access Token de Mercado Pago (APP_USR-...)  [obligatoria]
//   RESEND_API_KEY   → clave de Resend para el correo              [para el email]
//   ORDER_EMAIL      → correo donde recibes los pedidos            [para el email]
//   ORDER_FROM       → remitente (opcional)
//   NOTIFY_ON_CREATE → "1" para recibir también un aviso al iniciar el pago (opcional)
// ============================================================
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { enviarCorreoPedido } = require("../lib/pedido");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta configurar MP_ACCESS_TOKEN en Netlify." }) };
  }

  try {
    const { items, cliente, total } = JSON.parse(event.body || "{}");
    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "El carrito está vacío." }) };
    }

    // Sanitizar items
    const cleanItems = items
      .map((i) => ({
        title: String(i.title || "Producto").slice(0, 250),
        quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
        unit_price: Math.round((Number(i.unit_price) || 0) * 100) / 100,
        currency_id: "PEN",
      }))
      .filter((i) => i.unit_price > 0);

    if (cleanItems.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Productos inválidos." }) };
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);
    const base = process.env.URL || `https://${event.headers.host}`;
    const externalRef = "FRIMA-" + Date.now();

    const body = {
      items: cleanItems,
      external_reference: externalRef,
      notification_url: `${base}/.netlify/functions/webhook-mp`,
      back_urls: {
        success: `${base}/?pago=ok`,
        failure: `${base}/?pago=error`,
        pending: `${base}/?pago=pendiente`,
      },
      auto_return: "approved",
      statement_descriptor: "FRIMA",
    };

    // Guardamos TODOS los datos de envío en la preferencia para recuperarlos
    // luego en el webhook cuando el pago se apruebe.
    if (cliente) {
      body.payer = {
        name: cliente.nombre || undefined,
        surname: cliente.apellidos || undefined,
        email: cliente.email || undefined,
        phone: cliente.tel ? { number: String(cliente.tel) } : undefined,
        address: cliente.dir ? { street_name: String(cliente.dir) } : undefined,
      };
      body.metadata = {
        email: cliente.email, nombre: cliente.nombre, apellidos: cliente.apellidos,
        doc: cliente.doc, dir: cliente.dir, ref: cliente.ref,
        distrito: cliente.distrito, provincia: cliente.provincia,
        ciudad: cliente.ciudad, tel: cliente.tel,
      };
    }

    const result = await preference.create({ body });

    // Aviso opcional al iniciar el pago (si activas NOTIFY_ON_CREATE).
    // El correo de confirmación real lo envía el webhook al aprobarse el pago.
    if (process.env.NOTIFY_ON_CREATE === "1" && cliente) {
      await enviarCorreoPedido({
        cliente, items: cleanItems, total, prefId: result.id || externalRef, estado: "iniciado",
      });
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_point: result.init_point, id: result.id }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Error al crear el pago." }) };
  }
};
