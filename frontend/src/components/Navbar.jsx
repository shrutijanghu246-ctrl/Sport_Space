import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import {
  Home,
  Newspaper,
  Users,
  MessageCircle,
  Trophy,
  Salad,
  Dumbbell,
  Zap,
} from "lucide-react";
import styles from "./Navbar.module.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Home", icon: <Home size={16} /> },
    { path: "/feed", label: "Feed", icon: <Newspaper size={16} /> },
    { path: "/team", label: "Team", icon: <Users size={16} /> },
    { path: "/chat", label: "Chat", icon: <MessageCircle size={16} /> },
    {
      path: "/achievements",
      label: "Achievements",
      icon: <Trophy size={16} />,
    },
    { path: "/diet", label: "Diet", icon: <Salad size={16} /> },
    { path: "/exercises", label: "Exercises", icon: <Dumbbell size={16} /> },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <div className={styles.logo} onClick={() => navigate("/dashboard")}>
          <Zap size={22} fill="#f59e0b" color="#f59e0b" />
          <span>SportSpace</span>
        </div>

        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ""}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.navRight}>
          <NotificationBell />
          <div
            className={styles.userInfo}
            onClick={() => navigate(`/profile/${user?.id || user?._id}`)}
          >
            <div className={styles.avatar}>{user?.name?.[0]}</div>
            <span className={styles.userName}>{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
