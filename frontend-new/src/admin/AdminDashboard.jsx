
import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

// Flask backend URL
const API_URL = "http://127.0.0.1:5000";

const FARMERS_API = `${API_URL}/admin/farmers`;
const STORES_API = `${API_URL}/admin/stores`;
const DASHBOARD_API = `${API_URL}/admin/dashboard`;
const MARKETPLACE_API = `${API_URL}/api/marketplace/`;

function AdminDashboard() {
  const [activePage, setActivePage] = useState("overview");

  const [stats, setStats] = useState({
    farmers: 0,
    stores: 0,
    marketplace: 0,
  });

  const [farmers, setFarmers] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Load dashboard information
  const fetchDashboard = async () => {
    try {
      const response = await fetch(DASHBOARD_API);

      if (!response.ok) {
        throw new Error("Unable to load dashboard statistics.");
      }

      const data = await response.json();

      setStats({
        farmers: Number(data.farmers ?? data.total_farmers ?? 0),
        stores: Number(data.stores ?? data.total_stores ?? 0),
        marketplace: Number(
          data.marketplace ?? data.total_listings ?? 0
        ),
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
    }
  };

  // Load farmers
  const fetchFarmers = async () => {
    try {
      const response = await fetch(FARMERS_API);

      if (!response.ok) {
        throw new Error("Unable to load farmers.");
      }

      const data = await response.json();

      // Supports either a direct array or { farmers: [...] }
      const farmerList = Array.isArray(data)
        ? data
        : data.farmers || [];

      setFarmers(farmerList);
      setStats((previous) => ({
        ...previous,
        farmers: farmerList.length,
      }));
    } catch (err) {
      console.error("Farmers error:", err);
      setError(err.message);
    }
  };

  // Load stores
  const fetchStores = async () => {
    try {
      const response = await fetch(STORES_API);

      if (!response.ok) {
        throw new Error("Unable to load stores.");
      }

      const data = await response.json();

      // Supports either a direct array or { stores: [...] }
      const storeList = Array.isArray(data)
        ? data
        : data.stores || [];

      setStores(storeList);
      setStats((previous) => ({
        ...previous,
        stores: storeList.length,
      }));
    } catch (err) {
      console.error("Stores error:", err);
      setError(err.message);
    }
  };

  // Load marketplace listings
  const fetchMarketplace = async () => {
    try {
      const response = await fetch(MARKETPLACE_API);

      if (!response.ok) {
        throw new Error("Unable to load marketplace listings.");
      }

      const data = await response.json();

      // Supports either a direct array or { listings: [...] }
      const listingList = Array.isArray(data)
        ? data
        : data.listings || data.products || [];

      setProducts(listingList);
      setStats((previous) => ({
        ...previous,
        marketplace: listingList.length,
      }));
    } catch (err) {
      console.error("Marketplace error:", err);
      setError(err.message);
    }
  };

  // Load all dashboard data
  const loadAllData = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      fetchDashboard(),
      fetchFarmers(),
      fetchStores(),
      fetchMarketplace(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Refresh button
  const handleRefresh = () => {
    loadAllData();
  };

  // Search helper
  const filterData = (data, fields) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return data;
    }

    return data.filter((item) =>
      fields.some((field) =>
        String(item[field] ?? "")
          .toLowerCase()
          .includes(searchText)
      )
    );
  };

  const filteredFarmers = filterData(farmers, [
    "id",
    "name",
    "email",
    "phone",
  ]);

  const filteredStores = filterData(stores, [
    "id",
    "store_name",
    "name",
    "location",
    "phone",
    "product",
  ]);

  const filteredProducts = filterData(products, [
    "id",
    "product_name",
    "name",
    "category",
    "farmer_name",
    "listing_type",
    "location",
  ]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon">🌱</span>
          <h2>Smart Farming</h2>
        </div>

        <p className="admin-subtitle">ADMIN PANEL</p>

        <nav className="admin-nav">
          <button
            className={activePage === "overview" ? "active" : ""}
            onClick={() => {
              setActivePage("overview");
              setSearch("");
            }}
          >
            📊 Overview
          </button>

          <button
            className={activePage === "farmers" ? "active" : ""}
            onClick={() => {
              setActivePage("farmers");
              setSearch("");
            }}
          >
            👨‍🌾 Farmers
          </button>

          <button
            className={activePage === "stores" ? "active" : ""}
            onClick={() => {
              setActivePage("stores");
              setSearch("");
            }}
          >
            🏪 Stores
          </button>

          <button
            className={activePage === "marketplace" ? "active" : ""}
            onClick={() => {
              setActivePage("marketplace");
              setSearch("");
            }}
          >
            🛒 Marketplace
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>
              {activePage === "overview" && "Dashboard Overview"}
              {activePage === "farmers" && "Manage Farmers"}
              {activePage === "stores" && "Manage Stores"}
              {activePage === "marketplace" && "Marketplace Listings"}
            </h1>

            <p>Smart Farming Administration</p>
          </div>

          <button
            className="admin-refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </header>

        {error && (
          <div className="admin-error">
            <strong>Connection notice:</strong> {error}
            <p>
              Check that your Flask backend is running and that the API
              routes and MySQL tables exist.
            </p>
          </div>
        )}

        {loading && (
          <div className="admin-loading">
            Loading information from the backend...
          </div>
        )}

        {/* Overview */}
        {activePage === "overview" && (
          <section>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <span className="admin-stat-icon">👨‍🌾</span>
                <p>Total Farmers</p>
                <h2>{stats.farmers}</h2>
              </div>

              <div className="admin-stat-card">
                <span className="admin-stat-icon">🏪</span>
                <p>Total Stores</p>
                <h2>{stats.stores}</h2>
              </div>

              <div className="admin-stat-card">
                <span className="admin-stat-icon">🛒</span>
                <p>Marketplace Listings</p>
                <h2>{stats.marketplace}</h2>
              </div>
            </div>

            <div className="admin-panel">
              <h2>Welcome to Smart Farming Admin</h2>
              <p>
                Use the sidebar to view registered farmers, farming stores,
                and marketplace listings stored in your database.
              </p>
            </div>
          </section>
        )}

        {/* Farmers */}
        {activePage === "farmers" && (
          <section className="admin-panel">
            <div className="admin-section-heading">
              <h2>Registered Farmers</h2>
              <input
                className="admin-search"
                type="text"
                placeholder="Search farmers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {!loading && filteredFarmers.length === 0 ? (
              <p className="admin-empty">No farmers found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFarmers.map((farmer, index) => (
                      <tr key={farmer.id ?? index}>
                        <td>{farmer.id ?? "-"}</td>
                        <td>{farmer.name ?? "-"}</td>
                        <td>{farmer.email ?? "-"}</td>
                        <td>{farmer.phone ?? "-"}</td>
                        <td>{farmer.created_at ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Stores */}
        {activePage === "stores" && (
          <section className="admin-panel">
            <div className="admin-section-heading">
              <h2>Registered Stores</h2>
              <input
                className="admin-search"
                type="text"
                placeholder="Search stores..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {!loading && filteredStores.length === 0 ? (
              <p className="admin-empty">No stores found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Store Name</th>
                      <th>Location</th>
                      <th>Phone</th>
                      <th>Product</th>
                      <th>Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStores.map((store, index) => (
                      <tr key={store.id ?? index}>
                        <td>{store.id ?? "-"}</td>
                        <td>{store.store_name ?? store.name ?? "-"}</td>
                        <td>{store.location ?? "-"}</td>
                        <td>{store.phone ?? "-"}</td>
                        <td>{store.product ?? "-"}</td>
                        <td>{store.price ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Marketplace */}
        {activePage === "marketplace" && (
          <section className="admin-panel">
            <div className="admin-section-heading">
              <h2>Farmer Marketplace</h2>
              <input
                className="admin-search"
                type="text"
                placeholder="Search listings..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {!loading && filteredProducts.length === 0 ? (
              <p className="admin-empty">No marketplace listings found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Farmer</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Location</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id ?? index}>
                        <td>{product.id ?? "-"}</td>
                        <td>
                          {product.product_name ?? product.name ?? "-"}
                        </td>
                        <td>{product.category ?? "-"}</td>
                        <td>{product.farmer_name ?? "-"}</td>
                        <td>{product.listing_type ?? "-"}</td>
                        <td>
                          {product.quantity ?? "-"}{" "}
                          {product.unit ?? ""}
                        </td>
                        <td>
                          {product.price != null
                            ? `₹${product.price}`
                            : "-"}
                        </td>
                        <td>{product.location ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="admin-footer">
          <p>Smart Farming Project | Admin Dashboard</p>
          <p>Manage farmers, stores, and marketplace listings in one place.</p>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
