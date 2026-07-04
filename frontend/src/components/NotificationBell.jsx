import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await axiosInstance.patch(`/notifications/${notif._id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)),
      );
      setShowDropdown(false);
      navigate("/feed");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.bellBtn}
      >
        <Bell size={20} color="#9ca3af" />
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={styles.markAllBtn}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={styles.empty}>No notifications yet</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  ...styles.notifItem,
                  backgroundColor: notif.isRead ? "white" : "#eff6ff",
                }}
              >
                <p style={styles.notifMessage}>{notif.message}</p>
                <p style={styles.notifTime}>
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
  },
  bellBtn: {
    background: "none",
    border: "none",
    fontSize: "1.3rem",
    cursor: "pointer",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "0.7rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    position: "absolute",
    top: "2.5rem",
    right: 0,
    width: "300px",
    maxHeight: "400px",
    overflowY: "auto",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 10,
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #eee",
    fontWeight: "600",
  },
  markAllBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  notifItem: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    cursor: "pointer",
  },
  notifMessage: {
    fontSize: "0.9rem",
  },
  notifTime: {
    fontSize: "0.75rem",
    color: "#999",
    marginTop: "0.25rem",
  },
  empty: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#999",
  },
};

export default NotificationBell;
