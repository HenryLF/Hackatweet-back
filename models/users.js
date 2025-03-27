const mongoose = require("mongoose");

const usersScheme = mongoose.Schema({
  username: { type: String, required: true },
  hashedPassword: String,
  uID: { type: String, index: true },
});

const Users = mongoose.model("users", usersScheme);

module.exports = Users;
