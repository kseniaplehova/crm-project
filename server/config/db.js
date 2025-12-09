// server/config/db.js (Использование SQLite3)

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Путь к файлу базы данных SQLite (находится в корне сервера)
const DB_PATH = path.join(__dirname, "..", "crm_data.db");
// Путь к скрипту инициализации
const INIT_SQL_PATH = path.join(__dirname, "..", "sql", "init.sql");

/**
 * Функция для подключения к БД и инициализации таблиц
 * @returns {Promise<sqlite3.Database>} Экземпляр базы данных
 */
const connectDB = () => {
  return new Promise((resolve, reject) => {
    // Открываем базу данных. Если файл не существует, он будет создан.
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("❌ SQLite Connection Error:", err.message);
        return reject(err);
      }
      console.log(`✅ SQLite Connection Successful! DB file: ${DB_PATH}`);

      // Инициализация БД
      fs.readFile(INIT_SQL_PATH, "utf8", (err, data) => {
        if (err) {
          console.error("❌ Error reading init SQL file:", err);
          return reject(err);
        }

        // Запускаем скрипт инициализации
        db.exec(data, (err) => {
          if (err) {
            console.error("❌ SQLite Initialization Error:", err.message);
            return reject(err);
          }
          console.log("✅ SQLite Tables Initialized/Checked.");
          resolve(db); // Возвращаем объект базы данных
        });
      });
    });
  });
};

// Экспортируем функцию, которая будет вызвана в index.js
module.exports = connectDB;

// Экспортируем готовый и настроенный объект базы данных
// Этот экспорт будет заполнен в server/index.js после успешного подключения
module.exports.db = null;
