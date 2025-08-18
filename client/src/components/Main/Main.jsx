import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Main.module.css";
import logoutIcon from "/logout.png";
import { ApiContext } from "../ApiComponent/ApiProvider";
import editButton from "/edit.png";
import deleteButton from "/trash.png";
import { dateToString } from "../../utils/format-date.util";
import Loading from "../Loading/Loading";

export default function Main() {
  const [email, setEmail] = useState("");
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showLoading, setShowLoading] = useState(true);

  const navigate = useNavigate();

  const { apiFetch } = useContext(ApiContext);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserAndChats = async () => {
      try {
        const user = await apiFetch("http://localhost:8000/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(user.id);
        setUsername(user.username || "");
        setEmail(user.email || "");

        const rooms = await apiFetch("http://localhost:8000/chat/rooms", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (rooms.statusCode) throw new Error(rooms.message);

        setChats(rooms || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndChats();
  }, [token, apiFetch, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showLoading) {
    return <Loading />;
  }

  const handleAddChat = () => navigate("/createChat");

  const openDeleteDialog = (id) => {
    setSelectedChatId(id);
    setModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedChatId) return;
    try {
      await apiFetch(`http://localhost:8000/chat/rooms/${selectedChatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== selectedChatId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setModal(false);
      setSelectedChatId(null);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await apiFetch("http://localhost:8000/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.statusCode) throw new Error(res.message);
      return res;
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.logoutCont}>
          <button onClick={handleLogout} className={styles.logout}>
            <img src={logoutIcon} alt="logout" width="30" height="30" />
          </button>
        </div>

        <div className={styles.container}>
          <h1 className={styles.title}>Welcome, {username}</h1>
          <p className={styles.email}>Email: {email}</p>
        </div>

        <div className={styles.addChat}>
          <button
            type="button"
            onClick={handleAddChat}
            className={styles.addChatButton}
          >
            +
          </button>
        </div>

        <div className={styles.chat}>
          {chats.length === 0 ? (
            <p>No chats yet.</p>
          ) : (
            chats.map((chat) =>
              chat.user.email === email ? (
                <div className={styles.chats} key={chat.id}>
                  <h3 className={styles.chatName}>{chat.name}</h3>
                  <h2 className={styles.date}>
                    {dateToString(chat.createdAt)}
                  </h2>

                  <button
                    type="button"
                    className={"button " + styles.editButton}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/editChat/${chat.id}`);
                    }}
                  >
                    <img src={editButton} alt="edit" width="30" height="30" />
                  </button>
                  <div className={styles["flex-break"]}></div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteDialog(chat.id);
                    }}
                    className={"button " + styles.deleteButton}
                  >
                    <img
                      src={deleteButton}
                      alt="Delete"
                      width={30}
                      height={30}
                    />
                  </button>

                  <Link
                    to={`/chat?name=${username}&room=${chat.name}&chat=${chat.id}&user=${userId}`}
                    key={chat.id}
                  >
                    <button className={"button " + styles.joinButton}>
                      Join Chat
                    </button>
                  </Link>
                  <p className={styles.author}>
                    {chat.user?.username || "Unknown"}
                  </p>
                </div>
              ) : (
                <div className={styles.chats} key={chat.id}>
                  <h3 className={styles.chatName}>{chat.name}</h3>
                  <h2 className={styles.date}>
                    {dateToString(chat.createdAt)}
                  </h2>
                  <div className={styles["flex-break"]}></div>

                  <Link
                    to={`/chat?name=${username}&room=${chat.name}&chat=${chat.id}&user=${userId}`}
                    key={chat.id}
                  >
                    <button className={"button " + styles.joinButton}>
                      Join Chat
                    </button>
                  </Link>
                  <p className={styles.author}>
                    {chat.user?.username || "Unknown"}
                  </p>
                </div>
              )
            )
          )}
        </div>
        {modal && (
          <div className={styles.dialogBg}>
            <dialog className={styles.dialogue} open>
              <h1 className={styles.messageDialog}>Are you sure?</h1>
              <div>
                <button className={styles.yes} onClick={handleDeleteConfirm}>
                  Yes
                </button>
                <button className={styles.no} onClick={() => setModal(false)}>
                  No
                </button>
              </div>
            </dialog>
          </div>
        )}
      </div>
    </>
  );
}
