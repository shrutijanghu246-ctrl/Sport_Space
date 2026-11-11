import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import NoTeam from "../components/NoTeam";
import { Medal, Trophy, Newspaper, User } from "lucide-react";
import styles from "./Dashboard.module.css";
import { formatRole } from "../utils/formatRole";

function Dashboard() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [postsError, setPostsError] = useState(false);
  const [achError, setAchError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [genderChoice, setGenderChoice] = useState("");
  const [genderSaving, setGenderSaving] = useState(false);
  const [genderMsg, setGenderMsg] = useState("");

  const saveGender = async () => {
    setGenderMsg("");
    setGenderSaving(true);
    try {
      const res = await axiosInstance.patch("/auth/me", {
        gender: genderChoice,
      });
      login(res.data.user);
    } catch (err) {
      if (
        err.response?.data?.message ===
        "Gender is already saved on this account"
      ) {
        // Another tab or device saved it first.
        try {
          const me = await axiosInstance.get("/auth/me");
          login(me.data.user);
        } catch {
          setGenderMsg("Gender is already saved. Refresh the page.");
        }
      } else {
        setGenderMsg(err.response?.data?.message || "Could not save gender");
      }
    } finally {
      setGenderSaving(false);
    }
  };

  const fetchLatest = async () => {
    // allSettled: each request succeeds or fails on its own
    const [feedRes, teamRes] = await Promise.allSettled([
      axiosInstance.get(`/posts/team/${user.team}`),
      axiosInstance.get(`/teams/${user.team}`),
    ]);

    if (feedRes.status === "fulfilled") {
      // quick posts only (training logs are private), newest 5
      setPosts(
        feedRes.value.data.posts.filter((p) => p.type === "post").slice(0, 5),
      );
      setPostsError(false);
    } else {
      console.error("Posts request failed:", feedRes.reason);
      setPostsError(true);
    }

    if (teamRes.status === "fulfilled") {
      // newest 3 achievements by date
      setAchievements(
        [...(teamRes.value.data.team.achievements || [])]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3),
      );
      setAchError(false);
    } else {
      console.error("Team request failed:", teamRes.reason);
      setAchError(true);
    }

    setLoading(false);
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

      {!user?.gender && (
        <div className={styles.genderCard}>
          <div className={styles.genderInfo}>
            <div className={styles.genderIcon}>
              <User size={20} />
            </div>
            <p className={styles.genderText}>Pick your gender.</p>
          </div>
          <div className={styles.genderControls}>
            <select
              className={styles.genderSelect}
              aria-label="Gender"
              value={genderChoice}
              onChange={(e) => setGenderChoice(e.target.value)}
              disabled={genderSaving}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <button
              className={styles.genderSave}
              onClick={saveGender}
              disabled={!genderChoice || genderSaving}
            >
              {genderSaving ? "Saving..." : "Save"}
            </button>
          </div>
          {genderMsg && <p className={styles.genderMsg}>{genderMsg}</p>}
        </div>
      )}

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
            {postsError ? (
              <p className={styles.empty}>
                Couldn't load posts. Try refreshing.
              </p>
            ) : posts.length === 0 ? (
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
            {achError ? (
              <p className={styles.empty}>
                Couldn't load achievements. Try refreshing.
              </p>
            ) : achievements.length === 0 ? (
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
