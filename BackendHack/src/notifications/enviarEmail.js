const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "us-east-1" });

/**
 * Lambda triggered by SNS to send email notifications
 * Receives SNS events when new incidents are created
 */
exports.handler = async (event) => {
  console.log("SNS Event recibido:", JSON.stringify(event, null, 2));

  try {
    // Process each SNS record
    for (const record of event.Records) {
      if (record.EventSource !== "aws:sns") {
        console.log("Evento no es de SNS, ignorando");
        continue;
      }

      const message = JSON.parse(record.Sns.Message);
      const incidente = message.incidente;

      console.log("Procesando incidente:", incidente.incidenteId);

      // Send email to reporter if email provided
      if (incidente.emailReportante) {
        await sendEmailToReporter(incidente);
      }

      // Send email to security team for critical incidents
      if (incidente.urgencia === "critica" || incidente.urgencia === "alta") {
        await sendEmailToSecurityTeam(incidente);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Emails enviados exitosamente" })
    };

  } catch (error) {
    console.error("Error enviando emails:", error);
    throw error;
  }
};

/**
 * Send confirmation email to incident reporter
 */
async function sendEmailToReporter(incidente) {
  const fromEmail = process.env.SES_FROM_EMAIL || "alertautec@example.com";

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1>🚨 Alerta UTEC</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Incidente Registrado</h2>
          <p>Hola,</p>
          <p>Tu reporte de incidente ha sido registrado exitosamente:</p>

          <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p><strong>ID:</strong> ${incidente.incidenteId}</p>
            <p><strong>Tipo:</strong> ${getTipoLabel(incidente.tipo)}</p>
            <p><strong>Urgencia:</strong> ${getUrgenciaLabel(incidente.urgencia)}</p>
            <p><strong>Ubicación:</strong> ${incidente.ubicacion}</p>
            <p><strong>Descripción:</strong> ${incidente.descripcion}</p>
            <p><strong>Estado:</strong> ${incidente.estado}</p>
            <p><strong>Fecha:</strong> ${new Date(incidente.fechaCreacion).toLocaleString('es-PE')}</p>
          </div>

          <p>El equipo de seguridad ha sido notificado y atenderá tu reporte lo antes posible.</p>
          <p>Recibirás actualizaciones cuando el estado del incidente cambie.</p>

          <p style="margin-top: 30px;">
            <strong>Equipo de Alerta UTEC</strong><br>
            Universidad de Ingeniería y Tecnología
          </p>
        </div>
        <div style="background-color: #333; color: #ccc; padding: 10px; text-align: center; font-size: 12px;">
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [incidente.emailReportante]
    },
    Message: {
      Subject: {
        Data: `Incidente Registrado: ${incidente.incidenteId}`,
        Charset: "UTF-8"
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: "UTF-8"
        },
        Text: {
          Data: `Incidente registrado: ${incidente.incidenteId}\n\nTipo: ${incidente.tipo}\nUrgencia: ${incidente.urgencia}\nUbicación: ${incidente.ubicacion}\nDescripción: ${incidente.descripcion}\n\nSe te notificará sobre actualizaciones.`,
          Charset: "UTF-8"
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(`Email enviado al reportante: ${incidente.emailReportante}`, result.MessageId);
  } catch (error) {
    console.error(`Error enviando email al reportante:`, error);
    // Don't throw - continue processing other emails
  }
}

/**
 * Send alert email to security team for urgent incidents
 */
async function sendEmailToSecurityTeam(incidente) {
  const fromEmail = process.env.SES_FROM_EMAIL || "alertautec@example.com";
  const securityEmail = process.env.SECURITY_EMAIL || "seguridad@utec.edu.pe";

  const urgencyColor = incidente.urgencia === "critica" ? "#dc3545" : "#ff9800";

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${urgencyColor}; color: white; padding: 20px; text-align: center;">
          <h1>⚠️ ALERTA DE INCIDENTE ${incidente.urgencia.toUpperCase()}</h1>
        </div>
        <div style="padding: 20px; background-color: #fff9e6;">
          <h2>Nuevo Incidente Reportado</h2>

          <div style="background-color: white; padding: 15px; border-left: 4px solid ${urgencyColor}; margin: 20px 0;">
            <p><strong>ID:</strong> ${incidente.incidenteId}</p>
            <p><strong>Tipo:</strong> ${getTipoLabel(incidente.tipo)}</p>
            <p><strong>Urgencia:</strong> <span style="color: ${urgencyColor}; font-weight: bold;">${getUrgenciaLabel(incidente.urgencia)}</span></p>
            <p><strong>Ubicación:</strong> ${incidente.ubicacion}</p>
            <p><strong>Descripción:</strong> ${incidente.descripcion}</p>
            <p><strong>Estado:</strong> ${incidente.estado}</p>
            <p><strong>Fecha:</strong> ${new Date(incidente.fechaCreacion).toLocaleString('es-PE')}</p>
            ${incidente.emailReportante ? `<p><strong>Contacto:</strong> ${incidente.emailReportante}</p>` : ''}
          </div>

          <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>⚡ ACCIÓN REQUERIDA</strong></p>
            <p>Este incidente requiere atención inmediata. Por favor, accede al panel de administración para más detalles y asignación.</p>
          </div>

          <p style="margin-top: 30px; text-align: center;">
            <a href="https://your-frontend-url/admin" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Panel Admin
            </a>
          </p>
        </div>
        <div style="background-color: #333; color: #ccc; padding: 10px; text-align: center; font-size: 12px;">
          <p>Sistema de Alertas UTEC - Notificación Automática</p>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [securityEmail]
    },
    Message: {
      Subject: {
        Data: `🚨 INCIDENTE ${incidente.urgencia.toUpperCase()}: ${incidente.tipo} - ${incidente.incidenteId}`,
        Charset: "UTF-8"
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: "UTF-8"
        },
        Text: {
          Data: `ALERTA DE INCIDENTE ${incidente.urgencia.toUpperCase()}\n\nID: ${incidente.incidenteId}\nTipo: ${incidente.tipo}\nUrgencia: ${incidente.urgencia}\nUbicación: ${incidente.ubicacion}\nDescripción: ${incidente.descripcion}\n\nAcción requerida inmediatamente.`,
          Charset: "UTF-8"
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(`Email enviado al equipo de seguridad`, result.MessageId);
  } catch (error) {
    console.error(`Error enviando email al equipo de seguridad:`, error);
  }
}

function getTipoLabel(tipo) {
  const labels = {
    emergencia_medica: "🏥 Emergencia Médica",
    seguridad: "🔒 Seguridad",
    infraestructura: "🏗️ Infraestructura",
    otro: "📋 Otro"
  };
  return labels[tipo] || tipo;
}

function getUrgenciaLabel(urgencia) {
  const labels = {
    baja: "🟢 Baja",
    media: "🟡 Media",
    alta: "🟠 Alta",
    critica: "🔴 Crítica"
  };
  return labels[urgencia] || urgencia;
}
