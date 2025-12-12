const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Попытка входа для email: ${email}`);

  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT ClientID, PasswordHash, Role, Name FROM Clients WHERE Email = ?",
        [email],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
    console.log(
      "[AUTH] Результат поиска (user):",
      user ? "НАЙДЕН" : "НЕ НАЙДЕН"
    );
    if (!user) {
      return res
        .status(401)
        .json({ message: "Неправильный логин или пароль." });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Неправильный логин или пароль." });
    }

    const payLoad = {
      id: user.ClientID,
      role: user.Role,
    };
    const token = jwt.sign(payLoad, JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      message: "Вход успешен!",
      token,
      user: {
        id: user.ClientID,
        email: email,
        role: user.Role,
        name: user.Name,
      },
    });
  } catch (error) {
    console.error("Ошибка аутентификации SQLite:", error);
    return res.status(500).json({ message: "Ошибка сервера при входе." });
  }
});

module.exports = router;
