from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import flask_cors
from datetime import datetime
import os

app = Flask(__name__)
flask_cors.CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_DIR = os.path.join(BASE_DIR, "database")
os.makedirs(DB_DIR, exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(DB_DIR, "inventory.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    supplier = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "product_name": self.product_name,
            "category": self.category,
            "quantity": self.quantity,
            "price": self.price,
            "supplier": self.supplier,
            "date": self.date
        }

def validate_item(data):
    required = ["product_name", "category", "quantity", "price", "supplier", "date"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return f"{field.replace('_', ' ').title()} is required."

    try:
        quantity = int(data["quantity"])
        if quantity < 0:
            return "Quantity must be 0 or greater."
    except (ValueError, TypeError):
        return "Quantity must be a valid integer."

    try:
        price = float(data["price"])
        if price <= 0:
            return "Price must be greater than 0."
    except (ValueError, TypeError):
        return "Price must be a valid number."

    try:
        datetime.strptime(str(data["date"]), "%Y-%m-%d")
    except ValueError:
        return "Date must be in YYYY-MM-DD format."

    return None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/items/", methods=["GET"])
def get_items():
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()

    query = Inventory.query
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Inventory.product_name.ilike(pattern),
                Inventory.category.ilike(pattern),
                Inventory.supplier.ilike(pattern)
            )
        )
    if category:
        query = query.filter(Inventory.category == category)

    items = query.order_by(Inventory.id.desc()).all()
    return jsonify([item.to_dict() for item in items])

@app.route("/api/items/<int:item_id>/", methods=["GET"])
def get_item(item_id):
    item = db.session.get(Inventory, item_id)
    if not item:
        return jsonify({"error": "Product not found."}), 404
    return jsonify(item.to_dict())

@app.route("/api/items/", methods=["POST"])
def create_item():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON data."}), 400

    error = validate_item(data)
    if error:
        return jsonify({"error": error}), 400

    item = Inventory(
        product_name=str(data["product_name"]).strip(),
        category=str(data["category"]).strip(),
        quantity=int(data["quantity"]),
        price=float(data["price"]),
        supplier=str(data["supplier"]).strip(),
        date=str(data["date"])
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Product created successfully.", "item": item.to_dict()}), 201

@app.route("/api/items/<int:item_id>/", methods=["PUT", "PATCH"])
def update_item(item_id):
    item = db.session.get(Inventory, item_id)
    if not item:
        return jsonify({"error": "Product not found."}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON data."}), 400

    merged = {
        "product_name": data.get("product_name", item.product_name),
        "category": data.get("category", item.category),
        "quantity": data.get("quantity", item.quantity),
        "price": data.get("price", item.price),
        "supplier": data.get("supplier", item.supplier),
        "date": data.get("date", item.date)
    }

    error = validate_item(merged)
    if error:
        return jsonify({"error": error}), 400

    item.product_name = str(merged["product_name"]).strip()
    item.category = str(merged["category"]).strip()
    item.quantity = int(merged["quantity"])
    item.price = float(merged["price"])
    item.supplier = str(merged["supplier"]).strip()
    item.date = str(merged["date"])

    db.session.commit()
    return jsonify({"message": "Product updated successfully.", "item": item.to_dict()})

@app.route("/api/items/<int:item_id>/", methods=["DELETE"])
def delete_item(item_id):
    item = db.session.get(Inventory, item_id)
    if not item:
        return jsonify({"error": "Product not found."}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully."})

@app.route("/api/stats/", methods=["GET"])
def get_stats():
    items = Inventory.query.all()
    total_products = len(items)
    total_quantity = sum(item.quantity for item in items)
    total_categories = len(set(item.category for item in items))
    total_value = sum(item.quantity * item.price for item in items)
    return jsonify({
        "total_products": total_products,
        "total_quantity": total_quantity,
        "total_categories": total_categories,
        "total_value": total_value
    })

@app.route("/api/categories/", methods=["GET"])
def get_categories():
    categories = db.session.query(Inventory.category).distinct().order_by(Inventory.category).all()
    return jsonify([row[0] for row in categories])

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Resource not found."}), 404
    return "Page not found.", 404

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
