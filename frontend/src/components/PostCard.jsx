import { useState } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();

  const hasLiked = post.likes?.includes(user?.id);
  const canDelete =
    user?.id === post.author?._id || ["captain", "admin"].includes(user?.role);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axiosInstance.delete(`/posts/${post._id}`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    try {
      await axiosInstance.post(`/posts/${post._id}/like`);
      onUpdate(); //refresh feed
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await axiosInstance.post(`/posts/${post._id}/comment`, {
        text: commentText,
      });
      setCommentText("");
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.card}>
      <div
        style={{ ...styles.header, cursor: "pointer" }}
        onClick={() => navigate(`/profile/${post.author?._id}`)}
      >
        <div style={styles.avatar}>{post.author?.name?.[0]}</div>
        <div>
          <p style={styles.authorName}>{post.author?.name}</p>
          <p style={styles.sportTag}>{post.author?.sport}</p>
        </div>
      </div>

      {post.type === "log" ? (
        <div style={styles.logBox}>
          <p style={styles.logTitle}>
            🏋️ Training Log — {post.logDetails?.drillName}
          </p>
          <p>{post.logDetails?.personalNote}</p>
          <p style={styles.logMeta}>
            {post.logDetails?.duration} mins •{" "}
            {new Date(post.logDetails?.date).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p style={styles.content}>{post.content}</p>
      )}

      {post.image && <img src={post.image} alt="post" style={styles.image} />}

      <div style={styles.actions}>
        <button onClick={handleLike} style={styles.actionBtn}>
          {hasLiked ? "❤️" : "🤍"} {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={styles.actionBtn}
        >
          💬 {post.comments?.length || 0}
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            style={{ ...styles.actionBtn, color: "red" }}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {showComments && (
        <div style={styles.commentsSection}>
          {post.comments?.map((c, i) => (
            <div key={i} style={styles.comment}>
              <strong>{c.author?.name}:</strong> {c.text}
            </div>
          ))}

          <form onSubmit={handleComment} style={styles.commentForm}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={styles.commentInput}
            />
            <button type="submit" style={styles.commentBtn}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },
  authorName: {
    fontWeight: "600",
  },
  sportTag: {
    fontSize: "0.8rem",
    color: "#666",
  },
  content: {
    marginBottom: "0.75rem",
    lineHeight: "1.5",
  },
  logBox: {
    backgroundColor: "#f0f9ff",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "0.75rem",
  },
  logTitle: {
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  logMeta: {
    fontSize: "0.8rem",
    color: "#666",
    marginTop: "0.5rem",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
    marginBottom: "0.75rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    borderTop: "1px solid #eee",
    paddingTop: "0.75rem",
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  commentsSection: {
    marginTop: "0.75rem",
    borderTop: "1px solid #eee",
    paddingTop: "0.75rem",
  },
  comment: {
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  },
  commentForm: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  commentInput: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  commentBtn: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
};

export default PostCard;
