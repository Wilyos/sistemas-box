// Script de prueba para verificar configuración de WhatsApp
// Ejecutar en la consola del navegador (F12)

console.log('🔍 Verificando configuración de WhatsApp...\n');

// 1. Verificar variable de entorno
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
console.log('📱 Número configurado:', whatsappNumber);

if (!whatsappNumber) {
  console.error('❌ VITE_WHATSAPP_NUMBER no está configurado en .env');
  console.log('💡 Agrega: VITE_WHATSAPP_NUMBER=573001234567 en tu archivo .env');
} else {
  console.log('✅ Variable configurada correctamente');
  
  // Validar formato
  if (whatsappNumber.startsWith('57') && whatsappNumber.length >= 12) {
    console.log('✅ Formato del número parece correcto (Colombia)');
  } else {
    console.warn('⚠️ Verifica el formato: debe ser 57 + 10 dígitos (ej: 573001234567)');
  }
}

// 2. Probar mensaje de prueba
const testMessage = `
*PRUEBA DE WHATSAPP* ✅

Este es un mensaje de prueba para verificar que la integración de WhatsApp funciona correctamente.

Si ves este mensaje en WhatsApp, la configuración es correcta.
`.trim();

const encodedMessage = encodeURIComponent(testMessage);
const testUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

console.log('\n🔗 URL de prueba generada:');
console.log(testUrl);

console.log('\n💡 Para probar, ejecuta en la consola:');
console.log(`window.open('${testUrl}', '_blank')`);

// 3. Verificar localStorage para datos pendientes
const pendingOrder = localStorage.getItem('pendingOrder');
if (pendingOrder) {
  console.log('\n⚠️ Hay una orden pendiente en localStorage:');
  console.log(JSON.parse(pendingOrder));
} else {
  console.log('\n✅ No hay órdenes pendientes');
}

console.log('\n✨ Verificación completada');
