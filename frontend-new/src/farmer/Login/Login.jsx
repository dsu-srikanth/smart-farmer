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

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save farmer information
        if (data.farmer) {
          localStorage.setItem(
            "farmer",
            JSON.stringify(data.farmer)
          );
        }

        alert("Login successful!");

        // Navigate directly to dashboard
        navigate("/farmer/dashboard", {
          replace: true
        });
      } else {
        alert(
          data.message ||
          data.error ||
          "Invalid email or password"
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Cannot connect to Flask server. Please start your backend."
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
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