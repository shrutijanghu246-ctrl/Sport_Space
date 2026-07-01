import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function Achievements() {
  const { user } = useAuth();
  const [teamAchievements, setTeamAchievements] = useState([]);
  const [personalAchievements, setPersonalAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState("team");

  //team achievements form
  const [teamForm, setTeamForm] = useState({
    title: "",
    competition: "",
    date: "",
  });

  //personal achievements form
  const [personalForm, setPersonalForm] = useState({
    title: "",
    date: "",
  });

  const isPrivileged = ["captain", "admin"].includes(user?.role);
  console.log("user role:", user?.role, "isPrivileged:", isPrivileged);

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
      console.log("personal achievements response:", res.data);
      setPersonalAchievements(res.data.user.achievements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeamAchievements();
    fetchPersonalAchievements();
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
    console.log("Deleting achievement ID:", achievementId);
    if (!window.confirm("Delete this achievement?")) return;
    try {
      await axiosInstance.delete(`/auth/achievements/${achievementId}`);
      // Update state directly instead of refetching
      setPersonalAchievements((prev) =>
        prev.filter((a) => a._id !== achievementId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🏆 Achievements Wall</h2>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("team")}
          style={{
            ...styles.tab,
            ...(activeTab === "team" ? styles.activeTab : {}),
          }}
        >
          Team Achievements
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          style={{
            ...styles.tab,
            ...(activeTab === "personal" ? styles.activeTab : {}),
          }}
        >
          My Achievements
        </button>
      </div>

      {activeTab === "team" && (
        <div>
          {isPrivileged && (
            <form onSubmit={handleAddTeamAchievement} style={styles.form}>
              <h3 style={styles.formTitle}>Add Team Achievement</h3>
              <input
                type="text"
                placeholder="Title (e.g. Gold Medal — 100m Sprint)"
                value={teamForm.title}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, title: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Competition (e.g. Inter-NIT 2026)"
                value={teamForm.competition}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, competition: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="date"
                value={teamForm.date}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, date: e.target.value })
                }
                style={styles.input}
                required
              />
              <button type="submit" style={styles.submitBtn}>
                Add Achievement 🏅
              </button>
            </form>
          )}

          <div style={styles.achievementsList}>
            {teamAchievements.length === 0 ? (
              <p style={styles.empty}>No team achievements yet!</p>
            ) : (
              teamAchievements.map((a) => (
                <div key={a._id} style={styles.achievementCard}>
                  <div>
                    <p style={styles.achievementTitle}>🥇 {a.title}</p>
                    <p style={styles.achievementMeta}>
                      {a.competition} •{" "}
                      {a.date ? new Date(a.date).toLocaleDateString() : ""}
                    </p>
                  </div>
                  {isPrivileged && (
                    <button
                      onClick={() => handleDeleteTeamAchievement(a._id)}
                      style={styles.deleteBtn}
                    >
                      🗑️
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
          <form onSubmit={handleAddPersonalAchievement} style={styles.form}>
            <h3 style={styles.formTitle}>Add Personal Achievement</h3>
            <input
              type="text"
              placeholder="Title (e.g. Best Female Athlete — CITIUS 2026)"
              value={personalForm.title}
              onChange={(e) =>
                setPersonalForm({ ...personalForm, title: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              type="date"
              value={personalForm.date}
              onChange={(e) =>
                setPersonalForm({ ...personalForm, date: e.target.value })
              }
              style={styles.input}
              required
            />
            <button type="submit" style={styles.submitBtn}>
              Add Achievement 🏅
            </button>
          </form>

          <div style={styles.achievementsList}>
            {personalAchievements.length === 0 ? (
              <p style={styles.empty}>
                No personal achievements yet — go win some! 🏃‍♀️
              </p>
            ) : (
              personalAchievements.map((a) => (
                <div key={a._id} style={styles.achievementCard}>
                  <div>
                    <p style={styles.achievementTitle}>🏅 {a.title}</p>
                    <p style={styles.achievementMeta}>
                      {a.date ? new Date(a.date).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalAchievement(a._id)}
                    style={styles.deleteBtn}
                  >
                    🗑️
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

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "1.5rem 1rem",
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  tab: {
    padding: "0.5rem 1.25rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
  activeTab: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "1px solid #2563eb", // remove borderColor, keep just border
  },
  form: {
    backgroundColor: "white",
    padding: "1.25rem",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  formTitle: {
    fontSize: "1rem",
    fontWeight: "600",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  submitBtn: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  achievementsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  achievementCard: {
    backgroundColor: "white",
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  achievementTitle: {
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  achievementMeta: {
    fontSize: "0.85rem",
    color: "#666",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "2rem",
  },
};

export default Achievements;
