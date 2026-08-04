# Plan y Reporte de Pruebas (Evaluación 2)

## Casos de Prueba

| ID | Componente | Descripción de la Prueba | Resultado Esperado | Estado |
|---|---|---|---|---|
| **01** | App Teléfono (P2.5) | **Prueba API:** La app teléfono arranca y hace GET a la API de Anime News. | Se muestra una lista de animes reales. Si no hay red, muestra lista local o error. | Pendiente |
| **02** | App Reloj (Wear OS) | Simulación de sensores inicia al presionar el botón "Play". | Datos (BPM, Hype) cambian cada segundo en pantalla local. | Pendiente |
| **03** | BLE Escaneo | App Teléfono inicia búsqueda de dispositivos cercanos. | Encuentra el Wearable por UUID o nombre y cambia estado a "Conectando". | Pendiente |
| **04** | BLE (P2.6) | **Prueba BLE NOTIFY:** Wearable y Teléfono conectados. | Los datos del reloj se reflejan en tiempo real en la UI del teléfono. | Pendiente |
| **05** | App Teléfono | Alerta Crítica (Umbral). Ritmo supera 120 o Hype > 90. | Aparece recuadro rojo visible de alerta crítica en el Dashboard. | Pendiente |
| **06** | PWA Smart TV | **Prueba modo offline:** Se apaga la red y se recarga la PWA. | Service Worker sirve la app estructurada desde caché sin mostrar "No Internet". | Pendiente |
| **07** | PWA Smart TV | **Prueba D-pad:** Navegación por grid 2x2. | Las teclas Arrow(Up/Down/Left/Right) mueven el borde dorado lógicamente sin romper la UI. | Pendiente |
| **08** | PWA Smart TV | Selección D-pad. Pulsar tecla `Enter`. | La imagen/recurso multimedia de fondo cambia según la tarjeta seleccionada. | Pendiente |
| **09** | Sincronización | Sincronización Teléfono -> TV (Simulada/Real). | Cambio o alerta en teléfono se refleja en la TV en < 2 segundos. | Pendiente |
| **10** | Ecosistema | Los 3 dispositivos activos simultáneamente por 5 minutos sin crashear. | Ninguna app se cierra, la conexión BLE se mantiene estable. | Pendiente |
| **11** | App Teléfono | Desconexión abrupta del Wearable (Apagar emulador/Bluetooth). | App no crashea, muestra mensaje limpio "Desconectado". | Pendiente |

---

## Evidencias Fotográficas

*(Pegar aquí los screenshots solicitados)*
- [ ] Evidencia 1: Emulador Wear OS generando datos.
- [ ] Evidencia 2: App Flutter Teléfono conectada y mostrando datos de la API.
- [ ] Evidencia 3: PWA Smart TV corriendo en navegador (1080p).
- [ ] Evidencia 4: Disparador de Alerta Crítica en teléfono.
- [ ] Evidencia 5: Navegación D-pad demostrada (foco en TV).

---
**Firma del Alumno:** __________________________
**Fecha:** _____________________________________
