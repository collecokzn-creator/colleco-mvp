import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedCallout({
  title = 'Access required',
  description = 'This area is reserved. Please register as a partner or contact support to request access.',
  registerLabel = 'Register as partner',
  supportLabel = 'Contact Support',
  registerParams = { tab: 'register', role: 'partner', companyName: undefined }
}){
  const query = new URLSearchParams();
  if (registerParams) {
    Object.entries(registerParams).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, v); });
  }
  const registerHref = '/login?' + query.toString();

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p className="mb-4">{description}</p>
      <div className="flex gap-3 justify-center">
        <Link to={registerHref} className="px-4 py-2 bg-brand-orange text-white rounded">{registerLabel}</Link>
        <Link to="/support" className="px-4 py-2 border rounded">{supportLabel}</Link>
      </div>
      <p className="mt-4 text-sm text-gray-600">If you believe you should have access, ask your account admin to assign a partner role or request verification.</p>
    </div>
  );
}
