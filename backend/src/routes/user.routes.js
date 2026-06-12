const express = require("express");
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  updateMeValidation,
  listUsersValidation,
  createUserValidation,
  updateUserValidation,
  userIdParamValidation,
  assignMembershipValidation,
  updateUserStatusValidation,
  updateUserRoleValidation,
} = require("../validations/user.validation");

const router = express.Router();

router.get("/me", authenticate, userController.getMyProfile);
router.patch("/me", authenticate, updateMeValidation, validate, userController.updateMyProfile);

// Xem danh sách người dùng (Admin & Staff)
router.get(
  "/admin/users",
  authenticate,
  allowRoles("admin", "staff"),
  listUsersValidation,
  validate,
  userController.adminListUsers
);

// Xem chi tiết người dùng (Admin & Staff)
router.get(
  "/admin/users/:userId",
  authenticate,
  allowRoles("admin", "staff"), // Đã mở quyền cho staff
  userIdParamValidation,
  validate,
  userController.adminGetUser
);

// Thêm người dùng mới (Admin & Staff)
router.post(
  "/admin/users",
  authenticate,
  allowRoles("admin", "staff"), // Đã mở quyền cho staff
  createUserValidation,
  validate,
  userController.adminCreateUser
);

// Sửa thông tin người dùng (Admin & Staff)
router.patch(
  "/admin/users/:userId",
  authenticate,
  allowRoles("admin", "staff"), // Đã mở quyền cho staff
  updateUserValidation,
  validate,
  userController.adminUpdateUser
);

// Xóa người dùng (Admin & Staff)
router.delete(
  "/admin/users/:userId",
  authenticate,
  allowRoles("admin", "staff"), // Đã mở quyền cho staff
  userIdParamValidation,
  validate,
  userController.adminDeleteUser
);

// Gán thẻ hội viên (Admin & Staff)
router.post(
  "/admin/users/:userId/memberships",
  authenticate,
  allowRoles("admin", "staff"),
  assignMembershipValidation,
  validate,
  userController.adminAssignMembership
);

// Hủy thẻ hội viên (Admin & Staff)
router.delete(
  "/admin/users/:userId/memberships/:membershipId",
  authenticate,
  allowRoles("admin", "staff"),
  userController.adminRemoveMembership
);

// Cập nhật trạng thái (Admin & Staff)
router.patch(
  "/admin/users/:userId/status",
  authenticate,
  allowRoles("admin", "staff"), // Đã mở quyền cho staff
  updateUserStatusValidation,
  validate,
  userController.adminUpdateStatus
);

// Cập nhật quyền (Chỉ Admin)
router.patch(
  "/admin/users/:userId/role",
  authenticate,
  allowRoles("admin"),
  updateUserRoleValidation,
  validate,
  userController.adminUpdateRole
);

module.exports = router;