const express = require("express");
const { getDb } = require("../db");
const { requireMember } = require("../middleware/auth");
const { getOpenRound } = require("../services/rounds");
const {
  addOrUpdateLine,
  cancelOrder,
  getActiveOrder,
  getLatestMemberOrder,
  getOrCreateOrder,
  listOrderLines,
  removeLine,
  updateLineQuantity,
} = require("../services/orders");
const { PricingError } = require("../pricing");

const router = express.Router();

router.use(requireMember);

function loadMemberContext(db, memberId) {
  const openRound = getOpenRound(db);
  let order = null;
  let lines = [];
  let canEdit = false;
  let readOnlyReason = null;

  if (openRound) {
    order = getActiveOrder(db, memberId, openRound.id);

    if (order && order.is_cancelled) {
      readOnlyReason = "Your previous order for this round was cancelled. You can add products below to start a new order.";
    } else {
      canEdit = true;
      if (order) {
        lines = listOrderLines(db, order.id);
      }
    }
  } else {
    order = getLatestMemberOrder(db, memberId);

    if (order) {
      lines = listOrderLines(db, order.id);
      readOnlyReason = order.is_cancelled
        ? "The ordering round is closed. This order was cancelled."
        : "The ordering round is closed. Your order is read-only.";
    }
  }

  return {
    openRound,
    order,
    lines,
    canEdit,
    readOnlyReason,
  };
}

function renderCatalog(res, statusCode, data) {
  return res.status(statusCode).render("member/catalog", {
    user: data.user,
    openRound: data.openRound,
    order: data.order,
    products: data.products,
    lines: data.lines,
    canEdit: data.canEdit,
    readOnlyReason: data.readOnlyReason,
    message: data.message,
    error: data.error,
  });
}

function loadCatalogData(db, memberId) {
  const context = loadMemberContext(db, memberId);

  const products = context.openRound
    ? db
        .prepare(
          `
          SELECT id, name, sell_price, sell_method
          FROM products
          WHERE is_withdrawn = 0
          ORDER BY name
        `,
        )
        .all()
    : [];

  return {
    ...context,
    products,
  };
}

function assertEditable(openRound, order) {
  if (!openRound || openRound.status !== "open") {
    throw new Error("The round is not open for changes.");
  }

  if (!order || order.is_cancelled) {
    throw new Error("There is no active order to change.");
  }
}

router.get("/", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const data = loadCatalogData(db, memberId);

  return renderCatalog(res, 200, {
    user: req.session.user,
    ...data,
    message: data.openRound ? null : "No round is open for ordering right now.",
    error: null,
  });
});

router.post("/order/lines", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const openRound = getOpenRound(db);

  try {
    if (!openRound || openRound.status !== "open") {
      throw new Error("The round is not open for changes.");
    }

    const productId = Number(req.body.product_id);
    const quantity = req.body.quantity;

    const order = getOrCreateOrder(db, memberId, openRound.id);

    addOrUpdateLine(db, order.id, productId, quantity);

    return res.redirect("/member");
  } catch (err) {
    const data = loadCatalogData(db, memberId);

    const message =
      err instanceof PricingError || err instanceof Error
        ? err.message
        : "Could not save line.";

    return renderCatalog(res, 400, {
      user: req.session.user,
      ...data,
      message: data.openRound
        ? null
        : "No round is open for ordering right now.",
      error: message,
    });
  }
});

router.post("/order/lines/:lineId/update", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const openRound = getOpenRound(db);
  const lineId = Number(req.params.lineId);

  try {
    const order = getActiveOrder(db, memberId, openRound?.id);

    assertEditable(openRound, order);

    updateLineQuantity(db, lineId, memberId, req.body.quantity);

    return res.redirect("/member");
  } catch (err) {
    const data = loadCatalogData(db, memberId);

    const message =
      err instanceof PricingError || err instanceof Error
        ? err.message
        : "Could not update line.";

    return renderCatalog(res, 400, {
      user: req.session.user,
      ...data,
      message: data.openRound
        ? null
        : "No round is open for ordering right now.",
      error: message,
    });
  }
});

router.post("/order/lines/:lineId/remove", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const openRound = getOpenRound(db);
  const lineId = Number(req.params.lineId);

  try {
    const order = getActiveOrder(db, memberId, openRound?.id);

    assertEditable(openRound, order);

    removeLine(db, lineId, memberId);

    return res.redirect("/member");
  } catch (err) {
    const data = loadCatalogData(db, memberId);

    const message =
      err instanceof PricingError || err instanceof Error
        ? err.message
        : "Could not remove line.";

    return renderCatalog(res, 400, {
      user: req.session.user,
      ...data,
      message: data.openRound
        ? null
        : "No round is open for ordering right now.",
      error: message,
    });
  }
});

router.post("/order/cancel", (req, res) => {
  const db = getDb();
  const memberId = req.session.user.memberId;
  const openRound = getOpenRound(db);

  try {
    const order = getActiveOrder(db, memberId, openRound?.id);

    assertEditable(openRound, order);

    cancelOrder(db, order.id, memberId);

    return res.redirect("/member");
  } catch (err) {
    const data = loadCatalogData(db, memberId);

    const message =
      err instanceof Error ? err.message : "Could not cancel order.";

    return renderCatalog(res, 400, {
      user: req.session.user,
      ...data,
      message: data.openRound
        ? null
        : "No round is open for ordering right now.",
      error: message,
    });
  }
});

router.assertEditable = assertEditable;
module.exports = router;
