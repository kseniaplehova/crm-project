const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Доступ запрещен! Токен не предоставлен" });
  }

  const token = authHeader.split(" ", [1]);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Токен недействителен или истек." });
  }
};

module.exports = authMiddleware;
