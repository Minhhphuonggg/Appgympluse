const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const membershipService = require("../services/membership.service");
const paymentService = require("../services/payment.service");

const getMyMemberships = asyncHandler(async (req, res) => {
  const data = await membershipService.getMyMemberships(req.user.id);
  return sendSuccess(res, { message: "My memberships fetched", data });
});

const createPaymentUrl = asyncHandler(async (req, res) => {
  const data = await paymentService.createMembershipPayment(
    req.user.id,
    Number(req.params.planId),
    req.headers["x-forwarded-for"] || req.socket.remoteAddress
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "VNPAY payment URL created",
    data,
  });
});

module.exports = {
  getMyMemberships,
  createPaymentUrl,
};
