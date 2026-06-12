const ApiError = require("../utils/apiError");
const { addDays, toSqlDateTime } = require("../utils/date");
const { generateQrDataUrl } = require("../utils/qr");
const { buildVnpayPaymentUrl, verifyVnpayReturn } = require("../utils/vnpay");
const { findPlanById } = require("../models/membershipPlan.model");
const {
  createPaymentTransaction,
  findPaymentByOrderRef,
  updatePaymentStatus,
} = require("../models/paymentTransaction.model");
const {
  createUserMembership,
  findUserMembershipById,
} = require("../models/userMembership.model");

async function createMembershipPayment(userId, planId, ipAddr) {
  const plan = await findPlanById(planId);

  if (!plan || plan.status !== "active") {
    throw new ApiError(404, "Membership plan is not available");
  }

  const orderRef = `GYM_${Date.now()}_${userId}`;

  await createPaymentTransaction({
    userId,
    planId,
    orderRef,
    amount: plan.price,
  });

  const paymentUrl = buildVnpayPaymentUrl({
    amount: plan.price,
    orderRef,
    orderInfo: `Thanh toan goi ${plan.name}`,
    ipAddr: Array.isArray(ipAddr) ? ipAddr[0] : String(ipAddr || "").split(",")[0].trim(),
  });

  return {
    orderRef,
    paymentUrl,
    amount: plan.price,
  };
}

async function handleVnpayCallback(query) {
  const signatureValid = verifyVnpayReturn(query);
  if (!signatureValid) {
    throw new ApiError(400, "Invalid VNPAY signature");
  }

  const orderRef = query.vnp_TxnRef;
  const responseCode = query.vnp_ResponseCode;

  const payment = await findPaymentByOrderRef(orderRef);

  if (!payment) {
    throw new ApiError(404, "Payment transaction not found");
  }

  if (payment.status === "success" && payment.membership_id) {
    const existingMembership = await findUserMembershipById(payment.membership_id);
    return {
      status: "success",
      membership: existingMembership,
      orderRef,
    };
  }

  if (responseCode !== "00") {
    await updatePaymentStatus({
      id: payment.id,
      status: "failed",
      rawResponse: JSON.stringify(query),
    });

    return {
      status: "failed",
      orderRef,
      responseCode,
    };
  }

  const plan = await findPlanById(payment.plan_id);
  if (!plan) {
    throw new ApiError(404, "Membership plan not found");
  }

  const startDate = new Date();
  const endDate = addDays(startDate, Number(plan.duration_days));

  const qrPayload = JSON.stringify({
    type: "gym-membership",
    userId: payment.user_id,
    planId: payment.plan_id,
    orderRef,
    validUntil: endDate.toISOString(),
  });

  const qrCode = await generateQrDataUrl(qrPayload);

  const membership = await createUserMembership({
    userId: payment.user_id,
    planId: payment.plan_id,
    startDate: toSqlDateTime(startDate),
    endDate: toSqlDateTime(endDate),
    price: payment.amount,
    qrCode,
    status: "active",
  });

  await updatePaymentStatus({
    id: payment.id,
    status: "success",
    membershipId: membership.id,
    rawResponse: JSON.stringify(query),
  });

  return {
    status: "success",
    membership,
    orderRef,
  };
}

module.exports = {
  createMembershipPayment,
  handleVnpayCallback,
};
