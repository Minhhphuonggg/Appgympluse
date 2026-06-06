const ApiError = require("../utils/apiError");
const {
  createEquipment,
  findEquipmentById,
  listEquipments,
  updateEquipmentById,
  deleteEquipmentById,
} = require("../models/equipment.model");

async function getEquipments(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
  const offset = (page - 1) * limit;

  const result = await listEquipments({
    keyword: query.keyword,
    condition: query.condition,
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

async function getEquipmentDetail(equipmentId) {
  const equipment = await findEquipmentById(equipmentId);
  if (!equipment) {
    throw new ApiError(404, "Equipment not found");
  }

  return equipment;
}

async function createEquipmentItem(payload, actorId) {
  return createEquipment({
    ...payload,
    createdBy: actorId,
  });
}

async function updateEquipmentItem(equipmentId, payload) {
  const existing = await findEquipmentById(equipmentId);
  if (!existing) {
    throw new ApiError(404, "Equipment not found");
  }

  return updateEquipmentById(equipmentId, payload);
}

async function removeEquipmentItem(equipmentId) {
  const existing = await findEquipmentById(equipmentId);
  if (!existing) {
    throw new ApiError(404, "Equipment not found");
  }

  await deleteEquipmentById(equipmentId);
}

module.exports = {
  getEquipments,
  getEquipmentDetail,
  createEquipmentItem,
  updateEquipmentItem,
  removeEquipmentItem,
};
