# Greenhill ordering

Small Node and Express app for the Greenhill Food Co-op weekly grocery orders.

## Prerequisites

- Node.js 20 or newer

## Install

From this folder:

```bash
npm install
```

## Configure

Copy the sample file and edit values for your machine:

```bash
cp .env.example .env
```

Required variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (e.g. `3000`) |
| `SESSION_SECRET` | Secret for sessions (login in a later part) |
| `DATABASE_PATH` | Path to the SQLite file |

You can set the same variables in your shell instead of using a `.env` file. The app loads `.env` automatically when it exists. `.env` is not committed to Git.

If a variable is missing or `PORT` is invalid, the app prints an error and exits.

## Database

On startup the app creates the SQLite file at `DATABASE_PATH` (if needed), applies `src/schema.sql`, and seeds demo data **once** when there are no rounds yet.

Demo logins (plain text, for local development only):

| Username | Password | Role |
| --- | --- | --- |
| `member` | `member` | member (linked to sample household GH-101) |
| `coordinator` | `coordinator` | coordinator |

Seed includes one **open** round, four sample products (unit and kilogram), two members, and the users above. To re-seed from scratch, delete the SQLite file and run `npm start` or `npm run seed`.

## Pricing

`src/pricing.js` calculates order line totals:

- **Unit** products: whole-number quantity × sell price.
- **Kilogram** products: decimal kilograms × price per kg (e.g. `0.25` for 250 g).

When a line is saved, the product’s current sell price is copied to `order_lines.unit_price` so later product edits do not change past orders.

Run pricing tests:

```bash
npm test
```

## Member ordering (Part 7)

After `npm start`, open `http://localhost:3000` (or your `PORT`).

- **Log in** with demo users above.
- **Members** see the product catalog for the open round, or a message when no round is open. Withdrawn products are hidden.
- **Members** add lines to their order; lines persist for that member and round. Ordering is blocked when the round is not open.
- **Coordinators** go to `/coordinator` (placeholder until Part 9). Members get **403** on coordinator routes.

## Edit and cancel (Part 8)

While the round is **open**, members can **update** quantity, **remove** a line, or **cancel** the whole order. When the round is **closed**, the last order is shown **read-only** (no edits). Changes apply only to the logged-in member’s order.

## Start

```bash
npm start
```

Open the URL for your `PORT` (default in `.env.example` is `http://localhost:3000`).
