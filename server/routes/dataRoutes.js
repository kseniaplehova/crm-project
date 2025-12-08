const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Вы успешно получили защищенные данные!",
    userId: req.user.id,
    userRole: req.user.role,
    access: `У вас есть доступ как у ${req.user.role}`,
  });
});

router.get(
  "/admin-dashboard",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({
      message: "Вы успешно получили защищенные данные!",
      userId: req.user.id,
      userRole: req.user.role,
      access: `У вас есть доступ как у ${req.user.role}`,
    });
  }
);

router.get(
  "/my-orders",
  authMiddleware,
  roleMiddleware(["client"]),
  (req, res) => {
    res.json({
      message: "Вы успешно получили защищенные данные!",
      userId: req.user.id,
      userRole: req.user.role,
      access: `У вас есть доступ как у ${req.user.role}`,
    });
  }
);

module.exports = router;
