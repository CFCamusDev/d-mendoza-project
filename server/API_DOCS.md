# API Documentation - D-Mendoza Project Backend

Esta documentación proporciona las especificaciones técnicas detalladas para consumir los endpoints de la API. Servirá de base para la integración con el cliente (Frontend).

## Índice de Endpoints

- [Autenticación](#autenticación)
  - [POST /api/v1/auth/register](#post-apiv1authregister)
  - [POST /api/v1/auth/verify](#post-apiv1authverify)
  - [POST /api/v1/auth/login](#post-apiv1authlogin)
- [Control de Acceso por Roles (RBAC)](#control-de-acceso-por-roles-rbac)
  - [POST /api/v1/roles](#post-apiv1roles)
  - [PUT /api/v1/users/:id/role](#put-apiv1usersidrole)

---

## Autenticación

### POST /api/v1/auth/register

Permite registrar una nueva cuenta de usuario en la plataforma. Por defecto, el usuario se crea en estado **inactivo** hasta que se complete el flujo de verificación posterior.

#### 1. Especificación del Endpoint

| Método | Ruta                    | Autenticación     | Rol Requerido |
| :----- | :---------------------- | :---------------- | :------------ |
| `POST` | `/api/v1/auth/register` | Ninguna (Público) | Invitado      |

#### 2. Cuerpo de la Petición (Request Body)

Se espera un objeto JSON con la siguiente estructura:

```json
{
  "email": "usuario@dominio.com",
  "password": "Password123!"
}
```

**Detalle de Campos:**

| Parámetro  | Tipo     | Requerido | Reglas de Validación                                                                  |
| :--------- | :------- | :-------- | :------------------------------------------------------------------------------------ |
| `email`    | `string` | Sí        | Debe ser un formato de email válido (`ejemplo@correo.com`).                           |
| `password` | `string` | Sí        | Mínimo 8 caracteres. Debe contener al menos una letra mayúscula y al menos un número. |

#### 3. Respuestas (Responses)

##### Exito (HTTP 201 Created)

Retornado cuando los datos son válidos y el usuario se ha guardado correctamente en el sistema.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@dominio.com",
    "isActive": false,
    "message": "El usuario se ha creado correctamente. A la espera de verificación."
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

Retornado cuando los datos enviados no cumplen con las restricciones del esquema de Zod.

```json
{
  "success": false,
  "error": [
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "La contraseña debe tener al menos 8 caracteres",
      "path": ["password"]
    }
  ]
}
```

##### Error de Conflicto (HTTP 409 Conflict)

Retornado cuando el correo electrónico proporcionado ya se encuentra registrado en la base de datos.

```json
{
  "success": false,
  "error": "Correo electrónico ya registrado"
}
```

##### Error Interno (HTTP 500 Internal Server Error)

Retornado en caso de errores inesperados en el servidor.

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /api/v1/auth/verify

Permite activar una cuenta de usuario ingresando el código PIN numérico de 6 dígitos enviado previamente por correo electrónico.

#### 1. Especificación del Endpoint

| Método | Ruta                  | Autenticación     | Rol Requerido |
| :----- | :-------------------- | :---------------- | :------------ |
| `POST` | `/api/v1/auth/verify` | Ninguna (Público) | Invitado      |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "email": "usuario@dominio.com",
  "pin": "123456"
}
```

**Detalle de Campos:**

| Parámetro | Tipo     | Requerido | Reglas de Validación                                                    |
| :-------- | :------- | :-------- | :---------------------------------------------------------------------- |
| `email`   | `string` | Sí        | Debe coincidir con el correo registrado.                                |
| `pin`     | `string` | Sí        | Exactamente 6 caracteres numéricos. Corresponde al OTP enviado a email. |

#### 3. Respuestas (Responses)

##### Exito (HTTP 200 OK)

Retornado cuando el PIN es válido, no ha expirado, y la cuenta se activa exitosamente.

```json
{
  "success": true,
  "message": "Cuenta verificada exitosamente. Ya puedes iniciar sesión."
}
```

##### Error de Parámetros (HTTP 400 Bad Request)

Retornado si la estructura es inválida o si el PIN ingresado es incorrecto/inválido.

```json
{
  "success": false,
  "error": "PIN inválido o expirado"
}
```

##### Conflicto - Ya Verificado (HTTP 409 Conflict)

Retornado si el usuario ya se encuentra en estado Activo.

```json
{
  "success": false,
  "error": "La cuenta ya se encuentra verificada"
}
```

##### Expirado - Token Caducado (HTTP 410 Gone)

Retornado cuando el PIN superó el tiempo de vida configurado (15 minutos).

```json
{
  "success": false,
  "error": "El código de verificación ha expirado. Por favor, regístrese nuevamente."
}
```

---

### POST /api/v1/auth/login

Autentica a un usuario mediante correo electrónico y contraseña. Retorna los datos básicos del usuario junto a una dupla de tokens JWT (`accessToken` de corta duración y `refreshToken` de larga duración) para el manejo de sesiones y control de acceso RBAC.

#### 1. Especificación del Endpoint

| Método | Ruta                 | Autenticación     | Rol Requerido |
| :----- | :------------------- | :---------------- | :------------ |
| `POST` | `/api/v1/auth/login` | Ninguna (Público) | Invitado      |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "email": "usuario@dominio.com",
  "password": "Password123!"
}
```

**Detalle de Campos:**

| Parámetro  | Tipo     | Requerido | Reglas de Validación                                       |
| :--------- | :------- | :-------- | :--------------------------------------------------------- |
| `email`    | `string` | Sí        | Formato de correo electrónico válido.                      |
| `password` | `string` | Sí        | Cadena no vacía. Debe coincidir con el hash registrado.    |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retornado cuando las credenciales son correctas y el usuario está activo. Se retornan tanto los datos de perfil seguros como los tokens de acceso.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@dominio.com",
      "name": "Nombre Usuario",
      "lastLogin": "2026-05-10T16:10:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-05-10T16:10:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

##### Mala Petición - Validación (HTTP 400 Bad Request)

Retornado si no se envía un payload válido (ej. email con formato incorrecto).

```json
{
  "success": false,
  "error": [
    {
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

##### No Autorizado - Credenciales Inválidas (HTTP 401 Unauthorized)

Retornado de forma genérica si el correo no existe o la contraseña es incorrecta. **Importante por seguridad:** La respuesta no revela cuál de los dos campos falló para prevenir ataques de enumeración de cuentas.

```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

##### Prohibido - Cuenta Inactiva (HTTP 403 Forbidden)

Retornado cuando las credenciales son técnicamente correctas, pero la cuenta aún no ha sido verificada o ha sido inhabilitada.

```json
{
  "success": false,
  "error": "Cuenta inactiva o no verificada"
}
```

---

## Control de Acceso por Roles (RBAC)

Este módulo administrativo gestiona el catálogo global de roles y la vinculación dinámica con las identidades de usuario, aplicando controles de seguridad estrictos de tipo privilegio mínimo.

### POST /api/v1/roles

Permite registrar una nueva definición de Rol en el catálogo central del sistema. Útil para escalar perfiles administrativos como Vendedores, Supervisores o Gestores.

#### 1. Especificación del Endpoint

| Método | Ruta            | Autenticación       | Permiso Requerido |
| :----- | :-------------- | :------------------ | :---------------- |
| `POST` | `/api/v1/roles` | JWT `Bearer Token` | `roles:manage`    |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "name": "SELLER",
  "description": "Acceso al panel de inventarios y ventas"
}
```

**Detalle de Campos:**

| Parámetro     | Tipo     | Requerido | Reglas de Validación                                                                            |
| :------------ | :------- | :-------- | :---------------------------------------------------------------------------------------------- |
| `name`        | `string` | Sí        | Mínimo 3 caracteres, Máximo 50. Se transformará automáticamente a mayúsculas para normalización. |
| `description` | `string` | No        | Máximo 255 caracteres. Opcional.                                                                |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 201 Created)

Retornado cuando el Rol fue validado, es único y fue correctamente persistido.

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "SELLER",
    "description": "Acceso al panel de inventarios y ventas",
    "createdAt": "2026-05-12T16:50:00.000Z",
    "updatedAt": "2026-05-12T16:50:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

Falla sintáctica del payload de entrada detectada por Zod.

```json
{
  "success": false,
  "error": [
    {
      "message": "El nombre del rol debe tener al menos 3 caracteres",
      "path": ["name"]
    }
  ]
}
```

##### Acceso Denegado (HTTP 401 / 403)

*   **HTTP 401 Unauthorized**: Si falta el Token, es inválido o ha expirado.
*   **HTTP 403 Forbidden**: Si el usuario está inactivo o carece del permiso administrativo `roles:manage`.

##### Conflicto (HTTP 409 Conflict)

Retornado si se intenta crear un nombre de rol que ya se encuentra ocupado.

```json
{
  "success": false,
  "error": "El rol 'SELLER' ya existe en el sistema"
}
```

---

### PUT /api/v1/users/:id/role

Permite asignar un rol existente del catálogo a un usuario específico del sistema mediante su identificador numérico.

#### 1. Especificación del Endpoint

| Método | Ruta                        | Autenticación       | Permiso Requerido |
| :----- | :-------------------------- | :------------------ | :---------------- |
| `PUT`  | `/api/v1/users/:id/role` | JWT `Bearer Token` | `roles:manage`    |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "roleName": "SELLER"
}
```

**Detalle de Campos:**

| Parámetro  | Tipo     | Requerido | Reglas de Validación                                                |
| :--------- | :------- | :-------- | :------------------------------------------------------------------ |
| `roleName` | `string` | Sí        | Nombre exacto del rol que se desea vincular a la cuenta de usuario. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

La vinculación relacional se ha completado satisfactoriamente en la base de datos.

```json
{
  "success": true,
  "message": "Rol 'SELLER' asignado exitosamente al usuario."
}
```

##### No Encontrado (HTTP 404 Not Found)

Emitido cuando el `id` de usuario en la URL no pertenece a ningún registro activo, o el `roleName` especificado no existe en el catálogo de Roles.

```json
{
  "success": false,
  "error": "El rol 'SELLER' no está definido en el sistema"
}
```

