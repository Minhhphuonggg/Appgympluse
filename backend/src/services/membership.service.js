const { listUserMemberships } = require("../models/userMembership.model");

async function getMyMemberships(userId) {
  return listUserMemberships(userId);
}

module.exports = {
  getMyMemberships,
};
