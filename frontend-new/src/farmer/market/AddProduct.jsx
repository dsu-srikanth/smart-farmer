
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    farmer_id: "",
    product_name: "",
    category: "Crops",
    listing_type: "SELL",
    description: "",
    quantity: "",
    unit: "kg",
    price: "",
    location: "",
    phone: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Submit product to Flask backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (
      !product.farmer_id ||
      !product.product_name.trim() ||
      !product.quantity ||
      product.price === "" ||
      !product.location.trim()
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (
      Number(product.farmer_id) <= 0 ||
      Number(product.quantity) <= 0 ||
      Number(product.price) < 0
    ) {
      setMessage("Please enter valid ID, quantity and price.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/marketplace/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...product,
            farmer_id: Number(product.farmer_id),
            quantity: Number(product.quantity),
            price: Number(product.price)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to add product."
        );
      }

      setMessage("Product listing added successfully!");

      setProduct({
        farmer_id: "",
        product_name: "",
        category: "Crops",
        listing_type: "SELL",
        description: "",
        quantity: "",
        unit: "kg",
        price: "",
        location: "",
        phone: ""
      });

      // Allow the success message to appear before navigating.
      setTimeout(() => {
        navigate("/farmer/marketplace");
      }, 1200);

    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">

        <button
          type="button"
          className="add-product-back"
          onClick={() => navigate("/farmer/marketplace")}
        >
          ← Back to Marketplace
        </button>

        <div className="add-product-heading">
          <h1>🌾 Farmer Marketplace</h1>
          <p>Sell your products or find buyers for what you need.</p>
        </div>

        <form
          className="add-product-form"
          onSubmit={handleSubmit}
        >
          <h2>Create a Listing</h2>

          {message && (
            <div
              className={
                message.includes("successfully")
                  ? "add-product-message success"
                  : "add-product-message error"
              }
              role="status"
            >
              {message}
            </div>
          )}

          <div className="add-product-field">
            <label htmlFor="farmer_id">Farmer ID *</label>

            <input
              id="farmer_id"
              type="number"
              name="farmer_id"
              value={product.farmer_id}
              onChange={handleChange}
              placeholder="Enter your farmer ID"
              min="1"
              required
            />
          </div>

          <div className="add-product-field">
            <label htmlFor="listing_type">
              What do you want to do? *
            </label>

            <select
              id="listing_type"
              name="listing_type"
              value={product.listing_type}
              onChange={handleChange}
              required
            >
              <option value="SELL">Sell a Product</option>
              <option value="BUY">Buy a Product</option>
            </select>
          </div>

          <div className="add-product-field">
            <label htmlFor="product_name">Product Name *</label>

            <input
              id="product_name"
              type="text"
              name="product_name"
              value={product.product_name}
              onChange={handleChange}
              placeholder="Example: Rice, Tractor, Cotton"
              required
            />
          </div>

          <div className="add-product-field">
            <label htmlFor="category">Product Category *</label>

            <select
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              required
            >
              <option value="Crops">Crops</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Pesticides">Pesticides</option>
              <option value="Equipment">Farming Equipment</option>
              <option value="Machinery">Agricultural Machinery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="add-product-field">
            <label htmlFor="description">
              Product Description
            </label>

            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Describe your product, quality and other details"
              rows="4"
            />
          </div>

          <div className="add-product-row">
            <div className="add-product-field">
              <label htmlFor="quantity">Quantity *</label>

              <input
                id="quantity"
                type="number"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                min="0.01"
                step="any"
                required
              />
            </div>

            <div className="add-product-field">
              <label htmlFor="unit">Unit *</label>

              <select
                id="unit"
                name="unit"
                value={product.unit}
                onChange={handleChange}
                required
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="quintal">Quintal</option>
                <option value="tonne">Tonne</option>
                <option value="litre">Litre</option>
                <option value="piece">Piece</option>
                <option value="bag">Bag</option>
              </select>
            </div>
          </div>

          <div className="add-product-field">
            <label htmlFor="price">
              {product.listing_type === "SELL"
                ? "Selling Price per Unit (₹) *"
                : "Expected Buying Price per Unit (₹) *"}
            </label>

            <input
              id="price"
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="Enter price in rupees"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="add-product-field">
            <label htmlFor="location">Your Location *</label>

            <input
              id="location"
              type="text"
              name="location"
              value={product.location}
              onChange={handleChange}
              placeholder="Village, town or district"
              required
            />
          </div>

          <div className="add-product-field">
            <label htmlFor="phone">Contact Number</label>

            <input
              id="phone"
              type="tel"
              name="phone"
              value={product.phone}
              onChange={handleChange}
              placeholder="Enter contact number"
              maxLength="20"
            />
          </div>

          <button
            type="submit"
            className="add-product-submit"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : product.listing_type === "SELL"
                ? "🌾 Publish Product for Sale"
                : "🔍 Publish Buying Requirement"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddProduct;
