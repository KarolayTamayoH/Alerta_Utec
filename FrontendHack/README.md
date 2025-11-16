# Alerta UTEC - Frontend

Sistema frontend de alertas en tiempo real para UTEC, construido con React + Vite.

## 🚀 Características

- ✅ Formulario para reportar incidentes
- ✅ Lista de incidentes en tiempo real
- ✅ WebSocket para actualizaciones instantáneas
- ✅ Panel de administración con estadísticas
- ✅ Sistema de autenticación con roles
- ✅ Notificaciones del navegador
- ✅ Responsive design

## 📋 Requisitos

- Node.js 18+
- Backend desplegado en AWS (ver BackendHack/)

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus URLs de AWS:
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
VITE_WS_URL=wss://your-ws-id.execute-api.us-east-1.amazonaws.com/dev
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
FrontendHack/
├── src/
│   ├── api/
│   │   └── incidentsApi.js      # Cliente API REST
│   ├── components/
│   │   ├── IncidentForm.jsx     # Formulario de reportes
│   │   ├── IncidentList.jsx     # Lista de incidentes
│   │   └── IncidentCard.jsx     # Tarjeta individual
│   ├── sockets/
│   │   └── websocket.js         # Cliente WebSocket
│   ├── pages/
│   │   ├── Home.jsx             # Página principal
│   │   ├── Admin.jsx            # Panel administración
│   │   └── Login.jsx            # Login/Registro
│   ├── App.jsx                  # Router principal
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globales
├── index.html
├── package.json
├── vite.config.js
└── .env
```

## 🎯 Funcionalidades por Página

### 🏠 Home (`/`)
- Formulario para reportar incidentes
- Lista de todos los incidentes
- Actualización automática vía WebSocket
- Accesible para todos los usuarios

### 🎛️ Admin (`/admin`)
- Panel con estadísticas en tiempo real
- Gestión de estados de incidentes
- Notificaciones del navegador
- Solo para roles: `administrador` y `seguridad`

### 🔐 Login (`/login`)
- Registro de nuevos usuarios
- Inicio de sesión con JWT
- Selección de rol (estudiante, seguridad, administrador)

## 👥 Roles de Usuario

- **Estudiante**: Reporta incidentes y ve el listado
- **Seguridad**: Acceso al panel admin, actualiza estados
- **Administrador**: Acceso completo al sistema

## 🔌 API REST

El frontend consume los siguientes endpoints del backend:

```javascript
// Autenticación
POST /auth/register - Registrar usuario
POST /auth/login - Iniciar sesión

// Incidentes
POST /incidentes - Crear incidente
GET /incidentes - Listar incidentes
GET /incidentes/{id} - Obtener incidente
PATCH /incidentes/{id}/estado - Actualizar estado
```

## 🌐 WebSocket

Eventos en tiempo real:

```javascript
// Eventos recibidos
{
  "evento": "nuevo_incidente",
  "data": { /* datos del incidente */ }
}

{
  "evento": "estado_actualizado",
  "incidenteId": "INC_12345",
  "nuevoEstado": "resuelto"
}
```

## 🎨 Componentes Principales

### IncidentForm
- Formulario con validación
- Tipos: Emergencia médica, Seguridad, Infraestructura, Otro
- Niveles de urgencia: Baja, Media, Alta, Crítica

### IncidentList
- Lista filtrable por estado
- Actualización en tiempo real
- Botón de recarga manual

### IncidentCard
- Visualización detallada del incidente
- Historial de cambios
- Actualización de estado (solo admin)

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en `dist/`

## 🔗 Despliegue

Puedes desplegar en:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

```bash
# Ejemplo con Vercel
npm install -g vercel
vercel --prod
```

## 📱 Notificaciones del Navegador

El panel de administración usa la API de Notifications:
- Haz clic en "🔔 Habilitar Notificaciones"
- Acepta los permisos del navegador
- Recibirás alertas de nuevos incidentes

## 🔐 Autenticación

El sistema usa:
- JWT tokens almacenados en localStorage
- Validación de roles en rutas protegidas
- Auto-redireccionamiento según permisos

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **React Router** - Navegación
- **Vite** - Build tool y dev server
- **WebSocket API** - Comunicación en tiempo real
- **Fetch API** - Peticiones HTTP

## 📝 Notas Importantes

1. Asegúrate de configurar correctamente las URLs en `.env`
2. El backend debe estar desplegado y funcionando
3. Las WebSocket URLs deben usar el protocolo `wss://`
4. Los endpoints REST deben usar `https://`

## 🤝 Integración con Backend

Este frontend está diseñado para funcionar con el backend en `BackendHack/`
- Ver `BackendHack/README.md` para instrucciones de despliegue
- Obtén las URLs después de `npm run deploy` en el backend

## 📄 Licencia

Proyecto académico - UTEC 2025
