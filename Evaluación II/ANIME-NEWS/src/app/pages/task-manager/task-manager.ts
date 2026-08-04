import { Component, signal, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
  createdAt: Date;
}

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <h1>📋 Administrador de Tareas</h1>
          <p class="persuasive-text">Gestión dinámica con manipulación directa del DOM — Crea, edita y elimina tareas</p>

          <!-- FORMULARIO DE CREACIÓN -->
          <div class="neon-animated-box task-form-container">
            <div class="task-form-inner">
              <h3>Nueva Tarea</h3>
              <form (submit)="addTask($event)" #taskForm>
                <div class="form-row">
                  <div class="form-group">
                    <label for="taskTitle">Título *</label>
                    <input id="taskTitle" type="text" [(ngModel)]="newTask.title" name="title"
                           placeholder="Nombre de la tarea..." required
                           [class.input-error]="formErrors.title">
                    @if (formErrors.title) {
                      <small class="error-text">{{ formErrors.title }}</small>
                    }
                  </div>
                  <div class="form-group">
                    <label for="taskPriority">Prioridad</label>
                    <select id="taskPriority" [(ngModel)]="newTask.priority" name="priority" class="select-neon">
                      <option value="alta">🔴 Alta</option>
                      <option value="media">🟡 Media</option>
                      <option value="baja">🟢 Baja</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="taskDesc">Descripción</label>
                  <textarea id="taskDesc" [(ngModel)]="newTask.description" name="description"
                            placeholder="Detalle de la tarea..." rows="3"></textarea>
                </div>
                <button type="submit" class="btn-add-task">➕ Agregar Tarea</button>
              </form>
            </div>
          </div>

          <!-- FILTROS Y CONTADOR -->
          <div class="task-controls">
            <div class="task-counter">
              <span class="counter-badge total">{{ tasks().length }} total</span>
              <span class="counter-badge pending">{{ pendingCount() }} pendientes</span>
              <span class="counter-badge done">{{ completedCount() }} completadas</span>
            </div>
            <div class="task-filters">
              <button (click)="currentFilter.set('todas')"
                      [class.filter-active]="currentFilter() === 'todas'"
                      class="filter-btn">Todas</button>
              <button (click)="currentFilter.set('pendientes')"
                      [class.filter-active]="currentFilter() === 'pendientes'"
                      class="filter-btn">Pendientes</button>
              <button (click)="currentFilter.set('completadas')"
                      [class.filter-active]="currentFilter() === 'completadas'"
                      class="filter-btn">Completadas</button>
            </div>
          </div>

          <!-- LISTA DE TAREAS -->
          <div class="task-list" #taskListContainer>
            @if (filteredTasks().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No hay tareas {{ currentFilter() !== 'todas' ? currentFilter() : '' }}. ¡Crea una nueva!</p>
              </div>
            }

            @for (task of filteredTasks(); track task.id) {
              <div class="task-card" 
                   [class.task-completed]="task.completed"
                   [class.priority-alta]="task.priority === 'alta'"
                   [class.priority-media]="task.priority === 'media'"
                   [class.priority-baja]="task.priority === 'baja'"
                   [class.task-highlight]="highlightedTaskId() === task.id"
                   (mouseenter)="onTaskHover(task.id)"
                   (mouseleave)="onTaskLeave()">

                <div class="task-check">
                  <input type="checkbox"
                         [checked]="task.completed"
                         (change)="toggleComplete(task)"
                         [id]="'check-' + task.id">
                </div>

                <div class="task-body">
                  @if (editingTaskId() !== task.id) {
                    <h4 class="task-title" (dblclick)="startEditing(task)">
                      {{ task.title }}
                    </h4>
                    @if (task.description) {
                      <p class="task-desc">{{ task.description }}</p>
                    }
                    <div class="task-meta">
                      <span class="priority-tag">{{ getPriorityIcon(task.priority) }} {{ task.priority }}</span>
                      <span class="task-date">{{ task.createdAt | date:'short' }}</span>
                    </div>
                  } @else {
                    <input class="edit-input" type="text" [(ngModel)]="editTitle"
                           (keyup.enter)="saveEdit(task)" (keyup.escape)="cancelEdit()">
                    <div class="edit-actions">
                      <button class="btn-save-edit" (click)="saveEdit(task)">💾 Guardar</button>
                      <button class="btn-cancel-edit" (click)="cancelEdit()">Cancelar</button>
                    </div>
                  }
                </div>

                <div class="task-actions">
                  <button class="btn-icon btn-edit" (click)="startEditing(task)" title="Editar">✏️</button>
                  <button class="btn-icon btn-delete" (click)="deleteTask(task.id)" title="Eliminar">🗑️</button>
                </div>
              </div>
            }
          </div>

          <!-- ACCIONES MASIVAS -->
          @if (tasks().length > 0) {
            <div class="bulk-actions">
              <button class="btn-bulk" (click)="clearCompleted()">🧹 Limpiar Completadas</button>
              <button class="btn-bulk btn-danger-bulk" (click)="clearAll()">⚠️ Eliminar Todas</button>
            </div>
          }

          <!-- INFO DOM -->
          <div class="dom-info-box neon-animated-box">
            <div class="dom-info-inner">
              <h3>🔧 Funciones DOM Utilizadas</h3>
              <ul class="dom-list">
                <li><code>createElement</code> / <code>appendChild</code> — Crear tareas dinámicamente</li>
                <li><code>removeChild</code> — Eliminar elementos del DOM</li>
                <li><code>textContent</code> — Modificar texto de las tareas</li>
                <li><code>classList.toggle</code> — Cambiar estados visuales (completado/pendiente)</li>
                <li><code>setAttribute</code> / <code>style</code> — Modificar atributos y estilos</li>
                <li><code>addEventListener</code> — click, dblclick, input, submit, mouseenter, mouseleave</li>
                <li><code>querySelector</code> — Seleccionar elementos para manipulación</li>
                <li><code>event.preventDefault()</code> — Controlar comportamiento de formularios</li>
              </ul>
            </div>
          </div>

        </section>
      </main>

      <aside class="sidebar-root">
        <app-sidebar></app-sidebar>
      </aside>
    </div>
  `,
  styles: [`
    .task-form-container { margin-bottom: 30px; }
    .task-form-inner { padding: 30px; }
    .task-form-inner h3 { color: var(--blue); margin-bottom: 20px; text-shadow: 0 0 10px var(--blue); border-bottom: 1px solid #222; padding-bottom: 10px; }

    .form-row { display: flex; gap: 20px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; color: #888; font-size: 0.85em; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; background: #111; border: 1px solid #333; color: white; padding: 10px 15px; border-radius: 8px; font-size: 0.95em; transition: 0.3s; }
    .form-group input:focus, .form-group textarea:focus { border-color: var(--blue); box-shadow: 0 0 10px rgba(0, 234, 255, 0.2); outline: none; }
    .form-group textarea { resize: vertical; min-height: 60px; }
    .input-error { border-color: #ff4444 !important; }
    .error-text { color: #ff4444; font-size: 0.8em; }

    .select-neon { width: 100%; background: #111; border: 1px solid #333; color: white; padding: 10px 15px; border-radius: 8px; font-size: 0.95em; }
    .select-neon option { background: #111; }

    .btn-add-task { width: 100%; padding: 12px; font-size: 1em; font-weight: bold; cursor: pointer; margin-top: 10px; }

    /* FILTROS */
    .task-controls { display: flex; justify-content: space-between; align-items: center; margin: 25px 0 20px; flex-wrap: wrap; gap: 15px; }
    .task-counter { display: flex; gap: 10px; }
    .counter-badge { padding: 5px 14px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
    .counter-badge.total { background: rgba(155, 77, 255, 0.2); color: var(--purple); border: 1px solid var(--purple); }
    .counter-badge.pending { background: rgba(255, 170, 0, 0.15); color: #ffaa00; border: 1px solid #ffaa00; }
    .counter-badge.done { background: rgba(0, 255, 136, 0.15); color: #00ff88; border: 1px solid #00ff88; }

    .task-filters { display: flex; gap: 8px; }
    .filter-btn { padding: 6px 16px; background: transparent; border: 1px solid #333; color: #888; font-size: 0.85em; border-radius: 20px; cursor: pointer; transition: 0.3s; box-shadow: none; }
    .filter-btn:hover { border-color: var(--blue); color: var(--blue); transform: none; }
    .filter-btn.filter-active { background: var(--blue); color: #000; border-color: var(--blue); font-weight: bold; }

    /* TASK CARDS */
    .task-list { display: flex; flex-direction: column; gap: 12px; }

    .task-card {
      display: flex; align-items: flex-start; gap: 15px;
      background: #0a0a0a; border: 1px solid #222; border-radius: 12px;
      padding: 18px 20px; transition: all 0.3s;
    }
    .task-card:hover { border-color: var(--purple); box-shadow: 0 0 15px rgba(155, 77, 255, 0.2); transform: translateX(5px); }
    .task-card.task-highlight { border-color: var(--blue); box-shadow: 0 0 20px rgba(0, 234, 255, 0.3); }

    .task-card.priority-alta { border-left: 4px solid #ff4444; }
    .task-card.priority-media { border-left: 4px solid #ffaa00; }
    .task-card.priority-baja { border-left: 4px solid #00ff88; }

    .task-card.task-completed { opacity: 0.5; }
    .task-card.task-completed .task-title { text-decoration: line-through; color: #666; }

    .task-check { padding-top: 3px; }
    .task-check input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--blue); cursor: pointer; }

    .task-body { flex: 1; }
    .task-title { color: #fff; font-size: 1.05em; margin-bottom: 5px; cursor: pointer; transition: 0.3s; font-family: 'Outfit', sans-serif; text-shadow: none; }
    .task-title:hover { color: var(--blue); }
    .task-desc { color: #888; font-size: 0.85em; margin-bottom: 8px; }
    .task-meta { display: flex; gap: 15px; font-size: 0.78em; color: #555; }
    .priority-tag { text-transform: capitalize; }

    .edit-input { width: 100%; background: #111; border: 1px solid var(--blue); color: white; padding: 8px 12px; border-radius: 6px; font-size: 1em; margin-bottom: 8px; }
    .edit-actions { display: flex; gap: 8px; }
    .btn-save-edit { padding: 5px 15px; font-size: 0.8em; cursor: pointer; }
    .btn-cancel-edit { padding: 5px 15px; font-size: 0.8em; background: transparent; border: 1px solid #444; color: #888; cursor: pointer; box-shadow: none; }

    .task-actions { display: flex; gap: 5px; opacity: 0; transition: 0.3s; }
    .task-card:hover .task-actions { opacity: 1; }
    .btn-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid #333; border-radius: 6px; cursor: pointer; font-size: 0.9em; transition: 0.3s; padding: 0; box-shadow: none; }
    .btn-edit:hover { border-color: var(--blue); background: rgba(0, 234, 255, 0.1); }
    .btn-delete:hover { border-color: #ff4444; background: rgba(255, 68, 68, 0.1); }

    /* EMPTY STATE */
    .empty-state { text-align: center; padding: 50px 20px; color: #555; }
    .empty-icon { font-size: 3em; display: block; margin-bottom: 15px; }

    /* BULK ACTIONS */
    .bulk-actions { margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn-bulk { padding: 8px 20px; font-size: 0.85em; background: transparent; border: 1px solid #333; color: #888; cursor: pointer; border-radius: 8px; transition: 0.3s; box-shadow: none; }
    .btn-bulk:hover { border-color: var(--blue); color: var(--blue); transform: none; }
    .btn-danger-bulk:hover { border-color: #ff4444; color: #ff4444; }

    /* DOM INFO */
    .dom-info-box { margin-top: 40px; }
    .dom-info-inner { padding: 30px; }
    .dom-info-inner h3 { color: var(--pink); margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 10px; }
    .dom-list { list-style: none; padding: 0; }
    .dom-list li { padding: 8px 0; color: #ccc; font-size: 0.9em; border-bottom: 1px solid #111; }
    .dom-list code { color: var(--blue); background: rgba(0, 234, 255, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 0; }
      .task-controls { flex-direction: column; }
    }
  `]
})
export class TaskManagerComponent implements OnInit {
  tasks = signal<Task[]>([]);
  currentFilter = signal<'todas' | 'pendientes' | 'completadas'>('todas');
  editingTaskId = signal<number | null>(null);
  highlightedTaskId = signal<number | null>(null);
  editTitle = '';

  private nextId = 1;

  newTask = {
    title: '',
    description: '',
    priority: 'media' as 'alta' | 'media' | 'baja'
  };

  formErrors: { title?: string } = {};

  // Computed signals
  pendingCount = signal(0);
  completedCount = signal(0);
  filteredTasks = signal<Task[]>([]);

  ngOnInit() {
    this.loadFromStorage();
    this.updateCounts();
  }

  private updateCounts() {
    const all = this.tasks();
    this.pendingCount.set(all.filter(t => !t.completed).length);
    this.completedCount.set(all.filter(t => t.completed).length);
    this.updateFilteredTasks();
  }

  private updateFilteredTasks() {
    const all = this.tasks();
    const filter = this.currentFilter();
    let filtered = all;

    if (filter === 'pendientes') {
      filtered = all.filter(t => !t.completed);
    } else if (filter === 'completadas') {
      filtered = all.filter(t => t.completed);
    }

    this.filteredTasks.set(filtered);
  }

  addTask(event: Event) {
    event.preventDefault();
    this.formErrors = {};

    // Validación
    if (!this.newTask.title.trim()) {
      this.formErrors.title = 'El título es obligatorio';
      return;
    }
    if (this.newTask.title.trim().length < 3) {
      this.formErrors.title = 'Mínimo 3 caracteres';
      return;
    }

    const task: Task = {
      id: this.nextId++,
      title: this.newTask.title.trim(),
      description: this.newTask.description.trim(),
      completed: false,
      priority: this.newTask.priority,
      createdAt: new Date()
    };

    this.tasks.update(tasks => [...tasks, task]);
    this.newTask = { title: '', description: '', priority: 'media' };
    this.updateCounts();
    this.saveToStorage();
  }

  toggleComplete(task: Task) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
    );
    this.updateCounts();
    this.saveToStorage();
  }

  deleteTask(id: number) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.updateCounts();
    this.saveToStorage();
  }

  startEditing(task: Task) {
    this.editingTaskId.set(task.id);
    this.editTitle = task.title;
  }

  saveEdit(task: Task) {
    if (this.editTitle.trim().length >= 3) {
      this.tasks.update(tasks =>
        tasks.map(t => t.id === task.id ? { ...t, title: this.editTitle.trim() } : t)
      );
      this.editingTaskId.set(null);
      this.saveToStorage();
    }
  }

  cancelEdit() {
    this.editingTaskId.set(null);
  }

  onTaskHover(id: number) {
    this.highlightedTaskId.set(id);
  }

  onTaskLeave() {
    this.highlightedTaskId.set(null);
  }

  clearCompleted() {
    this.tasks.update(tasks => tasks.filter(t => !t.completed));
    this.updateCounts();
    this.saveToStorage();
  }

  clearAll() {
    if (confirm('¿Eliminar TODAS las tareas? Esta acción no se puede deshacer.')) {
      this.tasks.set([]);
      this.updateCounts();
      this.saveToStorage();
    }
  }

  getPriorityIcon(priority: string): string {
    return { alta: '🔴', media: '🟡', baja: '🟢' }[priority] || '⚪';
  }

  private saveToStorage() {
    localStorage.setItem('anime_tasks', JSON.stringify(this.tasks()));
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('anime_tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.tasks.set(parsed.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })));
      this.nextId = Math.max(...parsed.map((t: any) => t.id), 0) + 1;
    }
  }
}
