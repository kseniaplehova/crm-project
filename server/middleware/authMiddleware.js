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
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Токен недействителен или истек." });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Доступ запрещен. Требуется одна из ролей: ${roles.join(
          ", "
        )}`,
      });
    }
    next();
  };

module.exports = { protect, authorize };
