const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Вы успешно получили защищенные данные!",
    userId: req.user.id,
    userRole: req.user.role,
    access: `У вас есть доступ как у ${req.user.role}`,
  });
});

module.exports = router;
