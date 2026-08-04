# Prácticas 11 y 12: Módulo Administrativo y Seguridad

## Manual de Usuario y Manual Técnico

**Proyecto:** ANIME NEWS  
**Fecha:** Julio 2026  

---

## PARTE I: MANUAL DE USUARIO (ADMINISTRADOR)

El módulo administrativo está diseñado para gestionar el acceso y la seguridad de la comunidad. Solo los usuarios con rol `admin` tienen acceso a las rutas bajo `/admin/*`.

### 1. Gestión de Usuarios (`/admin/users`)

#### 1.1 Alta de Usuarios
1. Haz clic en el botón `➕ Crear Usuario`.
2. Llena el formulario con: Email, Nombre, Apellidos, Edad, Teléfono y Rol.
3. El usuario recibirá un registro directo en base de datos.
4. *Nota: La contraseña inicial se gestionará vía Supabase por defecto.*

#### 1.2 Edición de Usuarios
1. En la tabla, haz clic en el botón ✏️ (Lápiz) del usuario.
2. Modifica sus datos personales.
3. Puedes forzar que el usuario cambie su contraseña marcando la casilla correspondiente.

#### 1.3 Activación / Desactivación (Eliminación Lógica)
1. Usa el botón ✅ / 🚫 para cambiar el estado de un usuario.
2. Un usuario desactivado (inactivo) **no puede** iniciar sesión, pero sus datos se conservan.

#### 1.4 Eliminación Física
1. El botón 🗑️ (Basurero) borrará irreversiblemente el registro de la base de datos de perfiles.

### 2. Gestión de Roles

1. Haz clic en el botón 🛡️ (Escudo) en la tabla de usuarios.
2. Selecciona uno de los 4 niveles de privilegio:
   - **Admin:** Control total, gestión de usuarios, roles y sistema.
   - **Editor:** Publicación y moderación de contenido.
   - **Cliente:** Uso estándar del sitio (visualizar, comentar).
   - **Invitado:** Acceso de lectura temporal, cuenta limitada.

### 3. Bitácora de Auditoría (`/admin/audit`)

El sistema registra todas las acciones críticas.
1. Accede a la vista de Bitácora.
2. Visualiza el historial completo ordenado por fecha y hora.
3. Utiliza los filtros superiores para buscar:
   - Por tipo de acción (Alta, Baja, Login, Cambio de Contraseña).
   - Por correo electrónico del usuario.

---

## PARTE II: MANUAL TÉCNICO

### 1. Arquitectura del Módulo

- **Componentes UI:** `UserManagementComponent`, `AuditLogComponent`
- **Servicios:** `AuthService` (autenticación y políticas), `AuditService` (registro de bitácora), `SupabaseService` (CRUD).
- **Backend:** PostgreSQL alojado en Supabase + Supabase Auth.
- **Rutas Protegidas:** Uso de `adminGuard` para verificar claims antes de rutear.

### 2. Implementación de Auditoría

La tabla `bitacora` se diseñó con las siguientes columnas:
- `id` (UUID, primary key)
- `user_id` (UUID, referencia a perfiles)
- `usuario_email` (TEXT)
- `accion` (TEXT)
- `detalles` (TEXT)
- `ip` (TEXT)
- `created_at` (TIMESTAMP)

El servicio `AuditService` captura la IP pública del usuario mediante una petición a `api.ipify.org` antes de insertar el log. Row Level Security (RLS) en Supabase restringe las lecturas solo a usuarios con rol 'admin'.

### 3. Controles de Seguridad Informática (Los 5 Puntos)

#### Control 1: Contraseñas Cifradas
- Supabase Auth encripta todas las contraseñas utilizando `bcrypt` automáticamente en el backend. Las contraseñas en texto plano nunca tocan la base de datos.

#### Control 2: Validación de Formularios y Políticas
- El `AuthService` intercepta el registro y cambio de contraseña con el método `validatePassword(password)` que exige:
  - Mínimo 8 caracteres
  - 1 letra mayúscula
  - 1 letra minúscula
  - 1 número
  - 1 carácter especial
- Las validaciones de Angular (`required`, clases condicionales) validan la longitud en tiempo real.

#### Control 3: Bloqueo Temporal (Fuerza Bruta)
- Al fallar un inicio de sesión, se invoca `registerFailedLoginAttempt()`.
- Tras **5 intentos fallidos**, la cuenta (en el cliente) queda bloqueada temporalmente guardando un timestamp en `localStorage` (y en el servidor a través de la columna `intentos_fallidos`).
- El bloqueo dura 5 minutos, periodo durante el cual el login arroja un error inmediato.

#### Control 4: Expiración de Sesión
- Se implementó un detector de inactividad que escucha eventos `mousedown`, `keypress`, `scroll`.
- Tras **30 minutos** sin interacción, el temporizador expira (`SESSION_TIMEOUT_MS = 30 * 60 * 1000`).
- El sistema fuerza un `logout()`, limpia la sesión y lo registra en la bitácora como `SESION_EXPIRADA`.

#### Control 5: Eliminación Lógica
- La eliminación lógica (`activo: false`) previene la pérdida de integridad referencial. Si un usuario tiene posts o reportes, borrarlo físicamente causaría errores en cascada. Desactivarlo lo bloquea (vía `authGuard` y Supabase RLS) sin corromper la base de datos.
