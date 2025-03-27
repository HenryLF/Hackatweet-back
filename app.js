require("dotenv").config();

var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("./models/connection");

var tweetRouter = require("./routes/tweets");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/tweets", tweetRouter);
app.use("/users", usersRouter);

module.exports = app;
