import { useContext, useEffect, useState } from "react";
import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";
import { ApiContext } from "../ApiComponent/ApiProvider";

export default function Register() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState([]);
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");

  const navigate = useNavigate();
  const { apiFetch, login, token } = useContext(ApiContext);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError([]);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!res) {
        setError(["Registration failed. No response from server."]);
        return;
      }

      login(res.accessToken);

      setUserName("");
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error type:", typeof err);
      console.error("Error.message:", err.message);
      console.error("Is err.message array?", Array.isArray(err.message));

      if (Array.isArray(err.message)) {
        console.log("Setting error as array:", err.message);
        setError(err.message);
      } else {
        console.log("Setting error as single string array:", [err.message || "Registration failed. Please try again."]);
        setError([err.message || "Registration failed. Please try again."]);
      }
    }
  }

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <div className={styles.wrap}>
          <input
            className={"input " + styles.input}
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            autoComplete="off"
          />
          <input
            className="input"
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tBm0u@example.com"
            autoComplete="off"
          />
          <input
            className="input"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="off"
          />
          <button type="submit" className="button">
            Register
          </button>
        </div>

        <div className="errors">
        {error &&
          (Array.isArray(error) ? (
            error.map((err, i) => (
              <p key={i} className="error">
                {err}
              </p>
            ))
          ) : (
            <p className="error">{error}</p>
          ))}
        </div>

        <span>
          Already have an account?{" "}
          <Link className="link" to="/login">
            Log in
          </Link>
        </span>
      </form>
    </div>
  );
}
