# [RV2 — Luxury Websites] (https://rv2hex.github.io/RV2_portfolio/)

A static portfolio and service site for RV2 (Rishi Vishwakarma), with three complete concept builds:

1. **Casa Atelier** — residential interiors (5 pages)
2. **MODUL** — modular kitchens (6 pages)
3. **Furniture Now!** — furniture retail (5 pages)

No build step, no framework, no server. Everything is plain HTML, CSS and JavaScript, ready for GitHub Pages.

## Local preview

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Deploy to GitHub Pages

1. Use the GitHub repository `rv2hex/RV2_portfolio`.
2. From this folder:
   ```bash
   git remote add origin https://github.com/rv2hex/RV2_portfolio.git
   git push -u origin main
   ```
3. In the repository, open **Settings → Pages**.
4. Set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**.
5. Save. The site will publish at `https://rv2hex.github.io/RV2_portfolio/`.

All internal links and preview URLs are relative, so the site works from a project subpath.

## What is included

- Warm cream / terracotta “Maison” default theme, with a live theme studio.
- Three full demo sites under `work/`, each with its own pages and local images.
- Live preview modal with page tabs, desktop/tablet/mobile switching, and “Explore every page”.
- Location-aware display currency (INR base, with indicative USD, EUR, GBP, AED, JPY, AUD, CAD and SGD conversion). Final invoices are in INR.
- 50% upfront / 50% after completion payment terms.
- Local official WhatsApp logo asset and a single WhatsApp float per page.
- `case-study/` pages, linked only by direct URL (not from the main navigation).

## Notes

- Prices are stored in INR in the HTML and converted in the browser for display only.
- FX rates are indicative and dated in `assets/js/app.js`. Update the `CURRENCIES` table when needed.
- `B2B/` is the old reference copy and is **not** part of this deployable folder.

## Asset credits

- Furniture Now! hero footage: “Minimalist room with wooden furniture” by [Mixkit](https://mixkit.co/free-stock-video/minimalist-room-with-wooden-furniture-3091/), used under the [Mixkit Free License](https://mixkit.co/license/#videoFree). The clip has been cropped, colour-graded and looped locally.
