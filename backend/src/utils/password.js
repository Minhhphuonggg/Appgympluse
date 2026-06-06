const bcrypt = require("bcryptjs");

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};
