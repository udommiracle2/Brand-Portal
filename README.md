# Brand Portal — Seller/Brand Experience

A full-stack app for the brand/seller side of a marketplace: registration, login,
dashboard, product management, inventory, and brand profile.

- **Frontend:** React (Vite), React Router, Axios — plain CSS, no UI framework
- **Backend:** Node.js, Express, SQLite (via `better-sqlite3`), JWT auth, Multer for image uploads

```
brand-portal/
├── backend/     Express API + SQLite database
└── frontend/    React app (Vite)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # edit JWT_SECRET to a long random string
npm run dev                # starts on http://localhost:4000
```

The SQLite database file (`brand_portal.sqlite`) and an `uploads/` folder for
product/logo images are created automatically on first run — no separate
database server needed.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to the backend on
port 4000, so just open **http://localhost:5173**.

## 3. Using it

1. Go to `/register` and create a brand account (name, email, password).
2. You're taken straight to the **Dashboard**, which shows total products,
   available products, out-of-stock count, and total product views.
3. **Products** — search, filter by status, edit, delete, or toggle
   availability for anything in your catalogue.
4. **Add product** — name, category, description, price, sizes, colours,
   stock, and up to 6 images.
5. **Edit product** — same form, pre-filled; you can add or remove images.
6. **Inventory** — a focused view for updating stock counts quickly, with a
   "low stock" filter (3 or fewer).
7. **Brand profile** — logo, description, location, phone, WhatsApp,
   Instagram, website.

## API overview

All routes below except `/auth/register` and `/auth/login` require an
`Authorization: Bearer <token>` header, set automatically by the frontend
after sign-in.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create a brand account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get the signed-in brand |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/products` | List products (`?search=&category=&status=`) |
| POST | `/api/products` | Create a product (multipart, field `images`) |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Update a product (multipart) |
| DELETE | `/api/products/:id` | Delete a product |
| PATCH | `/api/products/:id/stock` | Update stock only |
| PATCH | `/api/products/:id/availability` | Toggle availability |
| PATCH | `/api/products/:id/price` | Update price only |
| GET | `/api/profile` | Get brand profile |
| PUT | `/api/profile` | Update brand profile (multipart, field `logo`) |

## Notes

- Passwords are hashed with bcrypt; sessions are stateless JWTs (7-day expiry).
- Every product/profile query is scoped to the signed-in brand's `brand_id` —
  one brand can never see or edit another's data.
- Product `views` is tracked in the schema and rolled up on the dashboard;
  wire up a `POST /api/products/:id/view`-style increment from your public
  storefront (not part of this brand-side app) to make it count real traffic.
- If `better-sqlite3` fails to install (rare, usually a missing native build
  toolchain), install build tools for your OS (e.g. `xcode-select --install`
  on macOS, `build-essential` on Debian/Ubuntu) and re-run `npm install`.
