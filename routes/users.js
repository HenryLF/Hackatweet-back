var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const uid = require("uid2");
const jwt = require("jsonwebtoken");
var Users = require("../models/users");

const SECRET_SALT = process.env.SECRET_SALT;

router.post("/signup", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .json({ result: false, message: "Invalid query, missing fields." });
    return;
  }
  const userExists = await Users.exists({ username });
  if (userExists) {
    res
      .status(400)
      .json({ result: false, message: "Username allready exists." });
    return;
  }

  const uID = uid(32);
  await new Users({
    username: username,
    hashedPassword: bcrypt.hashSync(password, 10),
    uID,
  }).save();

  const token = jwt.sign({ username, uID }, SECRET_SALT);

  res.json({
    result: true,
    data: { username, token },
    message: "Succesfully signed-up !",
  });
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .json({ result: false, message: "Invalid query, missing fields." });
    return;
  }

  const clientUser = await Users.findOne({ username });
  if (!clientUser) {
    res.status(400).json({ result: false, message: "User not found." });
    return;
  }
  console.log(clientUser)
  const valid = bcrypt.compareSync(password, clientUser.hashedPassword);
  if (!valid) {
    res
      .status(400)
      .json({ result: false, message: "Wrong password/username." });
    return;
  }

  const token = jwt.sign({ username : clientUser.username, uID : clientUser.uID }, SECRET_SALT);
  res.json({
    result: true,
    data: { username, token },
    message: "Succesfully signed-in !",
  });
});

module.exports = router;
