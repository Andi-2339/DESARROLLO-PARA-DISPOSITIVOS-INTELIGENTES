# Práctica 1 y 2: Selección de Framework

## Proyecto: ANIME NEWS — Portal de Noticias de Anime y Manga

**Materia:** Noveno Cuatrimestre  
**Fecha:** Julio 2026  

---

## 1. Framework Seleccionado

### Frontend: Angular 21
### Backend: Supabase (PostgreSQL + Auth)
### Lenguaje: TypeScript

---

## 2. Justificación del Framework

### 2.1 Angular (Frontend)

| Criterio | Evaluación |
|----------|-----------|
| **Escalabilidad** | ✅ Excelente — Arquitectura modular con componentes standalone, lazy loading para cargar páginas bajo demanda |
| **Mantenibilidad** | ✅ TypeScript proporciona tipado estático, reduciendo errores en tiempo de desarrollo |
| **Ecosistema** | ✅ Angular CLI, Angular Router, Reactive Forms, HttpClient integrados |
| **Rendimiento** | ✅ Signals (Angular 21) para reactividad óptima sin overhead de Zone.js |
| **Comunidad** | ✅ Respaldado por Google, documentación extensa, más de 90,000 estrellas en GitHub |
| **Reversionamiento** | ✅ Compatible con Git, estructura de archivos clara y predecible |

### 2.2 Supabase (Backend)

| Criterio | Evaluación |
|----------|-----------|
| **Base de datos** | ✅ PostgreSQL — Base de datos relacional robusta y escalable |
| **Autenticación** | ✅ Auth integrada con email/password, Google OAuth, y más |
| **Seguridad** | ✅ Row Level Security (RLS), API keys, políticas granulares |
| **Tiempo real** | ✅ Suscripciones en tiempo real incluidas |
| **Escalado** | ✅ Infraestructura serverless, escalado automático |
| **Costo** | ✅ Tier gratuito generoso, pricing por uso |

### 2.3 Alternativas Consideradas

| Framework | Pros | Contras | Decisión |
|-----------|------|---------|----------|
| **React + Next.js** | Popular, flexible | No tiene estructura opinada, más configuración manual | ❌ Rechazado |
| **Vue.js + Nuxt** | Curva de aprendizaje suave | Ecosistema más pequeño, menos herramientas enterprise | ❌ Rechazado |
| **Angular + Supabase** | Estructura clara, TypeScript nativo, Auth integrada, escalable | Curva de aprendizaje inicial | ✅ Seleccionado |
| **PHP + Laravel** | Maduro, muchos recursos | No SPA nativo, rendimiento inferior en frontend | ❌ Rechazado |

---

## 3. Escalabilidad

### Estrategia de escalado horizontal:
- **Lazy Loading:** Cada página se carga bajo demanda usando `loadComponent()`
- **Standalone Components:** Sin módulos monolíticos, cada componente es independiente
- **Signals:** Sistema reactivo eficiente sin Zone.js
- **Supabase Edge Functions:** Para lógica backend que necesite escalar

### Estructura del proyecto:
```
src/
├── app/
│   ├── components/     ← Componentes reutilizables
│   ├── pages/          ← Páginas (lazy loaded)
│   ├── services/       ← Servicios (Supabase, Auth, Audit)
│   ├── guards/         ← Guardias de rutas
│   ├── app.routes.ts   ← Configuración de rutas
│   └── app.ts          ← Componente raíz
├── assets/             ← Imágenes y recursos
└── styles.css          ← Estilos globales
```

---

## 4. Reversionamiento con Git

### Configuración:
- **Repositorio:** GitHub
- **Ramas:** `main` (producción), `develop` (desarrollo), `feature/*` (nuevas funcionalidades)
- **Commits:** Convención de commits semánticos (`feat:`, `fix:`, `docs:`, `style:`)
- **`.gitignore`:** Configurado para excluir `node_modules/`, `dist/`, archivos de entorno

### Flujo de trabajo Git:
1. Crear rama feature desde `develop`
2. Desarrollar y hacer commits descriptivos
3. Pull Request a `develop`
4. Revisión de código
5. Merge a `develop`
6. Release a `main`

---

## 5. Conclusión

Angular 21 con Supabase fue seleccionado porque ofrece:
- **Tipado fuerte** con TypeScript para reducir bugs
- **Arquitectura escalable** con lazy loading y componentes standalone
- **Backend as a Service** completo con autenticación y base de datos
- **Reversionamiento** natural con Git gracias a su estructura de archivos clara
- **Rendimiento** optimizado con Signals y compilación AOT
