import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

function Store() {

  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("Loading stores...");

  const navigate = useNavigate();


  // Get stores from Flask
  const getStores = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/stores"
      );

      const data = await response.json();

      console.log("STORE RESPONSE:", data);

      if (response.ok) {

        setStores(data);
        setMessage("");

      } else {

        setMessage(
          data.message || "Failed to get stores"
        );

      }

    } catch (error) {

      console.error("STORE ERROR:", error);

      setMessage(
        "Cannot connect to Flask server"
      );

    }

  };


  // Run when Store page opens
  useEffect(() => {

    getStores();

  }, []);


  return (

    <div className="store-page">

      {/* HEADER */}

      <h1>🏪 Farming Store</h1>

      <p>
        Farming products and store information
      </p>


      {/* BACK BUTTON */}

      <button
        className="back-button"
        onClick={() => navigate("/farmer/dashboard")}
      >
        ← Back to Dashboard
      </button>


      {/* STORE LIST */}

      <div className="store-container">

        {stores.map((store) => (

          <div
            className="store-card"
            key={store.id}
          >

            <h2>
              🌾 {store.store_name}
            </h2>

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

      </div>


      {/* MESSAGE */}

      {message && (

        <p className="store-message">
          {message}
        </p>

      )}

    </div>

  );
}

export default Store;