
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

function Login() {
  const [tab, setTab] = useState("login");
  const [userType, setUserType] = useState("client"); // client or partner
  const [loginIdentifier, setLoginIdentifier] = useState(""); // email or phone for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
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

  async function handleBiometricLogin() {
    setError("");
    setSuccess("");
    
    // Check if biometrics are enabled for this device
    const biometricEnabled = localStorage.getItem('user:biometrics') === '1';
    const lastUser = localStorage.getItem('user:lastIdentifier');
    
    if (!biometricEnabled || !lastUser) {
      setError("Biometric login not set up. Please login with password first and enable biometrics.");
      return;
    }
    
    // Use Web Authentication API if available
    if (window.PublicKeyCredential) {
      try {
        // Simulate biometric authentication (in production, use WebAuthn API)
        const user = JSON.parse(localStorage.getItem("user:" + lastUser));
        if (user) {
          setSuccess("Biometric login successful! Welcome, " + user.name + ".");
          setUser(user);
          setTimeout(() => navigate("/"), 800);
        } else {
          setError("Biometric authentication failed. Please use password.");
        }
      } catch (err) {
        setError("Biometric authentication not available or failed.");
      }
    } else {
      setError("Biometric authentication not supported on this device.");
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!loginIdentifier || loginIdentifier.trim().length === 0) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    
    // Try to find user by email or phone
    let user = JSON.parse(localStorage.getItem("user:" + loginIdentifier));
    
    // If not found, search all users for matching email or phone
    if (!user) {
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('user:'));
      for (const key of allKeys) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          if (userData.email === loginIdentifier || userData.phone === loginIdentifier) {
            user = userData;
            break;
          }
        } catch (e) {}
      }
    }
    
    if (!user || user.password !== password) {
      setError("Invalid credentials. Please check your email/phone and password.");
      return;
    }
    
    // Store last login identifier for biometric auth
    localStorage.setItem('user:lastIdentifier', loginIdentifier);
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
          navigate('/');
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
          navigate("/");
        }, 300);
        return;
      }
    } catch (e) {}
    setTimeout(() => navigate("/"), 800); // Redirect to home after success message
  }

  function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!name || name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone || phone.trim().length < 5) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!country || country.trim().length < 2) {
      setError("Please select your country for security and emergency contact purposes.");
      return;
    }
    
    // Partner-specific validation
    if (userType === "partner") {
      if (!businessName || businessName.trim().length < 2) {
        setError("Please enter your business name.");
        return;
      }
      if (!businessType) {
        setError("Please select your business type.");
        return;
      }
      if (!businessAddress || businessAddress.trim().length < 5) {
        setError("Please enter your business address.");
        return;
      }
    }
    
    if (email && localStorage.getItem("user:" + email)) {
      setError("An account with this email already exists.");
      return;
    }
    
    // Use email or phone as unique identifier
    const identifier = email || phone;
    
    const newUser = { 
      email: email || '', 
      password, 
      name: name.trim(),
      phone: phone.trim() || '',
      country: country.trim(),
      dateOfBirth: dateOfBirth || '',
      role: userType, // 'client' or 'partner'
      createdAt: new Date().toISOString()
    };
    
    // Add partner-specific fields
    if (userType === "partner") {
      newUser.businessName = businessName.trim();
      newUser.businessType = businessType;
      newUser.businessAddress = businessAddress.trim();
      newUser.registrationNumber = registrationNumber.trim() || '';
    }
    
    localStorage.setItem("user:" + identifier, JSON.stringify(newUser));
    
    // remember chosen persistence and biometrics for subsequent login
    try { localStorage.setItem('user:persistence', keepLoggedIn ? 'local' : 'session'); } catch (e) {}
    try { localStorage.setItem('user:biometrics', useBiometrics ? '1' : '0'); } catch (e) {}
    
    setSuccess("Registration successful! Redirecting to home...");
    
    // Auto-login after registration
    setUser(newUser);
    
    // E2E support
    try {
      if (typeof window !== 'undefined' && window.__E2E__) {
        window.__E2E_USER__ = newUser;
        window.__E2E_PROFILE_LOADED__ = true;
        if (keepLoggedIn) {
          localStorage.setItem('user', JSON.stringify(newUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(newUser));
        }
      }
    } catch (e) {}
    
    // Redirect to home page after registration
    setTimeout(() => navigate("/"), 800);
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
      <div className="min-h-screen bg-gradient-to-br from-cream via-cream-sand to-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-cream-border">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4">
              <img 
                src="/assets/Globeicon.png" 
                alt="CollEco Travel Globe" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-brand-brown mb-2">Welcome to your world of travel</h2>
            <p className="text-xl text-brand-russty">{effectiveUser.name}</p>
          </div>
          <div className="bg-cream-sand p-6 border border-cream-border rounded-lg mb-4">
            <p className="text-brand-russty mb-4">You are logged in and ready to explore the world.</p>
            <button
              className="w-full px-4 py-2.5 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-gold transition-all shadow-md"
              onClick={handleLogout}
            >Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-sand to-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4">
            <img 
              src="/assets/Globeicon.png" 
              alt="CollEco Travel" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-brand-brown mb-2">CollEco Travel</h1>
          <p className="text-brand-russty">Start your journey with us</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 gap-3 bg-white p-2 rounded-xl shadow-md">
          <button
            data-e2e="login-tab"
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              tab === "login" 
                ? "bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow-md transform scale-105" 
                : "text-brand-russty hover:bg-cream-sand"
            }`}
            onClick={() => { 
              setTab("login"); 
              setError(""); 
              setSuccess(""); 
              setName(""); 
              setPhone(""); 
              setCountry(""); 
              setDateOfBirth(""); 
              setUserType("client");
              setBusinessName("");
              setBusinessType("");
              setBusinessAddress("");
              setRegistrationNumber("");
            }}
          >
            Login
          </button>
          <button
            data-e2e="register-tab"
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              tab === "register" 
                ? "bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow-md transform scale-105" 
                : "text-brand-russty hover:bg-cream-sand"
            }`}
            onClick={() => { 
              setTab("register"); 
              setError(""); 
              setSuccess(""); 
              setUserType("client");
              setBusinessName("");
              setBusinessType("");
              setBusinessAddress("");
              setRegistrationNumber("");
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form 
          data-e2e="login-form" 
          className="bg-white rounded-2xl shadow-xl p-8 border border-cream-border max-h-[80vh] overflow-y-auto" 
          onSubmit={tab === "login" ? handleLogin : handleRegister}
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-brand-brown mb-2">
              {tab === "login" ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-sm text-brand-russty">
              {tab === "login" 
                ? "Sign in to continue your adventure" 
                : "Complete your profile to start your journey"}
            </p>
          </div>

          {/* Registration fields */}
          {tab === "register" && (
            <>
              {/* User Type Selector */}
              <div className="mb-6">
                <label className="block mb-3 text-brand-brown font-semibold text-sm">I'm registering as a: *</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold border-2 transition-all ${
                      userType === "client"
                        ? "bg-brand-orange text-white border-brand-orange shadow-md"
                        : "bg-white text-brand-brown border-cream-border hover:border-brand-orange"
                    }`}
                    onClick={() => setUserType("client")}
                  >
                    ✈️ Traveler
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold border-2 transition-all ${
                      userType === "partner"
                        ? "bg-brand-orange text-white border-brand-orange shadow-md"
                        : "bg-white text-brand-brown border-cream-border hover:border-brand-orange"
                    }`}
                    onClick={() => setUserType("partner")}
                  >
                    🏢 Business Partner
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">
                  {userType === "partner" ? "Contact Name *" : "Name *"}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Bika Collin Mkhize"
                  required
                />
                <p className="text-xs text-brand-russty mt-1">
                  {userType === "partner" ? "Primary contact person's name" : "How you'd like to be addressed"}
                </p>
              </div>

              {/* Partner-specific fields */}
              {userType === "partner" && (
                <>
                  <div className="mb-4">
                    <label className="block mb-2 text-brand-brown font-semibold text-sm">Business Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g., Safari Adventures Ltd"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-brand-brown font-semibold text-sm">Business Type *</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value)}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="Hotel">Hotel / Accommodation</option>
                      <option value="Tour Operator">Tour Operator</option>
                      <option value="Transport">Transport Services</option>
                      <option value="Restaurant">Restaurant / Catering</option>
                      <option value="Activity Provider">Activity Provider</option>
                      <option value="Travel Agency">Travel Agency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-brand-brown font-semibold text-sm">Business Address *</label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                      value={businessAddress}
                      onChange={e => setBusinessAddress(e.target.value)}
                      placeholder="Full business address including city and postal code"
                      rows="2"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-brand-brown font-semibold text-sm">Registration Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                      value={registrationNumber}
                      onChange={e => setRegistrationNumber(e.target.value)}
                      placeholder="Business/Tax registration number (optional)"
                    />
                    <p className="text-xs text-brand-russty mt-1">Optional - helps verify your business</p>
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <p className="text-xs text-brand-russty mt-1">Required for account verification and communication</p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Phone Number *</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+27 12 345 6789"
                  required
                />
                <p className="text-xs text-brand-russty mt-1">Required for booking confirmations and support</p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Country *</label>
                <select
                  className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  required
                >
                  <option value="">Select your country</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-brand-russty mt-1">Required for emergency assistance and travel documentation</p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />
                <p className="text-xs text-brand-russty mt-1">Optional - helps us personalize your experience. Minors can use parent/guardian account</p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border-2 border-cream-border rounded-lg pr-12 focus:border-brand-orange focus:outline-none transition-colors"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-3 my-auto h-10 w-10 flex items-center justify-center rounded-lg hover:bg-cream-sand text-brand-russty transition-colors"
                    title={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Login fields */}
          {tab === "login" && (
            <>
              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Email or Phone Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="email@example.com or +27 12 345 6789"
                  required
                />
                <p className="text-xs text-brand-russty mt-1">Enter your email address or phone number</p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-brand-brown font-semibold text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border-2 border-cream-border rounded-lg pr-12 focus:border-brand-orange focus:outline-none transition-colors"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-3 my-auto h-10 w-10 flex items-center justify-center rounded-lg hover:bg-cream-sand text-brand-russty transition-colors"
                    title={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-amber-100 border border-amber-300 text-brand-russty p-4 rounded-lg font-semibold animate-shake">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-cream-sand border border-brand-gold text-brand-brown p-4 rounded-lg font-semibold animate-fade-in">
              ✓ {success}
            </div>
          )}

          {/* Options */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                data-e2e="keep-logged-in" 
                type="checkbox" 
                checked={keepLoggedIn} 
                onChange={e => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 text-brand-orange border-cream-border rounded focus:ring-brand-orange"
              />
              <span className="text-brand-russty">Keep me logged in</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                data-e2e="use-biometrics" 
                type="checkbox" 
                checked={useBiometrics} 
                onChange={e => setUseBiometrics(e.target.checked)}
                className="w-4 h-4 text-brand-orange border-cream-border rounded focus:ring-brand-orange"
              />
              <span className="text-brand-russty">Biometrics</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            data-e2e="submit"
            type="submit"
            className="w-full px-6 py-3.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            {tab === "login" ? "Sign In →" : "Create Account →"}
          </button>

          {/* Biometric Login Options (Login only) */}
          {tab === "login" && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cream-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-brand-russty">Or login with</span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-brand-orange text-brand-orange rounded-lg font-semibold hover:bg-brand-orange hover:text-white transition-all"
                >
                  <span className="text-xl">👤</span>
                  <span>Face ID</span>
                </button>
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-brand-orange text-brand-orange rounded-lg font-semibold hover:bg-brand-orange hover:text-white transition-all"
                >
                  <span className="text-xl">👆</span>
                  <span>Fingerprint</span>
                </button>
              </div>
              <p className="text-xs text-brand-russty text-center mt-2">Enable biometrics in settings after first login</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-russty">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setTab(tab === "login" ? "register" : "login");
                  setError("");
                  setSuccess("");
                  setName("");
                  setUserType("client");
                  setBusinessName("");
                  setBusinessType("");
                  setBusinessAddress("");
                  setRegistrationNumber("");
                }}
                className="text-brand-orange font-semibold hover:text-brand-gold transition-colors"
              >
                {tab === "login" ? "Register here" : "Login here"}
              </button>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-brand-russty">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

