require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware (Промежуточное ПО) ---

// 1. Настройка CORS
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

// 2. Парсинг JSON
app.use(express.json());

// --- Роуты (Routes) ---

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
  console.log(`Server work on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});
