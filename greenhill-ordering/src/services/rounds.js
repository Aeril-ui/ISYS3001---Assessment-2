function getOpenRound(db) {
  return db
    .prepare(`
      SELECT id, status
      FROM rounds
      WHERE status = 'open'
      ORDER BY id DESC
      LIMIT 1
    `)
    .get();
}

function getRoundById(db, roundId) {
  return db
    .prepare(`
      SELECT id, status
      FROM rounds
      WHERE id = ?
    `)
    .get(roundId);
}

module.exports = {
  getOpenRound,
  getRoundById,
};
