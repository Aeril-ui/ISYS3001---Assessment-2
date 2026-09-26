const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "coordinator") {
      return res.redirect("/coordinator");
    }
    return res.redirect("/member");
  }
  res.render("login", { error: null });
});

router.post("/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).render("login", { error: "Enter username and password." });
  }

  const db = getDb();
  const user = db
    .prepare(`
      SELECT id, username, password, role, member_id
      FROM users
      WHERE username = ?
    `)
    .get(username);

  if (!user || user.password !== password) {
    return res.status(401).render("login", { error: "Invalid username or password." });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    memberId: user.member_id,
  };

  if (user.role === "coordinator") {
    return res.redirect("/coordinator");
  }
  return res.redirect("/member");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
