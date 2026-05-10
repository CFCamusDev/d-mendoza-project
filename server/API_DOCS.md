# API Documentation - D-Mendoza Project Backend

Esta documentación proporciona las especificaciones técnicas detalladas para consumir los endpoints de la API. Servirá de base para la integración con el cliente (Frontend).

## Índice de Endpoints

- [Autenticación](#autenticación)
  - [POST /api/v1/auth/register](#post-apiv1authregister)
  - [POST /api/v1/auth/verify](#post-apiv1authverify)

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

