import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";
import { assets } from "../assets/assets";
import { getFCMToken } from "../utils/firebase";
import {
  FaGift, FaTruck, FaLock, FaUser, FaEnvelope, FaPhone,
  FaKey, FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt, FaArrowLeft,
} from "react-icons/fa";

const Login = () => {
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // "login" | "signup" | "forgot"
  const [mode, setMode] = useState("login");
  // forgot sub-steps: "request" (enter email) | "reset" (enter OTP + new password)
  const [forgotStep, setForgotStep] = useState("request");

  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // forgot-password fields
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Save FCM token after login — non-blocking
  const saveFCM = async (authToken) => {
    try {
      const fcmToken = await getFCMToken();
      if (!fcmToken) return;
      await axios.post(
        `${backendUrl}/api/user/save-fcm`,
        { token: fcmToken },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch { /* FCM optional — ignore */ }
  };

  // ── Login / Signup submit ──
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === "signup"
        ? `${backendUrl}/api/user/register`
        : `${backendUrl}/api/user/login`;

      const payload = mode === "signup"
        ? { name, phone, email, password }
        : { email, password };

      const res = await axios.post(url, payload);

      if (res.data.success) {
        setToken(res.data.token);
        try { localStorage.setItem("token", res.data.token); } catch {}
        await saveFCM(res.data.token);
        toast.success("Welcome to Epic Moments");
        navigate("/");
      } else {
        toast.error(res.data.message || "Authentication failed");
      }
    } catch {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot: request OTP ──
  const requestOtpHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      if (res.data.success) {
        toast.success(res.data.message || "OTP sent to your email");
        setForgotStep("reset");
      } else {
        toast.error(res.data.message || "Could not send OTP");
      }
    } catch {
      toast.error("Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot: reset password ──
  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/user/reset-password`, {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Password reset successful");
        // Reset state and return to login
        setOtp("");
        setNewPassword("");
        setPassword("");
        setForgotStep("request");
        setMode("login");
      } else {
        toast.error(res.data.message || "Reset failed");
      }
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const goToForgot = () => {
    setMode("forgot");
    setForgotStep("request");
  };

  const backToLogin = () => {
    setMode("login");
    setForgotStep("request");
    setOtp("");
    setNewPassword("");
  };

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <div className="lp-page">
      <div className="lp-card">

        {/* ── LEFT PANEL ── */}
        <div className="lp-left">
          <img src={assets.logo_epicmoments} alt="Epic Moments" className="lp-logo" />

          <h1 className="lp-left__title">
            Welcome to <span>Epic Moments</span>
          </h1>
          <p className="lp-left__sub">
            Premium customised gifts — handcrafted with love &amp; delivered fast.
          </p>

          {/* Trust badges */}
          <div className="lp-trust">
            <div className="lp-trust__item">
              <span className="lp-trust__icon"><FaGift /></span>
              <div className="lp-trust__text">
                <strong>Premium Quality</strong>
                <span>Handcrafted with care</span>
              </div>
            </div>
            <div className="lp-trust__item">
              <span className="lp-trust__icon"><FaTruck /></span>
              <div className="lp-trust__text">
                <strong>Fast Delivery</strong>
                <span>Right to your doorstep</span>
              </div>
            </div>
            <div className="lp-trust__item">
              <span className="lp-trust__icon"><FaLock /></span>
              <div className="lp-trust__text">
                <strong>100% Secure</strong>
                <span>Safe &amp; encrypted payments</span>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="lp-avatars">
            <img src={assets.its_me}   alt="customer" />
            <img src={assets.siddu}    alt="customer" />
            <img src={assets.rahul}    alt="customer" />
            <img src={assets.niranjan} alt="customer" />
            <div className="lp-avatars__label">
              <strong>20,000+</strong>
              happy customers
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lp-right">

          {/* Mode toggle — hidden in forgot mode */}
          {mode !== "forgot" && (
            <div className="lp-mode-toggle">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                Log In
              </button>
              <button
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* ═══════════ LOGIN / SIGNUP ═══════════ */}
          {mode !== "forgot" && (
            <>
              <h2 className="lp-right__title">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="lp-right__sub">
                {mode === "login"
                  ? "Enter your details to continue shopping."
                  : "Join Epic Moments and start gifting smiles."}
              </p>

              <form className="lp-form" onSubmit={submitHandler}>

                {/* Name — signup only */}
                {mode === "signup" && (
                  <>
                  <div className="lp-field">
                    <label htmlFor="lp-name">Full Name</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon"><FaUser /></span>
                      <input
                        id="lp-name"
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="lp-field">
                    <label htmlFor="lp-phone">Contact Number</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon"><FaPhone /></span>
                      <input
                        id="lp-phone"
                        type="tel"
                        placeholder="Your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                  </>
                )}

                {/* Email */}
                <div className="lp-field">
                  <label htmlFor="lp-email">Email Address</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><FaEnvelope /></span>
                    <input
                      id="lp-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lp-field">
                  <label htmlFor="lp-password">Password</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><FaKey /></span>
                    <input
                      id="lp-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      className="lp-password-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                {mode === "login" && (
                  <div className="lp-form-row">
                    <label>
                      <input type="checkbox" /> Remember me
                    </label>
                    <button type="button" className="lp-forgot" onClick={goToForgot}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading ? (
                    <span className="lp-submit--loading">
                      <span className="lp-spinner" />
                      Please wait...
                    </span>
                  ) : (
                    <span className="lp-submit--content">
                      {mode === "login" ? "Log In" : "Create Account"}
                      <FaArrowRight />
                    </span>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <p className="lp-switch">
                {mode === "login" ? (
                  <>
                    New to Epic Moments?
                    <button onClick={() => setMode("signup")}>Sign up free</button>
                  </>
                ) : (
                  <>
                    Already have an account?
                    <button onClick={() => setMode("login")}>Log in</button>
                  </>
                )}
              </p>
            </>
          )}

          {/* ═══════════ FORGOT PASSWORD ═══════════ */}
          {mode === "forgot" && (
            <>
              <button type="button" className="lp-back" onClick={backToLogin}>
                <FaArrowLeft /> Back to login
              </button>

              <h2 className="lp-right__title">
                {forgotStep === "request" ? "Forgot password?" : "Reset password"}
              </h2>
              <p className="lp-right__sub">
                {forgotStep === "request"
                  ? "Enter your email and we'll send you a one-time code to reset your password."
                  : `We sent a 6-digit code to ${email || "your email"}. Enter it below with your new password.`}
              </p>

              {/* Step 1 — request OTP */}
              {forgotStep === "request" && (
                <form className="lp-form" onSubmit={requestOtpHandler}>
                  <div className="lp-field">
                    <label htmlFor="lp-forgot-email">Email Address</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon"><FaEnvelope /></span>
                      <input
                        id="lp-forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button type="submit" className="lp-submit" disabled={loading}>
                    {loading ? (
                      <span className="lp-submit--loading">
                        <span className="lp-spinner" />
                        Sending...
                      </span>
                    ) : (
                      <span className="lp-submit--content">
                        Send OTP
                        <FaArrowRight />
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2 — verify OTP + new password */}
              {forgotStep === "reset" && (
                <form className="lp-form" onSubmit={resetPasswordHandler}>
                  <div className="lp-field">
                    <label htmlFor="lp-otp">One-Time Code</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon"><FaShieldAlt /></span>
                      <input
                        id="lp-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </div>

                  <div className="lp-field">
                    <label htmlFor="lp-new-password">New Password</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon"><FaKey /></span>
                      <input
                        id="lp-new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="lp-password-toggle"
                        onClick={() => setShowNewPassword((s) => !s)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="lp-submit" disabled={loading}>
                    {loading ? (
                      <span className="lp-submit--loading">
                        <span className="lp-spinner" />
                        Resetting...
                      </span>
                    ) : (
                      <span className="lp-submit--content">
                        Reset Password
                        <FaArrowRight />
                      </span>
                    )}
                  </button>

                  <p className="lp-switch">
                    Didn't get the code?
                    <button type="button" onClick={requestOtpHandler}>Resend</button>
                  </p>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
