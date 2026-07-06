import { useState } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();

  const hasLiked = post.likes?.some(
    (id) => id.toString() === (user?._id || user?.id)?.toString(),
  );
  const canDelete =
    user?.id === post.author?._id ||
    ["captain", "admin", "vice_captain"].includes(user?.role);

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
        {/* Like button: */}
        <button onClick={handleLike} style={styles.actionBtn}>
          <Heart
            size={16}
            fill={hasLiked ? "#ef4444" : "none"}
            color={hasLiked ? "#ef4444" : "#6b7280"}
          />
          <span style={{ color: hasLiked ? "#ef4444" : "#6b7280" }}>
            {post.likes?.length || 0}
          </span>
        </button>
        {/* Comment button: */}
        <button
          onClick={() => setShowComments(!showComments)}
          style={styles.actionBtn}
        >
          <MessageCircle size={16} color="#6b7280" />
          <span>{post.comments?.length || 0}</span>
        </button>
        {/* Delete button */}
        {canDelete && (
          <button
            onClick={handleDelete}
            style={{ ...styles.actionBtn, color: "#ef4444" }}
          >
            <Trash2 size={16} />
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
    borderRadius: "16px",
    padding: "1.25rem",
    marginBottom: "0",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.875rem",
    cursor: "pointer",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#0a0f1e",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.875rem",
    flexShrink: 0,
  },
  authorName: {
    fontWeight: "600",
    fontSize: "0.95rem",
    color: "#0a0f1e",
  },
  sportTag: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  content: {
    marginBottom: "0.875rem",
    lineHeight: "1.6",
    color: "#374151",
    fontSize: "0.95rem",
  },
  logBox: {
    backgroundColor: "#fef3c7",
    padding: "1rem",
    borderRadius: "10px",
    marginBottom: "0.875rem",
    borderLeft: "3px solid #f59e0b",
  },
  logTitle: {
    fontWeight: "700",
    marginBottom: "0.5rem",
    color: "#0a0f1e",
    fontSize: "0.9rem",
  },
  logMeta: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "0.5rem",
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "0.875rem",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "0.875rem",
    alignItems: "center",
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    color: "#6b7280",
    fontSize: "0.85rem",
    padding: "0.3rem 0.5rem",
    borderRadius: "6px",
    transition: "background 0.15s",
  },
  commentsSection: {
    marginTop: "0.875rem",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "0.875rem",
  },
  comment: {
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
    color: "#374151",
    padding: "0.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  commentForm: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
  },
  commentInput: {
    flex: 1,
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    border: "1.5px solid #e5e7eb",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  },
  commentBtn: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0a0f1e",
    color: "white",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
};

export default PostCard;
