const express = require("express");
const mustache = require("mustache-express");
const mongoose = require("mongoose");
const helpers = require("./helpers");
const errorHalnder = require("./handlers/errorHandlers.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");

//Rotas
const router = require("./routes/index");
const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SECRET));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

//Configurações
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  next();
});

app.use("/", router);
app.use(errorHalnder.notFound);
app.engine("mst", mustache(__dirname + "/views/partials", ".mst"));
app.set("view engine", "mst");
app.set("views", __dirname + "/views");

module.exports = app;
