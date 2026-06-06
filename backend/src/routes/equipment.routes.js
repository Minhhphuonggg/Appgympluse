const express = require("express");
const equipmentController = require("../controllers/equipment.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  listEquipmentsValidation,
  equipmentIdParamValidation,
  createEquipmentValidation,
  updateEquipmentValidation,
} = require("../validations/equipment.validation");

const router = express.Router();

router.use(authenticate, allowRoles("admin", "staff"));

router.get("/", listEquipmentsValidation, validate, equipmentController.listEquipments);
router.get("/:equipmentId", equipmentIdParamValidation, validate, equipmentController.getEquipmentDetail);
router.post("/", createEquipmentValidation, validate, equipmentController.createEquipment);
router.patch("/:equipmentId", updateEquipmentValidation, validate, equipmentController.updateEquipment);
router.delete("/:equipmentId", equipmentIdParamValidation, validate, equipmentController.deleteEquipment);

module.exports = router;
