import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registrarUsuario } from "../api/incidentsApi";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    rol: "estudiante"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // Login
        const resp = await login({
          email: form.email,
          password: form.password
        });

        if (resp.ok) {
          // Guardar token y datos del usuario
          localStorage.setItem("token", resp.token);
          localStorage.setItem("userId", resp.user.userId);
          localStorage.setItem("rol", resp.user.rol);

          setMessage("✅ Login exitoso");

          // Redirigir según el rol
          setTimeout(() => {
            if (resp.user.rol === "administrador" || resp.user.rol === "seguridad") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }, 1000);
        } else {
          setMessage(`❌ ${resp.message}`);
        }
      } else {
        // Registro
        const resp = await registrarUsuario({
          email: form.email,
          password: form.password,
          rol: form.rol
        });

        if (resp.ok) {
          setMessage(`✅ Usuario registrado: ${resp.userId}`);
          setTimeout(() => {
            setIsLogin(true);
            setForm({ ...form, password: "" });
          }, 2000);
        } else {
          setMessage(`❌ ${resp.message}`);
        }
      }
    } catch (error) {
      setMessage("❌ Error en la operación");
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
      <div style={styles.card}>
        <h1 style={styles.title}>🚨 Alerta UTEC</h1>

        <div style={styles.tabs}>
          <button
            onClick={() => setIsLogin(true)}
            style={isLogin ? {...styles.tab, ...styles.tabActive} : styles.tab}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={!isLogin ? {...styles.tab, ...styles.tabActive} : styles.tab}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>📧 Email:</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="tu-email@utec.edu.pe"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>🔒 Contraseña:</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {!isLogin && (
            <div style={styles.field}>
              <label style={styles.label}>👤 Rol:</label>
              <select
                value={form.rol}
                onChange={(e) => handleChange("rol", e.target.value)}
                style={styles.select}
                required
              >
                <option value="estudiante">Estudiante</option>
                <option value="seguridad">Seguridad</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? "⏳ Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrarse")}
          </button>

          {message && <p style={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    padding: "20px"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "450px"
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
    fontSize: "28px"
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px"
  },
  tab: {
    flex: 1,
    padding: "12px",
    border: "none",
    backgroundColor: "#f0f2f5",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#666"
  },
  tabActive: {
    backgroundColor: "#007bff",
    color: "white"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333"
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px"
  },
  select: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px"
  },
  button: {
    padding: "14px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
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
    padding: "12px",
    borderRadius: "6px",
    textAlign: "center",
    backgroundColor: "#f0f2f5",
    fontSize: "14px"
  }
};
