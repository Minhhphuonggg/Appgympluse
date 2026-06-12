const ApiError = require("../utils/apiError");
const {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  sanitizeUserRow,
  updateUserById,
  deleteUserById,
} = require("../models/user.model");
const { findPlanById } = require("../models/membershipPlan.model");
const {
  createUserMembership,
  deactivateActiveMembershipsByUserId,
  deleteUserMembershipById,
} = require("../models/userMembership.model");
const { execute } = require("../models/base.model"); // Import để thực hiện lệnh xóa thủ công
const { hashPassword } = require("../utils/password");
const { addDays, toSqlDateTime } = require("../utils/date");
const { generateQrDataUrl } = require("../utils/qr");

async function getMyProfile(userId) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return sanitizeUserRow(user);
}

async function updateMyProfile(userId, payload) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  const updated = await updateUserById(userId, {
    name: payload.name,
    phone: payload.phone,
    avatar: payload.avatar,
  });
  return sanitizeUserRow(updated);
}

async function adminListUsers(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
  const offset = (page - 1) * limit;
  const result = await listUsers({
    role: query.role,
    status: query.status,
    keyword: query.keyword,
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

async function adminGetUser(userId) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return sanitizeUserRow(user);
}

async function adminUpdateStatus(userId, status) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  const updated = await updateUserById(userId, { status });
  return sanitizeUserRow(updated);
}

async function adminUpdateRole(userId, role) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  const updated = await updateUserById(userId, { role });
  return sanitizeUserRow(updated);
}

async function adminCreateUser(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) throw new ApiError(409, "Email already exists");
  const password = await hashPassword(payload.password);
  const created = await createUser({
    name: payload.name,
    email: payload.email,
    password,
    phone: payload.phone,
    avatar: payload.avatar,
    role: payload.role || "user",
    status: payload.status || "active",
  });
  return sanitizeUserRow(created);
}

async function adminUpdateUser(userId, payload) {
  const existingUser = await findUserById(userId);
  if (!existingUser) throw new ApiError(404, "User not found");
  if (payload.email && payload.email !== existingUser.email) {
    const duplicated = await findUserByEmail(payload.email);
    if (duplicated && duplicated.id !== userId) throw new ApiError(409, "Email already exists");
  }
  const updatePayload = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    avatar: payload.avatar,
    role: payload.role,
    status: payload.status,
  };
  if (payload.password) updatePayload.password = await hashPassword(payload.password);
  const updated = await updateUserById(userId, updatePayload);
  return sanitizeUserRow(updated);
}

// HÀM XÓA ĐÃ ĐƯỢC CHỈNH SỬA ĐỂ KHÔNG BỊ LỖI KHÓA NGOẠI
async function adminDeleteUser(userId, actorId) {
  if (userId === actorId) throw new ApiError(400, "You cannot delete your own account");
  const existingUser = await findUserById(userId);
  if (!existingUser) throw new ApiError(404, "User not found");

  try {
    // Xóa tất cả các bản ghi trong user_memberships trước khi xóa user
    await execute(`DELETE FROM user_memberships WHERE user_id = ?`, [userId]);
    // Sau đó xóa user
    await deleteUserById(userId);
  } catch (error) {
    throw new ApiError(409, "Cannot delete this user");
  }
}

async function adminAssignMembership(userId, payload, actorId) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== "user") throw new ApiError(400, "Membership can only be assigned to role user");
  const plan = await findPlanById(payload.planId);
  if (!plan || plan.status !== "active") throw new ApiError(404, "Membership plan is not available");

  const price = payload.price !== undefined ? Number(payload.price) : Number(plan.price);
  if (!Number.isFinite(price) || price <= 0) throw new ApiError(400, "price must be greater than 0");

  const startDate = new Date();
  const endDate = addDays(startDate, Number(plan.duration_days));
  const qrPayload = JSON.stringify({ type: "gym-membership", source: "admin-manual", assignedBy: actorId, userId, planId: plan.id, validUntil: endDate.toISOString() });
  const qrCode = await generateQrDataUrl(qrPayload);
  await deactivateActiveMembershipsByUserId(userId, "cancelled");

  return createUserMembership({
    userId,
    planId: plan.id,
    startDate: toSqlDateTime(startDate),
    endDate: toSqlDateTime(endDate),
    price,
    qrCode,
    status: "active",
  });
}

async function adminRemoveMembership(userId, membershipId) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  await deleteUserMembershipById(membershipId);
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  adminListUsers,
  adminGetUser,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminAssignMembership,
  adminRemoveMembership,
  adminUpdateStatus,
  adminUpdateRole,
};