
import { useEffect, useState } from "react";
import "./Crops.css";

const API_URL = "http://localhost:5000/crops";

function Crops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    season: "",
    soil_type: "",
    duration: "",
    water_requirement: "",
  });

  // Load crops from Flask
  const fetchCrops = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to fetch crops from the server.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(data.error || "Invalid crop data received.");
      }

      setCrops(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Flask. Please start your backend."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Add crop to MySQL through Flask
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a crop name.");
      return;
    }

    if (!form.duration || Number(form.duration) <= 0) {
      setError("Duration must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          duration: Number(form.duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add crop.");
      }

      setMessage(data.message || "Crop added successfully!");

      setForm({
        name: "",
        season: "",
        soil_type: "",
        duration: "",
        water_requirement: "",
      });

      await fetchCrops();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Flask backend."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  };

  // Clear form
  const handleReset = () => {
    setForm({
      name: "",
      season: "",
      soil_type: "",
      duration: "",
      water_requirement: "",
    });

    setMessage("");
    setError("");
  };

  return (
    <div className="crops-page">
      <header className="crops-header">
        <div>
          <p className="crops-subtitle">SMART FARMER MANAGEMENT</p>
          <h1>🌱 Manage Crops</h1>
          <p className="crops-description">
            Add crops and manage crop information for your farming project.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchCrops}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      <div className="crops-summary">
        <div className="summary-card">
          <span className="summary-icon">🌾</span>
          <div>
            <p>Total Crops</p>
            <h2>{crops.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon">💧</span>
          <div>
            <p>Water Categories</p>
            <h2>
              {
                new Set(
                  crops
                    .map((crop) => crop.water_requirement)
                    .filter(Boolean)
                ).size
              }
            </h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon">🌍</span>
          <div>
            <p>Soil Categories</p>
            <h2>
              {
                new Set(
                  crops.map((crop) => crop.soil_type).filter(Boolean)
                ).size
              }
            </h2>
          </div>
        </div>
      </div>

      <section className="crop-form-section">
        <h2>➕ Add a New Crop</h2>

        <p className="section-description">
          Enter the crop details below and save them to your database.
        </p>

        <form className="crop-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Crop Name *</label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Example: Paddy"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="season">Growing Season *</label>

            <select
              id="season"
              name="season"
              value={form.season}
              onChange={handleChange}
              required
            >
              <option value="">Select season</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
              <option value="Year-round">Year-round</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="soil_type">Soil Type *</label>

            <select
              id="soil_type"
              name="soil_type"
              value={form.soil_type}
              onChange={handleChange}
              required
            >
              <option value="">Select soil type</option>
              <option value="Clay">Clay</option>
              <option value="Loamy">Loamy</option>
              <option value="Black Soil">Black Soil</option>
              <option value="Red Soil">Red Soil</option>
              <option value="Sandy">Sandy</option>
              <option value="Alluvial">Alluvial</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Growing Duration (Days) *</label>

            <input
              id="duration"
              type="number"
              name="duration"
              placeholder="Example: 120"
              min="1"
              max="1000"
              value={form.duration}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="water_requirement">
              Water Requirement *
            </label>

            <select
              id="water_requirement"
              name="water_requirement"
              value={form.water_requirement}
              onChange={handleChange}
              required
            >
              <option value="">Select water requirement</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="add-crop-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "➕ Add Crop"}
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
              disabled={saving}
            >
              Clear Form
            </button>
          </div>
        </form>

        {message && (
          <div className="success-message" role="status">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        )}
      </section>

      <section className="crop-list-section">
        <div className="crop-list-heading">
          <div>
            <h2>🌿 Available Crops</h2>
            <p>Crop information retrieved from your Flask backend.</p>
          </div>

          <span className="crop-count">{crops.length} crops</span>
        </div>

        {loading && crops.length === 0 ? (
          <p className="empty-message">Loading crops...</p>
        ) : crops.length === 0 ? (
          <div className="empty-state">
            <span>🌱</span>
            <h3>No crops available</h3>
            <p>Add your first crop using the form above.</p>
          </div>
        ) : (
          <div className="crop-grid">
            {crops.map((crop) => (
              <article className="crop-card" key={crop.id}>
                <div className="crop-card-top">
                  <div className="crop-emoji">🌾</div>

                  <span className="season-badge">
                    {crop.season || "Not specified"}
                  </span>
                </div>

                <h3>{crop.name}</h3>

                <div className="crop-details">
                  <p>
                    <span>🌍 Soil Type</span>
                    <strong>{crop.soil_type || "Not specified"}</strong>
                  </p>

                  <p>
                    <span>📅 Duration</span>
                    <strong>
                      {crop.duration != null
                        ? `${crop.duration} days`
                        : "Not specified"}
                    </strong>
                  </p>

                  <p>
                    <span>💧 Water</span>
                    <strong>
                      {crop.water_requirement || "Not specified"}
                    </strong>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Crops;
