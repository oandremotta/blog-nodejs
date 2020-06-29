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
