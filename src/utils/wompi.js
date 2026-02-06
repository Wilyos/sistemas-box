// Configuración de Wompi
const WOMPI_API_URL = 'https://sandbox.wompi.co/v1'; // URL de pruebas
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

/**
 * Crear una transacción con Wompi
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise} - URL de pago en Wompi
 */
export async function createWompiTransaction(orderData) {
  try {
    if (!WOMPI_PUBLIC_KEY) {
      throw new Error('VITE_WOMPI_PUBLIC_KEY no está configurado');
    }

    // Wompi requiere estos campos específicos en formato correcto
    const transactionData = {
      amount_in_cents: Math.round(orderData.amount_in_cents),
      currency: 'COP',
      reference: orderData.reference,
      customer_email: orderData.customer_email,
      description: `Pedido ${orderData.reference}`,
      payment_method: {
        type: 'CARD',
        installments: 1,
      },
      redirect_url: window.location.origin,
      payment_source: {
        type: 'CARD',
      },
    };

    console.log('📦 Datos enviados a Wompi:', JSON.stringify(transactionData, null, 2));

    const response = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
      },
      body: JSON.stringify(transactionData),
    });

    console.log('📊 Respuesta status:', response.status);

    const data = await response.json();
    console.log('📋 Respuesta completa de Wompi:', data);
    
    // Si hay error de validación, loguear los campos específicos
    if (data?.error?.messages) {
      console.error('🔴 Errores de validación:', data.error.messages);
    }

    if (!response.ok) {
      console.error('❌ Error completo de Wompi:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
      
      let errorMessage = 'Error al crear la transacción';
      
      // Manejar errores de validación específicos
      if (data?.error?.messages) {
        const messages = data.error.messages;
        const errorFields = Object.entries(messages)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        errorMessage = `Validación: ${errorFields}`;
      } else if (data?.error?.description) {
        errorMessage = data.error.description;
      } else if (data?.message) {
        errorMessage = data.message;
      }
      
      console.error('Mensaje de error final:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ Transacción creada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en createWompiTransaction:', error.message);
    throw error;
  }
}

/**
 * Obtener estado de una transacción
 * @param {string} reference - Referencia de la transacción
 * @returns {Promise} - Estado de la transacción
 * @returns {Promise} - Estado de la transacción
 */
export async function getWompiTransactionStatus(transactionId) {
  try {
    const response = await fetch(
      `${WOMPI_API_URL}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener el estado de la transacción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error de Wompi:', error);
    throw error;
  }
}

/**
 * Generar referencia única para el pedido
 * @returns {string} - Referencia única
 */
export function generateOrderReference() {
  return `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
