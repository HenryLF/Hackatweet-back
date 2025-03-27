const jwt = require("jsonwebtoken");
const uid = require("uid2");
const Users = require("../models/users");

const SECRET_SALT = process.env.SECRET_SALT;

function generateToken(username, uID = null) {
  !uID ? (uID = uid(32)) : null;
  return { uID, token: jwt.sign({ username, uID }, SECRET_SALT) };
}

async function verifyToken(req, res, next) {
  const { token } = req.body;
  if (!token) {
    res
      .status(400)
      .json({ result: false, message: "No user token, are you connected ?" });
    return;
  }
  try {
    let decoded = jwt.verify(token, SECRET_SALT);
    req.body.username = decoded.username;
    req.body.uID = decoded.uID;
    req.body.mongoID = await Users.findOne({ uID: decoded.uID }).then(
      (r) => r._id
    );
    console.log(req.body);
    next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ result: false, message: "Invalid user token." });
    return;
  }
}

module.exports = { verifyToken, generateToken };
