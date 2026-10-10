import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import styles from "./NoTeam.module.css";

function NoTeam({ message = "Join a team to see updates from it." }) {
  const navigate = useNavigate();
  return (
    <div className={styles.box}>
      <div className={styles.icon}>
        <Users size={28} />
      </div>
      <p className={styles.title}>You haven't joined a team yet</p>
      <p className={styles.text}>{message}</p>
      <button onClick={() => navigate("/teams")} className={styles.btn}>
        Browse Teams
      </button>
    </div>
  );
}

export default NoTeam;
