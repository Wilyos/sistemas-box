# Gestión de Ventanas Emergentes (Popups) 🪟

## Problema
Los navegadores modernos bloquean las ventanas emergentes por defecto para proteger a los usuarios. Esto afectaba:
- La apertura de WhatsApp para pedidos
- La apertura de Wompi para pagos

## Solución Implementada

### 1. **PopupPermissionModal** ✨
Modal educativo que:
- Detecta si los popups están bloqueados
- Proporciona instrucciones específicas por navegador (Chrome, Firefox, Safari, Edge)
- Permite al usuario verificar permisos
- Muestra iconos visuales para ayudar a encontrar la configuración

**Ubicación:** `/src/components/PopupPermissionModal.jsx`

### 2. **PopupHintBanner** 💡
Banner discreto que aparece automáticamente:
- Se muestra en la esquina inferior derecha
- Solo aparece la primera vez que el usuario visita el sitio
- Permite verificar permisos de forma proactiva
- Se puede cerrar y no vuelve a aparecer

**Ubicación:** `/src/components/PopupHintBanner.jsx`

### 3. **Mejoras en Checkout** 🛒
Función `openPopupWithFallback()` que:
- Intenta abrir ventanas emergentes
- Detecta si el navegador las bloqueó
- Muestra el modal de instrucciones automáticamente
- Ofrece alternativa de abrir en la misma pestaña
- Elimina setTimeout que causaba más bloqueos

## ¿Por qué no se puede "solicitar permiso" directamente?

**No existe una API del navegador** para solicitar permisos de ventanas emergentes como con:
- ❌ Popups - No hay API
- ✅ Notificaciones - `Notification.requestPermission()`
- ✅ Cámara - `navigator.mediaDevices.getUserMedia()`
- ✅ Ubicación - `navigator.geolocation.getCurrentPosition()`

Los navegadores solo permiten popups cuando:
1. Son resultado **directo** de una acción del usuario (click, submit)
2. No hay delays (setTimeout, async operations)
3. El sitio no está en la lista de bloqueados del navegador

## Componentes Creados

### PopupPermissionModal.jsx
```jsx
<PopupPermissionModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onTestPopup={(allowed) => {
    if (allowed) {
      console.log('✅ Popups habilitados');
    }
  }}
/>
```

### PopupHintBanner.jsx
```jsx
// Se muestra automáticamente
<PopupHintBanner />
```

## Modificaciones en Checkout.jsx

### Antes:
```javascript
setTimeout(() => {
  window.open(whatsappUrl, '_blank'); // ❌ Bloqueado por setTimeout
}, 1500);
```

### Después:
```javascript
const openPopupWithFallback = (url) => {
  const newWindow = window.open(url, '_blank');
  
  if (!newWindow || newWindow.closed) {
    // Detectar bloqueo y mostrar modal de instrucciones
    setShowPopupPermissionModal(true);
    
    // Ofrecer alternativa
    if (confirm('¿Abrir en esta pestaña?')) {
      window.location.href = url;
    }
  }
  
  return newWindow;
};

// Llamada directa sin setTimeout
openPopupWithFallback(whatsappUrl); // ✅ Mayor probabilidad de éxito
```

## Flujo de Usuario

### Primera Visita:
1. Usuario entra al sitio
2. Banner aparece en esquina inferior derecha (2 segundos después)
3. Usuario puede verificar permisos o cerrar el banner
4. Si cierra, no vuelve a aparecer

### Al Hacer un Pedido:
1. Usuario hace click en "Pagar con Wompi" o "Enviar por WhatsApp"
2. Si el popup se bloquea → Modal aparece automáticamente
3. Modal muestra instrucciones específicas del navegador
4. Usuario puede:
   - Seguir instrucciones y recargar
   - Abrir en la misma pestaña (fallback)

## Instrucciones por Navegador

### Chrome/Edge:
1. Click en 🔒 o ⓘ en la barra de direcciones
2. Busca "Ventanas emergentes y redirecciones"
3. Selecciona "Permitir"
4. Recarga la página

### Firefox:
1. Click en 🔒 en la barra de direcciones
2. Click en "Configuración de permisos"
3. Desmarca "Bloquear ventanas emergentes"
4. Recarga la página

### Safari:
1. Safari > Preferencias
2. Click en "Sitios web"
3. Selecciona "Ventanas emergentes"
4. Busca el sitio y selecciona "Permitir"

## Testing

```javascript
// Probar detección de bloqueo
const testWindow = window.open('', '_blank', 'width=1,height=1');

if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
  console.log('❌ Popups bloqueados');
} else {
  testWindow.close();
  console.log('✅ Popups permitidos');
}
```

## Archivos Modificados

- ✅ `/src/components/Checkout.jsx` - Integración del modal y función de fallback
- ✅ `/src/App.jsx` - Banner informativo agregado

## Archivos Nuevos

- 🆕 `/src/components/PopupPermissionModal.jsx`
- 🆕 `/src/components/PopupPermissionModal.css`
- 🆕 `/src/components/PopupHintBanner.jsx`
- 🆕 `/src/components/PopupHintBanner.css`

## Mejores Prácticas

### ✅ Hacer:
- Abrir popups inmediatamente después del click
- Detectar bloqueos y ofrecer alternativas
- Educar a los usuarios sobre cómo habilitar popups
- Usar fallbacks (abrir en misma pestaña)

### ❌ Evitar:
- Usar setTimeout antes de abrir popups
- Abrir popups después de operaciones async sin interacción
- Abrir múltiples popups a la vez
- No informar al usuario sobre popups bloqueados

## Personalización

### Cambiar el mensaje del banner:
Edita `PopupHintBanner.jsx` línea 58:
```jsx
<strong>Tu mensaje:</strong> Texto personalizado
```

### Cambiar colores:
Edita `PopupPermissionModal.css` o `PopupHintBanner.css`:
```css
background: linear-gradient(135deg, #tu-color-1, #tu-color-2);
```

### Desactivar el banner automático:
En `App.jsx`, comenta o elimina:
```jsx
{/* <PopupHintBanner /> */}
```

## Soporte

El sistema funciona en:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## Notas Adicionales

- El banner se muestra solo una vez por dispositivo (localStorage)
- El modal se activa automáticamente cuando se detecta un bloqueo
- Los estilos son responsive y funcionan en móviles
- Las instrucciones cambian según el navegador detectado
