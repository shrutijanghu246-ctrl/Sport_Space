import { useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { MessageCircle, Send } from "lucide-react";
import styles from "./Chat.module.css";

function Chat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
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
    const fetchTeamName = async () => {
      try {
        const res = await axiosInstance.get(`/teams/${user.team}`);
        setTeamName(res.data.team.name);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.team) fetchTeamName();
  }, [user?.team]);

  useEffect(() => {
    if (!socket || !user?.team) return;

    socket.emit("joinTeam", user.team);

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                text: "This message was deleted",
                deletedForEveryone: true,
              }
            : m,
        ),
      );
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDeleted");
    };
  }, [socket, user?.team]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("sendMessage", {
      teamId: user.team,
      senderId: user._id,
      text,
    });
    setText("");
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}/delete-for-me`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}/delete-for-everyone`);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                text: "This message was deleted",
                deletedForEveryone: true,
              }
            : m,
        ),
      );
      setSelectedMessage(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        <div className={styles.header}>
          <MessageCircle
            size={20}
            className={styles.headerIcon}
            color="#f59e0b"
          />
          <span className={styles.headerTitle}>
            {teamName ? `${teamName} Team Chat` : "Team Chat"}
          </span>
        </div>

        <div className={styles.messagesBox}>
          {messages.map((msg) => {
            const isMine = msg.sender?._id?.toString() === user._id?.toString();
            return (
              <div
                key={msg._id}
                className={styles.messageRow}
                style={{ justifyContent: isMine ? "flex-end" : "flex-start" }}
              >
                <div
                  className={isMine ? styles.myBubble : styles.theirBubble}
                  onClick={() =>
                    setSelectedMessage(
                      selectedMessage === msg._id ? null : msg._id,
                    )
                  }
                >
                  {!isMine && (
                    <p className={styles.senderName}>{msg.sender?.name}</p>
                  )}
                  <p
                    className={msg.deletedForEveryone ? styles.deletedText : ""}
                  >
                    {msg.text}
                  </p>

                  {selectedMessage === msg._id && !msg.deletedForEveryone && (
                    <div className={styles.deleteOptions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteForMe(msg._id);
                        }}
                        className={styles.deleteOptionBtn}
                      >
                        Delete for me
                      </button>
                      {isMine && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteForEveryone(msg._id);
                          }}
                          className={`${styles.deleteOptionBtn} ${styles.deleteForEveryoneBtn}`}
                        >
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={styles.inputForm}>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.sendBtn}>
            <Send size={16} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
