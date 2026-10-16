
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./farmer/Login/Login";
import Signup from "./farmer/Signup/Signup";

import Dashboard from "./farmer/Dashboard";

import Marketplace from "./farmer/market/Marketplace";
import AddProduct from "./farmer/market/AddProduct";

import Crops from "./crops/Crops";

import AdminDashboard from "./admin/AdminDashboard";

// Live Weather Forecasting
import Weather from "./components/Weather";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/farmer/signup"
        element={<Signup />}
      />

      {/* Farmer Dashboard */}
      <Route
        path="/farmer/dashboard"
        element={<Dashboard />}
      />

      {/* Farmer Crop Management */}
      <Route
        path="/farmer/crops"
        element={<Crops />}
      />

      {/* Farmer Marketplace */}
      <Route
        path="/farmer/marketplace"
        element={<Marketplace />}
      />

      <Route
        path="/farmer/add-product"
        element={<AddProduct />}
      />

      {/* Live Weather Forecasting */}
      <Route
        path="/farmer/weather"
        element={<Weather />}
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      {/* 404 Page */}
      <Route
        path="*"
        element={<h1>404 - Page Not Found</h1>}
      />
    </Routes>
  );
}

export default App;
