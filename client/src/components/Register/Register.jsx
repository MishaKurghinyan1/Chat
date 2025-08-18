import { useContext, useState } from "react";
import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";
import { ApiContext } from "../ApiComponent/ApiProvider";

export default function Register() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");

  const navigate = useNavigate();

  const { apiFetch } = useContext(ApiContext);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const res = await apiFetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
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
          Already have an account?{" "}
          <Link className="link" to="/login">
            Log in
          </Link>
        </span>
      </form>
    </div>
  );
}
