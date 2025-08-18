import { useContext, useState } from "react";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { ApiContext } from "../ApiComponent/ApiProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { apiFetch } = useContext(ApiContext);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const res = await apiFetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.statusCode) {
        const errData = await res.json();
        setError(errData.message || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("token", res.accessToken);

      setEmail("");
      setPassword("");
      navigate("/");
    } catch (err) {
      setError(err.message);
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
