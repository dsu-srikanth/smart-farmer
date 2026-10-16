
from flask import Blueprint, request, jsonify
from db import get_db_connection

# Create crop Blueprint
crop_bp = Blueprint("crop", __name__)


# ===================================
# GET ALL CROPS
# ===================================
@crop_bp.route("/crops", methods=["GET"])
def get_crops():
    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM crop")
        crops = cursor.fetchall()

        return jsonify(crops), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        conn.close()


# ===================================
# ADD NEW CROP
# ===================================
@crop_bp.route("/crops", methods=["POST"])
def add_crop():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Crop details are required"}), 400

    name = data.get("name")
    season = data.get("season")
    soil_type = data.get("soil_type")
    duration = data.get("duration")
    water_requirement = data.get("water_requirement")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Crop name is required"}), 400

    try:
        if isinstance(duration, bool):
            raise ValueError

        duration = int(duration)

        if duration <= 0:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({"error": "Enter a valid duration"}), 400

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None

    try:
        cursor = conn.cursor()

        query = """
            INSERT INTO crop
            (name, season, soil_type, duration, water_requirement)
            VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            name.strip(),
            season,
            soil_type,
            duration,
            water_requirement
        )

        cursor.execute(query, values)
        conn.commit()

        crop_id = cursor.lastrowid

        return jsonify({
            "message": "Crop added successfully",
            "crop_id": crop_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        conn.close()
