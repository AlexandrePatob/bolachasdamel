# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev      # Start development server
yarn build    # Create production build
yarn start    # Start production server
yarn lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Bolachas da Mel** is a Next.js 16 e-commerce site for artisanal cookies. It uses the App Router, TypeScript, Tailwind CSS v4, and Supabase as the backend/database. Package manager: **yarn**.

### Key directories

- `src/app/` — Pages and API routes (App Router)
  - `page.tsx` — Home page
  - `admin/` — Protected admin dashboard for order management
  - `api/` — RESTful API routes (orders, products, admin auth)
- `src/components/` — React components (all client-side with `"use client"`)
  - `admin/` — Admin-specific components (CreateOrderModal, OrderDetailsModal)
- `src/lib/` — Core utilities
  - `supabase.ts` — All Supabase queries and database functions
  - `cart.ts` — LocalStorage-based cart persistence
  - `quantityRules.ts` — Product quantity/pricing tier validation
- `src/types/` — TypeScript interfaces for database entities and cart
- `src/proxy.ts` — Protects `/admin/*` routes via cookie check (Next.js 16: `proxy.ts` replaces `middleware.ts`)

### Data flow

- Products are fetched from Supabase via API routes with 5-minute revalidation
- Cart state lives in LocalStorage (no global state library)
- Admin auth uses Supabase Auth (email/password) + HTTP-only cookie (`admin_token`)
- Orders are created client-side via `POST /api/orders`, then tracked in Supabase
- WhatsApp button triggers order notification (no payment gateway integrated)

### Database schema (Supabase/PostgreSQL)

Core tables: `products`, `product_options`, `product_quantity_rules`, `customers`, `orders`, `order_items`, `order_item_options`.

Products have quantity rules (pricing tiers) and options (chocolate types, ribbons, flavors). Orders link customers to order items, each with selected options.

### Environment variables

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Store in `.env.local` for local development (not committed).

### Path alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
