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
  getActiveOrder,
  getOrCreateOrder,
  listOrderLines,
};
