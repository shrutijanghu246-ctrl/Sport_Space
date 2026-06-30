import { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState("post"); //"post" or "log"

  //form states
  const [content, setContent] = useState("");
  const [logDetails, setLogDetails] = useState({
    date: "",
    sport: user?.sport || "",
    drillName: "",
    duration: "",
    personalNote: "",
  });

  const fetchFeed = async () => {
    try {
      const res = await axiosInstance.get(`/posts/team/${user.team}`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("user:", user);
    console.log("user.team:", user?.team);
    if (user?.team) fetchFeed();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        type: postType,
        content: postType === "log" ? logDetails.personalNote : content,
        isPublic: postType === "post",
        logDetails: postType === "log" ? logDetails : undefined,
      };

      await axiosInstance.post("/posts", payload);

      //reset forms
      setContent("");
      setLogDetails({
        date: "",
        sport: user?.sport || "",
        drillName: "",
        duration: "",
        personalNote: "",
      });

      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading feed...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.createPost}>
        <div style={styles.tabs}>
          <button
            onClick={() => setPostType("post")}
            style={{
              ...styles.tab,
              ...(postType === "post" ? styles.activeTab : {}),
            }}
          >
            📝 Quick Post
          </button>
          <button
            onClick={() => setPostType("log")}
            style={{
              ...styles.tab,
              ...(postType === "log" ? styles.activeTab : {}),
            }}
          >
            🏋️ Training Log
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {postType === "post" ? (
            <textarea
              placeholder="What's happening in practice today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={styles.textarea}
              required
            />
          ) : (
            <div style={styles.logForm}>
              <input
                type="date"
                value={logDetails.date}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, date: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Drill name (e.g. Baton Exchange)"
                value={logDetails.drillName}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, drillName: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Duration (mins)"
                value={logDetails.duration}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, duration: e.target.value })
                }
                style={styles.input}
                required
              />
              <textarea
                placeholder="What did you learn/improve?"
                value={logDetails.personalNote}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, personalNote: e.target.value })
                }
                style={styles.textarea}
                required
              />
            </div>
          )}

          <button type="submit" style={styles.submitBtn}>
            {postType === "post" ? "Post" : "Log Training"}
          </button>
        </form>
      </div>

      <div style={styles.feed}>
        {posts.length === 0 ? (
          <p style={styles.empty}>
            No posts yet. Be the first to share something!
          </p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={fetchFeed} />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "1rem",
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
  },
  createPost: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  tab: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  },
  activeTab: {
    backgroundColor: "#2563eb",
    color: "white",
    borderColor: "#2563eb",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    fontFamily: "inherit",
    resize: "vertical",
    marginBottom: "0.75rem",
  },
  logForm: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
  feed: {
    display: "flex",
    flexDirection: "column",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    padding: "2rem",
  },
};

export default Feed;
