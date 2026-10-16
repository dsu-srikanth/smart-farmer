from flask import Blueprint, request, jsonify
import mysql.connector

store_bp = Blueprint("store", __name__)


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="sri@1234",
        database="smartfarming"
    )


# GET ALL STORES
@store_bp.route("/stores", methods=["GET"])
def get_stores():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM stores ORDER BY id DESC")

    stores = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(stores), 200


# ADD STORE
@store_bp.route("/stores", methods=["POST"])
def add_store():

    data = request.get_json()

    store_name = data.get("store_name")
    location = data.get("location")
    phone = data.get("phone")
    product = data.get("product")
    price = data.get("price")

    if not store_name or not location:
        return jsonify({
            "message": "Store name and location are required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor()

    sql = """
        INSERT INTO stores
        (store_name, location, phone, product, price)
        VALUES (%s, %s, %s, %s, %s)
    """

    values = (
        store_name,
        location,
        phone,
        product,
        price
    )

    cursor.execute(sql, values)

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "Store added successfully"
    }), 201