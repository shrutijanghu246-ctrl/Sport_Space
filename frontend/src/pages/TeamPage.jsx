import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, Crown, Trophy, Dumbbell } from "lucide-react";
import styles from "./TeamPage.module.css";

function TeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (user?.team) fetchTeam();
  }, [user?.team]);

  if (loading) return <div className={styles.loading}>Loading team...</div>;
  if (!team) return <div className={styles.loading}>No team found!</div>;

  return (
    <div className={styles.container}>
      {/* Team Header */}
      <div className={styles.teamHeader}>
        <div className={styles.teamAvatar}>
          <Dumbbell size={32} />
        </div>
        <div>
          <h2 className={styles.teamName}>{team.name}</h2>
          <p className={styles.teamSport}>{team.sport}</p>
          {team.description && (
            <p className={styles.teamDesc}>{team.description}</p>
          )}
        </div>
      </div>

      {/* Leadership */}
      {(team.captain?.boys || team.captain?.girls || team.coach) && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>
            <Crown size={16} color="#f59e0b" />
            Leadership
          </p>
          <div className={styles.leadershipRow}>
            {team.captain?.boys && (
              <div
                className={styles.leaderCard}
                onClick={() => navigate(`/profile/${team.captain.boys._id}`)}
              >
                <div className={styles.leaderAvatar}>
                  {team.captain.boys.name?.[0]}
                </div>
                <div>
                  <p className={styles.leaderName}>{team.captain.boys.name}</p>
                  <p className={styles.leaderRole}>Boys Captain</p>
                </div>
              </div>
            )}
            {team.captain?.girls && (
              <div
                className={styles.leaderCard}
                onClick={() => navigate(`/profile/${team.captain.girls._id}`)}
              >
                <div className={styles.leaderAvatar}>
                  {team.captain.girls.name?.[0]}
                </div>
                <div>
                  <p className={styles.leaderName}>{team.captain.girls.name}</p>
                  <p className={styles.leaderRole}>Girls Captain</p>
                </div>
              </div>
            )}
            {team.coach && (
              <div
                className={styles.leaderCard}
                onClick={() => navigate(`/profile/${team.coach._id}`)}
              >
                <div className={`${styles.leaderAvatar} ${styles.coachAvatar}`}>
                  {team.coach.name?.[0]}
                </div>
                <div>
                  <p className={styles.leaderName}>{team.coach.name}</p>
                  <p className={styles.leaderRole}>Coach</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <Users size={16} color="#f59e0b" />
          Members ({team.members?.length || 0})
        </p>
        <div className={styles.memberGrid}>
          {team.members?.map((member) => (
            <div
              key={member._id}
              className={styles.memberCard}
              onClick={() => navigate(`/profile/${member._id}`)}
            >
              <div className={styles.memberAvatar}>
                {member.profilePic ? (
                  <img
                    src={member.profilePic}
                    alt=""
                    className={styles.memberAvatarImg}
                  />
                ) : (
                  <span>{member.name?.[0]}</span>
                )}
              </div>
              <div>
                <p className={styles.memberName}>{member.name}</p>
                <p className={styles.memberSport}>{member.sport}</p>
                <p className={styles.memberRole}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Achievements */}
      {team.achievements?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>
            <Trophy size={16} color="#f59e0b" />
            Team Achievements
          </p>
          {team.achievements.map((a) => (
            <div key={a._id} className={styles.achievementItem}>
              <span>{a.title}</span>
              <span className={styles.achievementMeta}>
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

export default TeamPage;
