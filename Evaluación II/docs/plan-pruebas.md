# Plan y Reporte de Pruebas — Ecosistema Anime News

## Resumen de Casos de Prueba (Mínimo 10 casos - Requisito SA.5)

| ID | Componente | Descripción de la Prueba | Resultado Esperado | Estado |
|---|---|---|---|:---:|
| **P2.5** | Phone App | **API Datos Reales:** La app del teléfono debe consumir y mostrar el Top 5 de animes desde Jikan API. Manejar el error si no hay red usando datos fallback. | Lista de 5 animes con su score cargados en el Dashboard. | [ ] |
| **P2.6** | Phone/Wearable | **BLE NOTIFY:** Los datos del wearable (HeartRate, Hype, Eps) llegan al teléfono en tiempo real y se parsean correctamente (o se simulan si no hay BLE disponible). | La UI del teléfono se actualiza cada segundo coincidiendo con el estado biométrico. | [ ] |
| **P3.1** | Smart TV | **D-Pad Completo:** Usando las teclas del teclado (ArrowUp, ArrowDown, ArrowLeft, ArrowRight), el foco debe moverse entre los 4 elementos del grid sin salir de los límites. | El borde dorado y el efecto glow sigue correctamente la navegación en todas direcciones. | [ ] |
| **P3.2** | Smart TV | **Selección Enter/OK:** Al presionar Enter sobre un anime focalizado en el grid, el fondo multimedia (imagen de la serie) debe actualizarse. | El background-image cambia suavemente a la serie seleccionada. | [ ] |
| **P3.3** | Smart TV | **Modo Offline (SW):** Al desactivar la red (DevTools -> Offline) y recargar, el Service Worker debe servir la estructura básica de la app desde caché. | La app carga sin error de conexión, manteniendo el layout base de Smart TV. | [ ] |
| **P3.4** | Phone/TV | **Sincronización Tiempo Real:** Un cambio en el estado del teléfono (ej. pulso sube, hype sube) debe reflejarse en la pantalla de la Smart TV. | El tiempo de propagación a través de Supabase es menor a 2 segundos. | [ ] |
| **P4.1** | Phone/TV | **Alerta Crítica:** Cuando el HypeLevel supere 90% o el HeartRate 120BPM en el teléfono, se debe mostrar una alerta crítica. | Alerta visual roja y visible de "¡ALERTA CRÍTICA!" tanto en teléfono como en la PWA Smart TV. | [ ] |
| **P4.2** | Phone App | **Desconexión BLE:** Si el proceso BLE se interrumpe, la app del teléfono no debe crashear y debe mostrar estado de error o desconexión. | La UI actualiza de "Conectado" a "Buscando/Error/Desconectado". | [ ] |
| **P4.3** | Phone App | **Estado Conexión Visible:** La UI debe reflejar el estado actual del proceso de conexión (Buscando -> Conectando -> Conectado). | Indicador verde para conectado, azul o rojo para buscando/error. | [ ] |
| **P4.4** | Smart TV | **Seguridad (CSP):** El navegador debe aplicar la Content Security Policy definida y permitir la conexión con WSS (Supabase Realtime) e imágenes externas (MAL). | No deben existir errores de restricción CSP en la consola (DevTools). | [ ] |

---

## Evidencias Fotográficas

*(Incluir aquí 5 screenshots mínimos con los 3 dispositivos funcionando, alertas críticas visibles y el modo TV activo).*

- [Captura 1: Teléfono y Wearable mostrando datos sincronizados]
- [Captura 2: PWA Smart TV con el foco D-Pad activo en el primer anime]
- [Captura 3: Cambio de fondo multimedia tras presionar Enter]
- [Captura 4: Alerta Crítica (Hype > 90) simultánea en Teléfono y TV]
- [Captura 5: App cargando en Modo Offline (Network First / Cache Fallback)]

---

### Aprobación

Documento firmado por el alumno:  
**_______________________________________**  
**Fecha:** 03 de Agosto de 2026
