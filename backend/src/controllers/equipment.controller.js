const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const equipmentService = require("../services/equipment.service");

const listEquipments = asyncHandler(async (req, res) => {
  const data = await equipmentService.getEquipments(req.query);
  return sendSuccess(res, { message: "Equipments fetched", data });
});

const getEquipmentDetail = asyncHandler(async (req, res) => {
  const data = await equipmentService.getEquipmentDetail(Number(req.params.equipmentId));
  return sendSuccess(res, { message: "Equipment fetched", data });
});

const createEquipment = asyncHandler(async (req, res) => {
  const data = await equipmentService.createEquipmentItem(req.body, req.user.id);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Equipment created",
    data,
  });
});

const updateEquipment = asyncHandler(async (req, res) => {
  const data = await equipmentService.updateEquipmentItem(Number(req.params.equipmentId), req.body);
  return sendSuccess(res, { message: "Equipment updated", data });
});

const deleteEquipment = asyncHandler(async (req, res) => {
  await equipmentService.removeEquipmentItem(Number(req.params.equipmentId));
  return sendSuccess(res, { message: "Equipment deleted" });
});

module.exports = {
  listEquipments,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
