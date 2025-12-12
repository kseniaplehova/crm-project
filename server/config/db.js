const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "crm_data.db");
const INIT_SQL_PATH = path.join(__dirname, "..", "sql", "init.sql");

/**
 * Функция для подключения к БД и инициализации таблиц
 * @returns {Promise<sqlite3.Database>} Экземпляр базы данных
 */
const connectDB = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("❌ SQLite Connection Error:", err.message);
        return reject(err);
      }

      fs.readFile(INIT_SQL_PATH, "utf8", (err, data) => {
        if (err) {
          return reject(err);
        }

        // Запускаем скрипт инициализации
        db.exec(data, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(db);
        });
      });
    });
  });
};

module.exports = connectDB;

module.exports.db = null;
