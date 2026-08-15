# Plan y Reporte de Pruebas (Evaluación 2)

## Casos de Prueba

| ID | Caso de Prueba | Entrada / Acción | Resultado Esperado | Resultado Real |
|---|---|---|---|---|
| **01** | API P2.5 (Excepciones) | Iniciar la aplicación móvil con el dispositivo desconectado de internet (Wi-Fi/Datos apagados). | La aplicación captura la excepción y muestra una alerta/interfaz amigable sin cerrarse inesperadamente. | Exitoso. Se carga lista local de respaldo. |
| **02** | BLE NOTIFY P2.6 | El wearable (Wear OS) genera y transmite datos de sensores por BLE (o Supabase simulado). | El teléfono móvil recibe y renderiza los datos en la interfaz en tiempo real. | Exitoso. Datos reflejados instantáneamente en pantalla móvil. |
| **03** | D-pad PWA (Navegación) | Presionar teclas direccionales (Arriba, Abajo, Izquierda, Derecha) y tecla Enter en la Smart TV. | El foco visual (borde resaltado) se mueve lógicamente y Enter actualiza el contenido de la tarjeta activa. | Exitoso. La navegación responde correctamente a las entradas. |
| **04** | Modo Offline (Service Worker) | Simular estado "Offline" desde la pestaña Network de Chrome DevTools y recargar la página. | El Service Worker intercepta la petición y sirve la caché local; la estructura de la UI se mantiene visible. | Exitoso. La UI carga desde caché sin mostrar el error del navegador. |
| **05** | Sincronización Móvil-TV | Ejecutar una acción de cambio de estado en el teléfono móvil. | La pantalla de la Smart TV refleja el cambio con una latencia menor a los 2 segundos. | Exitoso. Tiempo registrado: **1.15 segundos**. |
| **06** | Límite de Grid (2x2) | Intentar navegar (con D-pad) hacia la derecha o abajo estando en el último elemento del borde de la cuadrícula. | El foco visual se mantiene en el elemento actual, la aplicación no lanza errores de desbordamiento. | Exitoso. Comportamiento de grid estable. |
| **07** | UI de Conexión BLE | Iniciar proceso de escaneo y emparejamiento desde el móvil. | La interfaz transiciona claramente por los estados: "Buscando", "Conectado", o "Error". | Exitoso. Estados visuales actualizados correctamente. |
| **08** | Desconexión Inesperada | Apagar el Bluetooth del wearable o forzar el cierre de su app durante una transmisión activa. | La app del teléfono no sufre crash, maneja la desconexión limpia y notifica al usuario en la pantalla. | Exitoso. Manejo de excepción validado. |
| **09** | Control de Sensores | Presionar el botón de Iniciar/Detener en la pantalla táctil de Wear OS. | El flujo de datos BLE hacia el móvil comienza o se interrumpe de forma inmediata según el estado del botón. | Exitoso. Control total de la transmisión desde el reloj. |
| **10** | Ecosistema 3 Dispositivos | Mantener teléfono, wearable y Smart TV interactuando y transmitiendo datos continuamente por 5 minutos. | Ninguno de los dispositivos presenta congelamientos, desconexiones aleatorias o caídas de frames. | Exitoso. Rendimiento estable durante los 5 minutos de prueba. |

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
