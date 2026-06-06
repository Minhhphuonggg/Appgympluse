const ApiError = require("../utils/apiError");
const {
  createPlan,
  findPlanById,
  listPlans,
  updatePlanById,
  deletePlanById,
} = require("../models/membershipPlan.model");

async function getPlans(query, { includeInactive = false } = {}) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
  const offset = (page - 1) * limit;

  const status = includeInactive ? query.status : "active";

  const result = await listPlans({ status, limit, offset });

  return {
    items: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
}

async function getPlanDetail(planId) {
  const plan = await findPlanById(planId);
  if (!plan) {
    throw new ApiError(404, "Membership plan not found");
  }

  return plan;
}

async function createMembershipPlan(payload, actorId) {
  return createPlan({
    ...payload,
    createdBy: actorId,
  });
}

async function updateMembershipPlan(planId, payload) {
  const plan = await findPlanById(planId);

  if (!plan) {
    throw new ApiError(404, "Membership plan not found");
  }

  return updatePlanById(planId, payload);
}

async function removeMembershipPlan(planId) {
  const plan = await findPlanById(planId);

  if (!plan) {
    throw new ApiError(404, "Membership plan not found");
  }

  await deletePlanById(planId);
}

module.exports = {
  getPlans,
  getPlanDetail,
  createMembershipPlan,
  updateMembershipPlan,
  removeMembershipPlan,
};
