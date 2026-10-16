import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleLogin = async (event) => {
event.preventDefault();


setError("");
setLoading(true);

try {
  const response = await fetch(
    "http://127.0.0.1:5000/admin/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    setError(data.message || "Invalid admin email or password.");
    return;
  }

  // Save admin information in browser storage
  localStorage.setItem("admin", JSON.stringify(data.admin));

  alert("Admin Login Successful!");

  // Navigate to admin dashboard
  navigate("/admin/dashboard", { replace: true });
} catch (error) {
  console.error("Admin login error:", error);

  setError(
    "Cannot connect to the backend. Please start Flask on port 5000."
  );
} finally {
  setLoading(false);
}


};

return ( <div className="admin-login-page"> <div className="admin-login-card"> <div className="admin-icon">👨‍💼</div>


    <h1>🌾 Smart Farming</h1>

    <h2>Admin Login</h2>

    <p>Login to manage Smart Farming</p>

    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Enter Admin Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Enter Admin Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error && (
        <div className="admin-login-error" role="alert">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Admin Login"}
      </button>
    </form>

    <button
      type="button"
      className="farmer-login-button"
      onClick={() => navigate("/login")}
    >
      ← Farmer Login
    </button>
  </div>
</div>


);
}

export default AdminLogin;
