// ============================================================
// Webhook de Mercado Pago.
// Mercado Pago llama a esta URL cuando cambia el estado de un pago.
// Si el pago está APROBADO, recupera los datos de envío (guardados en la
// preferencia) y envía el correo de confirmación.
//
// La URL se registra automáticamente en cada preferencia (notification_url),
// así que NO necesitas configurar nada en el panel de Mercado Pago.
// Requiere la variable MP_ACCESS_TOKEN (la misma del pago).
// ============================================================
const { enviarCorreoPedido } = require("../lib/pedido");

const MP = "https://api.mercadopago.com";

async function mpGet(path, token) {
  const r = await fetch(MP + path, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`MP ${path} -> ${r.status}`);
  return r.json();
}

exports.handler = async (event) => {
  // Mercado Pago espera siempre un 200 rápido. Respondemos 200 salvo error inesperado.
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { statusCode: 200, body: "no token" };

  try {
    const qs = event.queryStringParameters || {};
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch (_) {}

    // El tipo y el id pueden venir por query o por body, según la versión.
    const type = qs.type || qs.topic || body.type || body.topic || "";
    let paymentId = qs["data.id"] || (body.data && body.data.id) || qs.id || body.id;
    let merchantOrderId = null;

    // Notificación de merchant_order: el recurso trae el id (o una URL).
    if (/merchant_order/i.test(type)) {
      const res = qs.resource || body.resource || paymentId;
      merchantOrderId = String(res || "").split("/").pop();
      paymentId = null;
    }

    if (!paymentId && !merchantOrderId) return { statusCode: 200, body: "sin id" };

    // 1) Obtener el pago (directo o a través de la merchant_order)
    let payment = null;
    if (paymentId) {
      payment = await mpGet(`/v1/payments/${paymentId}`, token);
    } else if (merchantOrderId) {
      const mo = await mpGet(`/merchant_orders/${merchantOrderId}`, token);
      const pagos = (mo.payments || []).filter((p) => p.status === "approved");
      if (!pagos.length) return { statusCode: 200, body: "merchant_order sin pago aprobado" };
      payment = await mpGet(`/v1/payments/${pagos[0].id}`, token);
    }

    if (!payment) return { statusCode: 200, body: "sin pago" };
    if (payment.status !== "approved") {
      return { statusCode: 200, body: `pago ${payment.status} (ignorado)` };
    }

    // 2) Recuperar los datos de envío desde la preferencia
    let cliente = (payment.metadata && Object.keys(payment.metadata).length) ? payment.metadata : null;
    let items = [];
    let total = payment.transaction_amount;
    let prefId = payment.external_reference || String(payment.id);

    try {
      const orderId = payment.order && payment.order.id;
      if (orderId) {
        const mo = await mpGet(`/merchant_orders/${orderId}`, token);
        if (mo.preference_id) {
          const pref = await mpGet(`/checkout/preferences/${mo.preference_id}`, token);
          if (pref.metadata && Object.keys(pref.metadata).length) cliente = pref.metadata;
          if (Array.isArray(pref.items)) items = pref.items.map((i) => ({
            title: i.title, quantity: i.quantity, unit_price: i.unit_price,
          }));
          if (pref.external_reference) prefId = pref.external_reference;
        }
      }
    } catch (e) {
      console.warn("No se pudo leer la preferencia:", e.message);
    }

    // Respaldo: si no se obtuvieron items, usar los del pago.
    if (!items.length && payment.additional_info && Array.isArray(payment.additional_info.items)) {
      items = payment.additional_info.items.map((i) => ({
        title: i.title, quantity: Number(i.quantity) || 1, unit_price: Number(i.unit_price) || 0,
      }));
    }

    // 3) Enviar el correo de confirmación
    const ok = await enviarCorreoPedido({ cliente, items, total, prefId, estado: "aprobado" });
    return { statusCode: 200, body: ok ? "correo enviado" : "ok (sin correo)" };
  } catch (e) {
    console.error("Error en webhook-mp:", e.message);
    // 500 -> Mercado Pago reintentará más tarde
    return { statusCode: 500, body: "error" };
  }
};
