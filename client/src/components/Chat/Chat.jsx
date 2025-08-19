import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./Chat.module.css";
import sendLogo from "/send.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import logoutIcon from "/logout.png";
import { io } from "socket.io-client";
import Loading from "../Loading/Loading";
import emojiIcon from "/smile.png";
import EmojiPicker from "emoji-picker-react";
import { sortByDate } from "../../utils/sort-by-date";

export default function Chat() {
  const navigate = useNavigate();
  const { search } = useLocation();

  // --- State ---
  const [send, setSend] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [usersCount, setUsersCount] = useState();
  const [showLoading, setShowLoading] = useState(true);

  // --- Refs ---
  const emojiRef = useRef(null);
  const textareaRef = useRef(null);
  const socketChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketMessageRef = useRef(null);

  // --- URL Params ---
  const [uriParams] = useSearchParams();
  const name = uriParams.get("name");
  const room = uriParams.get("room");
  const chat = uriParams.get("chat");
  const user = uriParams.get("user");

  const token = localStorage.getItem("token");

  // --- Socket Connections ---
  useEffect(() => {
    socketChatRef.current = io("http://localhost:8000/chat", {
      auth: { token },
    });
    socketMessageRef.current = io("http://localhost:8000/messages", {
      auth: { token },
    });

    socketChatRef.current.emit("join", { room: chat });
    socketMessageRef.current.emit("join", { room: chat });

    socketChatRef.current.on("joined", ({ chat, usersCount }) => {
      setUsersCount(usersCount);
      const sortedMessages = sortByDate(chat.messages);
      setMessages(sortedMessages || []);
      setLoading(false);
    });

    return () => {
      socketChatRef.current.disconnect();
      socketMessageRef.current.disconnect();
    };
  }, [search, token, chat]);

  useEffect(() => {
    if (!socketMessageRef.current) return;

    const handleNewMessage = (msg) => setMessages((prev) => [...prev, msg]);

    socketMessageRef.current.on("newMessage", handleNewMessage);
    return () => socketMessageRef.current.off("newMessage", handleNewMessage);
  }, []);

  // --- Emoji Picker Outside Click ---
  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Loading timeout ---
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // --- Emoji Picker Handler & Memo ---
  const handleEmojiClick = useCallback(
    (emoji) => setSend((prev) => prev + emoji.emoji),
    []
  );

  const MessagesList = React.memo(({ messages, name }) => {
    return (
      <>
        {messages.map((msg) => {
          const isMe = msg.sender.username === name;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                padding: "5px 10px",
              }}
            >
              <div className={styles.messageItem}>
                <p className={styles.messageSender}>
                  {isMe ? "You" : msg.sender.username}
                </p>
                <h3 className={styles.messageContent}>{msg.content}</h3>
              </div>
            </div>
          );
        })}
      </>
    );
  });

  const emojiPicker = useMemo(
    () => (
      <div
        ref={emojiRef}
        style={{
          position: "absolute",
          bottom: "8%",
          right: 0,
          zIndex: 100,
          display: isOpen ? "block" : "none",
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </div>
    ),
    [isOpen, handleEmojiClick]
  );

  // --- Handlers ---
  const handleChange = (e) => {
    setSend(e.target.value);
    if (textareaRef.current && !textareaRef.current._resizeFrame) {
      textareaRef.current._resizeFrame = requestAnimationFrame(() => {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
        textareaRef.current._resizeFrame = null;
      });
    }
  };

  const handleLogout = () => {
    socketChatRef.current.disconnect();
    socketMessageRef.current.disconnect();
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!send.trim()) return;

    socketMessageRef.current.emit("addMessage", {
      senderId: user,
      content: send,
      chatId: chat,
    });

    setSend("");
  };

  // --- Early return for loading ---
  if (loading || showLoading) return <Loading />;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.headers}>
        <div className={styles.logoutCont}>
          <button onClick={handleLogout} className={styles.logout}>
            <img src={logoutIcon} alt="logout" width="30" height="30" />
          </button>
        </div>
        <h1>{name}</h1>
        <h1>Chat: {room}</h1>
        <h1>Users: {usersCount}</h1>
      </div>

      <div className={styles.history}>
        <MessagesList messages={messages} name={name} />
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={send}
          onChange={handleChange}
          placeholder="Enter your message"
        />
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <img src={emojiIcon} alt="emoji" width={25} height={25} />
        </button>

        {emojiPicker}

        <button type="submit">
          <img src={sendLogo} alt="send" width="30" height="30" />
        </button>
      </form>
    </div>
  );
}
