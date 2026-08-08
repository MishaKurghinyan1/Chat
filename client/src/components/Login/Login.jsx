import { useContext, useEffect, useState } from "react";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { ApiContext } from "../ApiComponent/ApiProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState([]);
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
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      login(res.accessToken);
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      if (Array.isArray(err.details)) {
        setError(err.details);
      } else if (Array.isArray(err.message)) {
        setError(err.message);
      } else {
        setError([err.message || "Login failed. Please try again."]);
      }
    }
  }

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <div className={styles.wrap}>
          <input
            className="input"
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tBm0u@example.com"
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
            Login
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
          Don't have an account?{" "}
          <Link className="link" to="/register">
            Register
          </Link>
        </span>
      </form>
    </div>
  );
}