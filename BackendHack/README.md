# Alerta UTEC - Backend

Sistema de alertas en tiempo real para UTEC usando AWS Lambda, API Gateway, DynamoDB y WebSockets.

## 📋 Requisitos

- Node.js 18+
- AWS CLI configurado
- Serverless Framework

## 🚀 Instalación

```bash
npm install
```

## 📦 Despliegue

```bash
npm run deploy
```

## 👥 Roles de Usuario

El sistema maneja diferentes tipos de roles para gestionar permisos y accesos:

- **Estudiante**: Usuario que puede reportar incidentes y ver el estado de sus reportes
- **Seguridad**: Personal de seguridad que puede gestionar y actualizar el estado de incidentes
- **Administrador**: Usuario con acceso completo al sistema para gestión avanzada

## 📊 Tipos de Incidentes

El sistema clasifica los incidentes en las siguientes categorías:

- **Emergencia médica**: Situaciones que requieren atención médica inmediata
- **Seguridad**: Incidentes relacionados con la seguridad del campus
- **Infraestructura**: Problemas con instalaciones o equipamiento
- **Otro**: Incidentes que no encajan en las categorías anteriores

## 🚨 Niveles de Urgencia

Cada incidente se clasifica según su nivel de urgencia:

- **Baja**: Situaciones que pueden esperar atención programada
- **Media**: Situaciones que requieren atención en un plazo razonable
- **Alta**: Situaciones que requieren atención inmediata
- **Crítica**: Emergencias que ponen en riesgo la seguridad o vida

## 📈 Estados de Incidentes

Los incidentes pasan por diferentes estados durante su ciclo de vida:

- **pendiente**: Incidente recién creado, esperando asignación
- **en_atencion**: Incidente siendo atendido por personal
- **resuelto**: Incidente completamente resuelto
- **cancelado**: Incidente cancelado o duplicado

## 🔐 Seguridad

- **Autenticación JWT**: Tokens con expiración de 24 horas
- **Encriptación de contraseñas**: Bcrypt con salt rounds de 10
- **CORS habilitado**: Para integración con frontend
- **Validación de datos**: Validación en todos los endpoints

## 🔄 WebSockets en Tiempo Real

El sistema utiliza AWS API Gateway WebSocket para:

- Notificaciones instantáneas de nuevos incidentes
- Actualizaciones de estado en tiempo real
- Conexión persistente entre cliente y servidor
- Gestión automática de conexiones obsoletas

## 🗄️ Base de Datos (DynamoDB)

### Tablas:

1. **Usuarios**
   - Clave primaria: `userId`
   - Índice secundario: `EmailIndex` para búsquedas por email
   - Campos: email, password (hasheado), rol, fechaCreacion

2. **Incidentes**
   - Clave primaria: `incidenteId`
   - Campos: tipo, descripcion, ubicacion, urgencia, estado, fechaCreacion, historial

3. **WebSocketConnections**
   - Clave primaria: `connectionId`
   - Gestión automática de conexiones activas

## ⚡ Características Técnicas

- **Serverless Framework**: Despliegue automatizado en AWS
- **Pay-per-request**: DynamoDB con facturación por uso
- **Escalabilidad automática**: Lambda escala según demanda
- **Historial de cambios**: Cada incidente mantiene un registro de todos los cambios de estado
- **Manejo de errores**: Responses consistentes con códigos HTTP apropiados

## 🧪 Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Incidentes
- `POST /incidentes` - Crear incidente
- `GET /incidentes` - Listar incidentes
- `GET /incidentes/{id}` - Obtener incidente
- `PATCH /incidentes/{id}/estado` - Actualizar estado

### WebSocket
- `$connect` - Conectar cliente
- `$disconnect` - Desconectar cliente
- `notify` - Enviar notificaciones

## 🗄️ Estructura

```
backend/
├── serverless.yml
├── package.json
├── src/
│   ├── auth/
│   ├── incidentes/
│   └── websocket/
└── db/
```
