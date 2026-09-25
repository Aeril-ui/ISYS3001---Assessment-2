require("dotenv").config();

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || String(value).trim() === "") {
    fail(
      `missing required environment variable ${name} (set it in the shell or copy .env.example to .env)`
    );
  }
  return String(value).trim();
}

const portRaw = requireEnv("PORT");
const port = Number(portRaw);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  fail(`PORT must be an integer from 1 to 65535, got "${portRaw}"`);
}

module.exports = {
  port,
  sessionSecret: requireEnv("SESSION_SECRET"),
  databasePath: requireEnv("DATABASE_PATH"),
};
