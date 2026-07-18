// ============================================================
// Módulo compartido: arma y envía el correo de un pedido (Resend).
// Lo usan crear-pago.js y webhook-mp.js.
// Variables de entorno:
//   RESEND_API_KEY → clave de Resend (re_...)
//   ORDER_EMAIL    → correo donde recibes los pedidos
//   ORDER_FROM     → remitente (opcional). Por defecto Frima <onboarding@resend.dev>
// ============================================================
const esc = (s) =>
  String(s == null ? "" : s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

function buildHtml({ cliente, items, total, prefId, estado }) {
  const c = cliente || {};
  const filas = (items || [])
    .map(
      (i) =>
        `<tr><td>${esc(i.title)}</td><td align="center">${i.quantity}</td><td align="right">S/ ${Number(
          i.unit_price
        ).toFixed(2)}</td></tr>`
    )
    .join("");

  const banner =
    estado === "aprobado"
      ? `<p style="background:#e6f7ec;padding:10px;border-radius:6px"><b>✅ Pago APROBADO en Mercado Pago.</b> Ya puedes preparar el envío.</p>`
      : `<p style="background:#fff6e6;padding:10px;border-radius:6px"><b>⏳ Pedido iniciado.</b> Confirma el pago en tu panel de Mercado Pago (Actividad).</p>`;

  return `
    <h2>🛍️ Pedido en Frima</h2>
    ${banner}
    <p><b>Referencia:</b> ${esc(prefId || "-")}</p>
    <h3>Productos</h3>
    <table cellpadding="6" style="border-collapse:collapse" border="1">
      <tr><th align="left">Producto</th><th>Cant.</th><th>Precio</th></tr>
      ${filas}
    </table>
    <p><b>Total: S/ ${Number(total || 0).toFixed(2)}</b></p>
    <h3>Datos de envío</h3>
    <p>
      <b>${esc(c.nombre)} ${esc(c.apellidos)}</b><br>
      DNI/RUC: ${esc(c.doc)}<br>
      Dirección: ${esc(c.dir)}${c.ref ? " (" + esc(c.ref) + ")" : ""}<br>
      ${esc(c.distrito)}, ${esc(c.provincia)}, ${esc(c.ciudad)}<br>
      Teléfono: ${esc(c.tel)}<br>
      Correo: ${esc(c.email)}
    </p>
  `;
}

// Envía el correo. Devuelve true/false. Nunca lanza (no rompe el flujo de pago).
async function enviarCorreoPedido({ cliente, items, total, prefId, estado }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL;
  if (!apiKey || !to) return false; // sin configuración de correo, se omite
  const from = process.env.ORDER_FROM || "Frima <onboarding@resend.dev>";
  const c = cliente || {};
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: c.email || undefined,
        subject: `${estado === "aprobado" ? "✅ Pago aprobado" : "Pedido"} — ${c.nombre || ""} ${
          c.apellidos || ""
        }`.trim(),
        html: buildHtml({ cliente: c, items, total, prefId, estado }),
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn("No se pudo enviar el correo del pedido:", e.message);
    return false;
  }
}

module.exports = { enviarCorreoPedido, esc };
