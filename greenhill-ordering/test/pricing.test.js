const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildOrderLine } = require("../src/pricing");

test("per-unit: whole quantity times sell price; unit_price stored on line", () => {
  const product = {
    sell_method: "unit",
    sell_price: 8,
    is_withdrawn: 0,
  };

  const line = buildOrderLine(product, 2);

  assert.equal(line.quantity, 2);
  assert.equal(line.unit_price, 8);
  assert.equal(line.line_total, 16);
});

test("per-kilogram: decimal kg times price per kg; unit_price stored on line", () => {
  const product = {
    sell_method: "kilogram",
    sell_price: 4.5,
    is_withdrawn: 0,
  };

  const line = buildOrderLine(product, 0.25);

  assert.equal(line.quantity, 0.25);
  assert.equal(line.unit_price, 4.5);
  assert.equal(line.line_total, 1.13);
});
