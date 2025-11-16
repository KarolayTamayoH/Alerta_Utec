import { useEffect, useState } from "react";
import { listarIncidentes, actualizarEstado } from "../api/incidentsApi";
import IncidentCard from "./IncidentCard";

export default function IncidentList({ realTimeIncidents = [] }) {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    cargarIncidentes();
  }, []);

  // Actualizar con incidentes en tiempo real
  useEffect(() => {
    if (realTimeIncidents.length > 0) {
      setIncidentes(realTimeIncidents);
    }
  }, [realTimeIncidents]);

  const cargarIncidentes = async () => {
    try {
      setLoading(true);
      const data = await listarIncidentes();
      setIncidentes(data);
      setError("");
    } catch (err) {
      setError("Error al cargar incidentes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      const resp = await actualizarEstado(id, nuevoEstado);

      if (resp.ok) {
        // Actualizar localmente
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

  const incidentesFiltrados = incidentes.filter(inc => {
    if (filtro === "todos") return true;
    return inc.estado === filtro;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>⏳ Cargando incidentes...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 Lista de Incidentes</h2>
        <button onClick={cargarIncidentes} style={styles.refreshButton}>
          🔄 Actualizar
        </button>
      </div>

      <div style={styles.filters}>
        <button
          onClick={() => setFiltro("todos")}
          style={filtro === "todos" ? {...styles.filterButton, ...styles.filterActive} : styles.filterButton}
        >
          Todos ({incidentes.length})
        </button>
        <button
          onClick={() => setFiltro("pendiente")}
          style={filtro === "pendiente" ? {...styles.filterButton, ...styles.filterActive} : styles.filterButton}
        >
          ⏳ Pendientes
        </button>
        <button
          onClick={() => setFiltro("en_atencion")}
          style={filtro === "en_atencion" ? {...styles.filterButton, ...styles.filterActive} : styles.filterButton}
        >
          🔧 En Atención
        </button>
        <button
          onClick={() => setFiltro("resuelto")}
          style={filtro === "resuelto" ? {...styles.filterButton, ...styles.filterActive} : styles.filterButton}
        >
          ✅ Resueltos
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {incidentesFiltrados.length === 0 ? (
        <p style={styles.empty}>No hay incidentes para mostrar</p>
      ) : (
        <div style={styles.list}>
          {incidentesFiltrados.map(incidente => (
            <IncidentCard
              key={incidente.incidenteId}
              incidente={incidente}
              onUpdateEstado={handleUpdateEstado}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "20px auto",
    padding: "0 20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  title: {
    margin: 0,
    color: "#333"
  },
  refreshButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  filterButton: {
    padding: "8px 16px",
    backgroundColor: "#f8f9fa",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  },
  filterActive: {
    backgroundColor: "#007bff",
    color: "white",
    borderColor: "#007bff"
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    padding: "40px",
    color: "#666"
  },
  error: {
    padding: "15px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    marginBottom: "20px",
    textAlign: "center"
  },
  empty: {
    textAlign: "center",
    fontSize: "16px",
    padding: "40px",
    color: "#666",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px"
  },
  list: {
    display: "flex",
    flexDirection: "column"
  }
};
