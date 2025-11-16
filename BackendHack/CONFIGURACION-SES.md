# Configuración de Amazon SES para Notificaciones por Email

## ⚠️ IMPORTANTE: Verificación de Email en SES

Amazon SES requiere que verifiques las direcciones de correo antes de poder enviar emails. En el sandbox de AWS Academy, solo puedes enviar emails a direcciones verificadas.

## Pasos para Configurar SES

### 1. Verificar Email en la Consola de AWS

1. Ve a la consola de AWS: https://console.aws.amazon.com/ses/
2. En el menú lateral, selecciona **"Verified identities"**
3. Haz clic en **"Create identity"**
4. Selecciona **"Email address"**
5. Ingresa el email desde el cual enviarás notificaciones (ejemplo: `alertautec@example.com`)
6. También verifica el email del equipo de seguridad (ejemplo: `seguridad@utec.edu.pe`)
7. Haz clic en **"Create identity"**
8. **Revisa tu bandeja de entrada** y haz clic en el link de verificación que AWS envió

### 2. Verificar Dominio (Opcional - Producción)

Si tienes un dominio propio:
1. En SES, crea una identidad de tipo **"Domain"**
2. Agrega los registros DNS proporcionados (TXT, CNAME, MX)
3. Espera la verificación (puede tomar hasta 72 horas)

### 3. Salir del Sandbox (Producción)

**En AWS Academy no es posible**, pero en una cuenta AWS normal:
1. Ve a SES > Account dashboard
2. Haz clic en **"Request production access"**
3. Completa el formulario explicando tu caso de uso
4. AWS revisará tu solicitud (24-48 horas)

## Configuración del Backend

### Variables de Entorno (serverless.yml)

```yaml
environment:
  SNS_TOPIC_ARN: { Ref: IncidentesSNSTopic }
  SES_FROM_EMAIL: alertautec@example.com  # ⚠️ Cambiar por tu email verificado
  SECURITY_EMAIL: seguridad@utec.edu.pe   # ⚠️ Cambiar por email verificado
```

### Permisos IAM Necesarios

El rol LabRole de AWS Academy ya incluye permisos para SES, pero en una cuenta normal necesitas:

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - ses:SendEmail
          - ses:SendRawEmail
        Resource: "*"
      - Effect: Allow
        Action:
          - sns:Publish
        Resource: !Ref IncidentesSNSTopic
```

## Flujo de Notificaciones

```
┌─────────────────┐
│ Usuario crea    │
│ incidente con   │
│ email opcional  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lambda:         │
│ crearIncidente  │
│ - Guarda en DB  │
│ - Publica a SNS │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SNS Topic:      │
│ Incidentes      │
│ Notificaciones  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lambda:         │
│ enviarEmail     │
│ - Lee mensaje   │
│ - Envía con SES │
└─────────────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌──────────────┐  ┌─────────────┐
│ Email al     │  │ Email a     │
│ reportante   │  │ seguridad   │
│ (si dio mail)│  │ (si urgente)│
└──────────────┘  └─────────────┘
```

## Tipos de Emails Enviados

### 1. Email de Confirmación al Reportante
- **Cuándo:** Siempre que el usuario proporcione un email
- **Contenido:**
  - Confirmación de recepción del incidente
  - Detalles completos del reporte
  - ID de seguimiento
  - Promesa de actualizaciones

### 2. Email de Alerta al Equipo de Seguridad
- **Cuándo:** Solo para incidentes de urgencia ALTA o CRÍTICA
- **Contenido:**
  - Alerta destacada con nivel de urgencia
  - Detalles completos del incidente
  - Información de contacto del reportante
  - Link directo al panel admin

## Testing en AWS Academy Sandbox

### Limitaciones del Sandbox:
- ✅ Puedes enviar emails
- ❌ Solo a direcciones verificadas
- ❌ Máximo 200 emails por día
- ❌ No puedes salir del sandbox

### Para Probar:
1. Verifica tu email personal en SES
2. Actualiza `SES_FROM_EMAIL` con ese email en `serverless.yml`
3. Actualiza `SECURITY_EMAIL` con ese mismo email (o otro verificado)
4. Despliega el backend
5. Crea un incidente con ese email
6. Revisa tu bandeja de entrada

## Comandos Útiles

```bash
# Ver identidades verificadas
aws ses list-identities

# Ver estado de verificación
aws ses get-identity-verification-attributes --identities alertautec@example.com

# Enviar email de prueba
aws ses send-email \
  --from alertautec@example.com \
  --to tu-email@example.com \
  --subject "Test" \
  --text "Test message"
```

## Troubleshooting

### Error: "Email address is not verified"
**Solución:** Verifica el email en la consola de SES y haz clic en el link de verificación.

### Error: "Message rejected: Email address is not verified"
**Solución:** En sandbox, tanto el remitente como el destinatario deben estar verificados.

### No llegan los emails
**Checklist:**
- [ ] Email verificado en SES
- [ ] Variable `SES_FROM_EMAIL` configurada correctamente
- [ ] Lambda tiene permisos SES
- [ ] Revisar CloudWatch Logs de la Lambda `enviarEmail`
- [ ] Revisar carpeta de SPAM

### Error: "Daily sending quota exceeded"
**Solución:** En sandbox tienes límite de 200 emails/día. Espera 24 horas o solicita salir del sandbox.

## Mejoras Futuras

1. **Templates SES:** Usar plantillas de SES en lugar de HTML inline
2. **Bounce Handling:** Configurar SNS para manejar rebotes y quejas
3. **Tracking:** Implementar seguimiento de aperturas y clicks
4. **Attachments:** Agregar opción de adjuntar fotos del incidente
5. **Translations:** Emails en múltiples idiomas
6. **Scheduling:** Digest diario de incidentes pendientes

## Recursos

- [Documentación SES](https://docs.aws.amazon.com/ses/)
- [SES Email Sending](https://docs.aws.amazon.com/ses/latest/dg/send-email.html)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
