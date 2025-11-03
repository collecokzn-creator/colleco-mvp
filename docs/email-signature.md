# CollEco Travel — Email signature

This folder contains an HTML email signature you can copy into your email client. The file `email-signature.html` is ready-to-copy and contains inline styles so it's portable across clients.

How to install

- Gmail (Web):
  1. Open Gmail Settings (⚙️) → "See all settings" → "General" tab.
  2. Scroll to "Signature" and click "Create new".
  3. Open `docs/email-signature.html` in a browser, select the rendered signature area, copy (Ctrl/Cmd+C), and paste into Gmail's signature editor.
  4. Save changes.

- Outlook (Web / OWA):
  1. Settings → View all Outlook settings → Mail → Compose and reply.
  2. Paste the copied signature HTML into the message signature box and save.

- Outlook Desktop (Windows):
  1. Open Outlook, go to File → Options → Mail → Signatures.
  2. Create a new signature and paste the HTML into the editor. If paste strips styles, create an email, insert the HTML by editing the message (Insert → HTML) then copy from the message.

- Apple Mail (macOS):
  1. Open Mail → Preferences → Signatures.
  2. Create a new signature and close preferences.
  3. Open `docs/email-signature.html` in Safari, copy the signature, then paste into the signature field. Lock the signature file in Finder if Mail rewrites it.

Accessibility & best practices

- Use descriptive alt attributes for images (done).
- Keep the HTML simple and use inline styles; some email clients strip external CSS.
- Test by sending a message to Gmail, Outlook, and mobile clients.

Plain-text fallback

Include a short plain-text version in your email client's plain-text signature field:

Bika Collin Mkhize | Managing Director
collecotravel@gmail.com | +27 73 399 4708 | www.travelcolleco.com

If you'd like, I can also generate separate signature variants (compact, mobile-first, or a vCard attachment), or export an Outlook .htm signature package. Tell me which one you want next.