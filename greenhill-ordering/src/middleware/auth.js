function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function requireMember(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "member") {
    return res.status(403).send("Members only.");
  }
  next();
}

function requireCoordinator(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "coordinator") {
    return res.status(403).send("Coordinator access only.");
  }
  next();
}

module.exports = {
  requireLogin,
  requireMember,
  requireCoordinator,
};
