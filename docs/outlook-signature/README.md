Outlook signature package (CollEco)

This folder explains how to generate an Outlook .htm signature package for the CollEco email signature.

What the script does

- `scripts/generate-outlook-signature.ps1` will create a signature package in `%APPDATA%\Microsoft\Signatures`.
- It writes three files:
  - `CollEco.htm` — the HTML signature used by Outlook
  - `CollEco.rtf` — a simple RTF fallback
  - `CollEco.txt` — plain-text fallback
- It also creates a `CollEco_files` folder and downloads `logo.png` and `globe.png` into it so Outlook embeds the images locally.

How to run (Windows / PowerShell)

1. Open PowerShell (preferably as your normal user, not administrator).
2. From the repo root run:

```powershell
cd .\scripts
pwsh .\generate-outlook-signature.ps1 -Name 'CollEco' \
  -LogoUrl 'https://www.travelcolleco.com/assets/logo.png' \
  -GlobeUrl 'https://www.travelcolleco.com/assets/globe.png' \
  -Email 'collecotravel@gmail.com'
```

3. The script will create the signature files in your `%APPDATA%\Microsoft\Signatures` folder. Open Outlook, go to File → Options → Mail → Signatures and select the new signature named `CollEco`.

Notes & troubleshooting

- If image downloads fail (network or blocked by policy), the HTML will fall back to referencing the remote URLs; you can re-run the script or manually download images into the `_files` folder.
- Some Outlook versions rewrite signatures; if copying doesn't appear, restart Outlook.
- If you prefer a different signature name, pass `-Name 'YourName'` to the script; the script will use that name for files and folders.
