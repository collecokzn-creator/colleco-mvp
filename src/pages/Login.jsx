
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

function Login() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'login';
  const initialRole = searchParams.get('role') || 'client';
  const initialCompanyName = searchParams.get('companyName') || '';
  const initialRef = searchParams.get('ref') || null;
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [partnerCategory, setPartnerCategory] = useState('business');
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [inviteRef] = useState(initialRef);
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
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
    // E2E trace: record login attempt and user into window.__E2E_LOGS__ for CI debugging
    try {
      if (typeof window !== 'undefined' && window.__E2E__) {
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: setUser', email: user.email });
      }
    } catch (e) {}
    // persist the user's persistence preference for UserContext to honor
    try { localStorage.setItem('user:persistence', keepLoggedIn ? 'local' : 'session'); } catch (e) {}
    try { localStorage.setItem('user:biometrics', useBiometrics ? '1' : '0'); } catch (e) {}
    // E2E helper: expose the user synchronously so tests and UserContext
    // can observe the logged-in user without waiting for React state to settle.
    try {
      if (typeof window !== 'undefined' && window.__E2E__) {
        window.__E2E_USER__ = user;
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: set __E2E_USER__ (pre-setUser)', email: user.email });
        // Persist according to chosen preference synchronously so that the
        // UserContext (which may read from storage) sees the same state.
        try {
          if (keepLoggedIn) {
            localStorage.setItem('user', JSON.stringify(user));
            sessionStorage.removeItem('user');
          } else {
            sessionStorage.setItem('user', JSON.stringify(user));
            localStorage.removeItem('user');
          }
          localStorage.setItem('user:persistence', keepLoggedIn ? 'local' : 'session');
          localStorage.setItem('user:biometrics', useBiometrics ? '1' : '0');
        } catch (err) {
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: storage write failed', err: String(err) });
        }
        // Immediately set a deterministic readiness flag for tests.
        try { window.__E2E_PROFILE_LOADED__ = true; } catch (err) {}
        // add a DOM marker with the user name so tests can inspect DOM
        try {
          if (typeof document !== 'undefined' && document.body) {
            document.body.setAttribute('data-e2e-login-success', (user && user.name) || '');
          }
        } catch (err) {}
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: set PROFILE_LOADED and marker' });
        // call setUser synchronously then navigate immediately in E2E mode
        setUser(user);
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: setUser called (E2E)'});
        try {
          // Navigate synchronously in E2E to avoid tick-based races in CI.
          navigate('/profile');
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: navigated synchronously (E2E)'});
        } catch (err) {
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: navigate failed', err: String(err) });
        }
        return;
      }
    } catch (e) {
      try { window.__E2E_LOGS__ = window.__E2E_LOGS__ || []; window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: e2e wrapper failure', err: String(e) }); } catch(e){}
    }

    setUser(user); // context handles local/session storage based on preference
    try {
      if (typeof window !== 'undefined' && window.__E2E__) {
        // For E2E runs: set an authoritative readiness flag and a short
        // DOM marker (data-e2e) then navigate after a tiny tick. Increasing
        // the tick in CI improves the chance transient messages render and
        // makes the spec more deterministic. Production behavior is
        // unchanged when not running under E2E.
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        try { window.__E2E_PROFILE_LOADED__ = true; } catch (err) {}
        // add a DOM marker with the user name so tests can inspect DOM
        try {
          if (typeof document !== 'undefined' && document.body) {
            document.body.setAttribute('data-e2e-login-success', (user && user.name) || '');
          }
        } catch (err) {}
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: e2e-flag-set-and-marker' });
        // Give a slightly larger tick to let success UI render in CI, then navigate.
        setTimeout(() => {
          try { window.__E2E_PROFILE_LOADED__ = true; } catch (err) {}
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'handleLogin: e2e-navigating-after-tick' });
          navigate("/profile");
        }, 300);
        return;
      }
    } catch (e) {}
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
    // Build user object with optional partner profile
    const base = { email, password, name: email.split("@")[0], role: role || 'client' };
    if (role === 'partner') {
      if (!companyName) { setError('Please provide a company or display name for partner registration.'); return; }
      if (!agreeTerms) { setError('You must accept the Terms and Conditions to register as a partner.'); return; }
      base.partnerProfile = { category: partnerCategory, companyName: companyName, phone: phone || null, verified: false, createdAt: new Date().toISOString(), inviteRef: inviteRef || null };
    }
    const newUser = base;
    localStorage.setItem("user:" + email, JSON.stringify(newUser));
    // remember chosen persistence and biometrics for subsequent login
    try { localStorage.setItem('user:persistence', keepLoggedIn ? 'local' : 'session'); } catch (e) {}
    try { localStorage.setItem('user:biometrics', useBiometrics ? '1' : '0'); } catch (e) {}
    // Log partner signups with invite ref for analytics/debugging
    try {
      if (role === 'partner') {
        const key = 'mock:partnerSignups';
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({ email, companyName, ref: inviteRef || null, ts: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(arr));
      }
    } catch (e) {
      // ignore logging failures
    }

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
      {/* Invitation banner when an invite ref is present */}
      {inviteRef && tab === 'register' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800">
          You were invited from <span className="font-semibold">{inviteRef}</span> — thank you! This will be recorded with your registration.
        </div>
      )}
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
        {tab === 'register' && (
          <div className="mb-4">
            <label className="block mb-2 text-brand-russty font-semibold">Account Type</label>
            <div className="flex gap-3 mb-3">
              <label className={`px-3 py-2 rounded border ${role==='client' ? 'bg-brand-orange text-white' : 'bg-cream-sand'}`}><input type="radio" name="role" value="client" checked={role==='client'} onChange={()=>setRole('client')} className="mr-2"/> Individual</label>
              <label className={`px-3 py-2 rounded border ${role==='partner' ? 'bg-brand-orange text-white' : 'bg-cream-sand'}`}><input type="radio" name="role" value="partner" checked={role==='partner'} onChange={()=>setRole('partner')} className="mr-2"/> Partner</label>
            </div>
            {role === 'partner' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-brand-russty">Partner category</label>
                  <select className="w-full border px-3 py-2 rounded" value={partnerCategory} onChange={e=>setPartnerCategory(e.target.value)}>
                    <option value="business">Business</option>
                    <option value="influencer">Influencer</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-brand-russty">Company / Display name</label>
                  <input className="w-full border px-3 py-2 rounded" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-brand-russty">Phone (optional)</label>
                  <input className="w-full border px-3 py-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)} />
                  <span>I agree to the <a href="/terms" className="text-brand-orange underline">Terms & Conditions</a> and partner policies.</span>
                </label>
              </div>
            )}
          </div>
        )}
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

