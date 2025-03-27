var express = require("express");
const jwt = require("jsonwebtoken");
const Users = require("../models/users");
const Tweets = require("../models/tweets");
var router = express.Router();

const SECRET_SALT = process.env.SECRET_SALT;

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

    next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ result: false, message: "Invalid user token." });
    return;
  }
}

router.get("/", async (req, res) => {
  const tweets = await Tweets.find({});
  res.json({
    result: true,
    data: tweets,
    message: "Here are some brainrot you twitos.",
  });
});

router.get("/trends", async (req, res) => {
  const trends = await Tweets.aggregate([
    {
      $unwind: {
        path: "$hashtags",
      },
    },
    {
      $group: {
        _id: "$hashtags",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $addFields: {
        hashtag: "$_id",
      },
    },
  ]);
  res.json({
    result: true,
    data: trends,
    message: "Here are the trends.",
  });
});

router.post("/new", verifyToken, async (req, res) => {
  console.log(req.body);
  const { content, uID, username } = req.body;
  if (!content) {
    res
      .status(400)
      .send({ result: false, message: "Cannot post empty tweet." });
    return;
  }
  const newTweet = await new Tweets({
    content,
    author: username,
    authorID: uID,
    createdAt: Date.now(),
    hashtags: Array(...content.matchAll(/#\w+/gi)).flat(),
  }).save();
  res.json({ result: true, data: newTweet, message: "Tweet Posted" });
});

router.post("/like", verifyToken, async (req, res) => {
  const { tweetID, mongoID } = req.body;
  //get user DB id from it's uID

  let update = await Tweets.updateOne(
    { tweetID },
    { $addToSet: { likedBy: mongoID} }
  );

  update.acknowledged
    ? res.json({ result: true, message: `Tweet ${tweetID} unliked.` })
    : res.json({ result: false, message: `Something went wrong...` });
});

router.post("/unlike", verifyToken, async (req, res) => {
  const { mongoID, tweetID } = req.body;

  let update = await Tweets.updateOne(
    { tweetID },
    { $pull: { likedBy: mongoID } }
  );

  update.modifiedCount
    ? res.json({ result: true, message: `Tweet ${tweetID} unliked.` })
    : res.json({ result: false, message: `Something went wrong...` });
});

router.post("/delete", verifyToken, async (req, res) => {
  const { uID, tweetID } = req.body;

  let update = await Tweets.deleteOne({ tweetID, authorID: uID });

  update.deletedCount
    ? res.json({ result: true, message: `Tweet ${tweetID} deleted.` })
    : res.json({
        result: false,
        message: `Something went wrong, do you own this post ?`,
      });
});


module.exports = router;
