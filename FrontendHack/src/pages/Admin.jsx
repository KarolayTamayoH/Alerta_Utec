import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listarIncidentes, actualizarEstado } from "../api/incidentsApi";
import { connectWebSocket, disconnectWebSocket } from "../sockets/websocket";
import IncidentCard from "../components/IncidentCard";

export default function Admin() {
  const navigate = useNavigate();
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enAtencion: 0,
    resueltos: 0
  });

  useEffect(() => {
    // Verificar autenticación y rol
    const rol = localStorage.getItem("rol");
    if (rol !== "administrador" && rol !== "seguridad") {
      alert("❌ No tienes permisos para acceder a esta página");
      navigate("/");
      return;
    }

    cargarIncidentes();

    // Conectar WebSocket para actualizaciones en tiempo real
    connectWebSocket(handleWebSocketMessage);
    setWsConnected(true);

    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    calcularEstadisticas();
  }, [incidentes]);

  const handleWebSocketMessage = (mensaje) => {
    console.log("📨 Mensaje WebSocket recibido:", mensaje);

    if (mensaje.evento === "nuevo_incidente") {
      // Agregar nuevo incidente
      setIncidentes(prev => [mensaje.data, ...prev]);
      mostrarNotificacion("🆕 Nuevo incidente reportado");
    }

    if (mensaje.evento === "estado_actualizado") {
      // Actualizar estado del incidente
      setIncidentes(prev =>
        prev.map(inc =>
          inc.incidenteId === mensaje.incidenteId
            ? { ...inc, estado: mensaje.nuevoEstado }
            : inc
        )
      );
      mostrarNotificacion(`📝 Incidente ${mensaje.incidenteId} actualizado`);
    }
  };

  const mostrarNotificacion = (texto) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Alerta UTEC", { body: texto });
    }
  };

  const cargarIncidentes = async () => {
    try {
      setLoading(true);
      const data = await listarIncidentes();
      setIncidentes(data);
    } catch (error) {
      console.error("Error al cargar incidentes:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    setStats({
      total: incidentes.length,
      pendientes: incidentes.filter(i => i.estado === "pendiente").length,
      enAtencion: incidentes.filter(i => i.estado === "en_atencion").length,
      resueltos: incidentes.filter(i => i.estado === "resuelto").length
    });
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      const resp = await actualizarEstado(id, nuevoEstado);

      if (resp.ok) {
        setIncidentes(prev =>
          prev.map(inc =>
            inc.incidenteId === id
              ? { ...inc, estado: nuevoEstado }
              : inc
          )
        );
        alert("✅ Estado actualizado correctamente");
      } else {
        alert(`❌ Error: ${resp.message}`);
      }
    } catch (error) {
      alert("❌ Error al actualizar estado");
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const solicitarPermisoNotificaciones = () => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>⏳ Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>🎛️ Panel de Administración</h1>
          <nav style={styles.nav}>
            <Link to="/" style={styles.link}>🏠 Inicio</Link>
            <span style={styles.wsStatus}>
              {wsConnected ? "🟢 WebSocket Conectado" : "🔴 Desconectado"}
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              🚪 Salir
            </button>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.statTotal}}>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Incidentes</p>
          </div>
          <div style={{...styles.statCard, ...styles.statPendiente}}>
            <h3 style={styles.statNumber}>{stats.pendientes}</h3>
            <p style={styles.statLabel}>⏳ Pendientes</p>
          </div>
          <div style={{...styles.statCard, ...styles.statAtencion}}>
            <h3 style={styles.statNumber}>{stats.enAtencion}</h3>
            <p style={styles.statLabel}>🔧 En Atención</p>
          </div>
          <div style={{...styles.statCard, ...styles.statResuelto}}>
            <h3 style={styles.statNumber}>{stats.resueltos}</h3>
            <p style={styles.statLabel}>✅ Resueltos</p>
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={cargarIncidentes} style={styles.refreshButton}>
            🔄 Actualizar Lista
          </button>
          <button onClick={solicitarPermisoNotificaciones} style={styles.notifButton}>
            🔔 Habilitar Notificaciones
          </button>
        </div>

        <div style={styles.incidentsList}>
          <h2 style={styles.listTitle}>📋 Todos los Incidentes</h2>
          {incidentes.length === 0 ? (
            <p style={styles.empty}>No hay incidentes registrados</p>
          ) : (
            incidentes.map(incidente => (
              <IncidentCard
                key={incidente.incidenteId}
                incidente={incidente}
                onUpdateEstado={handleUpdateEstado}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5"
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#666"
  },
  header: {
    backgroundColor: "#1a1a2e",
    color: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    margin: 0,
    fontSize: "24px"
  },
  nav: {
    display: "flex",
    gap: "15px",
    alignItems: "center"
  },
  link: {
    textDecoration: "none",
    color: "white",
    fontWeight: "bold",
    fontSize: "14px",
    padding: "8px 12px",
    borderRadius: "4px",
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  wsStatus: {
    fontSize: "12px",
    padding: "6px 12px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "4px"
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  statCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  statTotal: {
    borderLeft: "5px solid #007bff"
  },
  statPendiente: {
    borderLeft: "5px solid #ffc107"
  },
  statAtencion: {
    borderLeft: "5px solid #17a2b8"
  },
  statResuelto: {
    borderLeft: "5px solid #28a745"
  },
  statNumber: {
    margin: "0 0 10px 0",
    fontSize: "36px",
    fontWeight: "bold",
    color: "#333"
  },
  statLabel: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
    fontWeight: "bold"
  },
  actions: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px"
  },
  refreshButton: {
    padding: "12px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  },
  notifButton: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  },
  incidentsList: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  listTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#333"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "16px"
  }
};
