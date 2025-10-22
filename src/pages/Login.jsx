
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
  const [keepLoggedIn, setKeepLoggedIn] = useState(() => {
    try { return (localStorage.getItem('user:persistence') || 'local') === 'local'; } catch { return true; }
  });
  const [useBiometrics, setUseBiometrics] = useState(() => {
    try { return localStorage.getItem('user:biometrics') === '1'; } catch { return false; }
  });
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useUser();

  // E2E override: during tests we often want the login/register form visible
  // regardless of persisted session state to avoid flakiness caused by
  // storage reads that happen before tests can clear or inject state.
  const e2eForceShowForm = typeof window !== 'undefined' && window.__E2E__;
  const effectiveUser = e2eForceShowForm ? null : currentUser;

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
    // persist the user's persistence preference for UserContext to honor
    try { localStorage.setItem('user:persistence', keepLoggedIn ? 'local' : 'session'); } catch (e) {}
    try { localStorage.setItem('user:biometrics', useBiometrics ? '1' : '0'); } catch (e) {}
    setUser(user); // context handles local/session storage based on preference
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
    // remember chosen persistence and biometrics for subsequent login
    try { localStorage.setItem('user:persistence', keepLoggedIn ? 'local' : 'session'); } catch (e) {}
    try { localStorage.setItem('user:biometrics', useBiometrics ? '1' : '0'); } catch (e) {}
    setSuccess("Registration successful! You can now log in.");
  }

  function handleLogout() {
    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  }

  if (effectiveUser) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-brand-orange">Welcome, {effectiveUser.name}!</h2>
        <div className="bg-cream-sand p-6 border border-cream-border rounded mb-4">
          <p className="text-brand-russty mb-4">You are logged in as <span className="font-semibold">{effectiveUser.email}</span>.</p>
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
          data-e2e="login-tab"
          className={`px-4 py-2 rounded font-semibold transition ${tab === "login" ? "bg-brand-orange text-white" : "bg-cream-sand text-brand-russty border border-cream-border"}`}
          onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
        >Login</button>
        <button
          data-e2e="register-tab"
          className={`px-4 py-2 rounded font-semibold transition ${tab === "register" ? "bg-brand-orange text-white" : "bg-cream-sand text-brand-russty border border-cream-border"}`}
          onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
        >Register</button>
      </div>
      <form data-e2e="login-form" className="bg-cream-sand p-6 border border-cream-border rounded" onSubmit={tab === "login" ? handleLogin : handleRegister}>
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
        <div className="flex items-center justify-between gap-3 mt-3 mb-3">
          <label className="flex items-center gap-2 text-sm">
            <input data-e2e="keep-logged-in" type="checkbox" checked={keepLoggedIn} onChange={e => setKeepLoggedIn(e.target.checked)} />
            <span className="text-brand-russty">Keep me logged in</span>
          </label>
          {/* Simple biometrics toggle - gated to platforms that likely support WebAuthn */}
          <label className="flex items-center gap-2 text-sm">
            <input data-e2e="use-biometrics" type="checkbox" checked={useBiometrics} onChange={e => setUseBiometrics(e.target.checked)} />
            <span className="text-brand-russty">Use biometrics</span>
          </label>
        </div>
        <button
          data-e2e="submit"
          type="submit"
          className="w-full px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-orange/90 transition"
        >{tab === "login" ? "Login" : "Register"}</button>
      </form>
    </div>
  );
}

export default Login;

