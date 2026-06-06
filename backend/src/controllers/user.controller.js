const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const userService = require("../services/user.service");

const getMyProfile = asyncHandler(async (req, res) => {
  const data = await userService.getMyProfile(req.user.id);
  return sendSuccess(res, { message: "Profile fetched", data });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateMyProfile(req.user.id, req.body);
  return sendSuccess(res, { message: "Profile updated", data });
});

const adminListUsers = asyncHandler(async (req, res) => {
  const data = await userService.adminListUsers(req.query);
  return sendSuccess(res, { message: "Users fetched", data });
});

const adminGetUser = asyncHandler(async (req, res) => {
  const data = await userService.adminGetUser(Number(req.params.userId));
  return sendSuccess(res, { message: "User fetched", data });
});

const adminCreateUser = asyncHandler(async (req, res) => {
  const data = await userService.adminCreateUser(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "User created",
    data,
  });
});

const adminUpdateUser = asyncHandler(async (req, res) => {
  const data = await userService.adminUpdateUser(Number(req.params.userId), req.body);
  return sendSuccess(res, { message: "User updated", data });
});

const adminDeleteUser = asyncHandler(async (req, res) => {
  await userService.adminDeleteUser(Number(req.params.userId), req.user.id);
  return sendSuccess(res, { message: "User deleted" });
});

const adminAssignMembership = asyncHandler(async (req, res) => {
  const data = await userService.adminAssignMembership(
    Number(req.params.userId),
    req.body,
    req.user.id
  );
  return sendSuccess(res, {
    statusCode: 201,
    message: "Membership assigned",
    data,
  });
});

const adminUpdateStatus = asyncHandler(async (req, res) => {
  const data = await userService.adminUpdateStatus(Number(req.params.userId), req.body.status);
  return sendSuccess(res, { message: "User status updated", data });
});

const adminUpdateRole = asyncHandler(async (req, res) => {
  const data = await userService.adminUpdateRole(Number(req.params.userId), req.body.role);
  return sendSuccess(res, { message: "User role updated", data });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  adminListUsers,
  adminGetUser,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminAssignMembership,
  adminUpdateStatus,
  adminUpdateRole,
};
