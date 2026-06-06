const { query, execute } = require("./base.model");

async function createPaymentTransaction(payload) {
  const result = await execute(
    `INSERT INTO payment_transactions (user_id, plan_id, order_ref, amount, status, raw_response)
     VALUES (?, ?, ?, ?, 'pending', ?)` ,
    [payload.userId, payload.planId, payload.orderRef, payload.amount, payload.rawResponse || null]
  );

  return findPaymentTransactionById(result.insertId);
}

async function findPaymentTransactionById(id) {
  const rows = await query("SELECT * FROM payment_transactions WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function findPaymentByOrderRef(orderRef) {
  const rows = await query("SELECT * FROM payment_transactions WHERE order_ref = ? LIMIT 1", [orderRef]);
  return rows[0] || null;
}

async function updatePaymentStatus(payload) {
  await execute(
    `UPDATE payment_transactions
     SET status = ?, membership_id = ?, raw_response = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [payload.status, payload.membershipId || null, payload.rawResponse || null, payload.id]
  );

  return findPaymentTransactionById(payload.id);
}

module.exports = {
  createPaymentTransaction,
  findPaymentByOrderRef,
  updatePaymentStatus,
};
