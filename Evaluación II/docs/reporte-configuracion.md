# Reporte de Configuración del Entorno — Ecosistema Anime News

## Requisito SA.6 — Configuración de Herramientas y Emuladores

Este documento certifica las versiones de software, emuladores y configuraciones específicas utilizadas para compilar y ejecutar el ecosistema de 3 dispositivos (Teléfono, Wearable, Smart TV PWA).

---

### A. Versiones de Software y Herramientas (SA.6.A)

| Herramienta | Versión | Uso en el Proyecto |
|---|---|---|
| **Flutter SDK** | 3.22.0+ (o superior) | Compilación y framework de UI para Phone App y Wearable App. |
| **Dart SDK** | 3.4.0+ (o superior) | Lenguaje base para las aplicaciones Flutter. |
| **Angular CLI** | 18.0.0+ | Generación, servidor de desarrollo y compilación de la PWA. |
| **Node.js** | 20.x LTS | Entorno de ejecución para Angular CLI. |
| **Android Studio** | Koala Feature Drop (2024.1.1+) | Gestión de emuladores (AVDs), SDK de Android y plataforma. |
| **Visual Studio Code** | 1.90+ | Editor principal (IDE) para el desarrollo completo. |

**Plugins VS Code Principales:**
- Flutter & Dart (Dart Code)
- Angular Language Service
- Tailwind CSS IntelliSense (Opcional)
- Prettier - Code formatter

**Dependencias Críticas (Flutter):**
- `flutter_blue_plus: ^1.35.3` (Phone App - Cliente BLE)
- `flutter_ble_peripheral: ^3.0.0` (Wearable App - GATT Server)
- `supabase_flutter: ^2.5.3` (Sincronización en tiempo real)
- `provider: ^6.1.2` (Gestión de estado local)

**Dependencias Críticas (Angular):**
- `@angular/service-worker` (PWA Offline)
- `@supabase/supabase-js: ^2.43.4` (Base de datos y Realtime WSS)

---

### B. Emuladores y Dispositivos de Prueba (SA.6.B)

#### 1. Teléfono Móvil (Phone App)
- **Perfil de Hardware:** Pixel 7 o similar (Phone)
- **API Level:** 34 o 35 (Android 14+)
- **System Image:** Google APIs o Google Play Intel x86_64 Atom System Image
- **Nota de Troubleshooting:** Los emuladores de Android no soportan la comunicación de hardware BLE entre sí. El código implementa las llamadas a `flutter_blue_plus`, pero mediante un bloque try/catch detecta la falta de soporte y hace fallback a una simulación de conexión para la demostración y evaluación de la UI.

#### 2. Dispositivo Wearable (Wear OS App)
- **Perfil de Hardware:** Wear OS Large Round (API 33 o superior)
- **System Image:** Wear OS 4 (Android 13) Intel x86_64
- **Nota de Troubleshooting:** Para que el SDK de Wear OS reaccione correctamente, se aseguraron dependencias exclusivas y un `scaffoldBackgroundColor` negro, optimizado para pantallas OLED de relojes.

#### 3. Smart TV (PWA)
- **Entorno de Ejecución:** Google Chrome (Desktop)
- **Simulación Smart TV:** 
  - Chrome DevTools > Device Mode.
  - Resolución forzada a **1920 x 1080** (Full HD 10-foot UI).
  - Zoom al 100%.
- **Navegación:** Uso estricto de teclado direccional (Arrow Keys) y tecla Enter para simular el control remoto (D-Pad).

---

### C. Troubleshooting Común Encontrado (Bitácora)

1. **Problema con GATT en Emuladores:** Al principio el teléfono no descubría los servicios del Wearable.
   *Solución:* Se confirmó que es una limitante del emulador de Android Studio. Se implementó una lógica de fallback de simulación en `main.dart` para que la app no colapse y siga cumpliendo con la representación de datos para la presentación del proyecto.
   
2. **Error CORS con Supabase Realtime:** Al cambiar el `index.html` del entorno de la Smart TV, WebSocket fallaba por políticas de seguridad.
   *Solución:* Se actualizó el Content-Security-Policy (CSP) agregando explícitamente `wss://*.supabase.co` en la directiva `connect-src`.

3. **Safe Zone Invasivo en PWA TV:** El texto rozaba el borde en resoluciones menores.
   *Solución:* Se forzó un layout rígido `width: 1920px; height: 1080px; overflow: hidden;` en el contenedor principal de la Smart TV, con un padding de 5% (54px y 96px) para simular el comportamiento exacto de un WebOS/Tizen.

---
*(Capturas de pantalla del entorno de desarrollo y configuración del SDK recomendadas a continuación).*
