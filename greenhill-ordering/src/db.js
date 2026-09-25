const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const config = require("./config");

const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

function ensureDatabaseDirectory() {
  const directory = path.dirname(path.resolve(config.databasePath));
  fs.mkdirSync(directory, { recursive: true });
}

function openDatabase() {
  ensureDatabaseDirectory();
  const db = new Database(config.databasePath);
  db.pragma("foreign_keys = ON");
  return db;
}

function initSchema(db) {
  db.exec(schemaSql);
}

let database;

function getDb() {
  if (!database) {
    database = openDatabase();
    initSchema(database);
  }
  return database;
}

module.exports = {
  getDb,
  initSchema,
  openDatabase,
};
