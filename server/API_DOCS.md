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
- [Gestión de Variantes SKU de Productos](#gestión-de-variantes-sku-de-productos)
  - [GET /api/v1/products/:id/variants](#get-apiv1productsidvariants)
  - [POST /api/v1/products/:id/variants](#post-apiv1productsidvariants)
  - [PUT /api/v1/variants/:id](#put-apiv1variantsid)
- [Sucursales y Almacenes](#sucursales-y-almacenes)
  - [GET /api/v1/branches](#get-apiv1branches)
  - [POST /api/v1/branches](#post-apiv1branches)
  - [PUT /api/v1/branches/:id](#put-apiv1branchesid)
  - [PATCH /api/v1/branches/:id/status](#patch-apiv1branchesidstatus)
- [Identidad Visual y Branding](#identidad-visual-y-branding)
  - [GET /api/v1/config/brand](#get-apiv1configbrand)
  - [PUT /api/v1/config/brand](#put-apiv1configbrand)
>>>>>>> develop

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

Retornado cuando el payload no cumple con las validaciones de Zod (ej. número de teléfono con formato inválido, nombres muy cortos) o si el archivo subido excede el límite de tamaño de 5MB o formato inadecuado.

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

## Gestión de Variantes SKU de Productos

Este módulo permite gestionar variantes de producto de forma granular, incluyendo generación masiva basada en atributos e integraciones para edición inline de precios y SKUs.

### GET /api/v1/products/:id/variants

Lista todas las variantes asociadas a un producto.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso Requerido |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products/:id/variants` | JWT `Bearer Token` | `products:read` |

#### 2. Respuestas (Responses)
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
      "productId": 1,
      "sku": "CAM-M-NEGRO",
      "price": 99.90,
      "attributesJson": {
        "talla": "M",
        "color": "NEGRO"
      },
      "isActive": true
    }
  ]
}
```

---

### POST /api/v1/products/:id/variants

Genera masivamente combinaciones cartesianas de atributos y crea las variantes con SKU auto-generado.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/products/:id/variants` | JWT `Bearer Token` | `products:write` |
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
  "attributes": {
    "talla": ["S", "M"],
    "color": ["NEGRO", "BLANCO"]
  },
  "basePrice": 99.90
}
```

  "name": "Sucursal Norte",
  "address": "Calle Las Flores 456",
  "phone": "999888777"
}
```

**Detalle de Campos:**

| Parámetro | Tipo     | Requerido | Reglas de Validación                                                 |
| :-------- | :------- | :-------- | :------------------------------------------------------------------- |
| `name`    | `string` | Sí        | Debe ser único. Mínimo 2 caracteres, máximo 100 caracteres.          |
| `address` | `string` | No        | Dirección física de la sucursal. Máximo 255 caracteres.              |
| `phone`   | `string` | No        | Número de teléfono de contacto. Máximo 20 caracteres.                |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 201 Created)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productId": 1,
      "sku": "CAM-S-NEGRO",
      "price": 99.90,
      "attributesJson": {
        "talla": "S",
        "color": "NEGRO"
      },
      "isActive": true
    }
  ]
}
```

##### Conflicto (HTTP 409 Conflict)
Retornado si una de las variantes calculadas posee un SKU que ya está registrado.

---

### PUT /api/v1/variants/:id

Edita individualmente el precio y/o el SKU de una variante. Valida unicidad de SKU antes de guardar.

#### 1. Especificación del Endpoint

| Método | Ruta | Autenticación | Permiso Requerido |
| :--- | :--- | :--- | :--- |
| `PUT` | `/api/v1/variants/:id` | JWT `Bearer Token` | `products:write` |
Retornado cuando la sucursal y su almacén se crean de forma atómica y exitosa.
## Identidad Visual y Branding

### GET /api/v1/config/brand

Obtiene la configuración actual de la identidad visual y branding del sistema (público para personalización dinámica en el frontend e-commerce).

#### 1. Especificación del Endpoint

| Método | Ruta                    | Autenticación     | Rol Requerido |
| :----- | :---------------------- | :---------------- | :------------ |
| `GET`  | `/api/v1/config/brand` | Ninguna (Público) | Invitado      |

#### 2. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retorna la configuración actual. Si no se ha configurado ninguna, retorna los valores por defecto del sistema.

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

Retornado si algún campo del payload no cumple con las restricciones sintácticas de Zod (ej. nombre demasiado corto o duplicado).

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

Actualiza parcialmente uno o más detalles de una sucursal existente por su ID numérico (ej. cambiar nombre, dirección o teléfono).

#### 1. Especificación del Endpoint

| Método | Ruta                   | Autenticación      | Permiso Requerido |
| :----- | :--------------------- | :----------------- | :---------------- |
| `PUT`  | `/api/v1/branches/:id` | JWT `Bearer Token` | `users:write`     |
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

| Método | Ruta                    | Autenticación      | Rol Requerido         |
| :----- | :---------------------- | :----------------- | :-------------------- |
| `PUT`  | `/api/v1/config/brand` | JWT `Bearer Token` | Admin (`roles:manage`)|
>>>>>>> develop

#### 2. Cuerpo de la Petición (Request Body)

```json
{
  "sku": "CAM-M-ROJO",
  "price": 105.00
}
```

  "name": "Sucursal Norte Refactor",
  "address": null,
  "phone": "987654321"
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

| Parámetro | Tipo     | Requerido | Reglas de Validación                                                 |
| :-------- | :------- | :-------- | :------------------------------------------------------------------- |
| `name`    | `string` | No        | Si se provee, debe ser único. Mínimo 2 caracteres, máximo 100.       |
| `address` | `string` | No        | Puede ser `null` para eliminar la dirección. Máximo 255 caracteres. |
| `phone`   | `string` | No        | Puede ser `null` para eliminar el teléfono. Máximo 20 caracteres.    |
| Parámetro         | Tipo     | Requerido | Reglas de Validación                                 |
| :---------------- | :------- | :-------- | :--------------------------------------------------- |
| `brandName`       | `string` | Sí        | Nombre comercial visible del sistema.                |
| `logoUrl`         | `string` | No        | URL absoluta del logotipo de la marca.               |
| `primaryColor`    | `string` | Sí        | Código de color hexadecimal (ej. `#FF5733`).          |
| `socialLinksJson` | `object` | No        | Objeto JSON con urls de las redes sociales del comercio.|

>>>>>>> develop
#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retornado cuando la actualización en la base de datos finaliza con éxito.

>>>>>>> develop
```json
{
  "success": true,
  "data": {
    "id": 1,
    "productId": 1,
    "sku": "CAM-M-ROJO",
    "price": 105.00,
    "attributesJson": {
      "talla": "M",
      "color": "NEGRO"
    },
    "isActive": true
  }
}
```

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

Retornado si la sucursal con el ID provisto no existe.
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

| Parámetro  | Tipo      | Requerido | Reglas de Validación                       |
| :--------- | :-------- | :-------- | :----------------------------------------- |
| `isActive` | `boolean` | Sí        | Determina el nuevo estado de la sucursal.  |

#### 3. Respuestas (Responses)

##### Éxito (HTTP 200 OK)

Retornado cuando el estado ha sido actualizado con éxito.

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
}
```