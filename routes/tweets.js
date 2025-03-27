var express = require("express");
const Tweets = require("../models/tweets");
const { verifyToken } = require("../middlewares/jwtAuth");
var router = express.Router();

router.get("/", async (req, res) => {
  const tweets = await Tweets.find({}).populate({
    path: "likedBy",
    select: "username uID -_id",
  });

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

  let update = await Tweets.updateOne(
    { tweetID },
    { $addToSet: { likedBy: mongoID } }
  );
  console.log(update);
  update.modifiedCount
    ? res.json({ result: true, message: `Tweet ${tweetID} liked.` })
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
