# Práctica 13: Cuentas, Registros y Conexión de API

## Configuración y Operatividad del Sistema

**Proyecto:** ANIME NEWS  
**Fecha:** Julio 2026  

---

## 1. Conexión a Base de Datos de Cuentas (Supabase API)

El sistema utiliza la API REST / WebSocket proveída por Supabase, que actúa como capa superior (BaaS) para una instancia de PostgreSQL.

### 1.1 Configuración de Clientes
La conexión inicial se realiza en `src/environments/environment.ts` a través de variables de entorno, inyectando la URL y la llave pública (Anon Key).

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://xxx.supabase.co',
  supabaseKey: 'eyJh...'
};
```

El cliente se inicializa usando el SDK de JavaScript de Supabase `@supabase/supabase-js`, proveyendo un único punto de entrada (`supabase.service.ts`) que maneja las sesiones.

---

## 2. Operatividad de Diferentes Roles

El sistema fue diseñado considerando 4 niveles de roles jerárquicos. La tabla `perfiles` en la base de datos almacena el rol asociado a cada `user_id`.

| Rol | Privilegios y Operatividad |
|-----|----------------------------|
| **Admin** | Acceso a todo el sistema. Puede visualizar `/admin/users` y `/admin/audit`. Tiene permisos para realizar CRUD sobre cualquier usuario, y alterar el estado activo de las cuentas (Baja lógica). La base de datos mediante RLS permite lectura de bitácora SOLO a roles admin. |
| **Editor** | Tiene privilegios sobre el contenido. Puede gestionar la publicación de noticias (Próximamente) y reportes. Sin embargo, no tiene acceso a las pantallas de administración de usuarios. |
| **Cliente** | El usuario estándar registrado. Su panel lateral y vista general están restringidos a la lectura del catálogo de noticias, foros básicos y edición de su propio perfil. |
| **Invitado** | Un rol especial temporal que otorga una ventana limitada de interacción antes de requerir registro. (Actualmente manejado como usuario sin autenticar en la Landing Page). |

### Control de Acceso Frontend (Guards)
El archivo `admin.guard.ts` impide que usuarios sin el rol `admin` naveguen hacia las URLs protegidas.

```typescript
export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/signup']);
  }
  
  if (auth.isAdmin()) {
    return true; // Acceso concedido
  } else {
    // Intento de intrusión
    alert('Acceso denegado. Requiere privilegios de administrador.');
    return router.createUrlTree(['/home']);
  }
};
```

---

## 3. Registros Iniciales

Para probar la operatividad del sistema de administración y los guards, se configuró una base de datos con los siguientes perfiles de prueba:

| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| `admin@animenews.com` | `AnimeAdmin2026!` | `admin` | Cuenta principal de desarrollo y testing. Tiene full access. |
| `editor1@animenews.com` | `EditorPass123$` | `editor` | Para validación de publicación. |
| `testcliente@gmail.com` | `User1234#` | `cliente` | Cuenta estándar creada durante las pruebas de registro (SignupComponent). |
| `banned@animenews.com` | `BannedUser24*` | `cliente` | (*activo: false*) Cuenta para probar que los usuarios suspendidos no puedan ingresar al sistema. |

### Flujo de Registro (`SignUp`)
1. El usuario completa el formulario en `/signup`.
2. Se validan las políticas de contraseña fuerte.
3. Se invoca `supabase.auth.signUp()`.
4. Mediante triggers de Supabase (o lógicamente en el frontend inmediatamente después del signup), se inserta un registro en la tabla pública `perfiles` con `rol = 'cliente'` por defecto.
5. El sistema lo registra en la tabla `bitacora` (`ALTA_USUARIO`).
