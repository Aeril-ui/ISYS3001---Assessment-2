const { buildOrderLine, PricingError } = require("../pricing");

function getActiveOrder(db, memberId, roundId) {
  return db
    .prepare(`
      SELECT id, member_id, round_id, is_cancelled
      FROM orders
      WHERE member_id = ? AND round_id = ?
    `)
    .get(memberId, roundId);
}

function getOrCreateOrder(db, memberId, roundId) {
  const existing = getActiveOrder(db, memberId, roundId);
  if (existing) {
    if (existing.is_cancelled) {
      throw new Error("This order was cancelled.");
    }
    return existing;
  }

  const result = db
    .prepare(`
      INSERT INTO orders (member_id, round_id, is_cancelled)
      VALUES (?, ?, 0)
    `)
    .run(memberId, roundId);

  return getActiveOrder(db, memberId, roundId) || {
    id: result.lastInsertRowid,
    member_id: memberId,
    round_id: roundId,
    is_cancelled: 0,
  };
}

function listOrderLines(db, orderId) {
  return db
    .prepare(`
      SELECT
        ol.id,
        ol.quantity,
        ol.unit_price,
        p.name AS product_name,
        p.sell_method
      FROM order_lines ol
      JOIN products p ON p.id = ol.product_id
      WHERE ol.order_id = ?
      ORDER BY p.name
    `)
    .all(orderId);
}

function getOrderForMember(db, orderId, memberId) {
  return db
    .prepare(`
      SELECT id, member_id, round_id, is_cancelled
      FROM orders
      WHERE id = ? AND member_id = ?
    `)
    .get(orderId, memberId);
}

function getLatestMemberOrder(db, memberId) {
  return db
    .prepare(`
      SELECT o.id, o.member_id, o.round_id, o.is_cancelled, r.status AS round_status
      FROM orders o
      JOIN rounds r ON r.id = o.round_id
      WHERE o.member_id = ?
      ORDER BY o.round_id DESC
      LIMIT 1
    `)
    .get(memberId);
}

function getOrderLineForMember(db, lineId, memberId) {
  return db
    .prepare(`
      SELECT
        ol.id,
        ol.order_id,
        ol.product_id,
        ol.quantity,
        ol.unit_price,
        o.member_id,
        o.round_id,
        o.is_cancelled
      FROM order_lines ol
      JOIN orders o ON o.id = ol.order_id
      WHERE ol.id = ? AND o.member_id = ?
    `)
    .get(lineId, memberId);
}

function removeLine(db, lineId, memberId) {
  const line = getOrderLineForMember(db, lineId, memberId);
  if (!line) {
    throw new PricingError("Line not found.");
  }
  db.prepare("DELETE FROM order_lines WHERE id = ?").run(lineId);
}

function updateLineQuantity(db, lineId, memberId, quantity) {
  const line = getOrderLineForMember(db, lineId, memberId);
  if (!line) {
    throw new PricingError("Line not found.");
  }

  const product = db
    .prepare(`
      SELECT id, name, sell_price, sell_method, is_withdrawn
      FROM products
      WHERE id = ?
    `)
    .get(line.product_id);

  const built = buildOrderLine(product, quantity);

  db.prepare(`
    UPDATE order_lines
    SET quantity = @quantity, unit_price = @unit_price
    WHERE id = @id
  `).run({
    id: lineId,
    quantity: built.quantity,
    unit_price: built.unit_price,
  });

  return built;
}

function cancelOrder(db, orderId, memberId) {
  const order = getOrderForMember(db, orderId, memberId);
  if (!order) {
    throw new Error("Order not found.");
  }
  if (order.is_cancelled) {
    return order;
  }

  db.prepare(`
    UPDATE orders
    SET is_cancelled = 1
    WHERE id = ?
  `).run(orderId);

  db.prepare("DELETE FROM order_lines WHERE order_id = ?").run(orderId);

  return getOrderForMember(db, orderId, memberId);
}

function addOrUpdateLine(db, orderId, productId, quantity) {
  const product = db
    .prepare(`
      SELECT id, name, sell_price, sell_method, is_withdrawn
      FROM products
      WHERE id = ?
    `)
    .get(productId);

  if (!product) {
    throw new PricingError("Product not found.");
  }

  const line = buildOrderLine(product, quantity);

  db.prepare(`
    INSERT INTO order_lines (order_id, product_id, quantity, unit_price)
    VALUES (@order_id, @product_id, @quantity, @unit_price)
    ON CONFLICT(order_id, product_id) DO UPDATE SET
      quantity = excluded.quantity,
      unit_price = excluded.unit_price
  `).run({
    order_id: orderId,
    product_id: productId,
    quantity: line.quantity,
    unit_price: line.unit_price,
  });

  return line;
}

module.exports = {
  addOrUpdateLine,
  cancelOrder,
  getActiveOrder,
  getLatestMemberOrder,
  getOrderForMember,
  getOrCreateOrder,
  listOrderLines,
  removeLine,
  updateLineQuantity,
};
