import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Newspaper,
  Users,
  Trophy,
  MessageCircle,
  Salad,
  Dumbbell,
  Medal,
} from "lucide-react";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      icon: <Newspaper size={22} />,
      title: "Feed",
      desc: "View and share posts with your team",
      path: "/feed",
    },
    {
      icon: <Users size={22} />,
      title: "My Team",
      desc: "View your team members and activity",
      path: "/team",
    },
    {
      icon: <Trophy size={22} />,
      title: "Achievements",
      desc: "Track your medals and awards",
      path: "/achievements",
    },
    {
      icon: <MessageCircle size={22} />,
      title: "Team Chat",
      desc: "Real-time chat with your team",
      path: "/chat",
    },
    {
      icon: <Salad size={22} />,
      title: "Diet Tracker",
      desc: "Log meals and track nutrition",
      path: "/diet",
    },
    {
      icon: <Dumbbell size={22} />,
      title: "Exercises",
      desc: "Sport-specific exercise recommendations",
      path: "/exercises",
    },
    {
      icon: <Users size={22} />,
      title: "My Team",
      desc: "View your team members and activity",
      path: user?.team ? "/team" : "/teams",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {user?.name?.split(" ")[0]}!</h2>
          <p>
            {user?.role} • {user?.sport} • NIT Kurukshetra
          </p>
        </div>
        <div className={styles.medalIcon}>
          <Medal size={64} color="#f59e0b" strokeWidth={1.5} />
        </div>
      </div>

      <p className={styles.sectionTitle}>Quick Access</p>

      <div className={styles.grid}>
        {cards.map((card) => (
          <div
            key={card.path}
            className={styles.card}
            onClick={() => navigate(card.path)}
          >
            <div className={styles.cardIcon}>{card.icon}</div>
            <p className={styles.cardTitle}>{card.title}</p>
            <p className={styles.cardDesc}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
