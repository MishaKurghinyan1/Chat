import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiContext } from "../ApiComponent/ApiProvider";

export default function UpdateChat() {
  const { apiFetch } = useContext(ApiContext);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const user = await apiFetch("http://localhost:8000/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!user?.id) throw new Error("Failed to get user data");

      const res = await apiFetch(`http://localhost:8000/chat/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.statusCode) {
        setError(res.message);
        return;
      }
      navigate("/");
    } catch (err) {
      console.error("Error in handleSubmit:", err);

      if (err.message === "No token") {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (Array.isArray(err)) {
        setError(err.map((e) => e.message || e));
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    }
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Chat name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          autoComplete="off"
        />
        <button className="button" type="submit">
          Update
        </button>

        {error &&
          (Array.isArray(error) ? (
            error.map((errMsg, i) => (
              <p key={i} className="error">
                {errMsg}
              </p>
            ))
          ) : (
            <p className="error">{error}</p>
          ))}
      </form>
    </div>
  );
}
