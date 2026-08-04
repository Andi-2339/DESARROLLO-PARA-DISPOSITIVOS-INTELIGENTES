# Prácticas 9 y 10: Eventos JavaScript y Actualización de UI

## Documentación Técnica

**Proyecto:** ANIME NEWS  
**Fecha:** Julio 2026  

---

## 1. Actualización de Temporada (Evento de Tiempo)

Como parte de la estrategia de "Git pensado para la actualización de temporada", el sitio incluye un motor de detección estacional impulsado por eventos temporales en JavaScript (mediante la clase `Date`).

### 1.1 Lógica de Implementación (`SeasonalThemeService`)
El código se encarga de instanciar un objeto de fecha y extraer el mes y día, para luego determinar qué tema aplicar.

```typescript
// Extracción de la fecha del sistema
const now = new Date();
const month = now.getMonth(); // Enero = 0, Diciembre = 11
const day = now.getDate();
```

### 1.2 Detalle de la Actualización
Al entrar en vigor una nueva temporada:
1. **Detección Automática:** No se requiere empujar código nuevo; el cliente evalúa localmente si entra en un rango temporal válido (ej. Verano: Junio-Agosto).
2. **Aplicación al DOM:** El servicio limpia clases anteriores del `<body>` y aplica la nueva (ej. `.theme-summer`).
3. **Casos Especiales:** Validaciones de día/mes para eventos cortos. Por ejemplo, San Valentín se evalúa como `month === 1 && day <= 14`.

### 1.3 Mantenimiento (Flujo Git)
Las actualizaciones a los estilos de temporada o nuevos textos promocionales se trabajan en ramas independientes (ej. `feature/halloween-theme`) y se unen a `develop` antes de que comience el mes objetivo. La lógica local de JS garantiza que los estilos estén inactivos hasta que llegue la fecha, permitiendo despliegues adelantados.

---

## 2. Evento "Destacar Contenido mediante el Puntero"

Se implementó una experiencia de usuario enriquecida en la vista principal (`HomeComponent`) mediante eventos de ratón que modifican el DOM.

### 2.1 Lógica del Evento
Se utilizó el par de eventos `mouseenter` y `mouseleave` para rastrear con precisión la posición del puntero sobre elementos interactivos (las tarjetas de noticias).

**TypeScript:**
```typescript
highlightedCard = signal<number | null>(null);

onCardHover(index: number) {
  this.highlightedCard.set(index);
}

onCardLeave() {
  this.highlightedCard.set(null);
}
```

**HTML:**
```html
<div class="card card-hover-highlight"
     [class.card-highlighted]="highlightedCard() === index"
     (mouseenter)="onCardHover(index)"
     (mouseleave)="onCardLeave()">
    <!-- ... -->
    <!-- Elemento DOM oculto que aparece al hacer hover -->
    <div class="card-hover-info" *ngIf="highlightedCard() === index">
      <span class="hover-tag">🔥 Trending</span>
    </div>
</div>
```

### 2.2 Reacción Visual en la UI
Cuando ocurre el evento:
1. **Transformación Espacial:** La tarjeta se eleva en el eje Y (`translateY(-8px)`) y escala ligeramente (`scale(1.03)`).
2. **Resplandor:** Los bordes y la sombra exterior se iluminan con tonos Cyan y Púrpura (Efecto Neón).
3. **Inyección de Contenido:** El DOM añade dinámicamente un bloque de información oculta (tags promocionales y fechas).

### 2.3 Grabación de Evidencia
*(Se adjunta grabación de pantalla "evento_destacar_hover.webm/mp4" en la carpeta de evidencias demostrando la interacción fluida con el cursor).*
