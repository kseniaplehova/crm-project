// server/index.js (ИСПРАВЛЕННАЯ ВЕРСИЯ)

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// --- 1. ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ---
dotenv.config();

// --- 2. Импорт функции подключения к БД и объекта для экспорта ---
const connectDB = require("./config/db");
const dbExports = require("./config/db"); // Подключим объект db для сохранения экземпляра

// --- 3. Инициализация Express и порта ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- 4. Middleware ---
app.use(
  cors({
    /* ... */
  })
);
app.use(express.json());

// ❌ УДАЛИТЕ СТАРЫЕ ИМПОРТЫ РОУТОВ ОТСЮДА

// --- 6. Запуск сервера и подключение к БД ---
async function startServer() {
  try {
    // 1. Вызываем функцию подключения и получаем экземпляр БД
    const db = await connectDB();

    // 2. Сохраняем экземпляр базы данных в экспортах (теперь dbExports.db != null)
    dbExports.db = db;

    // 5. Роуты (ИМПОРТИРУЕМ ИХ ТОЛЬКО ЗДЕСЬ, ПОСЛЕ ПОДКЛЮЧЕНИЯ БД)
    const authRoutes = require("./routes/authRoutes");
    const dataRoutes = require("./routes/dataRoutes");

    // 6. Подключаем роуты
    app.use("/api/auth", authRoutes);
    app.use("/api/data", dataRoutes);

    app.listen(PORT, () => {
      console.log(`Server work on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server or connect to DB:", error);
    process.exit(1);
  }
}

startServer();
