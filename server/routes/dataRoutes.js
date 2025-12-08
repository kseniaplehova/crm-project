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
router.post(
  "/clients", // Путь относительно /api/data
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    const { name, email, phone } = req.body;

    // Имитируем сохранение и возвращаем новый объект клиента
    const newClient = {
      id: Date.now(),
      name,
      email,
      phone,
      role: "client",
      created: new Date().toISOString().split("T")[0],
    };

    console.log(`[SERVER] Новый клиент добавлен: ${newClient.name}`);
    return res.status(201).json(newClient);
  }
);

module.exports = router;
