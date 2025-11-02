import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-4xl font-bold mb-4 text-yellow-400">Access Denied</h1>
    <p className="mb-6 text-gray-400">You do not have permission to view this page.</p>
    <Link to="/" className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-400 text-black">
      Go Home
    </Link>
  </div>
);

export default Unauthorized;
