import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext.jsx';

export default function Profile() {
  const { user } = useUser();

  useEffect(() => {
    // Helpful explicit E2E marker for tests — set a DOM attribute and a
    // window flag so Cypress can reliably detect when the profile view is ready.
    try {
      if (typeof window !== 'undefined') {
        window.__E2E_PROFILE_LOADED__ = true;
        // Durable DOM marker: set the user's email on the body so tests
        // can assert post-login state after navigation. Use email because
        // it's stable and unique per test user.
        try {
          if (document && document.body) {
            document.body.setAttribute('data-e2e-login-success', (user && user.email) || '');
          }
        } catch (e) {}
      }
    } catch (e) {}
    // No cleanup necessary — tests read this marker and continue.
  }, []);

  return (
    <div className="p-6 max-w-3xl" data-e2e="profile-ready" data-e2e-user-email={user?.email || ''}>
      <h2 className="text-2xl font-bold mb-3 text-brand-orange">Profile</h2>
      <div className="bg-cream-sand p-4 border border-cream-border">
        {user ? (
          <>
            <p className="text-brand-russty mb-2">Welcome, <span className="font-semibold">{user.name}</span>!</p>
            <p className="text-brand-brown">You are signed in as <span className="font-semibold">{user.email}</span>.</p>
          </>
        ) : (
          <p className="text-brand-brown">User profile page placeholder.</p>
        )}
      </div>
    </div>
  );
}
