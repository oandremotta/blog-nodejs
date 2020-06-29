const User = require("../models/User");

exports.userMiddleware = (req, res, next) => {
  let info = { name: "André", id: 123 };
  req.userInfo = info;
  next();
};

exports.login = (req, res) => {
  let obj = {
    pageTitle: "HOME",
    userInfo: req.userInfo,
  };
  res.render("login", obj);
};

exports.loginAction = (req, res) => {
  const auth = User.authenticate();
  auth(req.body.email, req.body.password, (error, result) => {
    if (!result) {
      req.flash("error", "Seu e-mail e/ou senha estão errados");
      res.redirect("/users/login");
      return;
    }
    req.login(result, () => {});

    req.flash("success", "Logado com sucesso!");
    res.redirect("/");
  });
};

exports.register = (req, res) => {
  let obj = {};
  res.render("register", obj);
};

exports.registerAction = (req, res) => {
  const newUser = new User(req.body);
  User.register(newUser, req.body.password, (error) => {
    if (error) {
      req.flash("error", "Ocorreu um erro, tente mais tarde.", error);
      res.redirect("/users/register");
      return;
    }
    req.flash("success", "Registro efetuado com sucesso. Faça login.");
    res.redirect("/users/login");
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};
