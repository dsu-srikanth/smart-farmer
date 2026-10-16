import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // Get logged-in farmer details
  let farmer = {};

  try {
    farmer = JSON.parse(
      localStorage.getItem("farmer") || "{}"
    );
  } catch {
    farmer = {};
  }

  const farmerName = farmer.name || "Farmer";

  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  // Default city can be changed by the farmer.
  const [city, setCity] = useState(
    farmer.location || "Hyderabad"
  );

  // Fetch weather from Flask backend
  const fetchWeather = async (cityName = city) => {
    if (!cityName.trim()) {
      setWeatherError("Please enter a city name.");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/weather?city=${encodeURIComponent(
          cityName.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fetch weather information."
        );
      }

      setWeather(data);
    } catch (error) {
      setWeatherError(
        error.message ||
          "Unable to connect to the weather service."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  // Load weather when dashboard opens
  useEffect(() => {
    fetchWeather(city);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("farmer");

    navigate("/login", {
      replace: true,
    });
  };

  // Dashboard features
  const features = [
    {
      icon: "🌾",
      title: "Farmer Marketplace",
      description:
        "Buy and sell crops, seeds, fertilizers and farming equipment.",
      button: "Open Marketplace",
      path: "/farmer/marketplace",
    },
    {
      icon: "🛒",
      title: "Add Product",
      description:
        "Sell your agricultural products or publish a buying requirement.",
      button: "Add Product",
      path: "/farmer/add-product",
    },
    {
      icon: "🌱",
      title: "My Crops",
      description:
        "Add your crops and manage your farming activities.",
      button: "Add My Crops",
      path: "/farmer/crops",
    },
    {
      icon: "💰",
      title: "Expenses",
      description:
        "Track spending on seeds, fertilizers, labor and equipment.",
      button: "View Expenses",
      path: "/expenses",
    },
    {
      icon: "📊",
      title: "Profit",
      description:
        "Review your farming income, expenses and profit.",
      button: "View Profit",
      path: "/profit",
    },
    {
      icon: "🌦️",
      title: "Weather Forecast",
      description:
        "Check current weather, rainfall, temperature and forecasts for your farming location.",
      button: "Check Weather",
      path: "/farmer/weather",
    },
    {
      icon: "🤖",
      title: "Crop Recommendations",
      description:
        "Explore crop suggestions for your farming conditions.",
      button: "Get Recommendations",
      path: "/recommendations",
    },
  ];

  // Agricultural market websites
  const marketWebsites = [
    {
      icon: "🌾",
      title: "Rice & Paddy",
      description:
        "Find mandi prices for rice and paddy.",
      url: "https://agmarknet.gov.in/",
    },
    {
      icon: "🌿",
      title: "Cotton",
      description:
        "Explore cotton market rates.",
      url: "https://agmarknet.gov.in/",
    },
    {
      icon: "🌽",
      title: "Maize & Wheat",
      description:
        "Check available cereal market prices.",
      url: "https://agmarknet.gov.in/",
    },
    {
      icon: "🥦",
      title: "Vegetables & Fruits",
      description:
        "Explore vegetable and fruit market prices.",
      url: "https://agmarknet.gov.in/",
    },
  ];

  // Extract weather values safely.
  // These fields correspond to the suggested Flask API response.
  const currentWeather = weather?.current || {};

  const temperature =
    currentWeather.temperature_2m ??
    currentWeather.temperature ??
    null;

  const humidity =
    currentWeather.relative_humidity_2m ??
    currentWeather.humidity ??
    null;

  const windSpeed =
    currentWeather.wind_speed_10m ??
    currentWeather.wind_speed ??
    null;

  const rainfall =
    currentWeather.precipitation ??
    currentWeather.rain ??
    null;

  // Format a value when the API has not returned it.
  const displayValue = (value, suffix = "") =>
    value === null || value === undefined
      ? "--"
      : `${value}${suffix}`;

  return (
    <div className="farmer-dashboard">

      {/* HEADER */}

      <header className="dashboard-header">
        <div className="dashboard-logo">
          🌾 Smart Farmer
        </div>

        <div className="dashboard-header-right">
          <span className="dashboard-user">
            Welcome, {farmerName}
          </span>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* WELCOME SECTION */}

      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <span className="dashboard-tag">
            SMART FARMING PLATFORM
          </span>

          <h1>
            Welcome to Your Farmer Dashboard 🌱
          </h1>

          <p>
            Manage your farm, track expenses, check
            agricultural market prices, monitor weather
            and connect directly with other farmers.
          </p>

          <button
            className="dashboard-primary-button"
            onClick={() =>
              navigate("/farmer/marketplace")
            }
          >
            Explore Farmer Marketplace →
          </button>
        </div>

        <div className="dashboard-welcome-icon">
          🚜
        </div>
      </section>

      {/* WEATHER PREVIEW */}

      <section className="dashboard-weather-section">
        <div className="dashboard-weather-heading">
          <div>
            <span className="dashboard-weather-tag">
              LIVE WEATHER
            </span>

            <h2>🌦️ Farming Weather Updates</h2>

            <p>
              Check weather conditions before planning
              irrigation, spraying or harvesting.
            </p>
          </div>

          <button
            className="dashboard-weather-open"
            onClick={() =>
              navigate("/farmer/weather")
            }
          >
            Full Forecast →
          </button>
        </div>

        {/* CITY SEARCH */}

        <form
          className="dashboard-weather-search"
          onSubmit={(event) => {
            event.preventDefault();
            fetchWeather(city);
          }}
        >
          <input
            type="text"
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            placeholder="Enter your city"
            aria-label="Weather city"
          />

          <button
            type="submit"
            disabled={weatherLoading}
          >
            {weatherLoading ? "Loading..." : "Get Weather"}
          </button>

          <button
            type="button"
            className="dashboard-weather-refresh"
            onClick={() => fetchWeather(city)}
            disabled={weatherLoading}
          >
            ↻ Refresh
          </button>
        </form>

        {/* WEATHER ERROR */}

        {weatherError && (
          <div className="dashboard-weather-error">
            <p>⚠️ {weatherError}</p>

            <button
              onClick={() => fetchWeather(city)}
              disabled={weatherLoading}
            >
              Try Again
            </button>
          </div>
        )}

        {/* WEATHER LOADING */}

        {weatherLoading && !weather && (
          <div className="dashboard-weather-loading">
            <span className="dashboard-weather-spinner"></span>
            <p>Fetching weather information...</p>
          </div>
        )}

        {/* WEATHER DATA */}

        {!weatherLoading && weather && (
          <>
            <div className="dashboard-weather-location">
              <span>📍</span>

              <div>
                <strong>
                  {weather.location?.name ||
                    weather.location?.city ||
                    city}
                </strong>

                <p>
                  Current weather conditions
                </p>
              </div>
            </div>

            <div className="dashboard-weather-grid">

              {/* Temperature */}

              <div className="dashboard-weather-card temperature-card">
                <div className="dashboard-weather-card-icon">
                  🌡️
                </div>

                <div>
                  <p>Temperature</p>

                  <h3>
                    {displayValue(temperature, "°C")}
                  </h3>
                </div>
              </div>

              {/* Humidity */}

              <div className="dashboard-weather-card">
                <div className="dashboard-weather-card-icon">
                  💧
                </div>

                <div>
                  <p>Humidity</p>

                  <h3>
                    {displayValue(humidity, "%")}
                  </h3>
                </div>
              </div>

              {/* Wind Speed */}

              <div className="dashboard-weather-card">
                <div className="dashboard-weather-card-icon">
                  💨
                </div>

                <div>
                  <p>Wind Speed</p>

                  <h3>
                    {displayValue(windSpeed, " km/h")}
                  </h3>
                </div>
              </div>

              {/* Rainfall */}

              <div className="dashboard-weather-card">
                <div className="dashboard-weather-card-icon">
                  🌧️
                </div>

                <div>
                  <p>Precipitation</p>

                  <h3>
                    {displayValue(rainfall, " mm")}
                  </h3>
                </div>
              </div>

            </div>

            <div className="dashboard-weather-footer">
              <p>
                🌱 Use local forecasts alongside soil
                conditions and crop requirements when
                planning farm activities.
              </p>

              <button
                onClick={() =>
                  navigate("/farmer/weather")
                }
              >
                View 7-Day Forecast →
              </button>
            </div>
          </>
        )}
      </section>

      {/* CROP MARKET PRICES */}

      <section className="live-prices-section">
        <div className="live-prices-heading">
          <div>
            <h2>📈 Crop Market Prices</h2>

            <p>
              Visit agricultural market portals to
              check the latest available mandi prices.
            </p>
          </div>

          <span className="market-data-label">
            Official Market Sources
          </span>
        </div>

        <div className="live-prices-grid">
          {marketWebsites.map((market) => (
            <div
              className="live-price-card"
              key={market.title}
            >
              <div className="live-price-icon">
                {market.icon}
              </div>

              <h3>{market.title}</h3>

              <p>{market.description}</p>

              <a
                href={market.url}
                target="_blank"
                rel="noopener noreferrer"
                className="live-price-button"
              >
                Check Market Prices →
              </a>
            </div>
          ))}
        </div>

        <div className="market-price-footer">
          <h3>
            🇮🇳 Government Agricultural Market Portals
          </h3>

          <p>
            Search for commodities and check available
            market rates by selecting your state,
            district and mandi.
          </p>

          <div className="market-price-links">
            <a
              href="https://agmarknet.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="market-price-main-button"
            >
              Visit AGMARKNET
            </a>

            <a
              href="https://enam.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="market-price-secondary-button"
            >
              Visit e-NAM
            </a>
          </div>

          <small>
            Prices vary by market and date. These links
            open external websites; numeric live prices
            are not fetched into this dashboard.
          </small>
        </div>
      </section>

      {/* FARMING FEATURES */}

      <section className="dashboard-features">
        <div className="dashboard-section-heading">
          <h2>Manage Your Farming Activities</h2>

          <p>
            Everything you need to manage your farm
            in one place.
          </p>
        </div>

        <div className="dashboard-grid">
          {features.map((feature) => (
            <div
              className="dashboard-card"
              key={feature.path}
            >
              <div className="dashboard-card-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <button
                onClick={() =>
                  navigate(feature.path)
                }
              >
                {feature.button} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE BANNER */}

      <section className="dashboard-marketplace-info">
        <div>
          <h2>
            🤝 Connect Directly with Farmers
          </h2>

          <p>
            Find crops, seeds, fertilizers and farming
            equipment. Publish your own products for sale
            or tell other farmers what you want to buy.
          </p>
        </div>

        <div className="dashboard-marketplace-buttons">
          <button
            onClick={() =>
              navigate("/farmer/marketplace")
            }
          >
            Browse Products
          </button>

          <button
            onClick={() =>
              navigate("/farmer/add-product")
            }
          >
            + Create Listing
          </button>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <h3>🌾 Smart Farmer</h3>

        <p>
          Helping farmers manage their farms,
          understand market prices, monitor weather
          and connect with agricultural communities.
        </p>

        <p>
          Developed by: Srikanth Reddy
        </p>

        <p>
          © {new Date().getFullYear()} Smart Farmer.
          All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default Dashboard;