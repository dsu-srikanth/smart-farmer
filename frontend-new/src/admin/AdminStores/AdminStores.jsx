import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStores.css";

function AdminStores() {

  const navigate = useNavigate();


  // =====================================================
  // STORE LIST
  // =====================================================

  const [stores, setStores] = useState([]);


  // =====================================================
  // FORM DATA
  // =====================================================

  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");


  // =====================================================
  // ADD STORE
  // =====================================================

  const addStore = (event) => {

    event.preventDefault();


    const newStore = {

      id: Date.now(),

      store_name: storeName,

      location: location,

      phone: phone,

      product: product,

      price: price

    };


    // Add store to frontend list

    setStores([
      ...stores,
      newStore
    ]);


    // Clear form

    setStoreName("");

    setLocation("");

    setPhone("");

    setProduct("");

    setPrice("");


    alert("Store added successfully!");

  };


  return (

    <div className="admin-stores-page">


      {/* ================= HEADER ================= */}

      <div className="admin-store-header">

        <h1>
          🏪 Store Management
        </h1>

        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
        >
          ← Admin Dashboard
        </button>

      </div>


      {/* ================= ADD STORE ================= */}

      <section className="add-store-section">

        <h2>
          ➕ Add Store Information
        </h2>


        <form
          className="store-form"
          onSubmit={addStore}
        >


          <input
            type="text"
            placeholder="Store Name"
            value={storeName}
            onChange={(event) =>
              setStoreName(event.target.value)
            }
            required
          />


          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            required
          />


          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            required
          />


          <input
            type="text"
            placeholder="Product"
            value={product}
            onChange={(event) =>
              setProduct(event.target.value)
            }
            required
          />


          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            required
          />


          <button type="submit">
            Add Store
          </button>

        </form>

      </section>


      {/* ================= ALL STORES ================= */}

      <section className="all-stores-section">

        <h2>
          🏪 All Stores
        </h2>


        <div className="admin-store-grid">

          {stores.map((store) => (

            <div
              className="admin-store-card"
              key={store.id}
            >

              <h3>
                🌾 {store.store_name}
              </h3>

              <p>
                📍 <strong>Location:</strong>{" "}
                {store.location}
              </p>

              <p>
                📱 <strong>Phone:</strong>{" "}
                {store.phone}
              </p>

              <p>
                🧪 <strong>Product:</strong>{" "}
                {store.product}
              </p>

              <p>
                💰 <strong>Price:</strong>{" "}
                ₹{store.price}
              </p>

            </div>

          ))}


          {/* NO STORES */}

          {stores.length === 0 && (

            <p className="no-stores">
              No stores added yet.
            </p>

          )}

        </div>

      </section>

    </div>

  );
}

export default AdminStores;