import { useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

function Chat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/messages/team/${user.team}`);
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.team) fetchMessages();
  }, [user?.team]);

  useEffect(() => {
    if (!socket || !user?.team) return;

    socket.emit("joinTeam", user.team);

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, user?.team]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    console.log("Sending message:", {
      teamId: user.team,
      senderId: user._id,
      text,
    });

    socket.emit("sendMessage", {
      teamId: user.team,
      senderId: user._id,
      text,
    });

    setText("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>💬 Team Chat</div>

      <div style={styles.messagesBox}>
        {messages.map((msg) => {
          const isMine = msg.sender?._id?.toString() === user._id?.toString();
          return (
            <div
              key={msg._id}
              style={{
                ...styles.messageRow,
                justifyContent: isMine ? "flex-end" : "flex-start",
              }}
            >
              <div style={isMine ? styles.myBubble : styles.theirBubble}>
                {!isMine && <p style={styles.senderName}>{msg.sender?.name}</p>}
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    height: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  header: {
    padding: "1rem",
    borderBottom: "1px solid #eee",
    fontWeight: "600",
    fontSize: "1.1rem",
  },
  messagesBox: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  messageRow: {
    display: "flex",
  },
  myBubble: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "0.5rem 0.75rem",
    borderRadius: "12px",
    maxWidth: "70%",
  },
  theirBubble: {
    backgroundColor: "#f0f2f5",
    padding: "0.5rem 0.75rem",
    borderRadius: "12px",
    maxWidth: "70%",
  },
  senderName: {
    fontSize: "0.75rem",
    fontWeight: "600",
    marginBottom: "0.2rem",
    color: "#2563eb",
  },
  inputForm: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    borderTop: "1px solid #eee",
  },
  input: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  sendBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Chat;
