import { Link } from "react-router-dom";
import IncidentForm from "../components/IncidentForm";
import IncidentList from "../components/IncidentList";

export default function Home() {
  const userId = localStorage.getItem("userId");
  const rol = localStorage.getItem("rol");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>🚨 Alerta UTEC</h1>
          <nav style={styles.nav}>
            {userId ? (
              <>
                <span style={styles.userInfo}>
                  👤 {rol} ({userId})
                </span>
                {(rol === "administrador" || rol === "seguridad") && (
                  <Link to="/admin" style={styles.link}>
                    🎛️ Panel Admin
                  </Link>
                )}
                <button onClick={handleLogout} style={styles.logoutButton}>
                  🚪 Salir
                </button>
              </>
            ) : (
              <Link to="/login" style={styles.link}>
                🔐 Iniciar Sesión
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <h2 style={styles.heroTitle}>Sistema de Alertas en Tiempo Real</h2>
          <p style={styles.heroSubtitle}>
            Reporta incidentes y mantente informado sobre la seguridad en el campus
          </p>
        </section>

        <div style={styles.content}>
          <IncidentForm />
          <IncidentList />
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2025 Alerta UTEC - Sistema de Gestión de Incidentes</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100
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
    fontSize: "24px",
    color: "#007bff"
  },
  nav: {
    display: "flex",
    gap: "15px",
    alignItems: "center"
  },
  userInfo: {
    fontSize: "14px",
    color: "#666",
    padding: "8px 12px",
    backgroundColor: "#f0f2f5",
    borderRadius: "4px"
  },
  link: {
    textDecoration: "none",
    color: "#007bff",
    fontWeight: "bold",
    fontSize: "14px",
    padding: "8px 12px",
    borderRadius: "4px",
    backgroundColor: "#e7f3ff"
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
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "20px"
  },
  hero: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  heroTitle: {
    margin: "0 0 15px 0",
    fontSize: "32px",
    color: "#333"
  },
  heroSubtitle: {
    margin: 0,
    fontSize: "18px",
    color: "#666"
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  footer: {
    backgroundColor: "#333",
    color: "white",
    textAlign: "center",
    padding: "20px",
    marginTop: "40px"
  }
};
