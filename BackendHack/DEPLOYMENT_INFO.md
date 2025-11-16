# 🚀 Información del Despliegue

**Fecha:** 15 de Noviembre 2025
**Estado:** ✅ Desplegado exitosamente

## 📡 Endpoints REST API

**Base URL:** `https://if1stu7r2g.execute-api.us-east-1.amazonaws.com/dev`

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Incidentes
- `POST /incidentes` - Crear incidente
- `GET /incidentes` - Listar todos los incidentes
- `GET /incidentes/{id}` - Obtener incidente específico
- `PATCH /incidentes/{id}/estado` - Actualizar estado

## 🔌 WebSocket URL

**URL:** `wss://3lgmyhtvpa.execute-api.us-east-1.amazonaws.com/dev`

Rutas:
- `$connect` - Conexión de cliente
- `$disconnect` - Desconexión
- `notify` - Enviar notificaciones

## 📊 Funciones Lambda Desplegadas

1. **register** - Registro de usuarios (19 MB)
2. **login** - Autenticación (19 MB)
3. **crearIncidente** - Crear incidentes (19 MB)
4. **listarIncidentes** - Listar incidentes (19 MB)
5. **obtenerIncidente** - Obtener incidente (19 MB)
6. **actualizarEstado** - Actualizar estado (19 MB)
7. **wsConnect** - WebSocket conexión (19 MB)
8. **wsDisconnect** - WebSocket desconexión (19 MB)
9. **wsNotify** - WebSocket notificaciones (19 MB)

## 🗄️ Tablas DynamoDB

- **Usuarios** - Pay-per-request
- **Incidentes** - Pay-per-request
- **WebSocketConnections** - Pay-per-request

## 🔑 Configuración del Frontend

El archivo `.env` del frontend ya ha sido actualizado con estas URLs.

## 🧪 Probar los Endpoints

### Registrar usuario
```bash
curl -X POST https://if1stu7r2g.execute-api.us-east-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@utec.edu.pe",
    "password": "password123",
    "rol": "estudiante"
  }'
```

### Login
```bash
curl -X POST https://if1stu7r2g.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@utec.edu.pe",
    "password": "password123"
  }'
```

### Crear incidente
```bash
curl -X POST https://if1stu7r2g.execute-api.us-east-1.amazonaws.com/dev/incidentes \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "seguridad",
    "descripcion": "Puerta rota en edificio A",
    "ubicacion": "Pabellón A, 2do piso",
    "urgencia": "media"
  }'
```

### Listar incidentes
```bash
curl https://if1stu7r2g.execute-api.us-east-1.amazonaws.com/dev/incidentes
```

## ⚠️ Notas Importantes

- Las credenciales de AWS Academy expiran cada sesión
- Antes de redesplegar, ejecuta: `.\setup-credentials.ps1`
- Actualiza el script con las nuevas credenciales de AWS Academy
- El stack se llama: `alerta-utec-backend-dev`

## 🔄 Comandos Útiles

```bash
# Redesplegar
npm run deploy

# Ver logs de una función
npm run logs -- -f crearIncidente

# Eliminar todo el stack
npm run remove
```

## 📱 Siguiente Paso

Ejecuta el frontend:
```bash
cd ..\FrontendHack
npm run dev
```

El frontend ya está configurado con las URLs correctas.
