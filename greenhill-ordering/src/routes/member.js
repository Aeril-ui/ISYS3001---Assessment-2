const express = require("express");
const { getDb } = require("../db");
const { requireMember } = require("../middleware/auth");
const { getOpenRound } = require("../services/rounds");
const {
  addOrUpdateLine,
  getActiveOrder,
  getOrCreateOrder,
  listOrderLines,
} = require("../services/orders");
const { PricingError } = require("../pricing");

const router = express.Router();

router.use(requireMember);

function loadMemberContext(db, memberId) {
  const openRound = getOpenRound(db);
  let order = null;
  let lines = [];

  if (openRound) {
    order = getActiveOrder(db, memberId, openRound.id);
    if (order && !order.is_cancelled) {
      lines = listOrderLines(db, order.id);
    }
  }

  return { openRound, order, lines };
}

router.get("/", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const { openRound, lines } = loadMemberContext(db, memberId);

  const products = openRound
    ? db
        .prepare(`
          SELECT id, name, sell_price, sell_method
          FROM products
          WHERE is_withdrawn = 0
          ORDER BY name
        `)
        .all()
    : [];

  res.render("member/catalog", {
    user: req.session.user,
    openRound,
    products,
    lines,
    message: openRound ? null : "No round is open for ordering right now.",
    error: null,
  });
});

router.post("/order/lines", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const openRound = getOpenRound(db);

  if (!openRound) {
    return res.status(400).render("member/catalog", {
      user: req.session.user,
      openRound: null,
      products: [],
      lines: [],
      message: "No round is open for ordering right now.",
      error: "Cannot place an order while the round is closed.",
    });
  }

  const productId = Number(req.body.product_id);
  const quantity = req.body.quantity;

  try {
    const order = getOrCreateOrder(db, memberId, openRound.id);
    addOrUpdateLine(db, order.id, productId, quantity);

    return res.redirect("/member");
  } catch (err) {
    const { lines } = loadMemberContext(db, memberId);
    const products = db
      .prepare(`
        SELECT id, name, sell_price, sell_method
        FROM products
        WHERE is_withdrawn = 0
        ORDER BY name
      `)
      .all();

    const message =
      err instanceof PricingError || err instanceof Error ? err.message : "Could not save line.";

    return res.status(400).render("member/catalog", {
      user: req.session.user,
      openRound,
      products,
      lines,
      message: null,
      error: message,
    });
  }
});

module.exports = router;
