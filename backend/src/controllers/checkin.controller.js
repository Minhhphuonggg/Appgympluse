const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const checkinService = require("../services/checkin.service");

const listCheckins = asyncHandler(async (req, res) => {
  const data = await checkinService.getCheckins(req.query);
  return sendSuccess(res, { message: "Check-ins fetched", data });
});

const getMyCheckinHistory = asyncHandler(async (req, res) => {
  const data = await checkinService.getMyCheckinHistory(req.user.id, req.query);
  return sendSuccess(res, { message: "My check-in history fetched", data });
});

const checkIn = asyncHandler(async (req, res) => {
  const data = await checkinService.checkInMember(req.body, req.user.id);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Check-in successful",
    data,
  });
});

const checkOut = asyncHandler(async (req, res) => {
  const data = await checkinService.checkOutMember(Number(req.params.checkinId), req.body, req.user.id);
  return sendSuccess(res, { message: "Check-out successful", data });
});

module.exports = {
  listCheckins,
  getMyCheckinHistory,
  checkIn,
  checkOut,
};
