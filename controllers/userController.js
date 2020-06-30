const User = require("../models/User");
const crypto = require("crypto");
const mailHandler = require("../handlers/mailHandler");
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

exports.profile = (req, res) => {
  res.render("profile", {});
};

exports.profileAction = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true }
    );
  } catch (e) {
    "error", "Ocorreu algum erro:" + e.message();
    res.redirect("/profile");
    return;
  }
  req.flash("success", "Dados alterados com sucesso");
  res.redirect("/profile");
};

exports.forget = (req, res) => {
  res.render("forget");
};

exports.forgetAction = async (req, res) => {
  //1. Verificar se o usuário existe.
  const user = await User.findOne({ email: req.body.email }).exec();
  if (!user) {
    req.flash("error", "Um e-mail foi enviado para você.");
    res.redirect("/users/forget");
    return;
  }
  //2. Gerar um token e salvar no banco
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  //3. Gerar link para trocar a senha
  const resetLink = `http://localhost:7777/users/reset/${user.resetPasswordToken}`;
  //4. Enviar o link via e-mail para o usuário
  const html = `Testando e-mail com link:<br> <a href="${resetLink}">Resetar sua senha</a>`;
  const text = `Testando e-mail com link: ${resetLink}`;
  const to = `${user.name} <${user.email}>`;
  mailHandler.send({
    to,
    subject: "Resetar sua senha",
    html: html,
    text: text,
  });
  req.flash("success", "Te enviamos um e-mail com as instruções. " + resetLink);
  //5. Usuário vai acessar o link e trocar a senha
  res.redirect("/users/login");
};

exports.forgetToken = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    req.flash("error", "Token expirado!");
    res.redirect("/users/forget");
    return;
  }
  res.render("forgetPassword");
};

exports.forgetTokenAction = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    req.flash("error", "Token expirado!");
    res.redirect("/users/forget");
    return;
  }

  if (req.body.password != req.body["password-confirm"]) {
    req.flash("error", "Senhas não batem");
    res.redirect("back");
    return;
  }
  //2. Procurar o usuário e trocar a se nha dele.
  user.setPassword(req.body.password, async () => {
    await user.save();
    req.flash("success", "Senha alterada com sucesso!");
    res.redirect("/");
  });
};
