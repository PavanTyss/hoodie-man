# Hoodie Man – Startup Guide

Quick guide to run the app locally and log in as each role (Super Admin, Admin, Store Manager, Delivery Agent, Customer).

---

## 1. Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** or **npm**
- **PostgreSQL** (local or hosted, e.g. Supabase)
- **Git** (optional)

---

## 2. Environment setup

Create a `.env` file in the project root (or copy from `.env.example` if present) with at least:

```env
# Required: PostgreSQL connection (used for migrations)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Optional: connection pool URL for app runtime (e.g. Supabase pooler)
# If set, the app uses this for queries; migrations still use DATABASE_URL.
DATABASE_POOL_URL="postgresql://USER:PASSWORD@HOST:6542/DATABASE?pgbouncer=true"

# Required for NextAuth (login/session)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production-make-it-random"
```

- **DATABASE_URL**: Used by Prisma for migrations and, if `DATABASE_POOL_URL` is not set, for the app.
- **DATABASE_POOL_URL**: Optional; use your provider’s pooler URL for better performance.
- **NEXTAUTH_SECRET**: Use a long random string in production (e.g. `openssl rand -base64 32`).

---

## 3. Install, database, and seed

From the project root:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (creates/updates tables)
npx prisma migrate dev

# Seed database (test users, store, products, promo codes)
npx prisma db seed
```

After seeding you should see something like:

```text
✅ Database seeded successfully!
Test logins: super@hoodie.local / SuperAdmin1! (super_admin), ...
```

---

## 4. Run the app

```bash
# Development
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 5. Login details (after seed)

These accounts are created by `npx prisma db seed`. Passwords are case-sensitive.

| Role            | Email                 | Password      | Where to go after login |
|-----------------|------------------------|---------------|--------------------------|
| **Super Admin** | `super@hoodie.local`   | `SuperAdmin1!` | **Go to Admin:** click **Admin** in the top navbar (or **My Account** → **Admin** in the sidebar), then use the admin sidebar: **Home**, **Orders**, **Products**, **Stores**, **Users**, **Audit Logs**. Full access. |
| **Admin**       | `admin@hoodie.local`   | `TestUser1!`   | [/admin](http://localhost:3000/admin) – Scoped by Super Admin (stores/categories/customers). Create stores; assign managers. |
| **Store Manager** | `manager@hoodie.local` | `TestUser1!`   | [/admin](http://localhost:3000/admin) – “Main Store” only. Products, Orders; accept orders, assign delivery. |
| **Delivery Agent** | `delivery@hoodie.local` | `TestUser1!`   | [/admin](http://localhost:3000/admin) – Orders assigned to them only; update delivery status. |
| **Customer**    | (register at `/register`) | (your choice) | [/dashboard](http://localhost:3000/dashboard) – Orders, addresses, wishlist. Shop at `/`. |

- **Super Admin**: Create admins, set roles, assign scopes (stores/categories/customers). Manage all stores and see audit logs.
- **Admin**: Create and manage stores (within scope); assign store managers and delivery agents; see scoped orders/products.
- **Store Manager**: Manage products for “Main Store”; accept orders; assign delivery agent; approve/reject cancellation.
- **Delivery Agent**: See only orders assigned to them; set status: Yet to deliver → Out for delivery → Delivered.
- **Customer**: Register at `/register`; use `/dashboard` for orders, `/dashboard/addresses` for delivery addresses, `/dashboard/profile` for profile; checkout and wishlist as usual. On product pages you can edit or delete your own reviews.

---

## 5a. How to reach the Admin panel (Super Admin / Admin / Store Manager / Delivery Agent)

1. Log in with a staff account (e.g. `super@hoodie.local` / `SuperAdmin1!`).
2. In the **top navbar** (or mobile menu), click **Admin** to open the admin dashboard.
3. Alternatively: click **My Account** → in the **left sidebar** click **Admin**.
4. On the **Admin** page you’ll see a **left sidebar** with:
   - **Home** – Staff home with KPIs and recent activity
   - **Orders** – List and manage orders (filter by status, search, sort, pagination, **Export CSV**)
   - **Products** – List and manage products (filter by store/low stock, search, sort, pagination, **Export CSV**)
   - **Stores** – List and manage stores (search, sort, pagination, **Export CSV**); open a store to edit it, manage managers, and view products (with sort, search, pagination)
   - **Users** – *(Super Admin only)* List users, create admins/managers/agents, change roles; **View** a user for details and **Delete** (with safeguards); **Scopes** to assign stores/categories/customers to admins (store list has search and sort)
   - **Audit Logs** – *(Super Admin only)* View and filter audit log entries (search, sort, pagination, **Export CSV**)
5. **Audit Logs**: Open `/admin/audit-logs`. Use filters (Action, Entity type, From/To date), search, and pagination as needed.
6. **Stores / Managers**: Click **Stores** → open a store to edit it and add or remove store managers; the store’s product list supports sort, search, and pagination.
7. **Users (Super Admin)**: From the Users list, click **View** on a user to open their detail page (view info, **Delete user** with confirmation, or **Manage scopes** for admins). Delete is not allowed for your own account or the last super admin.

---

## 6. Quick test flow

1. **Customer**: Register → add product to cart → checkout → place order.
2. **Store Manager**: Log in as `manager@hoodie.local` → Admin → Orders → open order → **Accept order** → **Assign delivery** (choose `delivery@hoodie.local`).
3. **Delivery Agent**: Log in as `delivery@hoodie.local` → Admin → Orders → open assigned order → **Out for delivery** → **Mark delivered**.
4. **Super Admin**: Log in as `super@hoodie.local` → Admin → Users (create admins, set scopes, View/Delete users); Audit Logs (see actions). Use **Export CSV** on any list page to download filtered data.

---

## 7. Useful commands

| Command | Purpose |
|--------|--------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Apply migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma db seed` | Seed test data (users, store, products, promos) |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |

---

## 8. Resetting data

**Full reset** (drops database, reapplies migrations, runs seed):

```bash
npx prisma migrate reset
```

**Refresh test data only** (keeps database and migrations; wipes orders, products, stores, etc. and recreates the four test staff users plus Main Store and sample products):

```bash
npx prisma db seed
```

The seed script does **not** remove existing customer users or delivery addresses. Use `migrate reset` when you need a completely clean database (e.g. after schema changes).

---

## 9. Troubleshooting

- **“Prisma Client not generated”** → Run `npx prisma generate`.
- **“Cannot read properties of undefined (reading 'findMany')”** → Run `npx prisma generate` and restart the dev server.
- **Login fails** → Ensure seed ran (`npx prisma db seed`) and you use the exact emails/passwords above (e.g. `SuperAdmin1!` with capital S and A).
- **Admin panel 403** → Only users with role `super_admin`, `admin`, `store_manager`, or `delivery_agent` can access `/admin`. Use one of the seeded logins or create an admin via Super Admin → Users.
