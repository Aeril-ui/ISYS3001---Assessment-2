const { getDb } = require("../src/db");
const { seedIfEmpty } = require("../src/seed");

const seeded = seedIfEmpty(getDb());
if (seeded) {
  console.log("Demo data seeded.");
} else {
  console.log("Seed skipped: database already has a round.");
}
