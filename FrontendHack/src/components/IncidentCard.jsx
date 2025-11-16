export default function IncidentCard({ incidente, onUpdateEstado }) {
  const getUrgenciaColor = (urgencia) => {
    const colors = {
      baja: "#28a745",
      media: "#ffc107",
      alta: "#fd7e14",
      critica: "#dc3545"
    };
    return colors[urgencia] || "#6c757d";
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { bg: "#ffc107", text: "⏳ Pendiente" },
      en_atencion: { bg: "#17a2b8", text: "🔧 En Atención" },
      resuelto: { bg: "#28a745", text: "✅ Resuelto" },
      cancelado: { bg: "#6c757d", text: "❌ Cancelado" }
    };
    return badges[estado] || { bg: "#6c757d", text: estado };
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      emergencia_medica: "🏥",
      seguridad: "🔒",
      infraestructura: "🏗️",
      otro: "📋"
    };
    return icons[tipo] || "📋";
  };

  const handleCambiarEstado = () => {
    const nuevoEstado = prompt(
      "Ingrese el nuevo estado:\n- pendiente\n- en_atencion\n- resuelto\n- cancelado"
    );

    if (nuevoEstado && onUpdateEstado) {
      onUpdateEstado(incidente.incidenteId, nuevoEstado);
    }
  };

  const estadoBadge = getEstadoBadge(incidente.estado);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>{getTipoIcon(incidente.tipo)}</span>
          <div>
            <h3 style={styles.title}>{incidente.tipo?.replace(/_/g, " ").toUpperCase()}</h3>
            <p style={styles.id}>ID: {incidente.incidenteId}</p>
          </div>
        </div>
        <div
          style={{
            ...styles.urgenciaBadge,
            backgroundColor: getUrgenciaColor(incidente.urgencia)
          }}
        >
          {incidente.urgencia?.toUpperCase()}
        </div>
      </div>

      <div style={styles.body}>
        <p style={styles.descripcion}>{incidente.descripcion}</p>

        <div style={styles.info}>
          <div style={styles.infoItem}>
            <strong>📍 Ubicación:</strong> {incidente.ubicacion}
          </div>
          <div style={styles.infoItem}>
            <strong>📅 Fecha:</strong> {new Date(incidente.fechaCreacion).toLocaleString("es-PE")}
          </div>
        </div>

        <div style={styles.footer}>
          <div
            style={{
              ...styles.estadoBadge,
              backgroundColor: estadoBadge.bg
            }}
          >
            {estadoBadge.text}
          </div>

          {onUpdateEstado && (
            <button
              onClick={handleCambiarEstado}
              style={styles.button}
            >
              Cambiar Estado
            </button>
          )}
        </div>

        {incidente.historial && incidente.historial.length > 0 && (
          <details style={styles.historial}>
            <summary style={styles.historialTitle}>📋 Ver Historial</summary>
            <ul style={styles.historialList}>
              {incidente.historial.map((h, idx) => (
                <li key={idx} style={styles.historialItem}>
                  <strong>{h.accion}</strong> - {new Date(h.fecha).toLocaleString("es-PE")}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "box-shadow 0.3s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  icon: {
    fontSize: "32px"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    color: "#333"
  },
  id: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#666"
  },
  urgenciaBadge: {
    padding: "5px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold"
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  descripcion: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5"
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px"
  },
  infoItem: {
    fontSize: "13px",
    color: "#333"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  },
  estadoBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    color: "white",
    fontSize: "13px",
    fontWeight: "bold"
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold"
  },
  historial: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px"
  },
  historialTitle: {
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#007bff"
  },
  historialList: {
    marginTop: "10px",
    paddingLeft: "20px"
  },
  historialItem: {
    fontSize: "12px",
    color: "#555",
    marginBottom: "5px"
  }
};
