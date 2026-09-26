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

## Start

```bash
npm start
```

Open the URL for your `PORT` (default in `.env.example` is `http://localhost:3000`).
