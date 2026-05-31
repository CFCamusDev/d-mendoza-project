# API Documentation - D-Mendoza Project Backend

Esta documentación proporciona las especificaciones técnicas detalladas para consumir los endpoints de la API. Servirá de base para la integración con el cliente (Frontend).

## Índice de Endpoints

- [Autenticación](#autenticación)
  - [POST /api/v1/auth/register](#post-apiv1authregister)
  - [POST /api/v1/auth/verify](#post-apiv1authverify)
  - [POST /api/v1/auth/login](#post-apiv1authlogin)
  - [POST /api/v1/auth/forgot-password](#post-apiv1authforgotpassword)
  - [POST /api/v1/auth/reset-password](#post-apiv1authresetpassword)
- [Control de Acceso por Roles (RBAC)](#control-de-acceso-por-roles-rbac)
  - [POST /api/v1/roles](#post-apiv1roles)
  - [PUT /api/v1/users/:id/role](#put-apiv1usersidrole)
- [Perfil de Cliente](#perfil-de-cliente)
  - [GET /api/v1/profile](#get-apiv1profile)
  - [PATCH /api/v1/profile](#patch-apiv1profile)
- [Identidad Visual y Branding](#identidad-visual-y-branding)
  - [GET /api/v1/config/brand](#get-apiv1configbrand)
  - [PUT /api/v1/config/brand](#put-apiv1configbrand)
- [Sucursales y Almacenes](#sucursales-y-almacenes)
  - [GET /api/v1/branches](#get-apiv1branches)
  - [POST /api/v1/branches](#post-apiv1branches)
  - [PUT /api/v1/branches/:id](#put-apiv1branchesid)
  - [PATCH /api/v1/branches/:id/status](#patch-apiv1branchesidstatus)
- [Gestión de Proveedores — HU-051](#gestión-de-proveedores--hu-051)
  - [GET /api/v1/suppliers](#get-apiv1suppliers)
  - [POST /api/v1/suppliers](#post-apiv1suppliers)
  - [PUT /api/v1/suppliers/:id](#put-apiv1suppliersid)
  - [PATCH /api/v1/suppliers/:id/status](#patch-apiv1suppliersidstatus)
- [Ingreso de Mercadería — HU-051](#ingreso-de-mercadería--hu-051)
  - [GET /api/v1/variants/search](#get-apiv1variantssearch)
  - [POST /api/v1/stock/entries](#post-apiv1stockentries)
- [Visualización de Stock — HU-021](#visualización-de-stock--hu-021)
  - [GET /api/v1/stock](#get-apiv1stock)
- [Auditoría de Inventario Físico — HU-029](#auditoría-de-inventario-físico--hu-029)
  - [POST /api/v1/inventory-audits](#post-apiv1inventoryaudits)

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

| Parámetro  | Tipo     | Requerido | Reglas de Validación                                    |
| :--------- | :------- | :-------- | :------------------------------------------------------ |
| `email`    | `string` | Sí        | Formato de correo electrónico válido.                   |
| `password` | `string` | Sí        | Cadena no vacía. Debe coincidir con el hash registrado. |

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
      "message": "Formato de correo electrónico no válido",
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

### POST /api/v1/auth/forgot-password

Solicita el envío de un correo electrónico con un enlace para restablecer la contraseña olvidada. Genera un token temporal de seguridad firmado con JWT.

#### 1. Especificación del Endpoint

| Método | Ruta                           | Autenticación     | Rol Requerido |
| :----- | :----------------------------- | :---------------- | :------------ |
| `POST` | `/api/v1/auth/forgot-password` | Ninguna (Público) | Invitado      |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "email": "usuario@dominio.com"
}
```

**Detalle de Campos:**

| Parámetro | Tipo     | Requerido | Reglas de Validación                  |
| :-------- | :------- | :-------- | :------------------------------------ |
| `email`   | `string` | Sí        | Formato de correo electrónico válido. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retornado siempre que el formato del correo sea correcto, incluso si el usuario no existe (para evitar enumeración de cuentas y phishing).

```json
{
  "success": true,
  "message": "Si el correo está registrado, recibirás un enlace de recuperación en breve."
}
```

##### Error de Validación (HTTP 400 Bad Request)

Retornado si el valor de entrada no cumple con el formato de correo esperado por Zod.

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

---

### POST /api/v1/auth/reset-password

Permite establecer una nueva contraseña en la cuenta del usuario validando previamente el token JWT temporal recibido por correo electrónico. Hashea y persiste las nuevas credenciales en la base de datos.

#### 1. Especificación del Endpoint

| Método | Ruta                          | Autenticación     | Rol Requerido |
| :----- | :---------------------------- | :---------------- | :------------ |
| `POST` | `/api/v1/auth/reset-password` | Ninguna (Público) | Invitado      |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "token": "eyJhbGciOiJIUzI...",
  "newPassword": "MiNuevaPassword2026!"
}
```

**Detalle de Campos:**

| Parámetro     | Tipo     | Requerido | Reglas de Validación                                                                                                             |
| :------------ | :------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `token`       | `string` | Sí        | El token JWT enviado al correo. No debe estar vacío ni expirado.                                                                 |
| `newPassword` | `string` | Sí        | Mínimo 8 caracteres. Debe contener al menos una letra mayúscula y al menos un número. No puede ser igual a la contraseña actual. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retornado si el token es válido y la nueva contraseña ha sido guardada exitosamente. El usuario ya puede iniciar sesión.

```json
{
  "success": true,
  "message": "La contraseña ha sido restablecida con éxito."
}
```

##### Error de Validación (HTTP 400 Bad Request)

Retornado si el token está vacío o si la contraseña no cumple con los requisitos mínimos de seguridad de Zod.

```json
{
  "success": false,
  "error": [
    {
      "code": "too_small",
      "minimum": 8,
      "message": "La contraseña debe tener al menos 8 caracteres",
      "path": ["newPassword"]
    }
  ]
}
```

##### No Autorizado / Expirado (HTTP 401 Unauthorized)

Retornado cuando el token JWT es inválido, ha sido manipulado, o ha expirado su ventana de vida de 15 minutos.

**Ejemplo Expirado:**

```json
{
  "success": false,
  "error": "El enlace de recuperación ha expirado. Por favor, solicita uno nuevo."
}
```

**Ejemplo Inválido:**

```json
{
  "success": false,
  "error": "El token de recuperación no es válido o ya fue utilizado."
}
```

##### No Encontrado (HTTP 404 Not Found)

Retornado si el token es estructuralmente válido pero el identificador del usuario no existe en la base de datos (usuario eliminado recientemente).

```json
{
  "success": false,
  "error": "Usuario no encontrado"
}
```

---

## Control de Acceso por Roles (RBAC)

Este módulo administrativo gestiona el catálogo global de roles y la vinculación dinámica con las identidades de usuario, aplicando controles de seguridad estrictos de tipo privilegio mínimo.

### POST /api/v1/roles

Permite registrar una nueva definición de Rol en el catálogo central del sistema. Útil para escalar perfiles administrativos como Vendedores, Supervisores o Gestores.

#### 1. Especificación del Endpoint

| Método | Ruta            | Autenticación      | Permiso Requerido |
| :----- | :-------------- | :----------------- | :---------------- |
| `POST` | `/api/v1/roles` | JWT `Bearer Token` | `roles:manage`    |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "name": "SELLER",
  "description": "Acceso al panel de inventarios y ventas"
}
```

**Detalle de Campos:**

| Parámetro     | Tipo     | Requerido | Reglas de Validación                                                                             |
| :------------ | :------- | :-------- | :----------------------------------------------------------------------------------------------- |
| `name`        | `string` | Sí        | Mínimo 3 caracteres, Máximo 50. Se transformará automáticamente a mayúsculas para normalización. |
| `description` | `string` | No        | Máximo 255 caracteres. Opcional.                                                                 |

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

- **HTTP 401 Unauthorized**: Si falta el Token, es inválido o ha expirado.
- **HTTP 403 Forbidden**: Si el usuario está inactivo o carece del permiso administrativo `roles:manage`.

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

| Método | Ruta                     | Autenticación      | Permiso Requerido |
| :----- | :----------------------- | :----------------- | :---------------- |
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

---

## Perfil de Cliente

Este módulo permite al cliente autenticado autogestionar su información personal, incluyendo la carga segura de su foto de perfil y la obtención de los datos de su perfil actual.

### GET /api/v1/profile

Recupera la información detallada del perfil del usuario autenticado (nombre, apellido, teléfono, email, avatar).

#### 1. Especificación del Endpoint

| Método | Ruta              | Autenticación      | Rol Requerido         |
| :----- | :---------------- | :----------------- | :-------------------- |
| `GET`  | `/api/v1/profile` | JWT `Bearer Token` | Cualquier Autenticado |

#### 2. Cuerpo de la Petición (Request Body)

No requiere cuerpo de petición.

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retorna la información actual del usuario en la base de datos (excluyendo la contraseña y PINs sensibles).

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "cliente@dominio.com",
    "name": "Juan",
    "lastName": "Pérez",
    "phone": "+51999888777",
    "avatarUrl": "https://res.cloudinary.com/dugbrgwn8/image/upload/v123456789/profiles/juan_perez_123456789.png",
    "authProvider": "local",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-05-19T02:20:00.000Z"
  }
}
```

##### Acceso Denegado / No Encontrado (HTTP 401 / 404)

- **HTTP 401 Unauthorized**: Si falta el Token en los headers o si es inválido.
- **HTTP 404 Not Found**: Si el identificador de usuario en el token de autenticación no pertenece a ningún usuario registrado.

```json
{
  "success": false,
  "error": "Acceso no autorizado: Contexto de seguridad faltante"
}
```

---

### PATCH /api/v1/profile

Actualiza la información de perfil del usuario autenticado (nombre, apellido, teléfono) y permite cargar una nueva imagen para su avatar. Soporta peticiones `multipart/form-data`.

#### 1. Especificación del Endpoint

| Método  | Ruta              | Autenticación      | Rol Requerido |
| :------ | :---------------- | :----------------- | :------------ |
| `PATCH` | `/api/v1/profile` | JWT `Bearer Token` | Cliente       |

#### 2. Cuerpo de la Petición (Request Body)

Se espera una petición de tipo `multipart/form-data` con los siguientes campos opcionales:

**Detalle de Campos:**

| Campo      | Tipo     | Requerido | Reglas de Validación                                                                                   |
| :--------- | :------- | :-------- | :----------------------------------------------------------------------------------------------------- |
| `name`     | `string` | No        | Mínimo 2 caracteres, máximo 50. Nombre del cliente.                                                    |
| `lastName` | `string` | No        | Mínimo 2 caracteres, máximo 50. Apellido del cliente.                                                  |
| `phone`    | `string` | No        | Formato internacional E.164 obligatorio (debe coincidir con la expresión regular `^\+[1-9]\d{1,14}$`). |
| `avatar`   | `file`   | No        | Archivo de imagen de tipo JPEG, PNG o WEBP. Tamaño máximo permitido: 5MB.                              |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retornado cuando los campos son válidos, la imagen ha sido subida exitosamente al almacenamiento de Cloudinary y la información se ha actualizado de forma segura en la base de datos.

```json
{
  "success": true,
  "message": "Perfil actualizado correctamente",
  "data": {
    "id": 1,
    "email": "cliente@dominio.com",
    "name": "Juan",
    "lastName": "Pérez",
    "phone": "+51999888777",
    "avatarUrl": "https://res.cloudinary.com/dugbrgwn8/image/upload/v123456789/profiles/juan_perez_123456789.png",
    "authProvider": "local",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-05-19T02:20:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

Retornado cuando el payload no cumple con las validaciones de Zod.

**Ejemplo de Teléfono Inválido:**

```json
{
  "success": false,
  "errors": [
    {
      "field": "phone",
      "message": "El número de teléfono debe estar en formato internacional E.164 (ej: +51999888777)"
    }
  ]
}
```

**Ejemplo de Tipo de Archivo Inválido:**

```json
{
  "success": false,
  "error": "Formato de archivo inválido. Solo se admiten imágenes."
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token en los headers o si es inválido.
- **HTTP 403 Forbidden**: Si el usuario está inactivo.

```json
{
  "success": false,
  "error": "Acceso denegado: Token de autenticación inválido"
}
```

---

## Identidad Visual y Branding

### GET /api/v1/config/brand

Obtiene la configuración actual de la identidad visual y branding del sistema (público para personalización dinámica en el frontend e-commerce).

#### 1. Especificación del Endpoint

| Método | Ruta                   | Autenticación     | Rol Requerido |
| :----- | :--------------------- | :---------------- | :------------ |
| `GET`  | `/api/v1/config/brand` | Ninguna (Público) | Invitado      |

#### 2. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retorna la configuración actual. Si no se ha configurado ninguna, retorna los valores por defecto del sistema.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "brandName": "D'Mendoza",
    "logoUrl": null,
    "primaryColor": "#4F46E5",
    "socialLinksJson": {},
    "updatedAt": "2026-05-20T16:53:28.000Z"
  }
}
```

---

### PUT /api/v1/config/brand

Actualiza la configuración de identidad visual y branding del sistema de forma global. Solo accesible para administradores. Registra la modificación en los logs de auditoría para su trazabilidad.

#### 1. Especificación del Endpoint

| Método | Ruta                   | Autenticación      | Permiso Requerido      |
| :----- | :--------------------- | :----------------- | :--------------------- |
| `PUT`  | `/api/v1/config/brand` | JWT `Bearer Token` | Admin (`roles:manage`) |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "brandName": "D'Mendoza Premium",
  "logoUrl": "https://ejemplo.com/logo.png",
  "primaryColor": "#FF5733",
  "socialLinksJson": {
    "facebook": "https://facebook.com/dmendoza",
    "instagram": "https://instagram.com/dmendoza"
  }
}
```

**Detalle de Campos:**

| Parámetro         | Tipo     | Requerido | Reglas de Validación                                     |
| :---------------- | :------- | :-------- | :------------------------------------------------------- |
| `brandName`       | `string` | Sí        | Nombre comercial visible del sistema.                    |
| `logoUrl`         | `string` | No        | URL absoluta del logotipo de la marca.                   |
| `primaryColor`    | `string` | Sí        | Código de color hexadecimal (ej. `#FF5733`).             |
| `socialLinksJson` | `object` | No        | Objeto JSON con urls de las redes sociales del comercio. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "brandName": "D'Mendoza Premium",
    "logoUrl": "https://ejemplo.com/logo.png",
    "primaryColor": "#FF5733",
    "socialLinksJson": {
      "facebook": "https://facebook.com/dmendoza",
      "instagram": "https://instagram.com/dmendoza"
    },
    "updatedAt": "2026-05-20T16:54:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

Retornado si los campos enviados no cumplen con los tipos o validaciones de Zod.

```json
{
  "success": false,
  "error": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["brandName"],
      "message": "Required"
    }
  ]
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token en los headers o si es inválido.
- **HTTP 403 Forbidden**: Si el usuario autenticado no posee los permisos requeridos (`roles:manage`).

---

## Sucursales y Almacenes

Este módulo permite gestionar el catálogo de sucursales comerciales de la empresa. Cada sucursal creada tiene asociado de manera obligatoria y automática un almacén único (relación 1:1 de negocio) que se administra de forma independiente.

### GET /api/v1/branches

Recupera el listado completo de sucursales registradas en el sistema, incluyendo los detalles del almacén autogenerado asociado a cada una.

#### 1. Especificación del Endpoint

| Método | Ruta               | Autenticación      | Permiso Requerido |
| :----- | :----------------- | :----------------- | :---------------- |
| `GET`  | `/api/v1/branches` | JWT `Bearer Token` | `users:read`      |

#### 2. Cuerpo de la Petición (Request Body)

No requiere cuerpo de petición.

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sucursal Central",
      "address": "Av. Larco 123",
      "phone": "999888777",
      "isActive": true,
      "warehouse": {
        "id": 101,
        "createdAt": "2026-05-20T17:00:00.000Z"
      },
      "createdAt": "2026-05-20T17:00:00.000Z",
      "updatedAt": "2026-05-20T17:00:00.000Z"
    }
  ]
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token en los headers o si es inválido.
- **HTTP 403 Forbidden**: Si el usuario carece del permiso `users:read`.

---

### POST /api/v1/branches

Registra una nueva sucursal comercial en el sistema y crea atómicamente en una única transacción de base de datos su almacén independiente 1:1 asociado.

#### 1. Especificación del Endpoint

| Método | Ruta               | Autenticación      | Permiso Requerido |
| :----- | :----------------- | :----------------- | :---------------- |
| `POST` | `/api/v1/branches` | JWT `Bearer Token` | `users:write`     |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "name": "Sucursal Norte",
  "address": "Calle Las Flores 456",
  "phone": "999888777"
}
```

**Detalle de Campos:**

| Parámetro | Tipo     | Requerido | Reglas de Validación                                                |
| :-------- | :------- | :-------- | :------------------------------------------------------------------ |
| `name`    | `string` | Sí        | Debe ser único. Mínimo 2 caracteres, máximo 100 caracteres.         |
| `address` | `string` | No        | Dirección física de la sucursal. Máximo 255 caracteres.             |
| `phone`   | `string` | No        | Número de teléfono de contacto. Máximo 20 caracteres.               |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 201 Created)

Retornado cuando la sucursal y su almacén se crean de forma atómica y exitosa.

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Sucursal Norte",
    "address": "Calle Las Flores 456",
    "phone": "999888777",
    "isActive": true,
    "warehouse": {
      "id": 102,
      "createdAt": "2026-05-20T17:30:00.000Z"
    },
    "createdAt": "2026-05-20T17:30:00.000Z",
    "updatedAt": "2026-05-20T17:30:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

```json
{
  "success": false,
  "errors": [
    {
      "field": "name",
      "message": "El nombre debe tener al menos 2 caracteres"
    }
  ]
}
```

---

### PUT /api/v1/branches/:id

Actualiza parcialmente uno o más detalles de una sucursal existente por su ID numérico.

#### 1. Especificación del Endpoint

| Método | Ruta                   | Autenticación      | Permiso Requerido |
| :----- | :--------------------- | :----------------- | :---------------- |
| `PUT`  | `/api/v1/branches/:id` | JWT `Bearer Token` | `users:write`     |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "name": "Sucursal Norte Refactor",
  "address": null,
  "phone": "987654321"
}
```

**Detalle de Campos:**

| Parámetro | Tipo     | Requerido | Reglas de Validación                                                  |
| :-------- | :------- | :-------- | :-------------------------------------------------------------------- |
| `name`    | `string` | No        | Si se provee, debe ser único. Mínimo 2 caracteres, máximo 100.        |
| `address` | `string` | No        | Puede ser `null` para eliminar la dirección. Máximo 255 caracteres.   |
| `phone`   | `string` | No        | Puede ser `null` para eliminar el teléfono. Máximo 20 caracteres.     |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Sucursal Norte Refactor",
    "address": null,
    "phone": "987654321",
    "isActive": true,
    "warehouse": {
      "id": 102,
      "createdAt": "2026-05-20T17:30:00.000Z"
    },
    "createdAt": "2026-05-20T17:30:00.000Z",
    "updatedAt": "2026-05-20T17:35:00.000Z"
  }
}
```

##### No Encontrado (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "La sucursal no existe"
}
```

---

### PATCH /api/v1/branches/:id/status

Permite activar o desactivar una sucursal en el sistema, lo cual impacta su disponibilidad comercial general.

#### 1. Especificación del Endpoint

| Método  | Ruta                          | Autenticación      | Permiso Requerido |
| :------ | :---------------------------- | :----------------- | :---------------- |
| `PATCH` | `/api/v1/branches/:id/status` | JWT `Bearer Token` | `users:write`     |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "isActive": false
}
```

**Detalle de Campos:**

| Parámetro  | Tipo      | Requerido | Reglas de Validación                      |
| :--------- | :-------- | :-------- | :---------------------------------------- |
| `isActive` | `boolean` | Sí        | Determina el nuevo estado de la sucursal. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "message": "Sucursal inactivada correctamente",
  "data": {
    "id": 2,
    "name": "Sucursal Norte Refactor",
    "address": null,
    "phone": "987654321",
    "isActive": false,
    "warehouse": {
      "id": 102,
      "createdAt": "2026-05-20T17:30:00.000Z"
    },
    "createdAt": "2026-05-20T17:30:00.000Z",
    "updatedAt": "2026-05-20T17:40:00.000Z"
  }
}
```

##### No Encontrado (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "La sucursal no existe"
}
```

---

## Gestión de Proveedores — HU-051

Este módulo permite administrar el catálogo de proveedores del sistema, incluyendo su registro, actualización y gestión del estado activo/inactivo (baja lógica).

### GET /api/v1/suppliers

Retorna el listado completo de proveedores registrados, ordenados por fecha de creación descendente.

#### 1. Especificación del Endpoint

| Método | Ruta                | Autenticación      | Permiso Requerido |
| :----- | :------------------ | :----------------- | :---------------- |
| `GET`  | `/api/v1/suppliers` | JWT `Bearer Token` | `inventory:read`  |

#### 2. Cuerpo de la Petición (Request Body)

No requiere cuerpo de petición.

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ruc": "20123456789",
      "razonSocial": "Textiles S.A.C.",
      "contacto": "Pedro Gómez",
      "direccion": "Av. Industrial 123, Lima",
      "isActive": true,
      "createdAt": "2026-05-31T10:00:00.000Z",
      "updatedAt": "2026-05-31T10:00:00.000Z"
    }
  ]
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token o es inválido.
- **HTTP 403 Forbidden**: Si el usuario carece del permiso `inventory:read`.

---

### POST /api/v1/suppliers

Registra un nuevo proveedor en el sistema. El RUC debe ser único en la base de datos.

#### 1. Especificación del Endpoint

| Método | Ruta                | Autenticación      | Permiso Requerido  |
| :----- | :------------------ | :----------------- | :----------------- |
| `POST` | `/api/v1/suppliers` | JWT `Bearer Token` | `inventory:write`  |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "ruc": "20123456789",
  "razonSocial": "Textiles S.A.C.",
  "contacto": "Pedro Gómez",
  "direccion": "Av. Industrial 123, Lima"
}
```

**Detalle de Campos:**

| Parámetro    | Tipo     | Requerido | Reglas de Validación                                                    |
| :----------- | :------- | :-------- | :---------------------------------------------------------------------- |
| `ruc`        | `string` | Sí        | Exactamente 11 dígitos numéricos. Debe ser único en el sistema.         |
| `razonSocial`| `string` | Sí        | Mínimo 2 caracteres, máximo 200.                                        |
| `contacto`   | `string` | Sí        | Nombre de persona o área de contacto. Mínimo 2, máximo 100 caracteres.  |
| `direccion`  | `string` | No        | Dirección física del proveedor. Máximo 255 caracteres. Puede ser `null`.|

#### 3. Respuestas (Responses)

##### Éxito (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ruc": "20123456789",
    "razonSocial": "Textiles S.A.C.",
    "contacto": "Pedro Gómez",
    "direccion": "Av. Industrial 123, Lima",
    "isActive": true,
    "createdAt": "2026-05-31T10:00:00.000Z",
    "updatedAt": "2026-05-31T10:00:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

```json
{
  "success": false,
  "errors": [
    {
      "field": "ruc",
      "message": "El RUC debe tener al menos 11 dígitos"
    }
  ]
}
```

##### Conflicto (HTTP 409 Conflict)

Retornado si el RUC ya está registrado en el sistema.

```json
{
  "success": false,
  "error": "El RUC '20123456789' ya se encuentra registrado"
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token o es inválido.
- **HTTP 403 Forbidden**: Si el usuario carece del permiso `inventory:write`.

---

### PUT /api/v1/suppliers/:id

Actualiza los datos de un proveedor existente. Si se modifica el RUC, se valida que no esté en uso por otro proveedor.

#### 1. Especificación del Endpoint

| Método | Ruta                    | Autenticación      | Permiso Requerido |
| :----- | :---------------------- | :----------------- | :---------------- |
| `PUT`  | `/api/v1/suppliers/:id` | JWT `Bearer Token` | `inventory:write` |

#### 2. Cuerpo de la Petición (Request Body)

Todos los campos son opcionales; se actualiza únicamente lo que se envíe.

```json
{
  "razonSocial": "Textiles Premium S.A.C.",
  "contacto": "Carlos López",
  "direccion": null
}
```

**Detalle de Campos:**

| Parámetro    | Tipo     | Requerido | Reglas de Validación                                            |
| :----------- | :------- | :-------- | :-------------------------------------------------------------- |
| `ruc`        | `string` | No        | Exactamente 11 dígitos numéricos. Debe ser único.               |
| `razonSocial`| `string` | No        | Mínimo 2 caracteres, máximo 200.                                |
| `contacto`   | `string` | No        | Mínimo 2 caracteres, máximo 100.                                |
| `direccion`  | `string` | No        | Puede ser `null` para eliminar la dirección. Máximo 255.        |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ruc": "20123456789",
    "razonSocial": "Textiles Premium S.A.C.",
    "contacto": "Carlos López",
    "direccion": null,
    "isActive": true,
    "createdAt": "2026-05-31T10:00:00.000Z",
    "updatedAt": "2026-05-31T10:30:00.000Z"
  }
}
```

##### No Encontrado (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "El proveedor con ID 1 no existe"
}
```

##### Conflicto (HTTP 409 Conflict)

```json
{
  "success": false,
  "error": "El RUC '20999888777' ya se encuentra registrado"
}
```

---

### PATCH /api/v1/suppliers/:id/status

Activa o inactiva un proveedor (baja lógica). Un proveedor inactivo no puede ser utilizado en nuevos ingresos de mercadería.

#### 1. Especificación del Endpoint

| Método  | Ruta                           | Autenticación      | Permiso Requerido |
| :------ | :----------------------------- | :----------------- | :---------------- |
| `PATCH` | `/api/v1/suppliers/:id/status` | JWT `Bearer Token` | `inventory:write` |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "isActive": false
}
```

**Detalle de Campos:**

| Parámetro  | Tipo      | Requerido | Reglas de Validación                        |
| :--------- | :-------- | :-------- | :------------------------------------------ |
| `isActive` | `boolean` | Sí        | Determina el nuevo estado del proveedor.    |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "message": "Proveedor inactivado correctamente",
  "data": {
    "id": 1,
    "ruc": "20123456789",
    "razonSocial": "Textiles S.A.C.",
    "contacto": "Pedro Gómez",
    "direccion": "Av. Industrial 123, Lima",
    "isActive": false,
    "createdAt": "2026-05-31T10:00:00.000Z",
    "updatedAt": "2026-05-31T11:00:00.000Z"
  }
}
```

##### No Encontrado (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "El proveedor con ID 1 no existe"
}
```

---

## Ingreso de Mercadería — HU-051

Este módulo registra los ingresos de mercadería desde proveedores al almacén de una sucursal. Cada registro ejecuta una **transacción atómica** que:

1. Persiste el cabecero `StockEntry` y sus ítems `StockEntryItem`.
2. Actualiza (upsert) el stock actual en `BranchStock` por variante y sucursal.
3. Genera el asiento contable `ENTRADA` en el `KardexEntry` con saldo acumulado.

### GET /api/v1/variants/search

Busca variantes de productos por coincidencia parcial en el SKU de la variante o en el nombre del producto padre. Este endpoint está diseñado para alimentar selectores predictivos (Autocomplete) en la interfaz de usuario al registrar el ingreso de mercadería.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/variants/search` | JWT `Bearer Token` | `inventory:read` |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `q` | `string` | Sí | Término de búsqueda (coincide parcialmente con el SKU o nombre del producto) |
| `limit` | `number` | No | Límite de resultados a retornar (por defecto `10`, máximo `50`) |

#### 3. Respuestas del Servidor

##### Búsqueda Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "sku": "CAMISA-M-AZUL",
      "productName": "Camisa de Algodón Manga Larga",
      "price": 45.00
    }
  ]
}
```

##### Petición Incorrecta (HTTP 400 Bad Request)

Si falta el parámetro `q` o está vacío.

```json
{
  "success": false,
  "error": "El parámetro de búsqueda \"q\" es requerido y no puede estar vacío"
}
```

---

### POST /api/v1/stock/entries

Registra un ingreso de mercadería desde un proveedor activo hacia el almacén de una sucursal.


#### 1. Especificación del Endpoint

| Método | Ruta                    | Autenticación      | Permiso Requerido |
| :----- | :---------------------- | :----------------- | :---------------- |
| `POST` | `/api/v1/stock/entries` | JWT `Bearer Token` | `inventory:write` |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "supplierId": 1,
  "invoiceNumber": "F001-00123",
  "branchId": 2,
  "items": [
    {
      "variantId": 10,
      "quantity": 50,
      "unitCost": 25.50
    },
    {
      "variantId": 15,
      "quantity": 30,
      "unitCost": 18.00
    }
  ],
  "distributionItems": [
    {
      "branchId": 2,
      "variantId": 10,
      "quantity": 30
    },
    {
      "branchId": 3,
      "variantId": 10,
      "quantity": 20
    }
  ]
}
```

**Detalle de Campos — Cabecero:**

| Parámetro | Tipo | Requerido | Reglas de Validación |
| :--- | :--- | :--- | :--- |
| `supplierId` | `number` | Sí | ID entero positivo. El proveedor debe existir y estar activo. |
| `invoiceNumber` | `string` | Sí | Número de comprobante de pago (factura/boleta). Máximo 50 caracteres. |
| `branchId` | `number` | Sí | ID entero positivo. Identifica la sucursal destino del ingreso (sucursal receptora principal). |
| `items` | `array` | Sí | Al menos 1 ítem. Cada ítem representa una variante de producto ingresada. |
| `distributionItems`| `array` | No | Lista opcional de asignaciones para distribuir el stock a sucursales secundarias durante el ingreso (HU-022). |

**Detalle de Campos — Ítems (`items[]`):**

| Parámetro | Tipo | Requerido | Reglas de Validación |
| :--- | :--- | :--- | :--- |
| `variantId` | `number` | Sí | ID entero positivo de la variante de producto (`ProductVariant`). |
| `quantity` | `number` | Sí | Cantidad ingresada. Debe ser un número positivo mayor a 0. |
| `unitCost` | `number` | Sí | Costo unitario de compra. Debe ser un número positivo mayor a 0. |

**Detalle de Campos — Distribución (`distributionItems[]`):**

| Parámetro | Tipo | Requerido | Reglas de Validación |
| :--- | :--- | :--- | :--- |
| `branchId` | `number` | Sí | ID entero positivo de la sucursal de destino. |
| `variantId` | `number` | Sí | ID entero positivo de la variante de producto a distribuir. |
| `quantity` | `number` | Sí | Cantidad a distribuir. Debe ser un número positivo mayor a 0. La suma de cantidades distribuidas por variante no debe superar la cantidad total ingresada en `items[]`. El remanente se asignará automáticamente a la sucursal receptora (`branchId`). |


#### 3. Respuestas (Responses)

##### Éxito (HTTP 201 Created)

Retornado cuando la transacción completa se ejecuta exitosamente. El stock y el Kardex han sido actualizados.

```json
{
  "success": true,
  "data": {
    "id": 5,
    "supplierId": 1,
    "supplierRazonSocial": "Textiles S.A.C.",
    "invoiceNumber": "F001-00123",
    "branchId": 2,
    "items": [
      {
        "id": 9,
        "variantId": 10,
        "quantity": 50,
        "unitCost": 25.50
      },
      {
        "id": 10,
        "variantId": 15,
        "quantity": 30,
        "unitCost": 18.00
      }
    ],
    "createdAt": "2026-05-31T14:00:00.000Z",
    "updatedAt": "2026-05-31T14:00:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

Retornado cuando el payload no cumple con las restricciones del schema Zod.

```json
{
  "success": false,
  "errors": [
    {
      "field": "items",
      "message": "El ingreso debe contener al menos un ítem"
    },
    {
      "field": "items.0.unitCost",
      "message": "El costo unitario debe ser mayor a 0"
    }
  ]
}
```

##### No Encontrado (HTTP 404 Not Found)

Retornado si el `supplierId` no corresponde a ningún proveedor existente.

```json
{
  "success": false,
  "error": "El proveedor con ID 99 no existe"
}
```

##### Entidad no Procesable (HTTP 422 Unprocessable Entity)

Retornado si el proveedor existe pero se encuentra inactivo.

```json
{
  "success": false,
  "error": "El proveedor 'Textiles S.A.C.' se encuentra inactivo"
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token o es inválido.
- **HTTP 403 Forbidden**: Si el usuario carece del permiso `inventory:write`.

```json
{
  "success": false,
  "error": "Acceso denegado: Se requiere el permiso 'inventory:write'"
}
```

##### Error Interno (HTTP 500 Internal Server Error)

Retornado si falla la transacción de base de datos (ej. FK inválida en `variantId` o `branchId`). La transacción Prisma hace rollback automático garantizando consistencia.

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Visualización de Stock — HU-021

Este módulo permite consultar de forma centralizada el stock consolidado (global) y desglosado por sucursal de todas las variantes de producto activas del sistema.

### GET /api/v1/stock

Consulta la lista de existencias consolidadas y por sucursal. Soporta filtros opcionales de búsqueda.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/stock` | JWT `Bearer Token` | `inventory:read` |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `variantId` | `number` | No | ID de la variante específica a consultar |
| `branchId` | `number` | No | ID de la sucursal para filtrar los desgloses de stock |
| `sku` | `string` | No | Filtro de coincidencia parcial en el SKU de la variante |

#### 3. Respuestas (Responses)

##### Consulta Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "variantId": 10,
      "sku": "CAMISA-M-AZUL",
      "productName": "Camisa de Algodón Manga Larga",
      "globalStock": 80,
      "byBranch": [
        {
          "branchId": 2,
          "branchName": "Sucursal Norte",
          "quantity": 50
        },
        {
          "branchId": 3,
          "branchName": "Sucursal Sur",
          "quantity": 30
        }
      ]
    }
  ]
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token o es inválido.
- **HTTP 403 Forbidden**: Si el usuario carece del permiso `inventory:read`.

```json
{
  "success": false,
  "error": "Acceso denegado: Se requiere el permiso 'inventory:read'"
}
```

---

## Auditoría de Inventario Físico — HU-029

Este módulo permite registrar tomas o auditorías de inventario físico en las sucursales, comparando el conteo de existencias del personal (`physicalQty`) contra el stock registrado en el sistema (`systemQty`) y calculando las diferencias de manera automática.

### POST /api/v1/inventory-audits

Registra una auditoría de inventario físico. Si se guarda como `CONFIRMED`, sincroniza de manera atómica el stock físico e historial contable (asientos `AJUSTE` en Kardex).

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/inventory-audits` | JWT `Bearer Token` | `inventory:write` |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "branchId": 1,
  "status": "CONFIRMED",
  "items": [
    {
      "variantId": 10,
      "physicalQty": 45
    },
    {
      "variantId": 15,
      "physicalQty": 30
    }
  ]
}
```

**Detalle de Campos — Cabecero:**

| Parámetro | Tipo | Requerido | Reglas de Validación |
| :--- | :--- | :--- | :--- |
| `branchId` | `number` | Sí | ID entero positivo. La sucursal debe existir. |
| `status` | `string` | Sí | Debe ser `'PENDING'` (borrador/conteo preliminar) o `'CONFIRMED'` (aplica el ajuste de stock). |
| `items` | `array` | Sí | Al menos 1 ítem a auditar. |

**Detalle de Campos — Ítems (`items[]`):**

| Parámetro | Tipo | Requerido | Reglas de Validación |
| :--- | :--- | :--- | :--- |
| `variantId` | `number` | Sí | ID entero positivo de la variante a auditar. Debe existir. |
| `physicalQty` | `number` | Sí | Cantidad física real contada. Debe ser un número no negativo (mayor o igual a 0). |

#### 3. Respuestas (Responses)

##### Registro Exitoso (HTTP 201 Created)

Retornado cuando la auditoría se guarda correctamente. El cálculo de la diferencia se realiza automáticamente en base al stock actual de la sucursal.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "branchId": 1,
    "status": "CONFIRMED",
    "items": [
      {
        "id": 1,
        "variantId": 10,
        "physicalQty": 45,
        "systemQty": 50,
        "difference": -5
      },
      {
        "id": 2,
        "variantId": 15,
        "physicalQty": 30,
        "systemQty": 30,
        "difference": 0
      }
    ],
    "createdAt": "2026-05-31T06:30:00.000Z",
    "updatedAt": "2026-05-31T06:30:00.000Z"
  }
}
```

##### Error de Validación (HTTP 400 Bad Request)

Si faltan parámetros o no corresponden con las especificaciones.

```json
{
  "success": false,
  "errors": [
    {
      "field": "status",
      "message": "El estado debe ser 'PENDING' o 'CONFIRMED'"
    }
  ]
}
```

##### Sucursal/Variante No Encontrada (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "La sucursal con ID 99 no existe"
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token o es inválido.
- **HTTP 403 Forbidden**: Si el usuario carece del permiso `inventory:write`.

```json
{
  "success": false,
  "error": "Acceso denegado: Se requiere el permiso 'inventory:write'"
}
```


