import nodemailer from 'nodemailer';

// Configurar transporter para enviar emails
// Usa Gmail, Outlook, o cualquier servicio SMTP
export const sendOrderNotification = async (orderData) => {
  try {
    // Crear transporter (configurar con tus credenciales)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // tu-email@gmail.com
        pass: process.env.EMAIL_PASSWORD // contraseña de aplicación
      }
    });

    // Formatear productos s
    const productsHtml = orderData.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity?.toLocaleString() || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price?.toFixed(2) || 0}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    // HTML del email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL, // Email del propietario
      subject: `🛒 Nueva Orden Confirmada - ${orderData.reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F26E22; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background-color: #F26E22; color: white; padding: 10px; text-align: left; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Pago Confirmado</h1>
            </div>
            <div class="content">
              <h2>Nueva Orden Recibida</h2>
              
              <div class="order-info">
                <h3>Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${orderData.customer_name || 'N/A'}</p>
                <p><strong>Email:</strong> ${orderData.customer_email}</p>
                <p><strong>Teléfono:</strong> ${orderData.customer_phone || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${orderData.shipping_address || 'N/A'}</p>
              </div>

              <div class="order-info">
                <h3>Detalles de la Orden</h3>
                <p><strong>Referencia:</strong> ${orderData.reference}</p>
                <p><strong>Fecha:</strong> ${new Date(orderData.created_at).toLocaleString('es-CO')}</p>
                <p><strong>Método de pago:</strong> ${orderData.payment_method || 'N/A'}</p>
              </div>

              <h3>Productos</h3>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>

              <div class="total">
                Total: $${orderData.amount?.toFixed(2) || '0.00'} COP
              </div>

              <div class="order-info" style="margin-top: 20px;">
                <p><strong>⚠️ Acción Requerida:</strong></p>
                <p>Por favor, procesa este pedido y contacta al cliente para coordinar la entrega.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

// Enviar notificación por WhatsApp (usando API de WhatsApp Business)
export const sendWhatsAppNotification = async (orderData) => {
  try {
    // Si tienes WhatsApp Business API configurado
    const whatsappNumber = process.env.OWNER_WHATSAPP;
    
    const message = `
🛒 *NUEVA ORDEN CONFIRMADA*

📋 Referencia: ${orderData.reference}
💰 Total: $${orderData.amount?.toFixed(2)} COP

👤 *Cliente*
Nombre: ${orderData.customer_name || 'N/A'}
Email: ${orderData.customer_email}
Teléfono: ${orderData.customer_phone || 'N/A'}

📦 *Productos*
${orderData.items?.map(item => `• ${item.name} - ${item.quantity?.toLocaleString()} und - $${item.price}`).join('\n')}

📍 Dirección: ${orderData.shipping_address || 'N/A'}

✅ Pago confirmado
    `.trim();

    console.log('📱 Mensaje de WhatsApp generado:');
    console.log(message);

    // TODO: Implementar envío real con WhatsApp Business API
    // Por ahora solo registramos el mensaje
    
    return { success: true, message };
  } catch (error) {
    console.error('❌ Error preparando WhatsApp:', error);
    return { success: false, error: error.message };
  }
};
