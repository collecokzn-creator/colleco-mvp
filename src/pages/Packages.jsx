import React from 'react';
import { motion } from "framer-motion";

function Packages() {
  return (
    <div className="overflow-x-hidden min-h-screen flex items-start justify-center px-4 py-6">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
      <h1 className="text-3xl font-bold">Our Packages</h1>
      <p className="mt-4 text-gray-600">
        Exciting travel packages are being curated by our AI and will be available here soon.
        Stay tuned for personalized adventures!
      </p>
      <div className="mt-8 p-8 text-center border-2 border-dashed rounded-lg text-gray-500">
        <p>Packages coming soon...</p>
      </div>
    </motion.div>
    </div>
    </div>
  );
}

export default Packages;
