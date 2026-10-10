import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import NoTeam from "../components/NoTeam";
import { Medal, Trophy, Newspaper } from "lucide-react";
import styles from "./Dashboard.module.css";
import { formatRole } from "../utils/formatRole";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    try {
      const [feedRes, teamRes] = await Promise.all([
        axiosInstance.get(`/posts/team/${user.team}`),
        axiosInstance.get(`/teams/${user.team}`),
      ]);

      // quick posts only (training logs are private), newest 5
      setPosts(feedRes.data.posts.filter((p) => p.type === "post").slice(0, 5));

      // newest 3 achievements by date
      setAchievements(
        [...(teamRes.data.team.achievements || [])]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.team) fetchLatest();
  }, [user?.team]);

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {user?.name?.split(" ")[0]}!</h2>
          <p>
            {formatRole(user?.role)} • {user?.sport} • NIT Kurukshetra
          </p>
        </div>
        <div className={styles.medalIcon}>
          <Medal size={64} color="#f59e0b" strokeWidth={1.5} />
        </div>
      </div>

      {!user?.team ? (
        <NoTeam message="Join a team to see its latest posts and achievements here." />
      ) : loading ? (
        <p className={styles.empty}>Loading latest updates...</p>
      ) : (
        <div className={styles.columns}>
          <section>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionTitle}>
                <Newspaper size={16} /> Latest Posts
              </p>
              <button
                onClick={() => navigate("/feed")}
                className={styles.viewAll}
              >
                View all
              </button>
            </div>
            {posts.length === 0 ? (
              <p className={styles.empty}>
                No posts yet. Be the first to share something!
              </p>
            ) : (
              <div className={styles.postList}>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} onUpdate={fetchLatest} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionTitle}>
                <Trophy size={16} /> Latest Achievements
              </p>
              <button
                onClick={() => navigate("/achievements")}
                className={styles.viewAll}
              >
                View all
              </button>
            </div>
            {achievements.length === 0 ? (
              <p className={styles.empty}>No team achievements yet.</p>
            ) : (
              <div className={styles.achList}>
                {achievements.map((a) => (
                  <div key={a._id} className={styles.achItem}>
                    <div className={styles.achIcon}>
                      <Medal size={18} />
                    </div>
                    <div>
                      <p className={styles.achTitle}>{a.title}</p>
                      <p className={styles.achMeta}>
                        {a.competition}
                        {a.date
                          ? ` • ${new Date(a.date).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
