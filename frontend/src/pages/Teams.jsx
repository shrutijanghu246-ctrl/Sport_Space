import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, Trophy, Plus, LogIn } from "lucide-react";
import styles from "./Teams.module.css";

function Teams() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: "", sport: "", description: "" });
  const [message, setMessage] = useState("");

  const isPrivileged = ["captain", "admin"].includes(user?.role);

  const fetchTeams = async () => {
    try {
      const res = await axiosInstance.get("/teams");
      setTeams(res.data.teams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleJoin = async (teamId) => {
    try {
      setJoining(teamId);
      await axiosInstance.post(`/teams/${teamId}/join`);

      // Refresh user data to get team field
      const res = await axiosInstance.get("/auth/me");
      login(res.data.user);

      setMessage("Joined successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setJoining(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/teams/create-and-join", form);

      // Refresh user data
      const res = await axiosInstance.get("/auth/me");
      login(res.data.user);

      setMessage("Team created! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
        Loading teams...
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>
          <Users size={24} color="#f59e0b" />
          College Sports Teams
        </h2>
        {isPrivileged && !user?.team && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={styles.createBtn}
          >
            <Plus size={16} />
            Create Team
          </button>
        )}
      </div>

      {message && <div className={styles.message}>{message}</div>}

      {showCreateForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Create New Team</h3>
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              type="text"
              placeholder="Team name (e.g. Athletics)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Sport (e.g. Athletics, Football)"
              value={form.sport}
              onChange={(e) => setForm({ ...form, sport: e.target.value })}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={styles.input}
            />
            <button type="submit" className={styles.submitBtn}>
              <Plus size={16} /> Create & Join
            </button>
          </form>
        </div>
      )}

      <div className={styles.teamGrid}>
        {teams.length === 0 ? (
          <p className={styles.empty}>No teams yet!</p>
        ) : (
          teams.map((team) => {
            const isMyTeam = user?.team === team._id;
            return (
              <div key={team._id} className={styles.teamCard}>
                <div className={styles.teamIcon}>
                  <Trophy size={28} color="#f59e0b" />
                </div>
                <div className={styles.teamInfo}>
                  <h3 className={styles.teamName}>{team.name}</h3>
                  <p className={styles.teamSport}>{team.sport}</p>
                  {team.description && (
                    <p className={styles.teamDesc}>{team.description}</p>
                  )}
                </div>
                <div className={styles.teamActions}>
                  {isMyTeam ? (
                    <button
                      onClick={() => navigate("/team")}
                      className={styles.viewBtn}
                    >
                      View Team
                    </button>
                  ) : user?.team ? (
                    <span className={styles.alreadyMember}>
                      Already in a team
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoin(team._id)}
                      disabled={joining === team._id}
                      className={styles.joinBtn}
                    >
                      <LogIn size={15} />
                      {joining === team._id ? "Joining..." : "Join Team"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Teams;
