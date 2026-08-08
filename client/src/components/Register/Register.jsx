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
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      login(res.accessToken);
      navigate("/");
    } catch (err) {
      if (Array.isArray(err.details)) {
        setError(err.details);
      } else {
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
