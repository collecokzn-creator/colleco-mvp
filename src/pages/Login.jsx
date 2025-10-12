
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

function Login() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useUser();

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user:" + email));
    if (!user || user.password !== password) {
      setError("Invalid email or password.");
      return;
    }
    setSuccess("Login successful! Welcome, " + user.name + ".");
    setUser(user); // context handles localStorage
    setTimeout(() => navigate("/profile"), 600); // Redirect after short success message
  }

  function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (localStorage.getItem("user:" + email)) {
      setError("An account with this email already exists.");
      return;
    }
    const newUser = { email, password, name: email.split("@")[0] };
    localStorage.setItem("user:" + email, JSON.stringify(newUser));
    setSuccess("Registration successful! You can now log in.");
  }

  function handleLogout() {
    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  }

  if (currentUser) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-brand-orange">Welcome, {currentUser.name}!</h2>
        <div className="bg-cream-sand p-6 border border-cream-border rounded mb-4">
          <p className="text-brand-russty mb-4">You are logged in as <span className="font-semibold">{currentUser.email}</span>.</p>
          <button
            className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-orange/90 transition"
            onClick={handleLogout}
          >Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-brand-orange">Login / Register</h2>
      <div className="flex mb-4 gap-2">
        <button
          className={`px-4 py-2 rounded font-semibold transition ${tab === "login" ? "bg-brand-orange text-white" : "bg-cream-sand text-brand-russty border border-cream-border"}`}
          onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
        >Login</button>
        <button
          className={`px-4 py-2 rounded font-semibold transition ${tab === "register" ? "bg-brand-orange text-white" : "bg-cream-sand text-brand-russty border border-cream-border"}`}
          onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
        >Register</button>
      </div>
      <form className="bg-cream-sand p-6 border border-cream-border rounded" onSubmit={tab === "login" ? handleLogin : handleRegister}>
  <label className="block mb-2 text-brand-russty font-semibold">Email</label>
        <input
          type="email"
          className="w-full mb-4 px-3 py-2 border border-cream-border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
  <label className="block mb-2 text-brand-russty font-semibold">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-3 py-2 border border-cream-border rounded pr-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-2 my-auto h-7 w-7 flex items-center justify-center rounded bg-cream border border-cream-border text-brand-russty hover:bg-cream-sand"
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {error && <div className="mb-3 text-red-600 font-semibold">{error}</div>}
        {success && <div className="mb-3 text-green-700 font-semibold">{success}</div>}
        <button
          type="submit"
          className="w-full px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-orange/90 transition"
        >{tab === "login" ? "Login" : "Register"}</button>
      </form>
    </div>
  );
}

export default Login;

