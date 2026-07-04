import { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { Zap, ClipboardList, Send } from "lucide-react";
import styles from "./Feed.module.css";

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState("post");
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
    if (user?.team) fetchFeed();
  }, [user?.team]);

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

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
        Loading feed...
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.createPost}>
        <div className={styles.tabs}>
          <button
            onClick={() => setPostType("post")}
            className={`${styles.tab} ${postType === "post" ? styles.activeTab : ""}`}
          >
            <Zap size={15} />
            Quick Post
          </button>
          <button
            onClick={() => setPostType("log")}
            className={`${styles.tab} ${postType === "log" ? styles.activeTab : ""}`}
          >
            <ClipboardList size={15} />
            Training Log
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {postType === "post" ? (
            <textarea
              placeholder="What's happening in practice today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              required
            />
          ) : (
            <div className={styles.logForm}>
              <input
                type="date"
                value={logDetails.date}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, date: e.target.value })
                }
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Drill name (e.g. Baton Exchange)"
                value={logDetails.drillName}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, drillName: e.target.value })
                }
                className={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Duration (mins)"
                value={logDetails.duration}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, duration: e.target.value })
                }
                className={styles.input}
                required
              />
              <textarea
                placeholder="What did you learn/improve?"
                value={logDetails.personalNote}
                onChange={(e) =>
                  setLogDetails({ ...logDetails, personalNote: e.target.value })
                }
                className={styles.textarea}
                required
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            <Send size={15} />
            {postType === "post" ? "Post" : "Log Training"}
          </button>
        </form>
      </div>

      <div className={styles.feed}>
        {posts.length === 0 ? (
          <p className={styles.empty}>
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

export default Feed;
