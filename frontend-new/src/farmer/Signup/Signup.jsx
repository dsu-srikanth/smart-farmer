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
      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error(
          "Backend URL is missing. Please configure VITE_API_URL."
        );
      }

      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          data.error ||
          "Signup failed. Please try again."
        );
        return;
      }

      alert(data.message || "Signup successful!");

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");

      navigate("/login", {
        replace: true
      });

    } catch (error) {
      console.error("Signup error:", error);

      alert(
        error.message ||
        "Cannot connect to the backend. Please try again."
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