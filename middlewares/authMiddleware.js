exports.isLogged = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Ops! Você não tem permissão para acessar esta página");
    res.redirect("/users/login");
    return;
  }
  next();
};

exports.changePassword = (req, res, next) => {
  //1. Confirmar que as senhas batem
  if (req.body.password != req.body["password-confirm"]) {
    req.flash("error", "Senhas não batem");
    res.redirect("/profile");
    return;
  }
  //2. Procurar o usuário e trocar a se nha dele.
  req.user.setPassword(req.body.password, async () => {
    await req.user.save();
    req.flash("success", "Senha alterada com sucesso!");
    res.redirect("/");
  });
  //3. Redirecionar para HOME
};
