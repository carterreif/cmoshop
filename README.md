# CMOShop

CMOShop is a simple affiliate storefront that highlights categories and products and routes Buy clicks through your domain to external stores (Amazon and others).

## Features
- Hero section, newsletter, brand logos
- Category tiles auto-built from products
- Product grid with search and filtering
- Outbound affiliate routing via `/go/<slug>`
- Local product images in `assets/products/` so cards always render

## Project Structure
```
index.html                # Main site
go/index.html             # Client-side redirector: /go/<slug>
assets/products/          # Product images (SVG placeholders + any JPG/PNG you add)
netlify.toml              # Redirects: /go/* -> /go/index.html?slug=:splat
```

## Local Development
You can serve this as a static site. For example:

```powershell
# Windows PowerShell
python -m http.server 8080
# Visit http://127.0.0.1:8080
```

## Managing Products
- Products are defined inline in `index.html` inside the `products` array
- Each product has: `id, name, description, price, image, category, url`
- `url` should point to `/go/index.html?slug=<your-slug>`
- Map each slug to a destination in `go/index.html` inside the `routes` object

## Netlify Deployment
This repo is zero-build. Use these settings:
- Build command: (leave empty)
- Publish directory: `/`

### Connect to Git and Deploy
1. Push to a GitHub repo with a `main` branch
2. In Netlify → Add new site → Import from Git → Select repo
3. Confirm build settings above → Deploy site

### Custom Domain (cmoshop.net)
1. Netlify → Site settings → Domain management → Add custom domain → `cmoshop.net`
2. Follow Netlify DNS instructions (CNAME for `www`, ALIAS/A for apex)
3. Enable HTTPS with Let’s Encrypt in Netlify

## Updating Links
- Amazon Associates tag is set in `go/index.html` (variable `tag`). Update it to your tag.
- For non-Amazon products, set the slug’s URL directly (e.g., your Teespring/Creator-Spring product link)

## Notes
- For any product image you want to guarantee, add a local file under `assets/products/` and point the product’s `image` to it.
