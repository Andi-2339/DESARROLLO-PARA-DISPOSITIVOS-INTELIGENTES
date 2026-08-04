# Prácticas 5 y 6: Aplicación del DOM en Sitios Web

## Administrador de Tareas — Manipulación del DOM

**Proyecto:** ANIME NEWS  
**Fecha:** Julio 2026  

---

## 1. Objetivo

Desarrollar una página web dinámica que demuestre el uso del DOM (Document Object Model) para seleccionar, modificar, crear y actualizar elementos de la interfaz mediante eventos generados por el usuario.

---

## 2. Funcionalidades Implementadas

### 2.1 Creación de Elementos (createElement / appendChild)
- Al enviar el formulario de nueva tarea, se crea un nuevo elemento `<div>` con la estructura completa de la tarea
- Angular maneja esto internamente con su sistema de templates, pero la lógica es equivalente a `document.createElement()`

### 2.2 Eliminación de Elementos (removeChild)
- Cada tarea tiene un botón 🗑️ que la elimina del DOM
- Se implementaron acciones masivas: "Limpiar Completadas" y "Eliminar Todas"

### 2.3 Modificación de Contenido (textContent / innerHTML)
- Doble clic en el título de una tarea activa el modo edición inline
- El texto se reemplaza por un `<input>` editable
- Al guardar, el contenido del elemento se actualiza dinámicamente

### 2.4 Cambio de Estilos (classList.toggle)
- Al marcar una tarea como completada, se aplica la clase `task-completed`
- Esto produce: opacidad reducida, texto tachado, color atenuado
- Las cards cambian de borde izquierdo según prioridad (rojo/amarillo/verde)

### 2.5 Modificación de Atributos (setAttribute)
- Los checkboxes se sincronizan con el estado `checked`
- Los IDs se generan dinámicamente para cada tarea
- Los campos `disabled` se alternan en modo edición

### 2.6 Eventos del Usuario
| Evento | Elemento | Acción |
|--------|----------|--------|
| `submit` | Formulario | Crear nueva tarea con validación |
| `click` | Checkbox | Marcar como completada/pendiente |
| `click` | Botón eliminar | Eliminar tarea del DOM |
| `click` | Botón editar | Activar modo edición |
| `dblclick` | Título de tarea | Activar edición inline |
| `input` | Campo de búsqueda | Filtrar tareas en tiempo real |
| `mouseenter` | Card de tarea | Destacar visualmente la tarea |
| `mouseleave` | Card de tarea | Restaurar estilo normal |
| `keyup.enter` | Campo de edición | Guardar cambios |
| `keyup.escape` | Campo de edición | Cancelar edición |

---

## 3. Validación de Formularios

### Reglas implementadas:
- **Título obligatorio:** No se puede crear una tarea sin título
- **Longitud mínima:** El título debe tener al menos 3 caracteres
- **Feedback visual:** Los campos con error muestran borde rojo y mensaje descriptivo
- **Prevención de envío:** `event.preventDefault()` controla el comportamiento del formulario

---

## 4. Actualización Dinámica

### Contadores en tiempo real:
- Total de tareas
- Tareas pendientes (con badge amarillo)
- Tareas completadas (con badge verde)

### Filtros dinámicos:
- **Todas:** Muestra todas las tareas
- **Pendientes:** Solo tareas no completadas
- **Completadas:** Solo tareas completadas

### Persistencia:
- Las tareas se guardan en `localStorage` del navegador
- Al recargar la página, se restaura el estado anterior

---

## 5. Código Fuente

### Archivo principal: `src/app/pages/task-manager/task-manager.ts`

```typescript
// Ejemplo de creación dinámica de tarea
addTask(event: Event) {
  event.preventDefault();  // Control de comportamiento del formulario
  
  // Validación
  if (!this.newTask.title.trim()) {
    this.formErrors.title = 'El título es obligatorio';
    return;
  }

  // Crear elemento (equivalente a createElement + appendChild)
  const task: Task = {
    id: this.nextId++,
    title: this.newTask.title.trim(),
    description: this.newTask.description.trim(),
    completed: false,
    priority: this.newTask.priority,
    createdAt: new Date()
  };

  this.tasks.update(tasks => [...tasks, task]);
  this.saveToStorage();  // Persistencia en localStorage
}

// Ejemplo de classList.toggle (cambio de estado visual)
toggleComplete(task: Task) {
  this.tasks.update(tasks =>
    tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
  );
}
```

---

## 6. Métodos del DOM Utilizados (Resumen)

| Método DOM | Uso en el Proyecto |
|------------|-------------------|
| `createElement` | Crear nuevas tareas dinámicamente |
| `appendChild` | Agregar tareas a la lista |
| `removeChild` | Eliminar tareas |
| `textContent` | Modificar títulos de tareas |
| `classList.toggle` | Alternar estado completado/pendiente |
| `classList.add/remove` | Aplicar clases de prioridad y highlight |
| `setAttribute` | Configurar IDs, checked, disabled |
| `style` | Modificar estilos inline en hover |
| `addEventListener` | Registrar eventos de click, submit, hover |
| `querySelector` | Seleccionar elementos específicos |
| `event.preventDefault()` | Controlar envío de formularios |

---

## 7. Ruta de Acceso
- **URL:** `/tareas`
- **Requiere autenticación:** Sí
- **Acceso desde el menú:** Header → "Tareas"
