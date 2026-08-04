# Anime News Hub — Ecosistema de 3 Dispositivos

Proyecto final para la materia Desarrollo de Aplicaciones Móviles.
Ecosistema completo que incluye **Wear OS**, **Teléfono Android**, y **Smart TV (PWA)**, sincronizados en tiempo real para trackear métricas de "Hype" mientras se ven noticias de Anime.

## 🚀 Requisitos de Ejecución (Setup)

### 1. PWA Smart TV (Angular 18)
```bash
# En la raíz del repositorio:
npm install
npm run start # O ng serve
```
La aplicación correrá en `http://localhost:4200`.
- **Vista Web/Phone:** `http://localhost:4200/`
- **Vista Smart TV (10-foot UI):** `http://localhost:4200/tv` (Usar teclas direccionales + Enter para simular D-Pad).

### 2. Phone App (Flutter)
```bash
cd phone_app
flutter pub get
flutter run
```
Esta aplicación sirve como puente BLE, consumiendo datos del Wearable y mostrándolos en pantalla junto con noticias de la API Jikan. Además, publica los datos a Supabase Realtime para que la TV los consuma.

### 3. Wearable App (Flutter Wear OS)
```bash
cd wearable_app
flutter pub get
flutter run
```
Esta aplicación corre en el emulador Wear OS. Emite publicidad BLE (GATT) simulando datos de ritmo cardíaco, nivel de hype y episodios vistos.

---

## 🏗️ Arquitectura y Tecnologías

- **Angular 18 (PWA):** Aplicación cliente principal. Offline-first usando Angular Service Worker (`ngsw`). 
- **Flutter 3.22+:** Desarrollo multiplataforma nativo para el teléfono móvil y el reloj inteligente.
- **Supabase Realtime (WSS):** Broker de sincronización con latencia ultrabaja (<2s) entre el teléfono y la TV.
- **Bluetooth Low Energy (BLE):** Comunicación simulada/GATT entre el reloj y el teléfono mediante `flutter_blue_plus` y `flutter_ble_peripheral`.
- **Jikan API (V4):** Consumo de noticias de anime (REST API).

---

## 🔒 Documentación y Pruebas

Toda la documentación requerida para la evaluación se encuentra en el directorio `docs/`:
- [x] **[docs/seguridad.md](docs/seguridad.md):** Políticas de seguridad, LFPDPPP, retención de datos y validaciones.
- [x] **[docs/plan-pruebas.md](docs/plan-pruebas.md):** Plan de pruebas e-2-e con 10 casos cubriendo todo el ecosistema.
- [x] **[docs/reporte-configuracion.md](docs/reporte-configuracion.md):** SDKs, dependencias y configuración de emuladores (Troubleshooting).
- [x] **[docs/evaluacion2/rubrica-sa.md](docs/evaluacion2/rubrica-sa.md):** Evidencia del cumplimiento de requisitos SA.

---

**Desarrollado para el Noveno Cuatrimestre.**