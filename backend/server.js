                import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import nodemailer from 'nodemailer';
                import multer from 'multer';
                import fs from 'fs';
                import path from 'path';
                import { fileURLToPath } from 'url';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración
app.use(cors());
app.use(express.json());

const WOMPI_API = process.env.WOMPI_API_URL;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadedLogos = new Map();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const reference = req.body?.reference || 'order';
    const ext = path.extname(file.originalname) || '';
    cb(null, `${reference}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isValid = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
  if (!isValid) {
    return cb(new Error('Tipo de archivo no permitido'), false);
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Configurar Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Configurar nodemailer
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 0);
const smtpSecure = process.env.SMTP_SECURE === 'true';

const transporter = nodemailer.createTransport(
  smtpHost
    ? {
        host: smtpHost,
        port: smtpPort || (smtpSecure ? 465 : 587),
        secure: smtpSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
      }
);
//for commit
// Función para enviar email de notificación
async function sendOrderEmail(orderData, attachmentInfo = null) {
  try {
    // Formatear productos
    const productsHtml = orderData.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity?.toLocaleString() || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price?.toLocaleString() || 0}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
      </tr>
    `).join('') || '';

    const subject = `🛒 Nueva Orden Confirmada - ${orderData.reference}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F26E22; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .order-info { background-color: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .order-info h3 { color: #F26E22; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
            th { background-color: #F26E22; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .total { background-color: #F26E22; color: white; padding: 15px 20px; font-size: 1.3em; font-weight: bold; text-align: right; margin-top: 15px; border-radius: 5px; }
            .footer { background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px; }
            .action-box { background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ¡Pago Confirmado!</h1>
              <p style="margin: 10px 0 0 0;">Nueva orden recibida</p>
            </div>
            
            <div class="content">
              <div class="order-info">
                <h3>👤 Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${orderData.customer?.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> ${orderData.customer?.email || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${orderData.customer?.phone || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${orderData.customer?.address || 'N/A'}</p>
              </div>

              <div class="order-info">
                <h3>📋 Detalles de la Orden</h3>
                <p><strong>Referencia:</strong> ${orderData.reference}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Estado:</strong> <span style="color: #4caf50; font-weight: bold;">PAGADO</span></p>
                ${attachmentInfo ? '<p><strong>Logo:</strong> adjunto al correo</p>' : ''}
              </div>

              <h3 style="color: #F26E22; padding-left: 20px;">📦 Productos Ordenados</h3>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>

              <div class="total">
                TOTAL: $${orderData.total?.toLocaleString() || '0'} COP
              </div>

              <div class="action-box">
                <p style="margin: 0;"><strong>⚠️ Acción Requerida:</strong></p>
                <p style="margin: 10px 0 0 0;">Por favor, procesa este pedido lo antes posible y contacta al cliente para coordinar la entrega.</p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">Tu Caja en Línea - Sistema de Notificaciones</p>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; opacity: 0.8;">Este es un mensaje automático, no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    if (resend && RESEND_FROM) {
      const attachments = attachmentInfo?.path
        ? [
            {
              filename: attachmentInfo.originalName || path.basename(attachmentInfo.path),
              content: fs.readFileSync(attachmentInfo.path).toString('base64'),
              type: attachmentInfo.mimetype,
            },
          ]
        : [];

      const result = await resend.emails.send({
        from: RESEND_FROM,
        to: process.env.OWNER_EMAIL,
        subject,
        html,
        attachments,
      });

      if (result?.error) {
        console.error('❌ Error enviando con Resend:', result.error);
        return { success: false, error: result.error.message || 'Error de Resend' };
      }

      console.log('📧 Email enviado con Resend:', result?.data?.id || result?.id || result);
      return { success: true, messageId: result?.data?.id || result?.id };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject,
      html,
    };

    if (attachmentInfo?.path) {
      mailOptions.attachments = [
        {
          filename: attachmentInfo.originalName || path.basename(attachmentInfo.path),
          path: attachmentInfo.path,
          contentType: attachmentInfo.mimetype,
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
}

// Endpoint para crear transacción con Wompi
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount_in_cents, reference, customer_email, customer_data, metadata } = req.body;

    console.log('\n📨 SOLICITUD RECIBIDA:');
    console.log('Body completo:', JSON.stringify(req.body, null, 2));

    // Validar datos requeridos
    if (!amount_in_cents || !reference || !customer_email) {
      console.log('❌ Validación fallida');
      return res.status(400).json({
        error: 'Faltan campos requeridos: amount_in_cents, reference, customer_email',
      });
    }

    console.log('📦 Generando Wompi Payment Link...');
    console.log('Monto:', amount_in_cents / 100, 'COP');
    console.log('Referencia:', reference);
    console.log('Email:', customer_email);

    // Crear un Payment Link usando la API de Wompi
    const paymentLinkPayload = {
      name: `Pedido ${reference}`,
      description: `Compra de productos - ${reference}`,
      single_use: false,
      collect_shipping: false,
      currency: 'COP',
      amount_in_cents: Math.round(amount_in_cents),
      redirect_url: `${FRONTEND_URL}/?payment_success=true&reference=${reference}`,
      customer_data: {
        email: customer_email,
        full_name: customer_data?.full_name || 'Cliente',
        phone_number: customer_data?.phone_number || ''
      }
    };

    console.log('\n📤 Enviando a Wompi API:');
    console.log(JSON.stringify(paymentLinkPayload, null, 2));

    const response = await axios.post(
      `${WOMPI_API}/payment_links`,
      paymentLinkPayload,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('\n✅ Respuesta de Wompi:');
    console.log(JSON.stringify(response.data, null, 2));

    if (!response.data || !response.data.data || !response.data.data.id) {
      throw new Error('Respuesta inválida de Wompi');
    }

    const paymentLink = `https://checkout.wompi.co/l/${response.data.data.id}`;
    console.log('\n🔗 Link de pago:', paymentLink);

    res.json({
      success: true,
      checkout_url: paymentLink,
      payment_link_id: response.data.data.id,
    });
  } catch (error) {
    console.error('\n❌ ERROR EN BACKEND:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);

    res.status(500).json({
      error: 'Error al crear el link de pago',
      details: error.response?.data?.error || error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando' });
});

// Endpoint para confirmar el pago y enviar notificación
app.post('/api/confirm-payment', async (req, res) => {
  try {
    console.log('\n💳 SOLICITUD DE CONFIRMACIÓN DE PAGO:');
    console.log(JSON.stringify(req.body, null, 2));

    const { reference, orderData } = req.body;

    if (!reference || !orderData) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    console.log('\n📦 ORDEN CONFIRMADA:');
    console.log('Referencia:', reference);
    console.log('Cliente:', orderData.customer?.fullName);
    console.log('Email:', orderData.customer?.email);
    console.log('Teléfono:', orderData.customer?.phone);
    console.log('Total:', orderData.total, 'COP');
    console.log('\n📋 Productos:');
    orderData.items?.forEach(item => {
      console.log(`  - ${item.name} x${item.quantity?.toLocaleString()} - $${item.price}`);
    });

    // Enviar email al propietario
    console.log('\n📧 Enviando notificación por email...');
    const attachmentInfo = uploadedLogos.get(reference || orderData.reference) || null;
    const emailResult = await sendOrderEmail(orderData, attachmentInfo);
    
    if (emailResult.success) {
      console.log('✅ Notificación enviada exitosamente');
    } else {
      console.error('⚠️ Error al enviar notificación:', emailResult.error);
    }

    res.json({ 
      success: true, 
      message: 'Orden registrada correctamente',
      reference,
      emailSent: emailResult.success,
      logoAttached: Boolean(attachmentInfo)
    });
  } catch (error) {
    console.error('❌ Error confirmando pago:', error);
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
});

// Endpoint para subir logo (imagen o PDF)
app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Referencia requerida' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    uploadedLogos.set(reference, {
      path: req.file.path,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype
    });

    res.json({
      success: true,
      reference,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Error subiendo logo:', error);
    res.status(500).json({ error: 'Error al subir el logo' });
  }
});

// Webhook para recibir notificaciones de Wompi (solo producción)
app.post('/api/webhooks/wompi', async (req, res) => {
  try {
    console.log('\n🔔 WEBHOOK RECIBIDO DE WOMPI:');
    console.log(JSON.stringify(req.body, null, 2));

    const event = req.body;
    
    // Wompi envía eventos de tipo transaction.updated
    if (event.event === 'transaction.updated') {
      const transaction = event.data.transaction;
      
      console.log('\n📊 Estado de la transacción:', transaction.status);
      console.log('Referencia:', transaction.reference);
      console.log('Monto:', transaction.amount_in_cents / 100, 'COP');
      
      // Si la transacción fue aprobada
      if (transaction.status === 'APPROVED') {
        console.log('✅ PAGO APROBADO');
        
        // Aquí puedes:
        // 1. Guardar la orden en Firebase
        // 2. Enviar email/WhatsApp al propietario
        // 3. Actualizar inventario
        
        // Por ahora solo logueamos la info importante
        const orderInfo = {
          reference: transaction.reference,
          amount: transaction.amount_in_cents / 100,
          currency: transaction.currency,
          customer_email: transaction.customer_email,
          status: transaction.status,
          payment_method: transaction.payment_method_type,
          created_at: transaction.created_at,
          finalized_at: transaction.finalized_at
        };
        
        console.log('\n📦 INFORMACIÓN DE LA ORDEN:');
        console.log(JSON.stringify(orderInfo, null, 2));
        
        // TODO: Implementar notificación al propietario
        // - Enviar email con detalles de la orden
        // - Enviar mensaje de WhatsApp
        // - Guardar en Firebase Firestore
      } else {
        console.log('⚠️ Transacción no aprobada:', transaction.status);
      }
    }
    
    // Wompi requiere que respondas con 200 OK
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Backend ejecutándose en http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/transactions\n`);
});
