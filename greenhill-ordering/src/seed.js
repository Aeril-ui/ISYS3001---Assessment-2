function seedIfEmpty(db) {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM rounds").get();
  if (count > 0) {
    return false;
  }

  const seed = db.transaction(() => {
    const insertMember = db.prepare(`
      INSERT INTO members (member_number, name, phone, is_active)
      VALUES (@member_number, @name, @phone, 1)
    `);

    const memberResult = insertMember.run({
      member_number: "GH-101",
      name: "Sample Household",
      phone: "0400 000 101",
    });
    const memberId = memberResult.lastInsertRowid;

    insertMember.run({
      member_number: "GH-102",
      name: "Another Demo Home",
      phone: "0400 000 102",
    });

    db.prepare(`
      INSERT INTO users (username, password, role, member_id)
      VALUES (@username, @password, @role, @member_id)
    `).run({
      username: "member",
      password: "member",
      role: "member",
      member_id: memberId,
    });

    db.prepare(`
      INSERT INTO users (username, password, role, member_id)
      VALUES (@username, @password, @role, NULL)
    `).run({
      username: "coordinator",
      password: "coordinator",
      role: "coordinator",
    });

    db.prepare(`
      INSERT INTO rounds (status)
      VALUES ('open')
    `).run();

    const insertProduct = db.prepare(`
      INSERT INTO products (name, sell_price, sell_method, is_withdrawn)
      VALUES (@name, @sell_price, @sell_method, 0)
    `);

    insertProduct.run({
      name: "Local Honey (jar)",
      sell_price: 12.0,
      sell_method: "unit",
    });
    insertProduct.run({
      name: "Rolled Oats",
      sell_price: 4.5,
      sell_method: "kilogram",
    });
    insertProduct.run({
      name: "Free Range Eggs (dozen)",
      sell_price: 8.0,
      sell_method: "unit",
    });
    insertProduct.run({
      name: "Seasonal Vegetables",
      sell_price: 6.25,
      sell_method: "kilogram",
    });
  });

  seed();
  return true;
}

module.exports = { seedIfEmpty };
