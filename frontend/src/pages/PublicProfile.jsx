import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { formatRole } from "../utils/formatRole";
import styles from "./PublicProfile.module.css";

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

  if (loading) return <div className={styles.loading}>Loading profile...</div>;
  if (!profileUser) return <div className={styles.loading}>User not found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.glow} />
        <div className={styles.avatarRing}>
          <div className={styles.avatarPlaceholder}>
            {profileUser.profilePic ? (
              <img
                src={profileUser.profilePic}
                alt="profile"
                className={styles.avatarImg}
              />
            ) : (
              <span>{profileUser.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.name}>{profileUser.name}</h2>
          <div className={styles.metaRow}>
            {profileUser.sport && (
              <span className={styles.sportBadge}>{profileUser.sport}</span>
            )}
            <span className={styles.role}>
              {formatRole(profileUser.role)}
              <span className={styles.dot}>•</span>
              NIT Kurukshetra
            </span>
          </div>
          {profileUser.bio && <p className={styles.bio}>{profileUser.bio}</p>}
        </div>
      </div>

      {profileUser.achievements?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Achievements</h3>
          {profileUser.achievements.map((a) => (
            <div key={a._id} className={styles.achievementItem}>
              <span>{a.title}</span>
              <span className={styles.achievementDate}>
                {a.date ? new Date(a.date).toLocaleDateString() : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Posts</h3>
          {posts.map((post) => (
            <div key={post._id} className={styles.postCard}>
              <p>{post.content}</p>
              <p className={styles.postDate}>
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicProfile;
