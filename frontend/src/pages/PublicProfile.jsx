import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axios";

function PublicProfile() {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/auth/profile/${userId}`);
        console.log("profile response:", res.data);
        setProfileUser(res.data.profileUser);
        setPosts(res.data.posts);
      } catch (err) {
        console.error("profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div style={styles.loading}>Loading profile...</div>;
  if (!profileUser) return <div style={styles.loading}>User not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        <div style={styles.avatarPlaceholder}>
          {profileUser.profilePic ? (
            <img
              src={profileUser.profilePic}
              alt="profile"
              style={styles.avatarImg}
            />
          ) : (
            <span>{profileUser.name?.[0]}</span>
          )}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.name}>{profileUser.name}</h2>
          <p style={styles.sport}>{profileUser.sport}</p>
          <p style={styles.role}>{profileUser.role} • NIT Kurukshetra</p>
          {profileUser.bio && <p style={styles.bio}>{profileUser.bio}</p>}
        </div>
      </div>

      {profileUser.achievements?.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Achievements</h3>
          {profileUser.achievements.map((a) => (
            <div key={a._id} style={styles.achievementItem}>
              <span>{a.title}</span>
              <span style={styles.achievementDate}>
                {a.date ? new Date(a.date).toLocaleDateString() : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Posts</h3>
          {posts.map((post) => (
            <div key={post._id} style={styles.postCard}>
              <p>{post.content}</p>
              <p style={styles.postDate}>
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#9ca3af",
  },
  profileCard: {
    background: "linear-gradient(135deg, #0a0f1e 0%, #1f2937 100%)",
    borderRadius: "16px",
    padding: "2rem",
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    marginBottom: "1.5rem",
    color: "white",
  },
  avatarPlaceholder: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    color: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "800",
    flexShrink: 0,
  },
  avatarImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: "1.5rem",
    fontWeight: "800",
    marginBottom: "0.25rem",
    letterSpacing: "-0.5px",
  },
  sport: {
    color: "#f59e0b",
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  role: {
    color: "#9ca3af",
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
    textTransform: "capitalize",
  },
  bio: {
    color: "#d1d5db",
    fontSize: "0.9rem",
  },
  section: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    border: "1px solid #e5e7eb",
    marginBottom: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "1rem",
  },
  achievementItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.625rem 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.9rem",
    color: "#374151",
  },
  achievementDate: {
    color: "#9ca3af",
    fontSize: "0.8rem",
  },
  postCard: {
    padding: "0.75rem 0",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  },
  postDate: {
    color: "#9ca3af",
    fontSize: "0.8rem",
    marginTop: "0.25rem",
  },
};

export default PublicProfile;
