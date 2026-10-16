
import React, { useEffect, useState } from "react";
import "./Marketplace.css";

const API_URL = "http://127.0.0.1:5000";
const MARKETPLACE_API = `${API_URL}/api/marketplace/`;

// Replace with your actual WhatsApp number, including country code.
const WEBSITE_WHATSAPP_NUMBER = "8309669374";

// Replace with your deployed website URL.
const WEBSITE_URL = "https://your-website-url.com";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch marketplace listings from Flask
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(MARKETPLACE_API);

      if (!response.ok) {
        throw new Error("Unable to load marketplace listings.");
      }

      const data = await response.json();

      // Supports either an array or an object containing listings.
      const listings = Array.isArray(data)
        ? data
        : data.listings || data.products || [];

      setProducts(listings);
    } catch (err) {
      console.error("Marketplace error:", err);
      setError(
        "Could not connect to the marketplace. Please check that the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp number must contain digits only.
  const cleanPhoneNumber = (phone) =>
    String(phone || "").replace(/\D/g, "");

  // WhatsApp message for contacting a farmer
  const getFarmerWhatsAppLink = (product) => {
    const phone = cleanPhoneNumber(product.phone);

    const message =
      `Hello ${product.farmer_name || "Farmer"}!\n\n` +
      `I found your listing on Smart Farming Marketplace.\n\n` +
      `Product: ${product.product_name || "N/A"}\n` +
      `Category: ${product.category || "N/A"}\n` +
      `Quantity: ${product.quantity ?? "N/A"} ${product.unit || ""}\n` +
      `Price: ${product.price != null ? "₹" + product.price : "N/A"}\n` +
      `Location: ${product.location || "N/A"}\n\n` +
      `Please share more details about this product.`;

    if (!phone) return "#";

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Floating WhatsApp welcome message about your website
  const websiteWelcomeMessage =
    "🌱 Welcome to Smart Farming!\n\n" +
    "Our website helps farmers manage their farming activities easily.\n\n" +
    "🚜 Features:\n" +
    "✅ Crop Management\n" +
    "✅ Expense Tracking\n" +
    "✅ Profit Calculation\n" +
    "✅ Crop Recommendations\n" +
    "✅ Farmer Marketplace\n" +
    "✅ Agricultural Store Information\n\n" +
    `🌐 Visit our website: ${WEBSITE_URL}\n\n` +
    "How can we help you today?";

  const websiteWhatsAppLink =
    `https://wa.me/${WEBSITE_WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(websiteWelcomeMessage)}`;

  // Filter and search listings
  const filteredProducts = products.filter((product) => {
    const productType = String(product.listing_type || "").toUpperCase();

    const matchesFilter =
      filter === "ALL" || productType === filter;

    const searchText = search.toLowerCase().trim();

    const matchesSearch = [
      product.product_name,
      product.name,
      product.category,
      product.farmer_name,
      product.location,
      product.description,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="marketplace-page">
      {/* Header */}
      <header className="marketplace-header">
        <div>
          <h1>🌾 Smart Farming Marketplace</h1>
          <p>
            Buy and sell agricultural products directly through our
            farmer marketplace.
          </p>
        </div>

        <button
          className="marketplace-refresh"
          onClick={fetchProducts}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {/* Search */}
      <section className="marketplace-toolbar">
        <input
          type="text"
          className="marketplace-search"
          placeholder="Search crops, products, farmers or locations..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="marketplace-filters">
          {["ALL", "SELL", "BUY"].map((type) => (
            <button
              key={type}
              className={filter === type ? "active" : ""}
              onClick={() => setFilter(type)}
            >
              {type === "ALL"
                ? "All Listings"
                : type === "SELL"
                ? "For Sale"
                : "Looking to Buy"}
            </button>
          ))}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="marketplace-message">
          Loading marketplace listings...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="marketplace-error">
          <p>{error}</p>
          <button onClick={fetchProducts}>Try Again</button>
        </div>
      )}

      {/* Product listings */}
      {!loading && !error && (
        <>
          <div className="marketplace-results">
            <h2>Available Listings</h2>
            <span>{filteredProducts.length} listing(s) found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="marketplace-empty">
              <span>🌱</span>
              <h3>No listings found</h3>
              <p>
                Try another search or select a different filter.
              </p>
            </div>
          ) : (
            <div className="marketplace-grid">
              {filteredProducts.map((product, index) => {
                const phone = cleanPhoneNumber(product.phone);

                const productName =
                  product.product_name || product.name || "Agricultural Product";

                const listingType = String(
                  product.listing_type || "SELL"
                ).toUpperCase();

                return (
                  <article
                    className="marketplace-card"
                    key={product.id ?? index}
                  >
                    <div className="marketplace-card-top">
                      <span className="marketplace-product-icon">
                        {String(product.category || "").toLowerCase().includes("seed")
                          ? "🌱"
                          : String(product.category || "").toLowerCase().includes("fertilizer")
                          ? "🧪"
                          : "🌾"}
                      </span>

                      <span
                        className={`marketplace-badge ${
                          listingType === "BUY" ? "buy-badge" : "sell-badge"
                        }`}
                      >
                        {listingType === "BUY" ? "Looking to Buy" : "For Sale"}
                      </span>
                    </div>

                    <h3>{productName}</h3>

                    <p className="marketplace-category">
                      {product.category || "Agricultural Product"}
                    </p>

                    <div className="marketplace-product-details">
                      <p>
                        <strong>👨‍🌾 Farmer:</strong>{" "}
                        {product.farmer_name || "Farmer"}
                      </p>

                      <p>
                        <strong>📦 Quantity:</strong>{" "}
                        {product.quantity ?? "Not specified"}{" "}
                        {product.unit || ""}
                      </p>

                      <p>
                        <strong>📍 Location:</strong>{" "}
                        {product.location || "Not specified"}
                      </p>

                      {product.description && (
                        <p>
                          <strong>📝 Details:</strong>{" "}
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="marketplace-price">
                      {product.price != null
                        ? `₹${product.price}`
                        : "Price not specified"}
                      {product.price != null && product.unit
                        ? ` / ${product.unit}`
                        : ""}
                    </div>

                    <div className="marketplace-contact-buttons">
                      {phone ? (
                        <>
                          <a
                            className="marketplace-call-button"
                            href={`tel:${phone}`}
                          >
                            📞 Call Farmer
                          </a>

                          <a
                            className="marketplace-whatsapp-button"
                            href={getFarmerWhatsAppLink(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🟢 WhatsApp
                          </a>
                        </>
                      ) : (
                        <a
                          className="marketplace-whatsapp-button"
                          href={websiteWhatsAppLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          🟢 Contact Support
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Floating WhatsApp support icon */}
      <a
        href={websiteWhatsAppLink}
        className="marketplace-whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Smart Farming support on WhatsApp"
        title="Contact Smart Farming"
      >
        <span aria-hidden="true">☏</span>
        <span className="marketplace-whatsapp-tooltip">
          Chat with us
        </span>
      </a>

      {/* Footer */}
      <footer className="marketplace-footer">
        <h3>🌱 Smart Farming</h3>
        <p>Connecting farmers with agricultural products and opportunities.</p>
        <p>© {new Date().getFullYear()} Smart Farming Project</p>
      </footer>
    </div>
  );
}

export default Marketplace;
