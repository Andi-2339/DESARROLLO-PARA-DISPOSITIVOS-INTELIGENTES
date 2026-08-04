# Documentación de Seguridad (Evaluación 2)

## 1. Validación de event.origin en BroadcastChannel
Para la comunicación entre ventanas de la PWA o sincronización de estados locales, se utiliza `BroadcastChannel`. Para evitar ataques de Cross-Site Scripting (XSS) y suplantación, siempre se debe validar el origen del mensaje:

```javascript
const channel = new BroadcastChannel('anime_sync_channel');
channel.onmessage = (event) => {
  // Validación de seguridad CRÍTICA
  if (event.origin !== 'https://tudominio.com' && event.origin !== 'http://localhost:4200') {
    console.warn('Origen no confiable rechazado:', event.origin);
    return;
  }
  // Procesar mensaje
};
```

## 2. Cumplimiento de la LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)

**Datos personales manejados:** 
- Ritmo Cardíaco (BPM). Considerado como **Dato Sensible** según la ley.
- Nivel de Hype (Estadística de uso).
- Historial de episodios de anime consumidos.

**Base legal documentada:** Consentimiento expreso del titular. Al tratarse de datos sensibles (salud/fisiológicos), el usuario debe aceptar explícitamente los términos al conectar la aplicación de Wear OS con el Teléfono mediante una casilla de verificación y firma electrónica o PIN.

## 3. Aviso de Privacidad (Resumen)
- **Responsable:** [Nombre del Alumno / Equipo ANIME NEWS].
- **Datos recabados:** Ritmo cardíaco, preferencias de anime, hábitos de visualización.
- **Finalidad:** Proporcionar una experiencia inmersiva e interactiva ("Otaku Tracker") recomendando contenido basado en la reacción emocional del usuario, así como emitir alertas preventivas de salud visual o cardíaca.
- **Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición):** El usuario puede ejercer sus derechos enviando un correo a `privacidad@animenews.com` solicitando la eliminación completa de su perfil y estadísticas de sensores.

## 4. Plan de Retención de Datos
- **Almacenamiento:** Los datos biométricos (BPM) se procesan localmente en el dispositivo (Edge Computing) y **no se envían a la nube** de forma persistente.
- **Duración:** Las métricas de sesión se conservan en la memoria RAM del teléfono durante la conexión BLE activa. Al desconectar o cerrar la aplicación, los datos crudos se **eliminan inmediatamente**. Solo se conserva un resumen (promedios) en la base de datos local (SQLite/Hive) por 30 días para mostrar el historial. Pasados los 30 días, se aplica purga automática.

## 5. Checklist de Seguridad PWA
- [x] **CSP (Content Security Policy):** Implementada en `index.html` para restringir `default-src`, `connect-src` (solo API de Jikan), `media-src` y `img-src`.
- [x] **HTTPS:** Requisito forzado para el registro del Service Worker en producción (Vercel/Firebase).
- [x] **SRI (Subresource Integrity):** Integridad generada automáticamente en los bundles de Angular por el CLI.
- [x] **Validación de Origin:** Aplicada en todos los listeners locales y peticiones a la API.
- [x] **Gestión de Secretos:** Archivos `.env`, `*.jks` y API keys incluidos en `.gitignore` (ningún secreto en commits).
