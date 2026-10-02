# Greenhill Ordering

Small Node.js and Express web application for the Greenhill Food Co-op weekly grocery ordering case study.

## Assessment Focus

The selected assessment feature is Seed User Story 3: a member can change or cancel an order while the ordering round is open, and a closed round is read-only.

Supporting functionality includes member login, product viewing, first-order creation, SQLite persistence, unit and kilogram pricing, and role-based access.

## Requirements

- Node.js 20 or newer
- npm

## Install

```bash
npm install
```

## Configure

Create a local `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Required values:

| Variable | Purpose |
| --- | --- |
| `PORT` | Web server port |
| `SESSION_SECRET` | Express session secret |
| `DATABASE_PATH` | SQLite database path |

The local `.env` file, SQLite database files and `node_modules` are excluded from Git.

## Start

```bash
npm start
```

Open `http://localhost:3000` when using the sample port.

Demo users:

| Username | Password | Role |
| --- | --- | --- |
| `member` | `member` | Member |
| `coordinator` | `coordinator` | Coordinator |

The application creates the SQLite schema and seeds demo data when the database has no ordering round.

## User Story 3 Verification

1. Log in as `member`.
2. Add a product to create the member order.
3. Change the quantity and select Update.
4. Remove an order line.
5. Add a product again and select Cancel entire order.
6. For closed-round verification, change the round status to `closed` in the local database and reload the member page. The order is displayed read-only.

## Tests

```bash
npm test
```

The automated test suite covers unit pricing, kilogram pricing, order-line update and removal, and whole-order cancellation.

## Repository Configuration

The project uses feature branches and `main`. Application settings are loaded from environment variables through `src/config.js`. `.env.example` documents the required configuration without committing local secrets. Dependencies are reproducible from `package.json` and `package-lock.json`.
