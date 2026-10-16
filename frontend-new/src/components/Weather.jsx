import { useCallback, useEffect, useState } from "react";
import "./Weather.css";

const API_URL = "http://127.0.0.1:5000/api/weather";

function getWeatherIcon(code, isDay = 1) {
  if (code === 0) {
    return isDay ? "☀️" : "🌙";
  }

  if (code === 1 || code === 2) {
    return "🌤️";
  }

  if (code === 3) {
    return "☁️";
  }

  if ([45, 48].includes(code)) {
    return "🌫️";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "🌦️";
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return "🌧️";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌡️";
}

function formatDay(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  );
}

function Weather() {
  const [city, setCity] = useState("Hyderabad");

  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState("");

  const fetchWeather = useCallback(async (location) => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      if (location.latitude != null && location.longitude != null) {
        query.set("latitude", location.latitude);
        query.set("longitude", location.longitude);
        query.set("city", location.city || "Selected Location");
      } else {
        query.set("city", location.city || "Hyderabad");
      }

      const response = await fetch(`${API_URL}?${query.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load weather information."
        );
      }

      setWeather(data);

      setCity(
        location.city ||
          data.location.split(",")[0] ||
          "Hyderabad"
      );

      setLastUpdated(new Date().toLocaleTimeString("en-IN"));

    } catch (err) {
      setError(
        err.message ||
          "Unable to load weather. Check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather({ city: "Hyderabad" });
  }, [fetchWeather]);

  // Search by city or village name.
  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setError("Please enter a city or village name.");
      return;
    }

    fetchWeather({ city: trimmedCity });
  };

  // Detect location using browser permission.
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location detection.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        fetchWeather({
          latitude,
          longitude,
          city: "My Location",
        });
      },

      (locationError) => {
        setLoading(false);

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. Search for your city instead."
          );
        } else if (locationError.code === 2) {
          setError("Your location could not be determined.");
        } else {
          setError("Location request timed out. Please try again.");
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const current = weather?.current;

  const forecast = weather?.forecast || [];

  const farmingAdvice = weather?.farming_advice || [];

  return (
    <div className="weather-page">
      <header className="weather-header">
        <div>
          <p className="weather-eyebrow">SMART FARMER</p>

          <h1>Live Weather Forecast</h1>

          <p>
            Weather information to help you plan your farming activities.
          </p>
        </div>

        <div className="weather-header-icon">🌦️</div>
      </header>

      {/* LOCATION SEARCH */}

      <section className="weather-search-card">
        <form onSubmit={handleSearch} className="weather-search-form">
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city or village"
            aria-label="City or village"
          />

          <button type="submit" disabled={loading}>
            Search
          </button>
        </form>

        <button
          type="button"
          className="location-button"
          onClick={detectLocation}
          disabled={loading}
        >
          📍 Detect My Location
        </button>

        <button
          type="button"
          className="refresh-button"
          onClick={() =>
            fetchWeather({
              city: weather?.location
                ? weather.location.split(",")[0]
                : city,
            })
          }
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </section>

      {/* LOADING */}

      {loading && (
        <div className="weather-message">
          <div className="weather-spinner"></div>
          <p>Loading weather information...</p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="weather-error" role="alert">
          <span>⚠️ {error}</span>

          <button onClick={() => setError("")}>
            Close
          </button>
        </div>
      )}

      {/* WEATHER RESULTS */}

      {weather && current && (
        <>
          <section className="current-weather-card">
            <div className="current-weather-main">
              <p className="weather-location">
                📍 {weather.location}
              </p>

              <p className="weather-condition">
                {current.description}
              </p>

              <div className="current-temperature">
                {getWeatherIcon(
                  current.weather_code,
                  current.is_day
                )}

                <span>
                  {current.temperature ?? "--"}°C
                </span>
              </div>

              <p className="feels-like">
                Feels like {current.feels_like ?? "--"}°C
              </p>

              <p className="updated-time">
                Last updated: {lastUpdated}
              </p>
            </div>

            <div className="current-weather-details">
              <div className="weather-stat">
                <span>💧</span>

                <div>
                  <p>Humidity</p>
                  <strong>{current.humidity ?? "--"}%</strong>
                </div>
              </div>

              <div className="weather-stat">
                <span>💨</span>

                <div>
                  <p>Wind Speed</p>
                  <strong>
                    {current.wind_speed ?? "--"} km/h
                  </strong>
                </div>
              </div>

              <div className="weather-stat">
                <span>🌧️</span>

                <div>
                  <p>Current Rainfall</p>
                  <strong>
                    {current.precipitation ?? "--"} mm
                  </strong>
                </div>
              </div>

              <div className="weather-stat">
                <span>🌡️</span>

                <div>
                  <p>Wind Direction</p>
                  <strong>
                    {current.wind_direction ?? "--"}°
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* SEVEN-DAY FORECAST */}

          <section className="forecast-section">
            <div className="section-heading">
              <div>
                <h2>Seven-Day Forecast</h2>

                <p>Expected conditions for the coming days.</p>
              </div>
            </div>

            <div className="forecast-grid">
              {forecast.map((day) => (
                <article
                  className="forecast-card"
                  key={day.date}
                >
                  <p className="forecast-day">
                    {formatDay(day.date)}
                  </p>

                  <div className="forecast-icon">
                    {getWeatherIcon(day.weather_code)}
                  </div>

                  <p className="forecast-description">
                    {day.description}
                  </p>

                  <div className="forecast-temperatures">
                    <strong>
                      {day.temperature_max ?? "--"}°
                    </strong>

                    <span>
                      {day.temperature_min ?? "--"}°
                    </span>
                  </div>

                  <div className="forecast-rain">
                    🌧️ {day.rain_probability ?? "--"}%
                  </div>

                  <p className="forecast-rainfall">
                    Rainfall: {day.rainfall ?? "--"} mm
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* FARMING RECOMMENDATIONS */}

          <section className="farming-section">
            <div className="section-heading">
              <div>
                <h2>🌱 Farming Recommendations</h2>

                <p>
                  General suggestions based on the weather forecast.
                </p>
              </div>
            </div>

            <div className="farming-grid">
              {farmingAdvice.map((advice, index) => (
                <article
                  className={`advice-card advice-${advice.type}`}
                  key={`${advice.title}-${index}`}
                >
                  <h3>{advice.title}</h3>

                  <p>{advice.message}</p>
                </article>
              ))}
            </div>

            <p className="farming-disclaimer">
              These suggestions are general guidance. Actual
              irrigation and spraying decisions should consider
              crop type, growth stage, soil moisture, product
              labels, and local agricultural advice.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default Weather;