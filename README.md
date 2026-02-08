# Bisum (Structured) – GitHub Pages Ready

This project was re-structured to make **header + footer + shared overlays (mobile menu/cart/modals)** reusable and easy to change.

## What changed

- ✅ **Single CSS:** `assets/css/main.css`
- ✅ **Single JS:** `assets/js/app.js`
- ✅ **Dynamic Header / Footer / Overlays:** loaded once from:
  - `partials/header.html`
  - `partials/footer.html`
  - `partials/overlays.html`
- ✅ **Config-driven:** edit `site.config.json` to change:
  - Site name, logo
  - Navigation menu
  - Theme CSS variables (colors, etc.)
- ✅ **No broken links:** pages that were missing in the template are now added as **redirect** or **“Coming soon”** stubs so GitHub Pages won't show *Page Not Found* for those template links.

## Quick edit guide (most common)

### 1) Change menu / logo / colors
Edit: `site.config.json`

- `nav`: update menu items
- `logo.src` / `logo.alt`
- `theme.vars`: override any CSS variable like `primary-color`

### 2) Change header/footer layout (HTML)
Edit:
- `partials/header.html`
- `partials/footer.html`
- `partials/overlays.html`

> Placeholders used in partials:
- `{{HOME_URL}}`
- `{{LOGO_SRC}}`
- `{{LOGO_ALT}}`
- `{{NAV_ITEMS}}`
- `{{MOBILE_NAV_ITEMS}}`

## Deploy on GitHub Pages

1. Push this folder to a GitHub repository (root of the repo).
2. GitHub → **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` (or `master`) / folder: `/ (root)`

### Custom domain
In GitHub → Settings → Pages → Custom domain:
- Enter your domain (example: `www.yourdomain.com`)
- GitHub will suggest DNS records (CNAME/A records). Add them in your DNS provider.
- Optional: Enable **Enforce HTTPS** after DNS is working.

## Notes
- GitHub Pages is **case-sensitive**. Keep filenames exactly as they are in the repo.
- `404.html` is present at root and will be used by GitHub Pages automatically.

## Base URL
This site uses `<base href="/">` for reliable asset paths on a custom domain.
- If you deploy under `username.github.io/REPO_NAME/` (without a custom domain), change it to: `<base href="/REPO_NAME/">` in all pages.


## Pages included
- index.html
- shop.html
- product-details.html
- about-us.html
- faq.html
- contact.html
- login.html
- 404.html
