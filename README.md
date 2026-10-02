# Greenhill Food Co-op — Ordering System (ISYS3001 Assessment 2)

Practical software development project demonstrating configuration management and procurement planning for **Greenhill Food Co-op**.

## Selected User Story
**User Story #3 — Change or Cancel an Order**
- A member can change order quantities while the ordering round is open.
- A member can remove order items while the round is open.
- A member can cancel the entire order while the round is open.
- Once the ordering round is closed, the existing order becomes read-only (viewable but cannot be modified).
- Supporting features include member login, product viewing, initial order creation, unit and kilogram pricing, and role-based access.

## Repository Structure

```text
.
├── .gitignore                      # Root ignore file (.env, node_modules, sqlite files)
├── README.md                       # Project and configuration overview
└── greenhill-ordering/             # Core web application directory
    ├── .env.example                # Sample environment configuration template
    ├── .gitignore                  # Local application ignore rules
    ├── package.json                # Project dependencies and npm scripts
    ├── package-lock.json           # Deterministic dependency tree
    ├── README.md                   # Application setup and testing instructions
    ├── data/                       # Local SQLite runtime storage (git-ignored)
    ├── scripts/                    # Database seeding scripts
    ├── src/                        # Express application code, routes, and services
    │   ├── config.js               # Centralized environment variable validation
    │   ├── db.js                   # SQLite database connection and migrations
    │   ├── server.js               # Express HTTP server entry point
    │   ├── pricing.js              # Unit and kilogram pricing calculation engine
    │   ├── middleware/             # Role and session authentication guards
    │   ├── routes/                 # Express route controllers (auth, member, coordinator)
    │   └── services/               # Database query services (orders, rounds)
    ├── test/                       # Node.js built-in automated test suite
    │   ├── pricing.test.js         # Automated tests for pricing and constraints
    │   └── us3.test.js             # Automated tests for User Story #3
    └── views/                      # EJS server-rendered templates
```

## Quick Start Guide

### Prerequisites
- Node.js (version 20 or newer recommended)
- npm

### Installation & Execution
```bash
# 1. Navigate to the application directory
cd greenhill-ordering

# 2. Install reproducible dependencies
npm install

# 3. Configure local environment variables
cp .env.example .env

# 4. Run automated tests
npm test

# 5. Start the web application
npm start
```

Open `http://localhost:3000` in your web browser.

### Demo Credentials (Development Only)
- **Member:** Username `member` / Password `member`
- **Coordinator:** Username `coordinator` / Password `coordinator`

## Configuration Management Highlights
- **Version Control Strategy:** Git feature branches (`feature/*`) merged via Pull Requests into `main`.
- **Environment Management:** Environment-specific settings (`PORT`, `SESSION_SECRET`, `DATABASE_PATH`) managed via `.env` and documented via `.env.example`.
- **Artifact Protection:** Sensitive credentials, local runtime databases (`*.sqlite`), and `node_modules/` are strictly excluded via `.gitignore`.
