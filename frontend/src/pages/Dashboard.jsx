import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🏅 SportSpace</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.welcomeCard}>
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p style={styles.roleTag}>
            {user?.role} • {user?.sport}
          </p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate("/feed")}>
            <h3>📝 Feed</h3>
            <p>View and share posts with your team</p>
          </div>
          <div style={styles.card}>
            <h3>👥 My Team</h3>
            <p>View your team members and activity</p>
          </div>
          <div style={styles.card}>
            <h3>🏆 Achievements</h3>
            <p>Track your medals and awards</p>
          </div>
          <div style={styles.card}>
            <h3>💬 Team Chat</h3>
            <p>Real-time chat with your team</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  navbar: {
    backgroundColor: "white",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logo: {
    fontSize: "1.5rem",
  },
  logoutBtn: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
  content: {
    maxWidth: "1000px",
    margin: "2rem auto",
    padding: "0 1rem",
  },
  welcomeCard: {
    backgroundColor: "white",
    padding: "1.5rem 2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
  },
  roleTag: {
    color: "#2563eb",
    fontWeight: "600",
    marginTop: "0.25rem",
    textTransform: "capitalize",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
};

export default Dashboard;
