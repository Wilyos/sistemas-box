// Configuración del backend
export const API_CONFIG = {
  // Railway URL - Reemplaza esto con tu URL de Railway
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  ENDPOINTS: {
    TRANSACTIONS: '/api/transactions',
    CONFIRM_PAYMENT: '/api/confirm-payment',
    UPLOAD_LOGO: '/api/upload-logo',
    HEALTH: '/health'
  }
};

// Helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
