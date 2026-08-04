# Práctica 1 y 2: Display Responsivo

## Diseño adaptativo para múltiples dispositivos

**Proyecto:** ANIME NEWS  
**Fecha:** Julio 2026  

---

## 1. Dispositivos Objetivo

| Dispositivo | Resolución | Breakpoint CSS |
|-------------|-----------|----------------|
| **Wearable** (smartwatch) | ≤280px | `max-width: 280px` |
| **Mobile pequeño** | 281-480px | `max-width: 480px` |
| **Mobile** | 481-768px | `max-width: 768px` |
| **Tablet** | 769-1024px | `max-width: 1024px` |
| **Desktop** | 1025-1919px | Default (sin media query) |
| **Smart TV** | ≥1920px | `min-width: 1920px` |

---

## 2. Características por Dispositivo

### 2.1 Wearable (≤280px)
- Barra de búsqueda oculta
- Logo minimizado (50px)
- Navegación compacta con texto reducido
- Slider de height reducido (120px)
- Cards apiladas verticalmente con imágenes pequeñas
- Subtexto del slider oculto

### 2.2 Mobile (≤768px)
- Layout de una columna
- Cards verticales (imagen arriba, texto abajo)
- Header con elementos apilados
- Navegación con wrap
- Footer de una columna
- Landing con botones verticales
- Slider de 250px de altura

### 2.3 Tablet (≤1024px)
- Content wrapper en columna
- Sidebar debajo del contenido principal
- Cards en columna
- Header adaptado
- Footer en una columna

### 2.4 Desktop (1025-1919px)
- Layout por defecto del sitio
- Content wrapper con sidebar lateral
- Cards horizontales grandes
- Navegación horizontal completa

### 2.5 Smart TV (≥1920px)
- Fuente base aumentada a 18px
- Content wrapper ampliado (max-width: 1800px)
- Imágenes de cards más grandes (550x350px)
- Slider de 600px de altura
- Títulos escalados
- Mayor padding en footer

---

## 3. Contenido Dinámico

### 3.1 Popups
- **Popup promocional:** Se muestra 3 segundos después de entrar al Home
- Almacenamiento en `sessionStorage` para no repetir en la misma sesión
- Diseño modal con overlay y animación de entrada
- Botón de cierre y acciones (Ver Noticias / Más Tarde)

### 3.2 Banners Digitales
- **Banner estacional:** Se muestra en la parte superior del sitio
- Cambia automáticamente según la temporada del año
- Temas: Verano, Otoño, Halloween, Navidad, Año Nuevo, San Valentín, Primavera
- Animación de entrada (slide-in desde arriba)
- Efecto glow en el texto del banner

---

## 4. Implementación Técnica

### Archivo principal de estilos: `src/styles.css`
- Media queries organizadas de mayor a menor breakpoint
- Uso de CSS custom properties para colores temáticos
- Transiciones suaves en cambios de layout

### Componentes clave:
- `PopupBannerComponent` — Gestiona popups y banners
- `SeasonalThemeService` — Detecta la fecha y aplica temas
- Media queries en `styles.css` — Responsividad completa

### Flujo de detección de pantalla:
```
CSS Media Queries → Detectan tamaño de viewport
                  → Aplican estilos específicos por breakpoint
                  → Se adaptan en tiempo real al redimensionar
```

---

## 5. Evidencias

Las capturas de pantalla del sitio en diferentes resoluciones se pueden obtener usando las herramientas de desarrollador del navegador (F12 → Toggle device toolbar) con los siguientes presets:

- Wearable: 280 × 280px
- iPhone SE: 375 × 667px  
- iPad: 768 × 1024px
- Desktop: 1440 × 900px
- Smart TV: 1920 × 1080px
