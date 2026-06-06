const ApiError = require("../utils/apiError");
const { findUserById } = require("../models/user.model");
const {
  createCheckin,
  findCheckinById,
  findOpenCheckinByUserId,
  checkoutCheckin,
  listCheckins,
  listCheckinHistoryByUserId,
} = require("../models/checkin.model");
const { findActiveMembershipByUserId } = require("../models/userMembership.model");
const { toSqlDateTime } = require("../utils/date");

async function checkInMember(payload, actorId) {
  const user = await findUserById(payload.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== "active") {
    throw new ApiError(400, "User is not active");
  }

  const membership = await findActiveMembershipByUserId(payload.userId);
  if (!membership) {
    throw new ApiError(400, "User has no active membership");
  }

  const openCheckin = await findOpenCheckinByUserId(payload.userId);
  if (openCheckin) {
    throw new ApiError(409, "User is already checked-in");
  }

  return createCheckin({
    userId: payload.userId,
    membershipId: membership.id,
    checkinTime: toSqlDateTime(new Date()),
    checkinBy: actorId,
    note: payload.note,
  });
}

async function checkOutMember(checkinId, payload, actorId) {
  const checkin = await findCheckinById(checkinId);

  if (!checkin) {
    throw new ApiError(404, "Check-in record not found");
  }

  if (checkin.status !== "checked_in") {
    throw new ApiError(400, "This check-in was already checked-out");
  }

  return checkoutCheckin({
    checkinId,
    checkoutTime: toSqlDateTime(new Date()),
    checkoutBy: actorId,
    note: payload.note,
  });
}

async function getCheckins(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
  const offset = (page - 1) * limit;

  const result = await listCheckins({
    userId: query.user_id,
    status: query.status,
    limit,
    offset,
  });

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

async function getMyCheckinHistory(userId, query) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== "user") {
    throw new ApiError(403, "Only user role can access this endpoint");
  }

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
  const offset = (page - 1) * limit;
  const fromDate = query.from_date || null;
  const toDate = query.to_date || null;

  if (fromDate && toDate && fromDate > toDate) {
    throw new ApiError(400, "from_date must be less than or equal to to_date");
  }

  const result = await listCheckinHistoryByUserId({
    userId,
    status: query.status,
    fromDate,
    toDate,
    limit,
    offset,
  });

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

module.exports = {
  checkInMember,
  checkOutMember,
  getCheckins,
  getMyCheckinHistory,
};
