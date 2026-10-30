
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error(
          "Backend URL is missing. Please configure VITE_API_URL."
        );
      }

      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      // Read response safely
      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Invalid backend response:", responseText);

        throw new Error(
          "Backend returned invalid data. Check your Render URL and backend logs."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Invalid email or password"
        );
      }

      if (data.farmer) {
        localStorage.setItem(
          "farmer",
          JSON.stringify(data.farmer)
        );
      }

      alert(data.message || "Login successful!");

      navigate("/farmer/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error("Login error:", error);

      alert(
        error.message ||
        "Cannot connect to the backend. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>🌾 Smart Farming</h1>
        <h2>Farmer Login</h2>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p>Don't have an account?</p>

        <Link to="/farmer/signup">
          Create Account
        </Link>

      </div>
    </div>
  );
}

export default Login;
