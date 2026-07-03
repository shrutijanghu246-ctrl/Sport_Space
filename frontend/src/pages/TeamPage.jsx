import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function TeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const res = await axiosInstance.get(`/teams/${user.team}`);
      setTeam(res.data.team);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("user.team:", user?.team);
    if (user?.team) fetchTeam();
  }, [user?.team]);

  if (loading) return <div style={styles.loading}>Loading team...</div>;
  if (!team) return <div style={styles.loading}>No team found!</div>;

  const allMembers = team.members || [];

  return (
    <div style={styles.container}>
      {/* Team Header */}
      <div style={styles.teamHeader}>
        <div style={styles.teamAvatar}>
          {team.logo ? (
            <img src={team.logo} alt="team logo" style={styles.logoImg} />
          ) : (
            <span style={styles.logoPlaceholder}>🏅</span>
          )}
        </div>
        <div>
          <h2 style={styles.teamName}>{team.name}</h2>
          <p style={styles.teamSport}>🏃 {team.sport}</p>
          {team.description && (
            <p style={styles.teamDesc}>{team.description}</p>
          )}
        </div>
      </div>

      {/* Captains */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>👑 Leadership</h3>
        <div style={styles.leadershipRow}>
          {team.captain?.boys && (
            <div
              style={styles.leaderCard}
              onClick={() => navigate(`/profile/${team.captain.boys._id}`)}
            >
              <div style={styles.leaderAvatar}>
                {team.captain.boys.name?.[0]}
              </div>
              <div>
                <p style={styles.leaderName}>{team.captain.boys.name}</p>
                <p style={styles.leaderRole}>Boys Captain</p>
              </div>
            </div>
          )}
          {team.captain?.girls && (
            <div
              style={styles.leaderCard}
              onClick={() => navigate(`/profile/${team.captain.girls._id}`)}
            >
              <div style={styles.leaderAvatar}>
                {team.captain.girls.name?.[0]}
              </div>
              <div>
                <p style={styles.leaderName}>{team.captain.girls.name}</p>
                <p style={styles.leaderRole}>Girls Captain</p>
              </div>
            </div>
          )}
          {team.coach && (
            <div
              style={styles.leaderCard}
              onClick={() => navigate(`/profile/${team.coach._id}`)}
            >
              <div
                style={{ ...styles.leaderAvatar, backgroundColor: "#22c55e" }}
              >
                {team.coach.name?.[0]}
              </div>
              <div>
                <p style={styles.leaderName}>{team.coach.name}</p>
                <p style={styles.leaderRole}>Coach</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>👥 Members ({allMembers.length})</h3>
        <div style={styles.memberGrid}>
          {allMembers.map((member) => (
            <div
              key={member._id}
              style={styles.memberCard}
              onClick={() => navigate(`/profile/${member._id}`)}
            >
              <div style={styles.memberAvatar}>
                {member.profilePic ? (
                  <img
                    src={member.profilePic}
                    alt=""
                    style={styles.memberAvatarImg}
                  />
                ) : (
                  <span>{member.name?.[0]}</span>
                )}
              </div>
              <div style={styles.memberInfo}>
                <p style={styles.memberName}>{member.name}</p>
                <p style={styles.memberSport}>{member.sport}</p>
                <p style={styles.memberRole}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Achievements */}
      {team.achievements?.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏆 Team Achievements</h3>
          {team.achievements.map((a) => (
            <div key={a._id} style={styles.achievementItem}>
              <span>🥇 {a.title}</span>
              <span style={styles.achievementMeta}>
                {a.competition} •{" "}
                {a.date ? new Date(a.date).toLocaleDateString() : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1.5rem 1rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#666",
  },
  teamHeader: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  teamAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    flexShrink: 0,
  },
  logoImg: {
    width: "80px",
    height: "80px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  logoPlaceholder: {
    fontSize: "2.5rem",
  },
  teamName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
  },
  teamSport: {
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  teamDesc: {
    color: "#666",
    fontSize: "0.9rem",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
  leadershipRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  leaderCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    cursor: "pointer",
    flex: 1,
    minWidth: "180px",
  },
  leaderAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  leaderName: {
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  leaderRole: {
    fontSize: "0.8rem",
    color: "#666",
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "0.75rem",
  },
  memberCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    cursor: "pointer",
  },
  memberAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    flexShrink: 0,
    overflow: "hidden",
  },
  memberAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  memberInfo: {
    overflow: "hidden",
  },
  memberName: {
    fontWeight: "600",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  memberSport: {
    fontSize: "0.75rem",
    color: "#2563eb",
  },
  memberRole: {
    fontSize: "0.75rem",
    color: "#666",
    textTransform: "capitalize",
  },
  achievementItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f5f5f5",
    fontSize: "0.9rem",
  },
  achievementMeta: {
    color: "#999",
    fontSize: "0.85rem",
  },
};

export default TeamPage;
