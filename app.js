// the requires
var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
var path = require("path");

var authenticate = require("./authenticate");
var passport = require("passport");

var FileStore = require("session-file-store")(session);
var session = require("express-session");
var config = require("./config");

// the routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const dishRouter = require("./routes/dishRouter");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");
const uploadRouter = require("./routes/uploadRouter");
const favoriteRouter = require("./routes/favoriteRouter");

// connection to the database
const mongoose = require("mongoose");
const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then(
  db => {
    console.log("Connected to the database");
  },
  err => {
    console.log(err);
  }
);

// express instance
var app = express();

// middleware for handling unsecure requests
app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      `https://${req.hostname}:${app.get("secPort")}${req.url}`
    );
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// for user authetication using passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// passport now is using jwt Strategy

app.use(express.static(path.join(__dirname, "public")));

app.use("/dishes", dishRouter);
app.use("/leaders", leaderRouter);
app.use("/promotions", promoRouter);
app.use("/imageUpload", uploadRouter);
app.use("/favorites", favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
