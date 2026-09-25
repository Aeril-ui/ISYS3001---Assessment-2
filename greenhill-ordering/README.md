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

## Start

```bash
npm start
```

Open the URL for your `PORT` (default in `.env.example` is `http://localhost:3000`).
