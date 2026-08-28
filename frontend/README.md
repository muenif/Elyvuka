# ELYVUKA Frontend (Next.js)

Pages Router, connected to your Express/MongoDB backend via the `services/` API layer.

## Setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and point it at your backend:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
(when the backend is deployed, change this to its live Render URL + `/api`)

```bash
pnpm install
pnpm run dev
```

Visit `http://localhost:3000`. Your backend must be running for pages to load real data — otherwise you'll see "Couldn't load products" style error states (that's the app working correctly, just with nothing to talk to).

## Structure

- `services/` — one file per backend resource (`authService`, `productService`, `categoryService`, `orderService`), all going through `services/api.js`, which attaches the admin JWT automatically when `auth: true` is passed.
- `context/` — `CartContext` (guest cart, submits real orders), `ToastContext` (notifications), `AdminAuthContext` (admin login/session).
- `pages/admin/` — protected by `AdminLayout`, which redirects to `/admin/login` if there's no valid session.

## First admin login

Use the same credentials you set with `pnpm run seed:admin` on the backend. Go to `/admin/login`.

## Notes

- Cart is guest-only (no customer accounts yet) — matches the pay-on-delivery, reduced-functionality plan.
- Order creation sends only `{ product, qty }` per line item — the backend re-fetches real price/stock server-side, so nothing here can be tampered with client-side.
- Product images come straight from Cloudinary URLs returned by the backend; products without images fall back to a placeholder icon.
