const { get } = require("../../db/get");
const { successResponse, errorResponse } = require("../utils/responses");

/**
 * Get a specific incident by ID
 * GET /incidentes/{id}
 */
exports.handler = async (event) => {
  try {
    const incidenteId = event.pathParameters.id;

    if (!incidenteId) {
      return errorResponse(400, "ID de incidente requerido");
    }

    const incidente = await get("Incidentes", { incidenteId });

    if (!incidente) {
      return errorResponse(404, "Incidente no encontrado");
    }

    return successResponse(200, {
      ok: true,
      incidente
    });

  } catch (error) {
    console.error("Error en obtenerIncidente:", error);
    return errorResponse(500, "Error al obtener incidente", error);
  }
};
