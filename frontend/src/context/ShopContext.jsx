import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("favorites") || "[]"); }
    catch { return []; }
  });

  // ❤️ Favorites — persist to localStorage automatically
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (item) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f._id === item._id);
      if (exists) {
        toast.info("Removed from favorites");
        return prev.filter((f) => f._id !== item._id);
      } else {
        toast.success("Added to favorites ❤️");
        return [...prev, item];
      }
    });
  };

  const isFavorite = (id) => favorites.some((f) => f._id === id);
  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem("token");
      if (!saved) return "";
      // Check expiry without network call
      const payload = JSON.parse(atob(saved.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return "";
      }
      return saved;
    } catch { return ""; }
  });
  const [slides, setSlides] = useState([]);
  const [catagere, setCatagere] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [deskDecoratives, setDeskDecorative] = useState([]);
  const [wallDecoratives, setWallDecoratives] = useState([]);
  const [carDecoratives, setCarDecoratives] = useState([]);
  const [businessNeeds, setBusinessNeeds] = useState([]);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [shopCategories, setShopCategories] = useState([]);
  const [offerBanner, setOfferBanner] = useState(null);

  const navigate = useNavigate();

  // 🔒 Global 401 interceptor — auto logout on expired/invalid token
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const code = error.response?.data?.code;
          if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") {
            // silently clear token — user needs to re-login
            setToken("");
            try { localStorage.removeItem("token"); } catch {}
            setCartItems({});
            toast.error("Session expired. Please login again.");
            navigate("/login");
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  // 🔁 Generic fetch function
  const fetchData = async (url, setter, key = null) => {
    try {
      const res = await axios.get(url);
      if (res.data.success) {
        const dataArray = key ? res.data[key] : res.data.products || res.data.slides || res.data.data || [];
        if (Array.isArray(dataArray)) setter([...dataArray].reverse());
        else setter([]);
      } else {
        setter([]);
      }
    } catch (err) {
      console.error(err);
      setter([]);
    }
  };

  // 🛒 Cart Functions
  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Select Product Size");
    const cartData = structuredClone(cartItems);
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(`${backendUrl}/api/cart/add`, { itemId, size }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        if (err.response?.status !== 401) toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(`${backendUrl}/api/cart/update`, { itemId, size, quantity }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        if (err.response?.status !== 401) toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  const getCartCount = () => Object.values(cartItems).reduce((acc, sizes) => {
    return acc + Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
  }, 0);

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find(p => p._id === itemId);
      if (!itemInfo) continue;
      for (const size in cartItems[itemId]) {
        totalAmount += itemInfo.price * cartItems[itemId][size];
      }
    }
    return totalAmount;
  };

  const getUserCart = async (userToken) => {
    try {
      const res = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      if (res.data.success) setCartItems(res.data.cartData);
    } catch (err) {
      // 401 handled by global interceptor — don't show a toast here
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  // 🔁 Fetch data on mount — split into two waves so the initial render
  // isn't blocked by network requests for content that's further down the page.
  useEffect(() => {
    // Wave 1 — above-the-fold content (hero, best sellers, categories, banner)
    fetchData(`${backendUrl}/api/product/list`, setProducts);
    fetchData(`${backendUrl}/api/popular/list`, setPopularProducts, "popularProducts");
    fetchData(`${backendUrl}/api/offer/list`, setOfferProducts);
    fetchData(`${backendUrl}/api/shopcategory/list`, setShopCategories, "categories");
    fetchData(`${backendUrl}/api/slides/list`, setSlides);

    // Offer banner — single object (not an array)
    (async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/offerbanner/get`);
        if (res.data.success && res.data.banner) setOfferBanner(res.data.banner);
      } catch (err) {
        console.error(err);
      }
    })();

    // Wave 2 — below-the-fold content, deferred until the browser is idle
    // so it doesn't compete with the first paint / above-the-fold data.
    const loadDeferred = () => {
      fetchData(`${backendUrl}/api/deskdecoratives/list`, setDeskDecorative);
      fetchData(`${backendUrl}/api/walldecoratives/list`, setWallDecoratives);
      fetchData(`${backendUrl}/api/cardecoratives/list`, setCarDecoratives);
      fetchData(`${backendUrl}/api/businessneeds/list`, setBusinessNeeds);
      fetchData(`${backendUrl}/api/googlereviews/list`, setGoogleReviews);
      fetchData(`${backendUrl}/api/catagere/list`, setCatagere);
      fetchData(`${backendUrl}/api/keyword`, setKeywords);
    };

    let idleId;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(loadDeferred, { timeout: 2000 });
    } else {
      idleId = setTimeout(loadDeferred, 800);
    }

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window && idleId) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, []);

  // 🔁 Token-based cart fetch — validate token before using
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) return;

      // Quick JWT expiry check without a network call
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        const isExpired = payload.exp && payload.exp * 1000 < Date.now();
        if (isExpired) {
          // Token is expired — clear it silently
          try { localStorage.removeItem("token"); } catch {}
          return;
        }
      } catch {
        // Malformed token — clear it
        try { localStorage.removeItem("token"); } catch {}
        return;
      }

      setToken(savedToken);
      getUserCart(savedToken);
    } catch {
      // localStorage blocked by browser tracking prevention — user stays logged out
    }
  }, []);

  return (
    <ShopContext.Provider
      value={{
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        setCartItems,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        token,
        setToken,
        slides,
        catagere,
        keywords,
        popularProducts,
        offerProducts,
        deskDecoratives,
        wallDecoratives,
        carDecoratives,
        businessNeeds,
        googleReviews,
        shopCategories,
        offerBanner,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
