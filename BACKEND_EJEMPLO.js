/**
 * BACKEND EJEMPLO - Manejo de transacciones Wompi (Node.js + Express)
 * 
 * Este es un ejemplo de cómo procesar pagos de forma SEGURA desde el backend
 * NUNCA expongas tus credenciales privadas en el frontend
 * 
 * Para usar este backend:
 * 1. npm install express cors dotenv axios body-parser
 * 2. Crea un archivo .env con tus credenciales
 * 3. node server.js
 */

// Ejemplo de API endpoint para crear transacciones
// POST /api/transactions/create

const createTransaction = async (req, res) => {
  try {
    const {
      amount_in_cents,
      reference,
      customer_email,
      customer_name,
      customer_phone,
      redirect_url,
      items
    } = req.body;

    // Validar datos
    if (!amount_in_cents || !reference || !customer_email) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }

    // Llamar API de Wompi desde el backend
    const wompiResponse = await fetch('https://sandbox.wompi.co/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`
      },
      body: JSON.stringify({
        amount_in_cents,
        currency: 'COP',
        reference,
        customer_email,
        payment_method: {
          type: 'CARD',
          installments: 1
        },
        redirect_url: redirect_url || process.env.FRONTEND_URL,
        metadata: {
          customer_name,
          customer_phone,
          items_count: items?.length || 0
        }
      })
    });

    const data = await wompiResponse.json();

    if (!wompiResponse.ok) {
      return res.status(400).json({
        success: false,
        error: data.error_code || 'Error en Wompi'
      });
    }

    // Guardar transacción en BD
    // await saveTransaction(data);

    res.json({
      success: true,
      data: {
        transactionId: data.data.id,
        reference: data.data.reference,
        redirectUrl: data.data.links.payment_link
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Webhook para confirmar transacciones (POST /api/webhooks/wompi)
const handleWompiWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    // Validar firma del webhook (importante para seguridad)
    // const signature = req.headers['x-wompi-signature'];
    // if (!verifySignature(signature, JSON.stringify(data))) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    if (event === 'transaction.confirmed') {
      console.log('Transacción confirmada:', data);
      // Actualizar estado del pedido en BD
      // await updateOrder(data.reference, { status: 'paid' });
      // Enviar email de confirmación
      // await sendConfirmationEmail(data.customer_email);
    }

    if (event === 'transaction.failed') {
      console.log('Transacción fallida:', data);
      // Actualizar estado del pedido
      // await updateOrder(data.reference, { status: 'failed' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

// Obtener estado de transacción (GET /api/transactions/:transactionId)
const getTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const response = await fetch(
      `https://sandbox.wompi.co/v1/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`
        }
      }
    );

    const data = await response.json();

    res.json({
      success: true,
      status: data.data.status,
      transaction: data.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export { createTransaction, handleWompiWebhook, getTransactionStatus };

/**
 * EJEMPLO DE USO DESDE FRONTEND:
 * 
 * const response = await fetch('/api/transactions/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     amount_in_cents: 50000,
 *     reference: 'ORDER-123456',
 *     customer_email: 'cliente@example.com',
 *     customer_name: 'Juan Pérez',
 *     customer_phone: '+57 300 000 0000',
 *     items: cartItems
 *   })
 * });
 * 
 * const { data } = await response.json();
 * window.location.href = data.redirectUrl; // Redirigir a Wompi
 */
