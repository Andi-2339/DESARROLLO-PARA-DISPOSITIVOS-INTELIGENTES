# Prácticas 7 y 8: Menú por Eventos y Temas Calendarizados

## Interacciones Avanzadas y Personalización Dinámica

**Proyecto:** ANIME NEWS  
**Fecha:** Julio 2026  

---

## 1. Menú Basado en Eventos (Hover)

Se implementó un sistema de menús desplegables (dropdowns) en la barra de navegación principal que reacciona a los eventos del puntero del usuario.

### 1.1 Diseño e Interacción
- **Evento disparador:** `mouseenter` sobre el elemento principal (`<li>`)
- **Evento de cierre:** `mouseleave` sobre el área combinada del elemento y su menú
- **Feedback visual:** Animación de aparición suave (`opacity` y `transform: translateY`), cambio de color en hover
- **Navegación:** Los elementos dentro del dropdown son enlaces funcionales y accesibles

### 1.2 Implementación Técnica (Angular)
En el archivo `header.ts`:
```typescript
activeDropdown = signal<string | null>(null);

openDropdown(name: string) {
  this.activeDropdown.set(name);
}

closeDropdown() {
  this.activeDropdown.set(null);
}
```

En `header.html`:
```html
<li class="nav-dropdown"
    (mouseenter)="openDropdown('noticias')"
    (mouseleave)="closeDropdown()">
  <a routerLink="/noticias" routerLinkActive="active">Noticias ▾</a>
  @if (activeDropdown() === 'noticias') {
    <div class="dropdown-menu">
      <a routerLink="/noticias" (click)="closeDropdown()">📰 Últimas Noticias</a>
      <!-- ... -->
    </div>
  }
</li>
```

---

## 2. Interfaz Dinámica por Calendario

El sitio adapta su apariencia visual basándose en la fecha actual del sistema del usuario, brindando una experiencia personalizada y fresca a lo largo del año.

### 2.1 Servicio de Temas Estacionales (`SeasonalThemeService`)
Se creó un servicio en Angular que se ejecuta al cargar la aplicación y detecta el mes y día actuales.

```typescript
// Ejemplo de detección (extracto)
private detectTheme(): SeasonalTheme {
  const now = new Date();
  const month = now.getMonth(); // 0 = Enero, 11 = Diciembre

  if (month === 9) { // Octubre
    return { name: 'Halloween', cssClass: 'theme-halloween', bannerText: '🎃 Especial...', bannerIcon: '🎃' };
  }
  // ... otras validaciones (Navidad, Verano, Primavera, etc.)
}
```

### 2.2 Temas Implementados
Cada tema aplica una clase CSS global al `<body>` que altera las variables de color, gradientes de fondo y efectos luminosos de toda la aplicación.

| Temporada / Evento | Mes | Efectos Visuales |
|--------------------|-----|------------------|
| **Halloween** | Octubre | Fondo naranja oscuro/negro, luces ámbar, banner de terror |
| **Navidad** | Diciembre | Fondo verde oscuro, luces rojas/doradas, banner festivo |
| **Año Nuevo** | Enero (1-15) | Luces vibrantes, banner de celebración |
| **San Valentín** | Febrero (1-14) | Luces fucsia y rosa profundo |
| **Primavera** | Marzo-Mayo | Tonos florales (rosa, verde suave) |
| **Verano** | Junio-Agosto | Tonos cálidos (amarillo, naranja brillante) |
| **Otoño** | Septiembre, Noviembre | Tonos tierra y cobrizos |
| **Por defecto** | Resto del año | Estética Cyberpunk (Cian, Magenta, Púrpura) |

### 2.3 Aplicación Global
El `App Component` inyecta el servicio y aplica el tema al inicializar la aplicación.

```typescript
// app.ts
ngOnInit() {
  this.themeService.applyTheme();
}
```

---

## 3. Integración Visual (Popups y Banners)

El tema estacional no solo cambia el color de fondo, sino que inyecta dinámicamente texto e íconos en el `PopupBannerComponent` de la cabecera.

- El banner estacional adopta la clase del tema (ej: `.promo-banner.theme-halloween`) cambiando su gradiente.
- El texto del banner es proveído por el servicio de temas (`themeService.currentTheme().bannerText`).

## 4. Evidencias

*(Las capturas de pantalla de los diferentes temas se pueden generar forzando la fecha del sistema operativo o utilizando el método `forceTheme()` del servicio durante el desarrollo).*
