# Reporte de Configuración de Herramientas y Emuladores (Evaluación 2)

## 1. Configuración de Herramientas (SA.6.A)

**SDKs Principales:**
- **Flutter SDK:** Versión 3.19.x (o superior). `flutter --version` ejecutado con éxito.
- **Dart SDK:** Versión 3.3.x (incluida en Flutter).

**Entornos de Desarrollo (IDEs):**
- **Android Studio:** Hedgehog | 2023.1.1 (o superior).
  - *Plugins Instalados:* Flutter, Dart.
- **Visual Studio Code:** Versión 1.86.x (para el proyecto Angular PWA).
  - *Extensiones:* Angular Language Service, Prettier, Dart/Flutter.

**Dependencias Clave (pubspec.yaml):**
- `flutter_blue_plus`: ^1.15.0 (Manejo BLE Central en teléfono).
- `flutter_ble_peripheral`: ^2.1.1 (Manejo BLE Periférico en reloj).
- `provider`: ^6.1.1 (Gestión de estado).
- `http`: ^1.2.0 (Consumo API Anime News).

**Pasos de Instalación Reproducibles:**
1. Clonar el repositorio.
2. Navegar a `wearable_app/` y ejecutar `flutter pub get`. Compilar en emulador Wear OS.
3. Navegar a `phone_app/` y ejecutar `flutter pub get`. Compilar en emulador móvil.
4. En la raíz, ejecutar `npm install` y luego `ng serve` para lanzar la PWA web.

---

## 2. Configuración de Emuladores (SA.6.B)

**Emulador Teléfono (App Central):**
- **Modelo:** Pixel 6 Pro (o similar).
- **API Level:** 33 o 34 (Requerido para nuevos permisos de Bluetooth `BLUETOOTH_SCAN`/`CONNECT`).
- **RAM Asignada:** 2048 MB.
- **VM Heap:** 256 MB.

**Emulador Wear OS (Reloj Inteligente):**
- **Forma:** Round (Wear OS Small Round API 30).
- **API Level:** 30 (Android 11).
- **RAM Asignada:** 1024 MB.
- **Nota técnica:** Se requiere emparejar los emuladores o testear con dispositivo físico, ya que la emulación BLE entre dos AVDs nativos tiene limitaciones.

**Configuración Smart TV (Chrome DevTools):**
- **Resolución:** 1920 x 1080 (HD).
- **Pixel Ratio:** 1.0.
- **User Agent:** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager` (Configurado vía Custom Device en DevTools).

---

## 3. Troubleshooting Documentado

**Problema 1:** Conflictos de permisos en Android 12+ al usar BLE.
**Solución:** Se tuvo que modificar el `AndroidManifest.xml` agregando específicamente `android.permission.BLUETOOTH_SCAN` y `BLUETOOTH_CONNECT`, ya que los permisos legados de `BLUETOOTH` y `BLUETOOTH_ADMIN` ya no son suficientes para Android 12 y superior.

**Problema 2:** Error instalando `@angular/pwa` por conflicto de dependencias Peer (Angular core v21).
**Solución:** Se instalaron las dependencias forzando compatibilidad mediante el flag `--legacy-peer-deps` en `npm`, permitiendo a Angular CLI configurar el `manifest.webmanifest` y el `ngsw-config.json` exitosamente.
