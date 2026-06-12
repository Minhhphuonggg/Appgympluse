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

router.get(
  "/admin/users",
  authenticate,
  allowRoles("admin", "staff"),
  listUsersValidation,
  validate,
  userController.adminListUsers
);

router.get(
  "/admin/users/:userId",
  authenticate,
  allowRoles("admin"),
  userIdParamValidation,
  validate,
  userController.adminGetUser
);

router.post(
  "/admin/users",
  authenticate,
  allowRoles("admin"),
  createUserValidation,
  validate,
  userController.adminCreateUser
);

router.patch(
  "/admin/users/:userId",
  authenticate,
  allowRoles("admin"),
  updateUserValidation,
  validate,
  userController.adminUpdateUser
);

router.delete(
  "/admin/users/:userId",
  authenticate,
  allowRoles("admin"),
  userIdParamValidation,
  validate,
  userController.adminDeleteUser
);

router.post(
  "/admin/users/:userId/memberships",
  authenticate,
  allowRoles("admin", "staff"),
  assignMembershipValidation,
  validate,
  userController.adminAssignMembership
);

// [ĐÃ THÊM] - Route Hủy thẻ hội viên
router.delete(
  "/admin/users/:userId/memberships/:membershipId",
  authenticate,
  allowRoles("admin", "staff"),
  userController.adminRemoveMembership
);

router.patch(
  "/admin/users/:userId/status",
  authenticate,
  allowRoles("admin"),
  updateUserStatusValidation,
  validate,
  userController.adminUpdateStatus
);

router.patch(
  "/admin/users/:userId/role",
  authenticate,
  allowRoles("admin"),
  updateUserRoleValidation,
  validate,
  userController.adminUpdateRole
);

module.exports = router;