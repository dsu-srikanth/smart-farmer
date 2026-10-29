import os
import requests

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from db import get_db_connection
from store import store_bp
from routes.marketplace import marketplace_bp
from crop import crop_bp


app = Flask(__name__)

# =====================================================
# CONFIGURATION: VERCEL FRONTEND + RENDER BACKEND
# =====================================================

frontend_urls = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:5173,http://127.0.0.1:5173"
)

allowed_origins = [
    origin.strip().rstrip("/")
    for origin in frontend_urls.split(",")
    if origin.strip()
]

CORS(
    app,
    resources={
        r"/*": {
            "origins": allowed_origins
        }
    },
    supports_credentials=False
)

# =====================================================
# REGISTER BLUEPRINTS
# =====================================================

app.register_blueprint(store_bp)
app.register_blueprint(marketplace_bp)
app.register_blueprint(crop_bp)


# =====================================================
# HOME API
# =====================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "Smart Farming Flask API is running"
    }), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "Backend is healthy"
    }), 200


# =====================================================
# FARMER SIGNUP
# =====================================================

@app.route("/signup", methods=["POST"])
def signup():
    db = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone")

        if not all([
            isinstance(name, str) and name.strip(),
            isinstance(email, str) and email.strip(),
            isinstance(password, str) and password,
            isinstance(phone, str) and phone.strip()
        ]):
            return jsonify({
                "success": False,
                "message": "All fields are required"
            }), 400

        name = name.strip()
        email = email.strip().lower()
        phone = phone.strip()

        if len(name) > 100:
            return jsonify({
                "success": False,
                "message": "Name is too long"
            }), 400

        if len(email) > 254 or "@" not in email:
            return jsonify({
                "success": False,
                "message": "Enter a valid email address"
            }), 400

        if len(password) < 8:
            return jsonify({
                "success": False,
                "message": "Password must contain at least 8 characters"
            }), 400

        if len(password) > 1024:
            return jsonify({
                "success": False,
                "message": "Password is too long"
            }), 400

        if len(phone) > 20:
            return jsonify({
                "success": False,
                "message": "Phone number is too long"
            }), 400

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "SELECT id FROM farmer WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Email already exists"
            }), 409

        password_hash = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO farmer (name, email, password, phone)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, password_hash, phone)
        )

        db.commit()

        return jsonify({
            "success": True,
            "message": "Signup successful"
        }), 201

    except Exception as error:
        print("SIGNUP ERROR:", error)

        if db:
            db.rollback()

        return jsonify({
            "success": False,
            "message": "Signup failed"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


# =====================================================
# FARMER LOGIN
# =====================================================

@app.route("/login", methods=["POST"])
def login():
    db = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email")
        password = data.get("password")

        if not isinstance(email, str) or not email.strip():
            return jsonify({
                "success": False,
                "message": "Email is required"
            }), 400

        if not isinstance(password, str) or not password:
            return jsonify({
                "success": False,
                "message": "Password is required"
            }), 400

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, email, password, phone, created_at
            FROM farmer
            WHERE email = %s
            """,
            (email.strip().lower(),)
        )

        farmer = cursor.fetchone()

        if not farmer:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        stored_password = farmer["password"]

        try:
            password_matches = check_password_hash(
                stored_password,
                password
            )
        except (ValueError, TypeError):
            password_matches = False

        # Temporary compatibility for existing plaintext passwords.
        # Remove this fallback after migrating all old passwords
        # to secure password hashes.
        if not password_matches and stored_password == password:
            password_matches = True

        if not password_matches:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        farmer.pop("password", None)

        return jsonify({
            "success": True,
            "message": "Login successful",
            "farmer": farmer
        }), 200

    except Exception as error:
        print("LOGIN ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Login failed"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


# =====================================================
# ADMIN DASHBOARD STATISTICS
# =====================================================

@app.route("/admin/dashboard", methods=["GET"])
def admin_dashboard():
    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS total FROM farmer")
        farmers_count = cursor.fetchone()["total"]

        cursor.execute("SHOW TABLES LIKE 'stores'")
        stores_table_exists = cursor.fetchone() is not None

        stores_count = 0

        if stores_table_exists:
            cursor.execute("SELECT COUNT(*) AS total FROM stores")
            stores_count = cursor.fetchone()["total"]

        return jsonify({
            "success": True,
            "total_farmers": farmers_count,
            "total_stores": stores_count
        }), 200

    except Exception as error:
        print("ADMIN DASHBOARD ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to load dashboard statistics"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


# =====================================================
# ADMIN: GET ALL FARMERS
# =====================================================

@app.route("/admin/farmers", methods=["GET"])
def get_admin_farmers():
    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, email, phone, created_at
            FROM farmer
            ORDER BY id DESC
            """
        )

        farmers = cursor.fetchall()

        return jsonify({
            "success": True,
            "farmers": farmers,
            "total": len(farmers)
        }), 200

    except Exception as error:
        print("ADMIN FARMERS ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to fetch farmers"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


# =====================================================
# ADMIN: GET ALL AGRICULTURAL STORES
# =====================================================

@app.route("/admin/stores", methods=["GET"])
def get_admin_stores():
    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SHOW TABLES LIKE 'stores'")

        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Stores table does not exist"
            }), 404

        cursor.execute("SELECT * FROM stores ORDER BY id DESC")
        stores = cursor.fetchall()

        return jsonify({
            "success": True,
            "stores": stores,
            "total": len(stores)
        }), 200

    except Exception as error:
        print("ADMIN STORES ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to fetch stores"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


# =====================================================
# WEATHER CODES
# =====================================================

WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail"
}


def get_weather_description(code):
    return WEATHER_CODES.get(
        code,
        "Weather information unavailable"
    )


# =====================================================
# FARMING RECOMMENDATIONS
# =====================================================

def generate_farming_advice(current, daily):
    advice = []

    temperature = current.get("temperature_2m")
    wind_speed = current.get("wind_speed_10m")

    rain_probabilities = (
        daily.get("precipitation_probability_max") or []
    )

    rainfall_values = (
        daily.get("precipitation_sum") or []
    )

    if temperature is not None and temperature >= 35:
        advice.append({
            "title": "High Temperature",
            "message": (
                "Monitor crops for heat stress and check "
                "their water requirements."
            ),
            "type": "warning"
        })

    if any(
        value is not None and value >= 60
        for value in rain_probabilities[:2]
    ):
        advice.append({
            "title": "Rain Alert",
            "message": (
                "Rain is possible in the next two days. "
                "Check the forecast before irrigation or spraying."
            ),
            "type": "warning"
        })

    if any(
        value is not None and value >= 10
        for value in rainfall_values[:2]
    ):
        advice.append({
            "title": "Rainfall Expected",
            "message": (
                "Check soil moisture and drainage before "
                "deciding on irrigation."
            ),
            "type": "info"
        })

    if wind_speed is not None and wind_speed >= 20:
        advice.append({
            "title": "Wind Advisory",
            "message": (
                "Check pesticide labels and local agricultural "
                "guidance before spraying."
            ),
            "type": "warning"
        })

    if not advice:
        advice.append({
            "title": "General Farming Advice",
            "message": (
                "Review the forecast and soil moisture before "
                "planning irrigation and other field activities."
            ),
            "type": "success"
        })

    return advice


# =====================================================
# WEATHER API
# GET /api/weather?city=Hyderabad
# GET /api/weather?city=Guntur
# GET /api/weather?latitude=16.3067&longitude=80.4365
# =====================================================

@app.route("/api/weather", methods=["GET"])
def get_weather():
    city = request.args.get("city", "Hyderabad").strip()

    latitude = request.args.get("latitude")
    longitude = request.args.get("longitude")

    if len(city) > 100:
        return jsonify({
            "success": False,
            "message": "Location name is too long"
        }), 400

    if (latitude is None) != (longitude is None):
        return jsonify({
            "success": False,
            "message": "Provide both latitude and longitude"
        }), 400

    try:
        if latitude is not None and longitude is not None:
            try:
                lat = float(latitude)
                lon = float(longitude)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "message": "Latitude and longitude must be numbers"
                }), 400

            if not -90 <= lat <= 90:
                return jsonify({
                    "success": False,
                    "message": "Latitude must be between -90 and 90"
                }), 400

            if not -180 <= lon <= 180:
                return jsonify({
                    "success": False,
                    "message": "Longitude must be between -180 and 180"
                }), 400

            location_name = city or "Selected Location"

        else:
            if not city:
                return jsonify({
                    "success": False,
                    "message": "Enter a city or village name"
                }), 400

            geocoding_response = requests.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={
                    "name": city,
                    "count": 1,
                    "language": "en",
                    "format": "json"
                },
                timeout=15
            )

            geocoding_response.raise_for_status()
            geocoding_data = geocoding_response.json()
            locations = geocoding_data.get("results", [])

            if not locations:
                return jsonify({
                    "success": False,
                    "message": (
                        "Location not found. Try another city or village."
                    )
                }), 404

            location = locations[0]

            lat = location["latitude"]
            lon = location["longitude"]
            location_name = location["name"]

            if location.get("admin1"):
                location_name += ", " + location["admin1"]

            if location.get("country"):
                location_name += ", " + location["country"]

        weather_response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": (
                    "temperature_2m,"
                    "relative_humidity_2m,"
                    "apparent_temperature,"
                    "precipitation,"
                    "rain,"
                    "weather_code,"
                    "wind_speed_10m,"
                    "wind_direction_10m"
                ),
                "daily": (
                    "weather_code,"
                    "temperature_2m_max,"
                    "temperature_2m_min,"
                    "precipitation_probability_max,"
                    "precipitation_sum,"
                    "sunrise,"
                    "sunset"
                ),
                "forecast_days": 7,
                "timezone": "auto"
            },
            timeout=15
        )

        weather_response.raise_for_status()
        weather_data = weather_response.json()

        current = weather_data.get("current")
        daily = weather_data.get("daily")

        if not current or not daily:
            return jsonify({
                "success": False,
                "message": "Weather data is unavailable"
            }), 502

        current_weather = {
            "time": current.get("time"),
            "temperature": current.get("temperature_2m"),
            "feels_like": current.get("apparent_temperature"),
            "humidity": current.get("relative_humidity_2m"),
            "precipitation": current.get("precipitation"),
            "rain": current.get("rain"),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_direction": current.get("wind_direction_10m"),
            "weather_code": current.get("weather_code"),
            "description": get_weather_description(
                current.get("weather_code")
            )
        }

        forecast = []

        daily_dates = daily.get("time", [])

        for index, date in enumerate(daily_dates):
            weather_code = daily["weather_code"][index]

            forecast.append({
                "date": date,
                "weather_code": weather_code,
                "description": get_weather_description(weather_code),
                "temperature_max": daily["temperature_2m_max"][index],
                "temperature_min": daily["temperature_2m_min"][index],
                "rain_probability": (
                    daily["precipitation_probability_max"][index]
                ),
                "rainfall": daily["precipitation_sum"][index],
                "sunrise": daily["sunrise"][index],
                "sunset": daily["sunset"][index]
            })

        farming_advice = generate_farming_advice(
            current_weather,
            daily
        )

        return jsonify({
            "success": True,
            "location": location_name,
            "coordinates": {
                "latitude": lat,
                "longitude": lon
            },
            "timezone": weather_data.get("timezone"),
            "current": current_weather,
            "forecast": forecast,
            "farming_advice": farming_advice
        }), 200

    except requests.Timeout:
        return jsonify({
            "success": False,
            "message": "Weather request timed out. Please try again"
        }), 504

    except requests.RequestException as error:
        print("WEATHER API ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to connect to the weather service"
        }), 502

    except (KeyError, IndexError, TypeError, ValueError) as error:
        print("WEATHER DATA ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Invalid weather data received"
        }), 502


# =====================================================
# ERROR HANDLERS
# =====================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint not found"
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "message": "HTTP method not allowed for this endpoint"
    }), 405


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


# =====================================================
# RUN FLASK LOCALLY
# Render production start command: gunicorn app:app
# =====================================================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=False
    )