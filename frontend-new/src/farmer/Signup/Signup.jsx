import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      // Get backend URL
      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error("Backend URL is missing. Check Vercel settings.");
      }

      // Connect to Flask signup API
      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            phone: phone.trim()
          })
        }
      );

      // Read response safely
      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Backend returned HTML or invalid JSON:", responseText);

        throw new Error(
          "Backend returned an invalid response. Check Render URL and Flask logs."
        );
      }

      // Check signup response
      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Signup failed."
        );
      }

      alert(data.message || "Signup successful!");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");

      // Navigate to login
      navigate("/login", {
        replace: true
      });

    } catch (error) {
      console.error("Signup error:", error);

      alert(
        error.message || "Cannot connect to backend."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        <h1>🌾 Smart Farming</h1>

        <h2>Farmer Signup</h2>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            maxLength={100}
            required
          />

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
            placeholder="Enter Password (minimum 8 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={1024}
            required
          />

          <input
            type="tel"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            maxLength={20}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Signup"}
          </button>

        </form>

        <p>Already have an account?</p>

        <Link to="/login">
          Login
        </Link>

      </div>

    </div>
  );
}

export default Signup;