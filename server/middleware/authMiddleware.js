// server/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// 1. protect (без изменений)
const protect = (req, res, next) => {
  // ... (весь код protect остается прежним)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Доступ запрещен! Токен не предоставлен" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Добавляем данные пользователя в запрос
    next();
  } catch (err) {
    return res.status(401).json({ message: "Токен недействителен или истек." });
  }
};

// 2. ДОБАВЬТЕ ФУНКЦИЮ АВТОРИЗАЦИИ ПО РОЛИ (authorize)
// ИСПРАВЛЕНО: Используем оператор rest (...roles) для сбора всех аргументов в массив 'roles'
const authorize =
  (...roles) =>
  (req, res, next) => {
    // <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
    // req.user берется из предыдущего мидлвара (protect)
    if (!req.user || !roles.includes(req.user.role)) {
      // <--- используем 'roles' (массив)
      return res.status(403).json({
        message: `Доступ запрещен. Требуется одна из ролей: ${roles.join(
          // <--- используем 'roles' (массив)
          ", "
        )}`,
      });
    }
    next();
  };

// 3. ЭКСПОРТИРУЙТЕ ИХ КАК ОБЪЕКТ
module.exports = { protect, authorize };
