const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const USERS_DB = [
  {
    id: 101,
    email: "admin@crm.com",
    role: "admin",
    passwordHash: "$2a$10$B59U8fQo.5hBwO9o/iK7N.T7J/4jD/k6ZzXp.nE3U4mZ/oE5zS7U",
  },
  {
    id: 102,
    email: "client@crm.com",
    role: "client",
    passwordHash: "$2a$10$B59U8fQo.5hBwO9o/iK7N.T7J/4jD/k6ZzXp.nE3U4mZ/oE5zS7U",
  },
];

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = USERS_DB.find((u) => u.email === email);

  if (!user) {
    return res
      .status(401)
      .json({ message: "fucking password or login is incorrect!" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json("fucking password or lofin is incorrect!");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({
    message: "Successful!",
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

module.exports = router;
