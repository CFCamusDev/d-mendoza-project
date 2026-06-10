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
- [Punto de Venta (POS) — HU-034](#punto-de-venta-pos--hu-034)
  - [POST /api/v1/pos/discounts/validate](#post-apiv1posdiscountsvalidate)
- [Apertura de Caja y Turnos — HU-032](#apertura-de-caja-y-turnos--hu-032)
  - [POST /api/v1/cash-turns/open](#post-apiv1cashturnsopen)
  - [GET /api/v1/cash-registers](#get-apiv1cashregisters)
  - [GET /api/v1/cash-turns/active](#get-apiv1cashturnsactive)

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

## 9. Módulo de POS (Punto de Venta)

### 9.1 Procesar Venta con Múltiples Pagos
- **URL:** `/api/v1/pos/sales`
- **Method:** `POST`
- **Auth Required:** Yes (Role: `ADMIN`, `SELLER`) + (Permission: `pos:sales`)
- **Body:**
```json
{
  "branchId": 1,
  "subtotal": 100.00,
  "discountTotal": 10.00,
  "total": 90.00,
  "items": [
    { "variantId": 5, "quantity": 2, "unitPrice": 50.00, "discountAmount": 10.00 }
  ],
  "payments": [
    { "method": "CASH", "amount": 50.00 },
    { "method": "YAPE", "amount": 40.00 }
  ]
}
```
- **Success Response:**
  - **Code:** 201 Created
  - **Content:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "subtotal": "100.00",
    "discountTotal": "10.00",
    "total": "90.00",
    "userId": 2,
    "branchId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 9.2 Validar Descuentos (HU-034)

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
    "faviconUrl": "https://res.cloudinary.com/...",
    "logoHorizontalUrl": "https://res.cloudinary.com/...",
    "logoVerticalUrl": "https://res.cloudinary.com/...",
    "colorBrandBg": "#F7F7F5",
    "colorBrandPrimary": "#D9D9D2",
    "colorBrandText": "#6B6B6B",
    "colorBrandAccent": "#3F3F3F",
    "socialLinksJson": {
      "facebook": "https://facebook.com/dmendoza"
    },
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
  "faviconUrl": "https://res.cloudinary.com/...",
  "logoHorizontalUrl": "https://res.cloudinary.com/...",
  "logoVerticalUrl": "https://res.cloudinary.com/...",
  "colorBrandBg": "#F7F7F5",
  "colorBrandPrimary": "#D9D9D2",
  "colorBrandText": "#6B6B6B",
  "colorBrandAccent": "#3F3F3F",
  "socialLinksJson": {
    "facebook": "https://facebook.com/dmendoza",
    "instagram": "https://instagram.com/dmendoza"
  }
}
```

**Detalle de Campos:**

| Parámetro           | Tipo     | Requerido | Reglas de Validación                                     |
| :------------------ | :------- | :-------- | :------------------------------------------------------- |
| `brandName`         | `string` | Sí        | Nombre comercial visible del sistema.                    |
| `faviconUrl`        | `string` | No        | URL absoluta del favicon de la marca.                    |
| `logoHorizontalUrl` | `string` | No        | URL absoluta del logotipo horizontal de la marca.        |
| `logoVerticalUrl`   | `string` | No        | URL absoluta del logotipo vertical de la marca.          |
| `colorBrandBg`      | `string` | Sí        | Color principal de fondo (ej. `#F7F7F5`).                |
| `colorBrandPrimary` | `string` | Sí        | Color primario de la marca (ej. `#D9D9D2`).              |
| `colorBrandText`    | `string` | Sí        | Color principal del texto (ej. `#6B6B6B`).               |
| `colorBrandAccent`  | `string` | Sí        | Color de acento/resalte (ej. `#3F3F3F`).                 |
| `socialLinksJson`   | `object` | No        | Objeto JSON con urls de las redes sociales del comercio. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "brandName": "D'Mendoza Premium",
    "faviconUrl": "https://res.cloudinary.com/...",
    "logoHorizontalUrl": "https://res.cloudinary.com/...",
    "logoVerticalUrl": "https://res.cloudinary.com/...",
    "colorBrandBg": "#F7F7F5",
    "colorBrandPrimary": "#D9D9D2",
    "colorBrandText": "#6B6B6B",
    "colorBrandAccent": "#3F3F3F",
    "socialLinksJson": {
      "facebook": "https://facebook.com/dmendoza",
      "instagram": "https://instagram.com/dmendoza"
    },
    "updatedAt": "2026-05-20T16:54:00.000Z"
  }
}
```

---

### POST /api/v1/config/brand/upload

Sube un archivo de imagen al servidor de almacenamiento en la nube (Cloudinary) y devuelve la URL absoluta de la imagen.

#### 1. Especificación del Endpoint

| Método | Ruta                          | Autenticación      | Permiso Requerido      |
| :----- | :---------------------------- | :----------------- | :--------------------- |
| `POST` | `/api/v1/config/brand/upload` | JWT `Bearer Token` | Admin (`roles:manage`) |

#### 2. Cuerpo de la Petición (Request Body - multipart/form-data)

Se requiere que el Content-Type de la petición sea `multipart/form-data`.

| Parámetro | Tipo   | Requerido | Descripción |
| :-------- | :----- | :-------- | :---------- |
| `image`   | `File` | Sí        | Archivo de la imagen a subir (ej. PNG, JPG, WEBP). Tamaño máximo 5MB. |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/tu-cloud-name/image/upload/v1684345231/logo-123456.png"
  }
}
```

##### Error de Archivo Faltante (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "La imagen del logo es requerida"
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

---
<<<<<<< HEAD
=======

## Apertura de Caja y Turnos — HU-032

Este módulo permite a los vendedores y administradores aperturar turnos de caja para registrar las operaciones del punto de venta (POS) vinculados a un monto de apertura.

### POST /api/v1/cash-turns/open

Apertura el turno de caja vinculándolo al vendedor autenticado.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/cash-turns/open` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "registerId": 1,
  "openAmount": 150.00
}
```

**Detalle de Campos:**

| Parámetro | Tipo | Requerido | Reglas de Validación |
| :--- | :--- | :--- | :--- |
| `registerId` | `number` | Sí | ID entero positivo de la caja registradora. Debe existir y estar disponible (sin turnos abiertos activos). |
| `openAmount` | `number` | Sí | Monto inicial de apertura. Debe ser un número mayor o igual a 0. |

#### 3. Respuestas (Responses)

##### Apertura Exitosa (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "registerId": 1,
    "userId": 2,
    "openAmount": 150.00,
    "status": "OPEN",
    "openedAt": "2026-06-01T11:45:00.000Z",
    "closedAt": null,
    "createdAt": "2026-06-01T11:45:00.000Z",
    "updatedAt": "2026-06-01T11:45:00.000Z"
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
      "field": "registerId",
      "message": "El ID de la caja debe ser un entero positivo"
    }
  ]
}
```

##### Caja No Encontrada (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "La caja registradora con ID 99 no existe"
}
```

##### Caja Ocupada o Usuario con Turno Abierto (HTTP 409 Conflict)

Retornado si el vendedor ya tiene un turno abierto o si la caja seleccionada ya está ocupada por otro turno activo.

```json
{
  "success": false,
  "error": "La caja registradora 'Caja Principal' ya tiene un turno abierto activo"
}
```

##### Acceso Denegado (HTTP 401 / 403)

- **HTTP 401 Unauthorized**: Si falta el Token o es inválido.
- **HTTP 403 Forbidden**: Si el usuario autenticado posee un rol diferente a `ADMIN` o `SELLER`.

```json
{
  "success": false,
  "error": "Acceso denegado: Solo los roles Administrador o Vendedor están autorizados para abrir caja"
}
```

---

### GET /api/v1/cash-registers

Obtiene la lista de todas las cajas registradoras asociadas a una sucursal específica.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cash-registers` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `branchId` | `number` | Sí | ID de la sucursal de la cual se desean obtener las cajas registradoras. |

#### 3. Respuestas (Responses)

##### Listado Exitoso (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "branchId": 1,
      "name": "Caja Principal - Sede Sur",
      "createdAt": "2026-06-01T11:00:00.000Z",
      "updatedAt": "2026-06-01T11:00:00.000Z"
    },
    {
      "id": 2,
      "branchId": 1,
      "name": "Caja Secundaria - Sede Sur",
      "createdAt": "2026-06-01T11:00:00.000Z",
      "updatedAt": "2026-06-01T11:00:00.000Z"
    }
  ]
}
```

##### Error de Parámetros (HTTP 400 Bad Request)

Retornado si falta el parámetro `branchId` o si es inválido.

```json
{
  "success": false,
  "error": "El parámetro branchId es obligatorio y debe ser un número entero"
}
```

---

### GET /api/v1/cash-turns/active

Obtiene el turno de caja abierto del usuario autenticado si es que existe. Utilizado para hidratar el estado de caja al cargar la aplicación.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cash-turns/active` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Respuestas (Responses)

##### Turno Activo Encontrado (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "registerId": 1,
    "userId": 2,
    "openAmount": 150.00,
    "status": "OPEN",
    "openedAt": "2026-06-01T11:45:00.000Z",
    "closedAt": null,
    "createdAt": "2026-06-01T11:45:00.000Z",
    "updatedAt": "2026-06-01T11:45:00.000Z"
  }
}
```

##### Sin Turno Activo (HTTP 200 OK)

Retornado cuando el usuario no tiene ningún turno de caja abierto en sesión.

```json
{
  "success": true,
  "data": null
}
```

---

### POST /api/v1/cash-registers

Crea una nueva caja registradora.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/cash-registers` | JWT `Bearer Token` | Administrador (`ADMIN`) |

#### 2. Cuerpo de la Solicitud (Request Body)

```json
{
  "branchId": 1,
  "name": "Caja Principal - Sede Larco"
}
```

#### 3. Respuestas (Responses)

##### Creación Exitosa (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 4,
    "branchId": 1,
    "name": "Caja Principal - Sede Larco",
    "createdAt": "2026-06-01T21:54:00.000Z",
    "updatedAt": "2026-06-01T21:54:00.000Z"
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
      "message": "El nombre debe tener al menos 3 caracteres"
    }
  ]
}
```

---

### PATCH /api/v1/cash-registers/:id

Actualiza la información de una caja registradora existente.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/v1/cash-registers/:id` | JWT `Bearer Token` | Administrador (`ADMIN`) |

#### 2. Cuerpo de la Solicitud (Request Body)

```json
{
  "name": "Caja Principal Renovada"
}
```

#### 3. Respuestas (Responses)

##### Actualización Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 4,
    "branchId": 1,
    "name": "Caja Principal Renovada",
    "createdAt": "2026-06-01T21:54:00.000Z",
    "updatedAt": "2026-06-01T21:55:00.000Z"
  }
}
```

---

### DELETE /api/v1/cash-registers/:id

Realiza la eliminación lógica (`isActive: false`) de una caja registradora.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `DELETE` | `/api/v1/cash-registers/:id` | JWT `Bearer Token` | Administrador (`ADMIN`) |

#### 2. Respuestas (Responses)

##### Eliminación Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "message": "Caja registradora eliminada lógicamente con éxito"
}
```

##### Conflicto - Turno Abierto (HTTP 409 Conflict)

```json
{
  "success": false,
  "error": "No se puede desactivar la caja registradora porque tiene un turno abierto actualmente"
}
```

---

### GET /api/v1/pos/products

Busca productos/variantes para el POS por SKU o nombre de producto, retornando el stock correspondiente a la sucursal del turno activo del usuario.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pos/products` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `sku` | `string` | Sí | SKU exacto (para lector de código de barras) o coincidencia parcial del nombre del producto. |

#### 3. Respuestas (Responses)

##### Búsqueda Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "variantId": 12,
      "productId": 5,
      "sku": "CAM-M-BLUE",
      "name": "Camisa Denim - M - Blue",
      "baseName": "Camisa Denim",
      "price": 89.90,
      "stock": 25,
      "attributes": {
        "Talla": "M",
        "Color": "Blue"
      }
    }
  ]
}
```

##### Error - Parámetro Requerido Faltante (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "El parámetro de búsqueda (sku) es requerido y no puede estar vacío"
}
```

##### Error - Turno Cerrado o Sin Apertura de Caja (HTTP 400 Bad Request)

Retornado cuando el vendedor autenticado no ha realizado la apertura de caja para su sesión y por ende no se tiene una sucursal activa.

```json
{
  "success": false,
  "error": "No tienes un turno de caja abierto. Por favor, abre caja antes de realizar búsquedas o ventas en el POS."
}
```

---

### GET /api/v1/pos/clients/lookup

Consulta de forma predictiva los datos de DNI o RUC desde la API externa de Factiliza.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pos/clients/lookup` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `type` | `string` | Sí | Tipo de documento, debe ser exactamente `DNI` o `RUC`. |
| `number` | `string` | Sí | Número de documento (8 dígitos para DNI, 11 dígitos para RUC). |

#### 3. Respuestas (Responses)

##### Búsqueda Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "success": true,
    "documentNumber": "73614169",
    "name": "JOSE PEDRO",
    "lastName": "CASTILLO TERRONES",
    "address": "CASERIO PUÑA",
    "department": "CAJAMARCA",
    "province": "CHOTA",
    "district": "TACABAMBA",
    "ubigeo": "060417"
  }
}
```

##### Documento no Encontrado o Inválido (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "Documento no encontrado en el padrón o inválido"
}
```

---

### POST /api/v1/pos/clients/quick-register

Realiza el registro rápido de un cliente en el POS utilizando datos de la API de Factiliza.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/pos/clients/quick-register` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Cuerpo de la Solicitud (Request Body)

```json
{
  "documentType": "DNI",
  "documentId": "73614169",
  "phone": "987654321",
  "email": "cliente@correo.com"
}
```

#### 3. Respuestas (Responses)

##### Registro Exitoso (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 15,
    "documentType": "DNI",
    "documentId": "73614169",
    "name": "JOSE PEDRO",
    "lastName": "CASTILLO TERRONES",
    "phone": "987654321",
    "email": "cliente@correo.com",
    "address": "CASERIO PUÑA",
    "department": "CAJAMARCA",
    "province": "CHOTA",
    "district": "TACABAMBA",
    "ubigeo": "060417",
    "userId": null,
    "createdAt": "2026-06-01T23:28:00.000Z",
    "updatedAt": "2026-06-01T23:28:00.000Z"
  }
}
```

##### Conflicto - Cliente ya existe en BD (HTTP 409 Conflict)

```json
{
  "success": false,
  "error": "El cliente con documento 73614169 ya se encuentra registrado en el sistema"
}
```

##### Error - Documento Inválido o No Existe en Factiliza (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "Cliente no encontrado o documento inválido (DNI: 00000000)"
}
```

---

### GET /api/v1/pos/clients/search

Realiza una búsqueda express de clientes locales registrados en el sistema por DNI, RUC o Nombre/Apellido con paginación máxima de 10 registros.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pos/clients/search` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `q` | `string` | Sí | El término de búsqueda (coincide parcialmente por DNI, RUC, nombre o apellido). |
| `page` | `number` | No | Número de página para la paginación (por defecto es 1). |

#### 3. Respuestas (Responses)

##### Búsqueda Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "clients": [
    {
      "id": 15,
      "documentType": "DNI",
      "documentId": "73614169",
      "name": "JOSE PEDRO",
      "lastName": "CASTILLO TERRONES",
      "phone": "987654321",
      "email": "cliente@correo.com",
      "address": "CASERIO PUÑA",
      "department": "CAJAMARCA",
      "province": "CHOTA",
      "district": "TACABAMBA",
      "ubigeo": "060417",
      "userId": null,
      "createdAt": "2026-06-01T23:28:00.000Z",
      "updatedAt": "2026-06-01T23:28:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "limit": 10
  }
}
```

##### Error - Parámetro q Faltante (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "El parámetro de búsqueda q es obligatorio"
}
```
>>>>>>> origin/develop

## Punto de Venta (POS) — HU-034

### POST /api/v1/pos/discounts/validate

Valida y calcula la aplicación de un descuento sobre un carrito de compra del POS. Requiere que el rol del usuario autenticado posea el permiso `pos:discounts` (Control RBAC). Devuelve el desglose financiero completo: subtotal, monto de descuento calculado y total final.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso RBAC Requerido |
| :----- | :--- | :------------ | :--------------------- |
| `POST` | `/api/v1/pos/discounts/validate` | Bearer JWT | `pos:discounts` |

> **Nota de Seguridad:** Este endpoint está protegido por el middleware `requirePermission('pos:discounts')`. Solo usuarios con roles que tengan este permiso asignado (ej. `ADMIN`, `CAJERO_SENIOR`) podrán acceder. Los intentos sin el permiso correcto retornarán `HTTP 403 Forbidden`.

#### 2. Cuerpo de la Petición (Request Body)

Se espera un objeto JSON con la siguiente estructura:

```json
{
  "items": [
    {
      "variantId": 12,
      "quantity": 2,
      "unitPrice": 49.99
    },
    {
      "variantId": 7,
      "quantity": 1,
      "unitPrice": 25.00
    }
  ],
  "discountType": "percentage",
  "discountValue": 10
}
```

#### 3. Campos del Request Body

| Campo | Tipo | Requerido | Descripción |
| :---- | :--- | :-------- | :---------- |
| `items` | `Array` | Sí | Lista de ítems del carrito. Debe tener al menos 1 elemento. |
| `items[].variantId` | `number (int)` | Sí | ID del `ProductVariant` a vender. |
| `items[].quantity` | `number (int)` | Sí | Cantidad de unidades. Debe ser mayor que 0. |
| `items[].unitPrice` | `number` | Sí | Precio unitario del ítem en moneda local. No negativo. |
| `discountType` | `"percentage" \| "fixed"` | Sí | Modalidad del descuento. `"percentage"` aplica un porcentaje sobre el subtotal. `"fixed"` aplica un monto fijo. |
| `discountValue` | `number` | Sí | Valor del descuento. Para `"percentage"`: valor entre 0.01 y 100. Para `"fixed"`: valor positivo que no supere el subtotal. |

#### 4. Respuesta Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "subtotal": 124.98,
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 12.50,
    "total": 112.48,
    "appliedBy": {
      "userId": 3,
      "email": "cajero@dmendoza.com"
    }
  }
}
```

#### 5. Respuestas de Error

**HTTP 400 — Validación fallida (datos inválidos)**

```json
{
  "success": false,
  "error": [
    {
      "code": "too_small",
      "message": "Se requiere al menos un ítem para calcular el descuento",
      "path": ["items"]
    }
  ]
}
```

**HTTP 400 — Porcentaje superior al 100%**

```json
{
  "success": false,
  "error": "El descuento porcentual no puede superar el 100%"
}
```

**HTTP 400 — Descuento fijo mayor que el subtotal**

```json
{
  "success": false,
  "error": "El descuento fijo no puede superar el subtotal de la orden"
}
```

**HTTP 401 — Token faltante o inválido**

```json
{
  "success": false,
  "error": "Acceso no autorizado: Token faltante o con formato incorrecto"
}
```

**HTTP 403 — Rol sin permiso `pos:discounts`**

```json
{
  "success": false,
  "error": "Acceso denegado: Se requiere el permiso 'pos:discounts'"
}
```

---

### 3. Emisión de Comprobante (Receipt)

**`GET /api/v1/pos/sales/:id/receipt`**

Devuelve los datos completos y estructurados de una venta específica, optimizados para la impresión del ticket en el POS (comprobante térmico de 58/80mm).

- **Permisos requeridos:** `pos:sales:read` o `pos:sales`
- **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "date": "2026-06-02T12:00:00.000Z",
    "seller": "Carlos Mendoza",
    "branch": {
      "id": 1,
      "name": "Sede Principal",
      "address": "Av. Central 123",
      "phone": "999888777"
    },
    "items": [
      {
        "id": 1,
        "name": "Aceite Motor 5W30",
        "sku": "LUB-001",
        "quantity": 2,
        "unitPrice": 45.00,
        "discountAmount": 0.00,
        "lineTotal": 90.00,
        "isCrossBranch": false
      }
    ],
    "totals": {
      "subtotal": 90.00,
      "discountTotal": 0.00,
      "total": 90.00,
      "paid": 100.00,
      "change": 10.00
    },
    "payments": [
      {
        "method": "CASH",
        "amount": 100.00
      }
    ]
  }
}
```

---

### GET /api/v1/pos/stock/cross-branch

Consulta el stock de una variante de producto en todas las sucursales activas, excluyendo la sucursal del turno actual del vendedor.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pos/stock/cross-branch` | JWT `Bearer Token` | Autenticado (`ADMIN` o `SELLER`) |

#### 2. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `variantId` | `number` | Sí | El ID de la variante de producto a consultar. |

#### 3. Respuestas (Responses)

##### Consulta Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "branchId": 2,
      "branchName": "Sede Miraflores",
      "quantity": 15
    },
    {
      "branchId": 3,
      "branchName": "Sede Larco",
      "quantity": 5
    }
  ]
}
```

##### Error - Parámetro variantId Inválido (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "El parámetro variantId debe ser un número entero positivo"
}
```

##### Error - Turno Cerrado o Sin Apertura de Caja (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "No tienes un turno de caja abierto. Por favor, abre caja antes de realizar consultas de stock intersucursales."
}
```

##### Error - Variante No Encontrada (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "La variante de producto con ID 999 no existe o se encuentra inactiva"
}
```

---

### POST /api/v1/stock-transfers

Registra y ejecuta una transferencia interna de stock de una variante de producto desde una sucursal de origen hacia otra de destino. Descuenta el inventario en la de origen, lo incrementa en la de destino, y genera los asientos de Kardex (SALIDA y ENTRADA) correspondientes.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/stock-transfers` | JWT `Bearer Token` | Permiso `inventory:write` |

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "fromBranchId": 1,
  "toBranchId": 2,
  "variantId": 15,
  "quantity": 5
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `fromBranchId` | `number` | Sí | El ID de la sucursal de origen (debe existir y estar activa). |
| `toBranchId` | `number` | Sí | El ID de la sucursal de destino (debe existir, estar activa y ser diferente del origen). |
| `variantId` | `number` | Sí | El ID de la variante de producto a transferir (debe existir y estar activa). |
| `quantity` | `number` | Sí | La cantidad de unidades a transferir (debe ser un número entero o decimal positivo). |

#### 3. Respuestas (Responses)

##### Transferencia Exitosa (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "fromBranchId": 1,
    "toBranchId": 2,
    "variantId": 15,
    "quantity": 5,
    "status": "CONFIRMED",
    "createdAt": "2026-06-10T08:14:00.000Z",
    "updatedAt": "2026-06-10T08:14:00.000Z",
    "fromBranch": {
      "id": 1,
      "name": "Sede Central",
      "isActive": true
    },
    "toBranch": {
      "id": 2,
      "name": "Sede San Isidro",
      "isActive": true
    },
    "variant": {
      "id": 15,
      "sku": "CAM-M-ROJO",
      "price": 49.90,
      "isActive": true
    }
  }
}
```

##### Error - Stock Insuficiente (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "Stock insuficiente en la sucursal de origen. Stock disponible: 3"
}
```

##### Error - Sucursales Iguales (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "La sucursal de origen y destino no pueden ser la misma"
}
```

##### Error - Recurso No Encontrado o Inactivo (HTTP 404 Not Found)

```json
{
  "success": false,
  "error": "La variante del producto no existe o se encuentra inactiva"
}
```

---

### POST /api/v1/pos/sales (Soporte Cross-Branch)

Registra una venta desde el POS. Permite indicar de forma opcional si es una venta Cross-Branch para reservar stock en la sucursal de origen en lugar de descontar directamente y generar Kardex.

#### 1. Nuevos Campos en el Request Body

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `isCrossBranch` | `boolean` | No | Indica si la venta toma stock de otra sucursal (`default: false`). |
| `sourceBranchId` | `number` | No | ID de la sucursal de origen de donde proviene el stock físico. |

---

### PATCH /api/v1/pos/sales/:id/confirm-cross-branch

Confirma la entrega física de una venta Cross-Branch. Esto cambia el estado de stock en la sucursal de origen de `RESERVED` a `SOLD`, genera el asiento correspondiente de `SALIDA` en el Kardex de origen y registra la auditoría.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/v1/pos/sales/:id/confirm-cross-branch` | JWT `Bearer Token` | Autenticado |

#### 2. Respuestas (Responses)

##### Confirmación Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 12,
    "status": "COMPLETED",
    "subtotal": 120.00,
    "discountTotal": 0.00,
    "total": 120.00,
    "branchId": 1,
    "isCrossBranch": true,
    "sourceBranchId": 2,
    "createdAt": "2026-06-10T09:40:00.000Z",
    "updatedAt": "2026-06-10T09:42:00.000Z"
  }
}
```

##### Error - No es Venta Cross-Branch (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "Esta orden no corresponde a una venta Cross-Branch"
}
```

##### Error - Ya Confirmada Previamente (HTTP 400 Bad Request)

```json
{
  "success": false,
  "error": "Esta venta Cross-Branch ya ha sido confirmada previamente"
```

---

### GET /api/v1/admin/cross-branch/pending

Obtiene las ventas Cross-Branch que están pendientes de entrega física, agrupadas por sucursal de origen (sucursal proveedora de stock).

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/cross-branch/pending` | JWT `Bearer Token` | Permiso `inventory:read` |

#### 2. Respuestas (Responses)

##### Respuesta Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "sourceBranchId": 1,
      "sourceBranchName": "Sede Central",
      "pendingOrdersCount": 1,
      "totalReservedUnits": 2,
      "orders": [
        {
          "orderId": 12,
          "destinationBranchId": 2,
          "destinationBranchName": "Sede San Isidro",
          "totalAmount": 99.80,
          "createdAt": "2026-06-10T09:40:00.000Z",
          "items": [
            {
              "variantId": 15,
              "sku": "CAM-M-ROJO",
              "productName": "Camisa Casual",
              "quantity": 2,
              "unitPrice": 49.90
            }
          ]
        }
      ]
    }
```

---

### GET /api/v1/receipts

Consulta de manera paginada y filtrada las ventas/comprobantes electrónicos emitidos en el sistema POS.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso / Rol Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/receipts` | JWT `Bearer Token` | Permiso `sales:read` |

#### 2. Parámetros Query (Query Parameters)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `branchId` | `number` | No | ID de la sucursal emisora. |
| `type` | `string` | No | Tipo de comprobante (`cross-branch` \| `normal`). |
| `from` | `string` | No | Fecha de inicio de búsqueda (formato YYYY-MM-DD o ISO). |
| `to` | `string` | No | Fecha de fin de búsqueda (formato YYYY-MM-DD o ISO). |
| `page` | `number` | No | Número de página para la paginación (`default: 1`). |
| `limit` | `number` | No | Cantidad de elementos por página (`default: 10`). |

#### 3. Respuestas (Responses)

##### Respuesta Exitosa (HTTP 200 OK)

```json
{
  "success": true,
  "data": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "results": [
      {
        "orderId": 12,
        "status": "COMPLETED",
        "subtotal": 99.80,
        "discountTotal": 0.00,
        "total": 99.80,
        "isCrossBranch": true,
        "sourceBranch": {
          "id": 1,
          "name": "Sede Central"
        },
        "branch": {
          "id": 2,
          "name": "Sede San Isidro"
        },
        "createdAt": "2026-06-10T09:40:00.000Z",
        "seller": {
          "id": 5,
          "name": "Juan",
          "lastName": "Perez",
          "email": "juan.perez@dmendoza.com"
        },
        "client": {
          "id": 3,
          "name": "Carlos",
          "lastName": "Mendoza",
          "documentId": "45678912"
        }
      }
    ]
  }
}
```
```
