const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.cookies.token || undefined;

  if (token == null || token == undefined) {
    return res.redirect("/");
  }

  jwt.verify(token, process.env.AUTH_TOKEN, (err, user) => {
    if (err) {
      return res.redirect("/");
    }
    req.user = user;
    next();
  });
}

function checkLogged(req, res, next) {
  const token = req.cookies.token || undefined;
  jwt.verify(token, process.env.AUTH_TOKEN, (err, user) => {
    if (err) {
      next();
    } else {
      req.user = user;
      return res.redirect("/index");
    }
  });
}

function adminAuthenticateToken(req, res, next) {
  const token = req.cookies.token || undefined;

  if (token == null || token == undefined) {
    return res.redirect("/admin");
  }

  jwt.verify(token, process.env.AUTH_TOKEN_ADMIN, (err, user) => {
    if (err) {
      return res.redirect("/admin");
    }
    req.user = user;
    next();
  });
}

function checkLoggedAdmin(req, res, next) {
  const token = req.cookies.token || undefined;
  jwt.verify(token, process.env.AUTH_TOKEN_ADMIN, (err, user) => {
    if (err) {
      next();
    } else {
      req.user = user;
      return res.redirect("/admin/index");
    }
  });
}

module.exports = { authenticateToken, adminAuthenticateToken, checkLogged, checkLoggedAdmin };
