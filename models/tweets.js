const mongoose = require("mongoose");

const uid = require("uid2");

const tweetsScheme = mongoose.Schema({
  content: { type: String, minLength: 1, maxLength: 280 },
  author: { type: String },
  authorID: { type: String },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  createdAt: Date,
  hashtags: [String],
  tweetID: { type: String, default: uid(32) },
});

const Tweets = mongoose.model("tweets", tweetsScheme);

module.exports = Tweets;
