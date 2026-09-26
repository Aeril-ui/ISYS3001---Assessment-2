const express = require("express");
const { requireCoordinator } = require("../middleware/auth");

const router = express.Router();

router.use(requireCoordinator);

router.get("/", (req, res) => {
  res.render("coordinator/home", {
    user: req.session.user,
  });
});

module.exports = router;
