import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";

import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import AdminUsers from "./pages/AdminUsers";
import CatagereList from "./pages/CatagereList";
import Catagere from "./pages/Catagere";
import ManageCategory from "./pages/ManageCategory";
import EnquiryList from "./pages/EnquiryList";
import KeywordManager from "./components/KeywordManager";

import PopularProducts from "./pages/PopularProducts";
import PopularProductsList from "./pages/PopularProductsList";
import OfferProducts from "./pages/OfferProducts";
import OfferProductsList from "./pages/OfferProductsList";
import DeskDecoratives from "./pages/DeskDecoratives";
import DeskDecorativesList from "./pages/DeskDecorativesList";
import WallDecoratives from "./pages/WallDecoratives";
import WallDecorativesList from "./pages/WallDecorativesList";
import CarDecoratives from "./pages/CarDecoratives";
import CarDecorativesList from "./pages/CarDecorativesList";
import BusinessNeeds from "./pages/BusinessNeeds";
import BusinessNeedsList from "./pages/BusinessNeedsList";
import GoogleReviewAdd from "./pages/GoogleReviewAdd";
import GoogleReviewList from "./pages/GoogleReviewList";
import ShopCategoryAdd from "./pages/ShopCategoryAdd";
import ShopCategoryList from "./pages/ShopCategoryList";
import OfferBanner from "./pages/OfferBanner";

import "./admin_app.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sidebar drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // ── Global new-order notification (works on ANY admin page) ──
  const audioRef = useRef(null);
  const knownOrderCount = useRef(null); // null = not yet initialised

  useEffect(() => {
    if (location.pathname === "/orders") {
      setNewOrdersCount(0);
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  // Poll the order list globally; play sound when a new order arrives.
  useEffect(() => {
    if (!token) {
      knownOrderCount.current = null;
      return;
    }

    let cancelled = false;

    const checkOrders = async () => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/order/list`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled || !res.data?.success) return;

        const count = Array.isArray(res.data.orders) ? res.data.orders.length : 0;

        // First successful fetch: just record the baseline, no sound.
        if (knownOrderCount.current === null) {
          knownOrderCount.current = count;
          return;
        }

        // A new order arrived → play sound + badge, regardless of current page.
        if (count > knownOrderCount.current) {
          const newOnes = count - knownOrderCount.current;
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
          setNewOrdersCount((prev) => prev + newOnes);
          toast.info(`🛎️ ${newOnes} new order${newOnes > 1 ? "s" : ""} received!`);
        }
        knownOrderCount.current = count;
      } catch {
        /* ignore transient errors; next poll retries */
      }
    };

    checkOrders();
    const interval = setInterval(checkOrders, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  if (!token) {
    return (
      <>
        <ToastContainer />
        <Login setToken={setToken} />
      </>
    );
  }

  return (
    <div className="admin-shell">
      <ToastContainer />
      {/* Global notification sound — plays on new orders from any page */}
      <audio ref={audioRef} src="/Sounds/notification_sound.mp3" preload="auto" />
      <Navbar
        setToken={setToken}
        newOrdersCount={newOrdersCount}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      <div className="admin_app">
        {sidebarOpen && (
          <div
            className="adm-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar open={sidebarOpen} />
        <div className="admin-content">
          <Routes>
            {/* ✅ DEFAULT ROUTE */}
            <Route path="/" element={<Navigate to="/list" />} />

            <Route path="/add" element={<Add token={token} />} />
            <Route path="/list" element={<List token={token} />} />
            <Route path="/orders" element={<Orders token={token} setToken={setToken} setNewOrdersCount={setNewOrdersCount} />} />

            <Route path="/catagereList" element={<CatagereList token={token} />} />
            <Route path="/catagereAdd" element={<Catagere token={token} />} />
            <Route path="/manageCategory" element={<ManageCategory token={token} />} />

            <Route path="/enquiries" element={<EnquiryList token={token} />} />
            <Route path="/admin/keywords" element={<KeywordManager token={token} />} />
            <Route path="/admin/users" element={<AdminUsers token={token} />} />

            <Route path="/PopularProducts" element={<PopularProducts token={token} />} />
            <Route path="/PopularProductsList" element={<PopularProductsList token={token} />} />

            <Route path="/OfferProducts" element={<OfferProducts token={token} />} />
            <Route path="/OfferProductsList" element={<OfferProductsList token={token} />} />

            <Route path="/DeskDecoratives" element={<DeskDecoratives token={token} />} />
            <Route path="/DeskDecorativesList" element={<DeskDecorativesList token={token} />} />

            <Route path="/WallDecoratives" element={<WallDecoratives token={token} />} />
            <Route path="/WallDecorativesList" element={<WallDecorativesList token={token} />} />

            <Route path="/CarDecoratives" element={<CarDecoratives token={token} />} />
            <Route path="/CarDecorativesList" element={<CarDecorativesList token={token} />} />

            <Route path="/BusinessNeeds" element={<BusinessNeeds token={token} />} />
            <Route path="/BusinessNeedsList" element={<BusinessNeedsList token={token} />} />

            <Route path="/GoogleReviewAdd" element={<GoogleReviewAdd token={token} />} />
            <Route path="/GoogleReviewList" element={<GoogleReviewList token={token} />} />

            <Route path="/ShopCategoryAdd"  element={<ShopCategoryAdd  token={token} />} />
            <Route path="/ShopCategoryList" element={<ShopCategoryList token={token} />} />

            <Route path="/OfferBanner" element={<OfferBanner token={token} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
