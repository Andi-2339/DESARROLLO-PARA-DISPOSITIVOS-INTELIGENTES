# Documentación de Seguridad — Ecosistema Anime News

## 1. Validación de event.origin en BroadcastChannel
Para la comunicación entre ventanas de la misma PWA, es vital asegurar que los mensajes recibidos provienen de nuestro propio origen. 

**Implementación documentada:**
Al usar APIs como `postMessage` o `BroadcastChannel`, siempre se debe verificar el origen antes de procesar el evento.

```typescript
const channel = new BroadcastChannel('tv-sync');
channel.onmessage = (event) => {
  // Validación de seguridad (SA.4)
  if (event.origin !== window.location.origin) {
    console.error('Origen de mensaje no confiable:', event.origin);
    return;
  }
  // Procesar mensaje
};
```
*Nota: En nuestra arquitectura final, la sincronización entre dispositivos físicos distintos (Teléfono y TV) se realiza mediante **Supabase Realtime** sobre WSS (WebSockets seguros), autenticados mediante Row Level Security (RLS).*

---

## 2. Cumplimiento LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)

### Identificación de Datos y Base Legal
| Tipo de Dato | Finalidad | Base Legal (LFPDPPP) |
|---|---|---|
| **Correo Electrónico** | Autenticación y recuperación de cuenta | Consentimiento del titular |
| **Ritmo Cardíaco (BPM)** | Funcionalidad core de métricas otaku | Consentimiento expreso (Datos Sensibles) |
| **Identificadores (UUIDs)** | Sincronización entre dispositivos | Interés legítimo / Ejecución de servicio |

---

## 3. Aviso de Privacidad

**Responsable:** Anime News Corporation S.A. de C.V.  
**Domicilio:** Calle Falsa 123, Ciudad de México.  

**Finalidad del Tratamiento de Datos:**
Los datos recabados (correo electrónico, ritmo cardíaco) se utilizarán exclusiva y estrictamente para proveer los servicios de la plataforma Anime News Hub, permitiendo la sincronización de estados emocionales (Hype) entre su dispositivo Wearable, su Teléfono y su Smart TV.

**Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición):**
Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal si está desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). 
Para ejercer estos derechos, puede enviar un correo a **privacidad@animenews.com**.

---

## 4. Plan de Retención y Eliminación de Datos

| Tipo de Dato | Tiempo de Retención | Método de Eliminación |
|---|---|---|
| **Datos biométricos (BPM, Hype)** | Solo durante la sesión activa (transitorios) | Purga automática en Supabase tras 24h o al desconectar el BLE. |
| **Cuentas inactivas** | 12 meses tras el último login | Eliminación lógica (soft delete) automatizada; purga física a los 24 meses. |
| **Logs de auditoría** | 5 años | Archivo en almacenamiento frío cifrado; posterior destrucción segura. |

---

## 5. Checklist de Seguridad PWA

- [x] **Content Security Policy (CSP):** Implementado en `index.html`. Previene XSS restringiendo las fuentes permitidas para scripts, imágenes y conexiones (`connect-src`).
- [x] **HTTPS Obligatorio:** La PWA solo se sirve a través de HTTPS (alojada en Vercel) y las conexiones a Supabase y Jikan API utilizan esquemas seguros (`https://`, `wss://`).
- [x] **Subresource Integrity (SRI):** Se recomienda aplicar integridad en los scripts externos importados en el build final.
- [x] **Validación de Origin:** Documentada y estipulada para cualquier uso futuro de `BroadcastChannel` o `postMessage`.
- [x] **API Keys Ocultas:** La clave anónima de Supabase se utiliza para conexiones frontend, pero las operaciones sensibles están protegidas por políticas RLS en la base de datos. `.env` y `*.jks` están excluidos mediante `.gitignore`.
