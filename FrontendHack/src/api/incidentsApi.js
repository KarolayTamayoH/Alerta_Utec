const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Crear un nuevo incidente
 * @param {Object} data - { tipo, descripcion, ubicacion, urgencia }
 * @returns {Promise<Object>}
 */
export async function crearIncidente(data) {
  try {
    const res = await fetch(`${API_URL}/incidentes`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await res.json();
  } catch (error) {
    console.error("Error al crear incidente:", error);
    throw error;
  }
}

/**
 * Listar todos los incidentes
 * @returns {Promise<Array>}
 */
export async function listarIncidentes() {
  try {
    const res = await fetch(`${API_URL}/incidentes`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error al listar incidentes:", error);
    throw error;
  }
}

/**
 * Obtener un incidente específico por ID
 * @param {string} id - ID del incidente
 * @returns {Promise<Object>}
 */
export async function obtenerIncidente(id) {
  try {
    const res = await fetch(`${API_URL}/incidentes/${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error al obtener incidente:", error);
    throw error;
  }
}

/**
 * Actualizar el estado de un incidente
 * @param {string} id - ID del incidente
 * @param {string} nuevoEstado - Nuevo estado (pendiente, en_atencion, resuelto, cancelado)
 * @returns {Promise<Object>}
 */
export async function actualizarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`${API_URL}/incidentes/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ nuevoEstado }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await res.json();
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    throw error;
  }
}

/**
 * Registrar un nuevo usuario
 * @param {Object} data - { email, password, rol }
 * @returns {Promise<Object>}
 */
export async function registrarUsuario(data) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await res.json();
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

/**
 * Iniciar sesión
 * @param {Object} data - { email, password }
 * @returns {Promise<Object>}
 */
export async function login(data) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await res.json();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}
