Deployment notes for GitHub Pages

- If you host the site on GitHub Pages under a repository subpath (https://<org>.github.io/<repo>/), set the build env var `VITE_BASE_PATH=/<repo>/` before running `npm run build`. This ensures assets are emitted with the correct base.
- Example (Windows PowerShell):

```powershell
$env:VITE_BASE_PATH = '/<repo>/'
npm run build
``` 

- If you prefer to avoid changing hosting, the app defaults to hash routing in production (so navigation will work even without server rewrites).
- For Netlify, the `public/_redirects` file included in the repo maps navigation requests to `index.html` so SPA deep links work.
- For GitHub Pages, you can add a small 404 -> index.html recovery script; index.html already contains a sessionStorage based redirect helper that recovers GitHub Pages 404 redirects if you set it to store the intended URL before redirecting.

