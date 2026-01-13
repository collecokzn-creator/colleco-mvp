# Quick Netlify Deployment Guide

## Option 1: Netlify CLI (Fastest - 2 minutes)

### Step 1: Install Netlify CLI
```powershell
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```powershell
netlify login
```
This will open your browser to authorize.

### Step 3: Deploy
```powershell
# Build the site
npm run build

# Deploy to Netlify
netlify deploy --prod
```

When prompted:
- **Create new site**: Yes
- **Site name**: colleco-mvp (or your preferred name)
- **Publish directory**: dist

Your site will be live at: `https://colleco-mvp.netlify.app` (or your custom name)

---

## Option 2: Netlify Web UI (3 minutes)

### Step 1: Go to Netlify
Visit: https://app.netlify.com/

### Step 2: Connect Repository
1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Authorize Netlify to access your repos
4. Select `collecokzn-creator/colleco-mvp`

### Step 3: Configure Build
- **Branch**: main
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: (optional for now)
  - `VITE_GOOGLE_MAPS_API_KEY`: (your key if you have one)

### Step 4: Deploy
Click "Deploy site" - will be live in 2-3 minutes!

---

## Option 3: Drag & Drop (Instant, but manual)

### Step 1: Build locally
```powershell
npm run build
```

### Step 2: Deploy
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder onto the page
3. Done! Site is live immediately

---

## After Deployment

### Your Demo Mode Features Will Work:
✅ Transfer booking with demo fallback
✅ Always navigates to checkout (no more stuck on errors)
✅ Demo booking IDs: `TRF-{timestamp}`
✅ All PDF sharing features
✅ Payment workflow

### Update Your Links:
- **Netlify URL**: `https://your-site-name.netlify.app`
- No hash routing needed (Netlify handles SPA routing)
- All features work perfectly

### Continuous Deployment:
Once connected via Option 2, every push to `main` auto-deploys in 2-3 minutes!

---

## Recommended: Use Option 2 (Netlify Web UI)
- **One-time setup**: 3 minutes
- **Auto-deploy on push**: Forever
- **Reliable infrastructure**: No queue timeouts
- **Free tier**: More than enough for your MVP
- **Custom domain support**: When you're ready

---

## Why Netlify Instead of GitHub Pages?

| Feature | GitHub Pages | Netlify |
|---------|-------------|---------|
| Deploy time | 10-30 min (when working) | 2-3 min |
| Queue issues | Yes (today's problem) | No |
| SPA routing | Requires hash mode | Native support |
| Deploy previews | No | Yes (for PRs) |
| Build logs | Hard to access | Clear UI |
| Environment vars | Workflow only | Dashboard UI |
| Reliability | ⚠️ Occasional issues | ✅ Excellent |

---

**Next Steps**: Choose Option 1 (CLI) or Option 2 (Web UI) and your demo mode will be live in minutes!
