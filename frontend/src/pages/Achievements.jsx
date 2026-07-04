import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { Trophy, Medal, Plus, Trash2 } from "lucide-react";
import styles from "./Achievements.module.css";

function Achievements() {
  const { user } = useAuth();
  const [teamAchievements, setTeamAchievements] = useState([]);
  const [personalAchievements, setPersonalAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState("team");
  const [teamForm, setTeamForm] = useState({
    title: "",
    competition: "",
    date: "",
  });
  const [personalForm, setPersonalForm] = useState({ title: "", date: "" });

  const isPrivileged = ["captain", "admin"].includes(user?.role);

  const fetchTeamAchievements = async () => {
    try {
      const res = await axiosInstance.get(`/teams/${user.team}`);
      setTeamAchievements(res.data.team.achievements);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPersonalAchievements = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setPersonalAchievements(res.data.user.achievements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.team) {
      fetchTeamAchievements();
      fetchPersonalAchievements();
    }
  }, [user?.team]);

  const handleAddTeamAchievement = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/teams/${user.team}/achievements`, teamForm);
      setTeamForm({ title: "", competition: "", date: "" });
      fetchTeamAchievements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeamAchievement = async (achievementId) => {
    if (!window.confirm("Delete this achievement?")) return;
    try {
      await axiosInstance.delete(
        `/teams/${user.team}/achievements/${achievementId}`,
      );
      setTeamAchievements((prev) =>
        prev.filter((a) => a._id !== achievementId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPersonalAchievement = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/achievements", personalForm);
      setPersonalForm({ title: "", date: "" });
      fetchPersonalAchievements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePersonalAchievement = async (achievementId) => {
    if (!window.confirm("Delete this achievement?")) return;
    try {
      await axiosInstance.delete(`/auth/achievements/${achievementId}`);
      setPersonalAchievements((prev) =>
        prev.filter((a) => a._id !== achievementId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        <Trophy size={24} color="#f59e0b" />
        Achievements Wall
      </h2>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("team")}
          className={`${styles.tab} ${activeTab === "team" ? styles.activeTab : ""}`}
        >
          Team Achievements
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`${styles.tab} ${activeTab === "personal" ? styles.activeTab : ""}`}
        >
          My Achievements
        </button>
      </div>

      {activeTab === "team" && (
        <div>
          {isPrivileged && (
            <div className={styles.form}>
              <p className={styles.formTitle}>
                <Plus size={18} color="#f59e0b" />
                Add Team Achievement
              </p>
              <form
                onSubmit={handleAddTeamAchievement}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Title (e.g. Gold Medal — 100m Sprint)"
                  value={teamForm.title}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, title: e.target.value })
                  }
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Competition (e.g. Inter-NIT 2026)"
                  value={teamForm.competition}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, competition: e.target.value })
                  }
                  className={styles.input}
                  required
                />
                <input
                  type="date"
                  value={teamForm.date}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, date: e.target.value })
                  }
                  className={styles.input}
                  required
                />
                <button type="submit" className={styles.submitBtn}>
                  <Plus size={16} />
                  Add Achievement
                </button>
              </form>
            </div>
          )}

          <div className={styles.achievementsList}>
            {teamAchievements.length === 0 ? (
              <p className={styles.empty}>No team achievements yet!</p>
            ) : (
              teamAchievements.map((a) => (
                <div key={a._id} className={styles.achievementCard}>
                  <div className={styles.achievementLeft}>
                    <div className={styles.medalIcon}>
                      <Medal size={22} />
                    </div>
                    <div>
                      <p className={styles.achievementTitle}>{a.title}</p>
                      <p className={styles.achievementMeta}>
                        {a.competition} •{" "}
                        {a.date ? new Date(a.date).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  {isPrivileged && (
                    <button
                      onClick={() => handleDeleteTeamAchievement(a._id)}
                      className={styles.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "personal" && (
        <div>
          <div className={styles.form}>
            <p className={styles.formTitle}>
              <Plus size={18} color="#f59e0b" />
              Add Personal Achievement
            </p>
            <form
              onSubmit={handleAddPersonalAchievement}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <input
                type="text"
                placeholder="Title (e.g. Best Female Athlete — CITIUS 2026)"
                value={personalForm.title}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, title: e.target.value })
                }
                className={styles.input}
                required
              />
              <input
                type="date"
                value={personalForm.date}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, date: e.target.value })
                }
                className={styles.input}
                required
              />
              <button type="submit" className={styles.submitBtn}>
                <Plus size={16} />
                Add Achievement
              </button>
            </form>
          </div>

          <div className={styles.achievementsList}>
            {personalAchievements.length === 0 ? (
              <p className={styles.empty}>
                No personal achievements yet — go win some!
              </p>
            ) : (
              personalAchievements.map((a) => (
                <div key={a._id} className={styles.achievementCard}>
                  <div className={styles.achievementLeft}>
                    <div className={styles.medalIcon}>
                      <Medal size={22} />
                    </div>
                    <div>
                      <p className={styles.achievementTitle}>{a.title}</p>
                      <p className={styles.achievementMeta}>
                        {a.date ? new Date(a.date).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalAchievement(a._id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;
