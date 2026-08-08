import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./Chat.module.css";
import sendLogo from "/send.png";
import emojiIcon from "/smile.png";
import logoutIcon from "/logout.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import Loading from "../Loading/Loading";
import { sortByDate } from "../../utils/sort-by-date";

const MessageItem = React.memo(({ msg, isMe }) => (
  <div className={isMe ? styles.messageWrapperMe : styles.messageWrapperOther}>
    <div className={styles.messageItem}>
      <p className={styles.messageSender}>
        {isMe ? "You" : msg.sender.username}
      </p>
      <h3 className={styles.messageContent}>{msg.content}</h3>
    </div>
  </div>
));

const MessagesList = React.memo(({ messages, name }) => (
  <>
    {messages.map((msg) => {
      const isMe = msg.sender.username === name;
      return <MessageItem key={msg.id} msg={msg} isMe={isMe} />;
    })}
  </>
));

export default function Chat() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [send, setSend] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [usersCount, setUsersCount] = useState(0);

  const emojiRef = useRef(null);
  const textareaRef = useRef(null);
  const socketChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketMessageRef = useRef(null);

  const [uriParams] = useSearchParams();
  const name = uriParams.get("name");
  const room = uriParams.get("room");
  const chat = uriParams.get("chat");
  const user = uriParams.get("user");
  const token = localStorage.getItem("token");

  useEffect(() => {
    socketChatRef.current = io(`${import.meta.env.VITE_API_URL}/chat`, {
      auth: { token },
    });
    socketMessageRef.current = io(`${import.meta.env.VITE_API_URL}/messages`, {
      auth: { token },
    });

    socketChatRef.current.emit("join", { room: chat, userID: user });
    socketMessageRef.current.emit("join", { room: chat });

    socketChatRef.current.on("joined", ({ chat, usersCount }) => {
      setUsersCount(usersCount);
      // Only keep last 100 messages to improve performance
      const sortedMessages = sortByDate(chat.messages).slice(-100);
      setMessages(sortedMessages || []);
      setLoading(false);
    });

    socketChatRef.current.on("usersCountUpdated", ({ usersCount }) => {
      setUsersCount(usersCount);
    });

    return () => {
      socketChatRef.current.disconnect();
      socketMessageRef.current.disconnect();
    };
  }, [search, token, chat, user]);

  useEffect(() => {
    if (!socketMessageRef.current) return;
    const handleNewMessage = (msg) =>
      setMessages((prev) => [...prev.slice(-99), msg]); // keep last 100 messages
    socketMessageRef.current.on("newMessage", handleNewMessage);
    return () => socketMessageRef.current.off("newMessage", handleNewMessage);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target))
        setOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages]);

  const handleEmojiClick = useCallback(
    (emoji) => setSend((prev) => prev + emoji.emoji),
    [],
  );

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

  if (loading) return <Loading />;

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
          onClick={() => setOpen((prev) => !prev)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <img src={emojiIcon} alt="emoji" width={25} height={25} />
        </button>

        {ReactDOM.createPortal(
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
          </div>,
          document.body,
        )}

        <button type="submit">
          <img src={sendLogo} alt="send" width="30" height="30" />
        </button>
      </form>
    </div>
  );
}
