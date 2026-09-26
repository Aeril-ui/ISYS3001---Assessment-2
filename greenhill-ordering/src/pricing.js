const SELL_METHODS = new Set(["unit", "kilogram"]);

class PricingError extends Error {
  constructor(message) {
    super(message);
    this.name = "PricingError";
  }
}

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

function validateQuantity(sellMethod, quantity) {
  if (!SELL_METHODS.has(sellMethod)) {
    throw new PricingError(`Unknown sell method "${sellMethod}"`);
  }

  const numeric = Number(quantity);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new PricingError("Quantity must be greater than zero");
  }

  if (sellMethod === "unit") {
    if (!Number.isInteger(numeric)) {
      throw new PricingError("Unit quantity must be a whole number");
    }
  }

  return numeric;
}

function validateUnitPrice(unitPrice) {
  const numeric = Number(unitPrice);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new PricingError("Unit price must be zero or greater");
  }
  return numeric;
}

function lineTotal(sellMethod, quantity, unitPrice) {
  const validQuantity = validateQuantity(sellMethod, quantity);
  const validPrice = validateUnitPrice(unitPrice);
  return roundMoney(validQuantity * validPrice);
}

/**
 * Build values for an order line at save time. Stores the product sell price on the line.
 */
function buildOrderLine(product, quantity) {
  if (!product || product.is_withdrawn) {
    throw new PricingError("Product is not available for ordering");
  }

  const validQuantity = validateQuantity(product.sell_method, quantity);
  const unitPrice = validateUnitPrice(product.sell_price);

  return {
    quantity: validQuantity,
    unit_price: unitPrice,
    line_total: roundMoney(validQuantity * unitPrice),
  };
}

module.exports = {
  PricingError,
  buildOrderLine,
  lineTotal,
  validateQuantity,
  validateUnitPrice,
};
