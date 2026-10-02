const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  addOrUpdateLine,
  cancelOrder,
  getActiveOrder,
  getOrCreateOrder,
  listOrderLines,
  removeLine,
  updateLineQuantity,
} = require("../src/services/orders");

function createDb() {
  const state = {
    orders: [],
    lines: [],
    products: [
      {
        id: 1,
        name: "Free Range Eggs (dozen)",
        sell_price: 8,
        sell_method: "unit",
        is_withdrawn: 0,
      },
    ],
    nextOrderId: 1,
    nextLineId: 1,
  };

  return {
    state,
    prepare(sql) {
      const compact = sql.replace(/\s+/g, " ").trim();

      if (compact.includes("FROM orders") && compact.includes("WHERE member_id = ? AND round_id = ?")) {
        return {
          get(memberId, roundId) {
            return state.orders.find(
              (order) => order.member_id === memberId && order.round_id === roundId,
            );
          },
        };
      }

      if (compact.startsWith("INSERT INTO orders")) {
        return {
          run(memberId, roundId) {
            const order = {
              id: state.nextOrderId++,
              member_id: memberId,
              round_id: roundId,
              is_cancelled: 0,
            };
            state.orders.push(order);
            return { lastInsertRowid: order.id };
          },
        };
      }

      if (compact.includes("FROM order_lines ol") && compact.includes("WHERE ol.order_id = ?")) {
        return {
          all(orderId) {
            return state.lines
              .filter((line) => line.order_id === orderId)
              .map((line) => {
                const product = state.products.find((item) => item.id === line.product_id);
                return {
                  id: line.id,
                  quantity: line.quantity,
                  unit_price: line.unit_price,
                  product_name: product.name,
                  sell_method: product.sell_method,
                };
              });
          },
        };
      }

      if (compact.includes("FROM orders") && compact.includes("WHERE id = ? AND member_id = ?")) {
        return {
          get(orderId, memberId) {
            return state.orders.find(
              (order) => order.id === orderId && order.member_id === memberId,
            );
          },
        };
      }

      if (compact.includes("FROM order_lines ol") && compact.includes("WHERE ol.id = ? AND o.member_id = ?")) {
        return {
          get(lineId, memberId) {
            const line = state.lines.find((item) => item.id === lineId);
            if (!line) {
              return undefined;
            }
            const order = state.orders.find((item) => item.id === line.order_id);
            if (!order || order.member_id !== memberId) {
              return undefined;
            }
            return {
              ...line,
              member_id: order.member_id,
              round_id: order.round_id,
              is_cancelled: order.is_cancelled,
            };
          },
        };
      }

      if (compact === "DELETE FROM order_lines WHERE id = ?") {
        return {
          run(lineId) {
            state.lines = state.lines.filter((line) => line.id !== lineId);
            return { changes: 1 };
          },
        };
      }

      if (compact.includes("FROM products") && compact.includes("WHERE id = ?")) {
        return {
          get(productId) {
            return state.products.find((product) => product.id === productId);
          },
        };
      }

      if (compact.startsWith("UPDATE order_lines")) {
        return {
          run(values) {
            const line = state.lines.find((item) => item.id === values.id);
            line.quantity = values.quantity;
            line.unit_price = values.unit_price;
            return { changes: 1 };
          },
        };
      }

      if (compact.startsWith("UPDATE orders") && compact.includes("SET is_cancelled = 1")) {
        return {
          run(orderId) {
            const order = state.orders.find((item) => item.id === orderId);
            order.is_cancelled = 1;
            return { changes: 1 };
          },
        };
      }

      if (compact === "DELETE FROM order_lines WHERE order_id = ?") {
        return {
          run(orderId) {
            state.lines = state.lines.filter((line) => line.order_id !== orderId);
            return { changes: 1 };
          },
        };
      }

      if (compact.startsWith("INSERT INTO order_lines")) {
        return {
          run(values) {
            const existing = state.lines.find(
              (line) => line.order_id === values.order_id && line.product_id === values.product_id,
            );
            if (existing) {
              existing.quantity = values.quantity;
              existing.unit_price = values.unit_price;
              return { changes: 1 };
            }
            state.lines.push({
              id: state.nextLineId++,
              order_id: values.order_id,
              product_id: values.product_id,
              quantity: values.quantity,
              unit_price: values.unit_price,
            });
            return { changes: 1 };
          },
        };
      }

      throw new Error(`Unsupported SQL in test: ${compact}`);
    },
  };
}

test("user story 3 allows a member to update and remove an order line", () => {
  const db = createDb();
  const order = getOrCreateOrder(db, 1, 1);

  addOrUpdateLine(db, order.id, 1, 1);
  let lines = listOrderLines(db, order.id);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 1);

  updateLineQuantity(db, lines[0].id, 1, 3);
  lines = listOrderLines(db, order.id);
  assert.equal(lines[0].quantity, 3);

  removeLine(db, lines[0].id, 1);
  assert.equal(listOrderLines(db, order.id).length, 0);
});

test("user story 3 allows a member to cancel an order", () => {
  const db = createDb();
  const order = getOrCreateOrder(db, 1, 1);

  addOrUpdateLine(db, order.id, 1, 2);
  const cancelled = cancelOrder(db, order.id, 1);

  assert.equal(cancelled.is_cancelled, 1);
  assert.equal(listOrderLines(db, order.id).length, 0);
  assert.equal(getActiveOrder(db, 1, 1).is_cancelled, 1);
});

test("user story 3 restricts modifications when the round is closed or not open", () => {
  const { assertEditable } = require("../src/routes/member");
  const activeOrder = { id: 1, member_id: 1, round_id: 1, is_cancelled: 0 };

  assert.throws(
    () => assertEditable(null, activeOrder),
    /round is not open for changes/
  );

  assert.throws(
    () => assertEditable({ id: 1, status: "closed" }, activeOrder),
    /round is not open for changes/
  );
});

test("user story 3 restricts modifications when order is cancelled or missing", () => {
  const { assertEditable } = require("../src/routes/member");
  const openRound = { id: 1, status: "open" };

  assert.throws(
    () => assertEditable(openRound, null),
    /no active order to change/
  );

  assert.throws(
    () => assertEditable(openRound, { id: 1, is_cancelled: 1 }),
    /no active order to change/
  );
});

