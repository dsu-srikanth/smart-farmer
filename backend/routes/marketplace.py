from flask import Blueprint, request, jsonify
from db import get_db_connection

marketplace_bp = Blueprint(
    "marketplace",
    __name__,
    url_prefix="/api/marketplace"
)


# ==========================================
# 1. GET ALL ACTIVE MARKETPLACE LISTINGS
# ==========================================

@marketplace_bp.route("/", methods=["GET"])
def get_products():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        sql = """
            SELECT
                id,
                farmer_id,
                product_name,
                category,
                listing_type,
                description,
                quantity,
                unit,
                price,
                location,
                phone,
                created_at
            FROM marketplace_products
            WHERE status = 'ACTIVE'
            ORDER BY created_at DESC
        """

        cursor.execute(sql)

        products = cursor.fetchall()

        return jsonify(products), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ==========================================
# 2. ADD A NEW MARKETPLACE LISTING
# ==========================================

@marketplace_bp.route("/", methods=["POST"])
def add_product():

    data = request.get_json()

    required_fields = [
        "farmer_id",
        "product_name",
        "category",
        "listing_type",
        "quantity",
        "unit",
        "price",
        "location"
    ]

    if not data or any(
        field not in data or data[field] in (None, "")
        for field in required_fields
    ):

        return jsonify({
            "error": "Please provide all required fields"
        }), 400

    listing_type = str(data["listing_type"]).upper()

    if listing_type not in ("BUY", "SELL"):

        return jsonify({
            "error": "Listing type must be BUY or SELL"
        }), 400

    try:

        quantity = float(data["quantity"])
        price = float(data["price"])
        farmer_id = int(data["farmer_id"])

        if quantity <= 0 or price < 0 or farmer_id <= 0:
            raise ValueError()

    except (ValueError, TypeError):

        return jsonify({
            "error": "Invalid farmer ID, quantity or price"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        sql = """
            INSERT INTO marketplace_products (
                farmer_id,
                product_name,
                category,
                listing_type,
                description,
                quantity,
                unit,
                price,
                location,
                phone
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            farmer_id,
            data["product_name"],
            data["category"],
            listing_type,
            data.get("description", ""),
            quantity,
            data["unit"],
            price,
            data["location"],
            data.get("phone", "")
        )

        cursor.execute(sql, values)

        connection.commit()

        return jsonify({
            "message": "Marketplace listing created successfully",
            "listing_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()