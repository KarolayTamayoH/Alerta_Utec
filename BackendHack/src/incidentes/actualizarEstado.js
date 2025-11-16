const AWS = require("aws-sdk");
const { get } = require("../../db/get");
const { update } = require("../../db/update");
const { successResponse, errorResponse } = require("../utils/responses");

const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * Update incident status
 * PATCH /incidentes/{id}/estado
 * Body: { nuevoEstado }
 */
exports.handler = async (event) => {
  try {
    const incidenteId = event.pathParameters.id;
    const { nuevoEstado } = JSON.parse(event.body);

    // Validate
    if (!incidenteId || !nuevoEstado) {
      return errorResponse(400, "ID de incidente y nuevo estado son requeridos");
    }

    // Validate estado values
    const estadosValidos = ["pendiente", "en_atencion", "resuelto", "cancelado"];
    if (!estadosValidos.includes(nuevoEstado)) {
      return errorResponse(400, "Estado inválido. Valores permitidos: " + estadosValidos.join(", "));
    }

    // Get current incident
    const incidente = await get("Incidentes", { incidenteId });

    if (!incidente) {
      return errorResponse(404, "Incidente no encontrado");
    }

    // Add to history
    const nuevoHistorial = incidente.historial || [];
    nuevoHistorial.push({
      accion: `estado cambiado a ${nuevoEstado}`,
      fecha: new Date().toISOString()
    });

    // Update incident
    await update(
      "Incidentes",
      { incidenteId },
      "set estado = :e, historial = :h",
      {
        ":e": nuevoEstado,
        ":h": nuevoHistorial
      }
    );

    // Notify WebSocket connections
    await notifyWebSocketClients(incidenteId, nuevoEstado);

    return successResponse(200, {
      ok: true,
      incidenteId,
      estado: nuevoEstado
    });

  } catch (error) {
    console.error("Error en actualizarEstado:", error);
    return errorResponse(500, "Error al actualizar estado", error);
  }
};

/**
 * Send notification to all WebSocket connections
 */
async function notifyWebSocketClients(incidenteId, nuevoEstado) {
  try {
    const apiGateway = new AWS.ApiGatewayManagementApi({
      endpoint: process.env.WEBSOCKET_ENDPOINT
    });

    // Get all connections
    const connections = await dynamo.scan({
      TableName: "WebSocketConnections"
    }).promise();

    const message = JSON.stringify({
      evento: "estado_actualizado",
      incidenteId,
      nuevoEstado
    });

    // Send to all connections
    const sendPromises = connections.Items.map(async ({ connectionId }) => {
      try {
        await apiGateway.postToConnection({
          ConnectionId: connectionId,
          Data: message
        }).promise();
      } catch (error) {
        // If connection is stale, delete it
        if (error.statusCode === 410) {
          await dynamo.delete({
            TableName: "WebSocketConnections",
            Key: { connectionId }
          }).promise();
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error("Error notificando WebSocket:", error);
  }
}
