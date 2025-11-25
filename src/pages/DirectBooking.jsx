import React, { useState } from "react";

const DirectBooking = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    package: "",
    guests: 1,
    date: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Here you would call your booking API and payment integration
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold text-brand-brown mb-2">Booking Submitted!</h2>
        <p className="mb-4">Thank you for your booking. You will be redirected to payment.</p>
        {/* Simulate payment redirect */}
        <a href="/payment-success" className="btn bg-yellow-400 text-brand-brown px-4 py-2 rounded">Go to Payment</a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-brand-brown mb-4">Direct Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="package"
          value={form.package}
          onChange={handleChange}
          placeholder="e.g., 3-Day Safari Package, Beach Getaway"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          name="guests"
          value={form.guests}
          onChange={handleChange}
          min={1}
          placeholder="Number of Guests"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="w-full bg-yellow-400 text-brand-brown font-bold py-2 rounded">
          Book & Pay Now
        </button>
      </form>
    </div>
  );
};

export default DirectBooking;
