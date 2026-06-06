const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const membershipPlanService = require("../services/membershipPlan.service");

const listPlans = asyncHandler(async (req, res) => {
  const includeInactive = ["admin", "staff"].includes(req.user?.role);
  const data = await membershipPlanService.getPlans(req.query, { includeInactive });
  return sendSuccess(res, { message: "Membership plans fetched", data });
});

const getPlanDetail = asyncHandler(async (req, res) => {
  const data = await membershipPlanService.getPlanDetail(Number(req.params.planId));
  return sendSuccess(res, { message: "Membership plan fetched", data });
});

const createPlan = asyncHandler(async (req, res) => {
  const data = await membershipPlanService.createMembershipPlan(req.body, req.user.id);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Membership plan created",
    data,
  });
});

const updatePlan = asyncHandler(async (req, res) => {
  const data = await membershipPlanService.updateMembershipPlan(Number(req.params.planId), req.body);
  return sendSuccess(res, { message: "Membership plan updated", data });
});

const deletePlan = asyncHandler(async (req, res) => {
  await membershipPlanService.removeMembershipPlan(Number(req.params.planId));
  return sendSuccess(res, { message: "Membership plan deleted" });
});

module.exports = {
  listPlans,
  getPlanDetail,
  createPlan,
  updatePlan,
  deletePlan,
};
