# ShopZone — E-Commerce Storefront & Admin Dashboard

A production-grade E-Commerce platform built with React, TypeScript, TanStack Query, React Hook Form, Zod, and Tailwind CSS. Features a public storefront, a protected shopper experience, and a secure admin dashboard with full inventory and order management.

---

## Features

- **Role-Based Access Control (RBAC)** — Admin and User roles with protected routes
- **Public Storefront** — Browse and view products without logging in
- **Shopping Cart** — Add, update, and remove items with persistent state
- **Multi-Step Checkout** — Shipping → Payment → Order Review with strict validation
- **Admin Dashboard** — Manage products, orders, and categories
- **TanStack Query** — Caching and automatic query invalidation
- **Zod + React Hook Form** — Client-side validation with real-time error feedback
- **Toast Notifications** — Success and error feedback on all actions
- **Fully Responsive** — Mobile-first design with hamburger navigation

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 19 |
| TypeScript | 5.9 |
| Axios | 1.14.0 |
| TanStack Query | Latest |
| React Hook Form | Latest |
| Zod | Latest |
| Tailwind CSS | v4 |
| React Router DOM | Latest |
| React Hot Toast | Latest |

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd my-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `my-project` root:

```env
VITE_API_URL=https://e-commas-apis-production.up.railway.app
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

---

## Admin Login Credentials

> Use these credentials to access the Admin Dashboard at `/admin`

| Field | Value |
|---|---|
| Email | `admin@admin.com` |
| Password | `admin123` |

---

## User Access

Register a new account via the `/login` page using the **Register** tab, then log in with those credentials to access the shopper experience (cart, checkout, order history).

---

## Deployment

Deployed on **Vercel / Netlify**. Ensure the following rewrite rule is configured for React Router to work on page refresh:

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** (`public/_redirects`):
```
/* /index.html 200
```

---

## API

Base URL: `https://e-commas-apis-production.up.railway.app`

| Endpoint | Access |
|---|---|
| `GET /products` | Public |
| `GET /products/:id` | Public |
| `GET /categories` | Public |
| `POST /users/register` | Public |
| `GET /cart`, `POST /cart` | User |
| `POST /orders` | User |
| `GET /orders/me` | User |
| `POST /products` | Admin |
| `PUT /products/:id` | Admin |
| `DELETE /products/:id` | Admin |
| `GET /orders` | Admin |
| `PUT /orders/:id/status` | Admin |
| `POST /categories` | Admin |
| `PATCH /categories/:id` | Admin |
| `DELETE /categories/:id` | Admin |
