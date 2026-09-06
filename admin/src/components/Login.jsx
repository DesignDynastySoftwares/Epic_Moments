import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import "./AdminLogin.css";

const AdminLogin = ({ setToken }) => {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:4000"; // backend URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
        email,
        password,
      });

      if (data.success) {
        setToken(data.token);
        toast.success("Admin login successful");
        navigate("/list");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <div className="al-card">
        <div className="al-head">
          <div className="al-head__badge">
            <FaShieldAlt />
          </div>
          <h1>Epic Moments</h1>
          <p>Admin Dashboard Login</p>
        </div>

        <form className="al-body" onSubmit={submit}>
          <div className="al-field">
            <label htmlFor="al-email">Admin Email</label>
            <div className="al-input-wrap">
              <span className="al-input-icon">
                <FaEnvelope />
              </span>
              <input
                id="al-email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="al-field">
            <label htmlFor="al-password">Password</label>
            <div className="al-input-wrap">
              <span className="al-input-icon">
                <FaLock />
              </span>
              <input
                id="al-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="al-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="al-btn" disabled={loading}>
            {loading ? (
              "Logging in..."
            ) : (
              <>
                Login <FaArrowRight />
              </>
            )}
          </button>

          <p className="al-foot">
            <FaLock style={{ fontSize: "0.7rem" }} /> Secure admin access only
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
