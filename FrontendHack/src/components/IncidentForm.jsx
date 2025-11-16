import { useState } from "react";
import { crearIncidente } from "../api/incidentsApi";

export default function IncidentForm() {
  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    ubicacion: "",
    urgencia: "",
    emailReportante: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const resp = await crearIncidente(form);

      if (resp.ok) {
        setMessage(`✅ Incidente creado exitosamente: ${resp.incidenteId}`);
        // Limpiar formulario
        setForm({
          tipo: "",
          descripcion: "",
          ubicacion: "",
          urgencia: "",
          emailReportante: ""
        });
      } else {
        setMessage(`❌ Error: ${resp.message}`);
      }
    } catch (error) {
      setMessage("❌ Error al crear incidente");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div style={styles.container}>
      <h2>🚨 Reportar Incidente</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Tipo de Incidente:</label>
          <select
            value={form.tipo}
            onChange={(e) => handleChange("tipo", e.target.value)}
            style={styles.select}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="emergencia_medica">🏥 Emergencia Médica</option>
            <option value="seguridad">🔒 Seguridad</option>
            <option value="infraestructura">🏗️ Infraestructura</option>
            <option value="otro">📋 Otro</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Descripción:</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            placeholder="Describe el incidente..."
            style={styles.textarea}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ubicación:</label>
          <input
            type="text"
            value={form.ubicacion}
            onChange={(e) => handleChange("ubicacion", e.target.value)}
            placeholder="Ej: Pabellón A, 2do piso"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Tu Email (opcional):</label>
          <input
            type="email"
            value={form.emailReportante}
            onChange={(e) => handleChange("emailReportante", e.target.value)}
            placeholder="correo@utec.edu.pe"
            style={styles.input}
          />
          <small style={styles.helper}>Recibirás notificaciones sobre el estado del incidente</small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Nivel de Urgencia:</label>
          <select
            value={form.urgencia}
            onChange={(e) => handleChange("urgencia", e.target.value)}
            style={styles.select}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="baja">🟢 Baja</option>
            <option value="media">🟡 Media</option>
            <option value="alta">🟠 Alta</option>
            <option value="critica">🔴 Crítica</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
        >
          {loading ? "Enviando..." : "Crear Incidente"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    margin: "20px auto"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  label: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333"
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px"
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    minHeight: "100px",
    resize: "vertical"
  },
  select: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px"
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed"
  },
  message: {
    padding: "10px",
    borderRadius: "4px",
    textAlign: "center",
    backgroundColor: "#f0f0f0"
  },
  helper: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic"
  }
};
