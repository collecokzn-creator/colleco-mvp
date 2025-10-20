import React from "react";
export default function Support() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="p-8 text-center text-brand-orange">
      <h1 className="text-2xl font-bold mb-2">Support</h1>
      <p>This is a placeholder for the Support page.</p>
    </div>
  );
}
