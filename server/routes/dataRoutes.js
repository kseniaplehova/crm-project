// D:\Study\University\2st year\crm-project\server\routes\dataRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Для хеширования пароля
const jwt = require("jsonwebtoken"); // Для генерации токена
const fs = require("fs");
const path = require("path");

const loadSql = (filename) => {
  return fs.readFileSync(
    path.join(__dirname, `../sql/queries/${filename}`),
    "utf8"
  );
};

const GET_ALL_SHIPPING_QUERY = fs.readFileSync(
  path.join(__dirname, "../sql/queries/get_all_shipping.sql"),
  "utf8"
);

const GET_SHIPPING_BY_ID_QUERY = fs.readFileSync(
  path.join(__dirname, "../sql/queries/get_shipping_by_id.sql"),
  "utf8"
);

const GET_ALL_ORDERS_QUERY = loadSql("get_all_orders.sql"); // С JOIN
const GET_ORDER_BY_ID_QUERY = loadSql("get_order_by_id.sql"); // С JOIN
const GET_ALL_CANCELLATIONS_QUERY = loadSql("get_all_cancellations.sql"); // С LEFT JOIN
const GET_CANCELLATION_BY_ID_QUERY = loadSql("get_cancellation_by_id.sql"); // С JOIN
const GET_ORDER_DETAILS_QUERY = loadSql("get_order_details_by_id.sql");

// Секрет для JWT. Используйте переменную окружения!
const JWT_SECRET = process.env.JWT_SECRET || "your_strong_secret_key";

// Импорт мидлваров (ВАЖНО: должны экспортироваться как { protect, authorize })
const { protect, authorize } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware"); // Оставлен на случай, если вы его используете
const { db } = require("../config/db"); // Импорт экземпляра БД

// =================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ДЛЯ РОУТА АУТЕНТИФИКАЦИИ)
// =================================================================

/**
 * Генерирует JWT токен.
 * @param {object} user - объект пользователя (id, role).
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Создает нового клиента в базе данных.
 */
const createUserInDB = async ({ name, email, passwordHash, phone, role }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Clients (Name, Email, PasswordHash, Phone, Role, CreatedDate)
             VALUES (?, ?, ?, ?, ?, DATETIME('now'))`,
      [name, email, passwordHash, phone, role],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID); // Возвращаем ClientID
      }
    );
  });
};

// =================================================================
// 0. ПУБЛИЧНЫЙ РОУТ РЕГИСТРАЦИИ (POST /register)
// =================================================================

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Необходимо указать имя, email и пароль." });
  }

  try {
    // 1. Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Создание нового пользователя в базе данных (role: 'client')
    const userId = await createUserInDB({
      name,
      email,
      passwordHash,
      phone,
      role: "client",
    });

    // 3. Объект пользователя, который будет возвращен
    const user = {
      id: userId,
      name: name,
      email: email,
      role: "client",
    };

    // 4. Генерация токена для автоматического входа
    const token = generateToken(user);

    // 5. Возвращаем токен и данные пользователя
    return res.status(201).json({
      message: "Регистрация успешна!",
      token,
      user: user,
    });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);

    // Обработка ошибки, если email уже существует
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return res
        .status(409)
        .json({ message: "Пользователь с таким email уже существует." });
    }
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// =================================================================
// 1. РОУТЫ ДЛЯ КЛИЕНТОВ (CRUD)
// (ВСЕ МАРШРУТЫ ЗАЩИЩЕНЫ МИДЛВАРАМИ protect И authorize)
// =================================================================

// GET /clients: Получение списка всех клиентов
// ⚠️ ИСПРАВЛЕНО: authMiddleware заменен на protect
router.get("/clients", protect, authorize("admin"), async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(
        `SELECT ClientID, Name, Email, Phone, Role, CreatedDate FROM Clients`,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    const clients = rows.map((client) => ({
      id: client.ClientID,
      name: client.Name,
      email: client.Email,
      phone: client.Phone,
      role: client.Role,
      created: client.CreatedDate ? client.CreatedDate.split(" ")[0] : "N/A",
    }));

    return res.json(clients);
  } catch (err) {
    console.error("Ошибка SQLite при получении списка клиентов:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при загрузке данных." });
  }
});

// POST /clients: Создание нового клиента
router.post(
  "/clients",
  protect,
  authorize("admin"), // Используем authorize
  async (req, res) => {
    const { name, email, phone } = req.body;

    // В реальном проекте здесь должен быть сгенерированный bcrypt-хеш.
    // Здесь мы используем заглушку, так как созданием занимается админ,
    // но лучше сгенерировать временный хеш.
    const tempPasswordHash = "temporary-hash";

    try {
      const runQuery = new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO Clients (Name, Email, Phone, Role, CreatedDate, PasswordHash)
                     VALUES (?, ?, ?, 'client', DATETIME('now'), ?)`,
          [name, email, phone, tempPasswordHash],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });

      const clientId = await runQuery;

      const newClient = await new Promise((resolve, reject) => {
        db.get(
          `SELECT ClientID, Name, Email, Phone, Role, CreatedDate 
                     FROM Clients WHERE ClientID = ?`,
          [clientId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      });

      const formattedClient = {
        id: newClient.ClientID,
        name: newClient.Name,
        email: newClient.Email,
        phone: newClient.Phone,
        role: newClient.Role,
        created: newClient.CreatedDate.split(" ")[0],
      };

      console.log(`[SQLite] Новый клиент добавлен: ${newClient.Name}`);
      return res.status(201).json(formattedClient);
    } catch (err) {
      console.error("Ошибка SQLite при добавлении клиента:", err);
      if (err.message.includes("UNIQUE constraint failed")) {
        return res
          .status(409)
          .json({ message: "Клиент с таким Email уже существует." });
      }
      return res
        .status(500)
        .json({ message: "Ошибка сервера при работе с базой данных." });
    }
  }
);

// PUT /clients/:id: Обновление клиента
router.put("/clients/:id", protect, authorize("admin"), async (req, res) => {
  const clientId = parseInt(req.params.id);
  const { name, email, phone, role } = req.body;

  try {
    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `UPDATE Clients
                     SET Name = ?, Email = ?, Phone = ?, Role = ?
                     WHERE ClientID = ?`,
        [name, email, phone, role || "client", clientId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });

    const changes = await runQuery;

    if (changes === 0) {
      return res.status(404).json({ message: "Клиент не найден." });
    }

    const updatedClient = {
      id: clientId,
      name,
      email,
      phone,
      role: role || "client",
    };

    return res.json(updatedClient);
  } catch (err) {
    console.error("Ошибка SQLite при обновлении клиента:", err);
    if (err.message.includes("UNIQUE constraint failed")) {
      return res
        .status(409)
        .json({ message: "Клиент с таким Email уже существует." });
    }
    return res
      .status(500)
      .json({ message: "Ошибка сервера при обновлении данных." });
  }
});

// DELETE /clients/:id: Удаление клиента
router.delete("/clients/:id", protect, authorize("admin"), async (req, res) => {
  const clientId = parseInt(req.params.id);

  try {
    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM Clients 
                     WHERE ClientID = ?`,
        [clientId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });

    const changes = await runQuery;

    if (changes === 0) {
      return res.status(404).json({ message: "Клиент не найден." });
    }

    console.log(`[SQLite] Успешно удален клиент ID: ${clientId}`);
    return res.status(204).send();
  } catch (err) {
    console.error("Ошибка SQLite при удалении клиента:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при удалении данных." });
  }
});

// =================================================================
// 2. РОУТЫ ДЛЯ ЗАКАЗОВ (CRUD)
// =================================================================

// GET /orders: Получение списка всех заказов
router.get(
  "/orders",
  protect,
  authorize("admin", "client"),
  async (req, res) => {
    try {
      const isClient = req.user.role === "client";
      const clientId = isClient ? req.user.id : null;

      // ВАЖНО: Предполагаем, что GET_ALL_ORDERS_QUERY - это SELECT...FROM... и не содержит WHERE/ORDER BY.
      let query = GET_ALL_ORDERS_QUERY;
      const params = [];
      let whereClause = "";

      if (isClient) {
        // Если клиент, фильтруем по его ID
        whereClause = ` WHERE o.ClientID = ?`;
        params.push(clientId);
      }

      // Добавляем условие WHERE перед ORDER BY/LIMIT
      // Если вам нужен ORDER BY, добавьте его здесь:
      query = `${query}${whereClause} ORDER BY o.OrderDate DESC`;

      const rows = await new Promise((resolve, reject) => {
        // Используем динамический запрос и параметры
        db.all(query, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      const orders = rows.map((order) => ({
        id: order.OrderID,
        clientId: order.ClientID,
        clientName: order.ClientName,
        date: order.OrderDate ? order.OrderDate.split(" ")[0] : "N/A",
        status: order.Status,
        totalAmount: parseFloat(order.TotalAmount).toFixed(2),
      }));

      return res.json(orders);
    } catch (err) {
      console.error("Ошибка SQLite при получении списка заказов:", err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при загрузке заказов." });
    }
  }
);

router.get(
  "/orders/:id/details",
  protect,
  authorize("admin", "client"),
  async (req, res) => {
    const orderId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
      // 1. Проверка владельца (для роли 'client')
      if (userRole === "client") {
        const ownerCheck = await new Promise((resolve, reject) => {
          db.get(
            `SELECT ClientID FROM Orders WHERE OrderID = ?`,
            [orderId],
            (err, row) => {
              if (err) return reject(err);
              resolve(row);
            }
          );
        });

        // Заказ не найден или не принадлежит клиенту
        if (!ownerCheck) {
          return res.status(404).json({ message: "Заказ не найден." });
        }
        if (ownerCheck.ClientID !== userId) {
          return res
            .status(403)
            .json({ message: "Недостаточно прав для просмотра этого заказа." });
        }
      }

      // 2. Получение деталей (OrderDetails, Product)
      const rows = await new Promise((resolve, reject) => {
        db.all(GET_ORDER_DETAILS_QUERY, [orderId], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      if (rows.length === 0) {
        return res.status(404).json({ message: "Детали заказа не найдены." });
      }

      // 3. Форматирование ответа
      const details = rows.map((row) => ({
        id: row.OrderDetailID,
        productName: row.ProductName,
        description: row.ProductDescription,
        quantity: row.Quantity,
        priceAtOrder: parseFloat(row.PriceAtOrder).toFixed(2),
        lineTotal: (row.Quantity * parseFloat(row.PriceAtOrder)).toFixed(2),
      }));

      return res.json(details);
    } catch (err) {
      console.error(`Ошибка при получении деталей заказа ID ${orderId}:`, err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при загрузке деталей заказа." });
    }
  }
);

router.post(
  "/orders",
  protect,
  authorize("admin", "client"),
  async (req, res) => {
    // Определяем, кто создает заказ:
    // - Если это клиент (из токена), используем его ID (req.user.id).
    // - Если это админ (из токена), используем ClientID, переданный в теле запроса (req.body.clientId).
    const actualClientId =
      req.user.role === "client" ? req.user.id : req.body.clientId;

    // TotalAmount и Status получаем из тела запроса
    const { totalAmount, status = "New" } = req.body;

    // Проверка обязательных полей
    if (!actualClientId || !totalAmount) {
      // Ошибка 400: Недостаточно данных для создания заказа
      return res
        .status(400)
        .json({ message: "Требуются ClientID (автоматически) и TotalAmount." });
    }

    try {
      const runQuery = new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO Orders (ClientID, OrderDate, Status, TotalAmount)
                       VALUES (?, DATETIME('now'), ?, ?)`,
          [actualClientId, status, totalAmount],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });

      const orderId = await runQuery;

      // Получение созданного заказа с именем клиента (используем GET_ORDER_BY_ID_QUERY)
      const newOrder = await new Promise((resolve, reject) => {
        db.get(GET_ORDER_BY_ID_QUERY, [orderId], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      const formattedOrder = {
        id: newOrder.OrderID,
        clientId: newOrder.ClientID,
        clientName: newOrder.ClientName,
        date: newOrder.OrderDate.split(" ")[0],
        status: newOrder.Status,
        totalAmount: parseFloat(newOrder.TotalAmount).toFixed(2),
      };

      return res.status(201).json(formattedOrder);
    } catch (err) {
      console.error("Ошибка SQLite при добавлении заказа:", err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при добавлении заказа." });
    }
  }
);

router.put("/orders/:id", protect, authorize("admin"), async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status, totalAmount } = req.body;

  // Проверка, что хотя бы одно поле для обновления предоставлено
  if (!status && !totalAmount) {
    // Ошибка 400: Нет данных для обновления
    return res
      .status(400)
      .json({ message: "Необходимо указать статус или сумму для обновления." });
  }

  try {
    const updates = [];
    const params = [];

    if (status) {
      updates.push("Status = ?");
      params.push(status);
    }
    if (totalAmount !== undefined && totalAmount !== null) {
      // Учитываем, что TotalAmount может быть 0
      updates.push("TotalAmount = ?");
      params.push(totalAmount);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Нет данных для обновления." });
    }

    params.push(orderId); // Последний параметр - это OrderID для WHERE

    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `UPDATE Orders
                    SET ${updates.join(", ")}
                    WHERE OrderID = ?`,
        params,
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });

    const changes = await runQuery;

    if (changes === 0) {
      return res.status(404).json({ message: "Заказ не найден." });
    }

    // Получение обновленного заказа
    const updatedOrder = await new Promise((resolve, reject) => {
      db.get(GET_ORDER_BY_ID_QUERY, [orderId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    const formattedOrder = {
      id: updatedOrder.OrderID,
      clientId: updatedOrder.ClientID,
      clientName: updatedOrder.ClientName,
      date: updatedOrder.OrderDate.split(" ")[0],
      status: updatedOrder.Status,
      totalAmount: parseFloat(updatedOrder.TotalAmount).toFixed(2),
    };

    return res.json(formattedOrder);
  } catch (err) {
    console.error("Ошибка SQLite при обновлении заказа:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при обновлении заказа." });
  }
});

// DELETE /orders/:id: Удаление заказа
router.delete("/orders/:id", protect, authorize("admin"), async (req, res) => {
  const orderId = parseInt(req.params.id);

  try {
    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM Orders 
                     WHERE OrderID = ?`,
        [orderId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });

    const changes = await runQuery;

    if (changes === 0) {
      return res.status(404).json({ message: "Заказ не найден." });
    }

    console.log(`[SQLite] Успешно удален заказ ID: ${orderId}`);
    return res.status(204).send();
  } catch (err) {
    console.error("Ошибка SQLite при удалении заказа:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при удалении заказа." });
  }
});

// =================================================================
// 3. РОУТЫ ДЛЯ ДОСТАВКИ (CRUD)
// =================================================================

// GET /shipping: Получение списка всех доставок
router.get("/shipping", protect, authorize("admin"), async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(GET_ALL_SHIPPING_QUERY, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const shippingList = rows.map((item) => ({
      id: item.ShippingID,
      orderId: item.OrderID,
      clientName: item.ClientName,
      trackingNumber: item.TrackingNumber,
      carrier: item.Carrier,
      shippingDate: item.ShippingDate ? item.ShippingDate.split(" ")[0] : "N/A",
      deliveryDate: item.DeliveryDate ? item.DeliveryDate.split(" ")[0] : "N/A",
      status: item.Status,
      totalAmount: parseFloat(item.TotalAmount).toFixed(2),
    }));

    return res.json(shippingList);
  } catch (err) {
    console.error("Ошибка SQLite при получении списка доставок:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при загрузке данных о доставке." });
  }
});

// POST /shipping: Создание новой записи о доставке
router.post("/shipping", protect, authorize("admin"), async (req, res) => {
  const { orderId, trackingNumber, carrier, deliveryDate } = req.body;

  if (!orderId || !trackingNumber || !carrier) {
    return res
      .status(400)
      .json({ message: "Требуются OrderID, TrackingNumber и Carrier." });
  }

  try {
    // 1. Вставляем новую запись о доставке
    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Shipping (OrderID, TrackingNumber, Carrier, ShippingDate, DeliveryDate, Status)
                     VALUES (?, ?, ?, DATETIME('now'), ?, 'Shipped')`,
        [orderId, trackingNumber, carrier, deliveryDate || null],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    const shippingId = await runQuery;

    // 2. Обновляем статус заказа на 'Shipped' (асинхронно, не блокируя ответ)
    db.run(
      `UPDATE Orders SET Status = 'Shipped' WHERE OrderID = ?`,
      [orderId],
      (err) => {
        if (err)
          console.error(
            "Ошибка обновления статуса заказа после отгрузки:",
            err
          );
      }
    );

    // 3. Получаем полную информацию для ответа, используя JOIN
    const newShipping = await new Promise((resolve, reject) => {
      db.get(GET_SHIPPING_BY_ID_QUERY, [shippingId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!newShipping) {
      console.error(
        `[SQL Error] Не удалось получить запись ShippingID: ${shippingId} после INSERT.`
      );
      return res.status(500).json({
        message:
          "Запись создана, но не удалось получить связанные данные для ответа.",
      });
    }

    // 4. Форматируем и отправляем ответ
    const formattedShipping = {
      id: newShipping.ShippingID,
      orderId: newShipping.OrderID,
      clientName: newShipping.ClientName,
      trackingNumber: newShipping.TrackingNumber,
      carrier: newShipping.Carrier,
      shippingDate: newShipping.ShippingDate.split(" ")[0],
      deliveryDate: newShipping.DeliveryDate
        ? newShipping.DeliveryDate.split(" ")[0]
        : null,
      status: newShipping.Status,
      totalAmount: parseFloat(newShipping.TotalAmount).toFixed(2),
    };

    return res.status(201).json(formattedShipping);
  } catch (err) {
    console.error("Ошибка SQLite при добавлении доставки:", err);
    if (err.message.includes("UNIQUE constraint failed")) {
      return res
        .status(409)
        .json({ message: "Этот заказ уже имеет запись о доставке." });
    }
    return res
      .status(500)
      .json({ message: "Ошибка сервера при добавлении доставки." });
  }
});

// PUT /shipping/:id: Обновление статуса или даты доставки
router.put("/shipping/:id", protect, authorize("admin"), async (req, res) => {
  const shippingId = parseInt(req.params.id);
  const { status, deliveryDate, trackingNumber, carrier } = req.body;

  const updates = [];
  const params = [];
  if (status) {
    updates.push("Status = ?");
    params.push(status);
  }
  if (deliveryDate) {
    updates.push("DeliveryDate = ?");
    params.push(deliveryDate);
  }
  if (trackingNumber) {
    updates.push("TrackingNumber = ?");
    params.push(trackingNumber);
  }
  if (carrier) {
    updates.push("Carrier = ?");
    params.push(carrier);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Нет данных для обновления." });
  }

  params.push(shippingId);

  try {
    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `UPDATE Shipping
                     SET ${updates.join(", ")}
                     WHERE ShippingID = ?`,
        params,
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });

    const changes = await runQuery;

    if (changes === 0) {
      return res.status(404).json({ message: "Запись о доставке не найдена." });
    }

    // Логика: если статус доставки - "Delivered", обновляем статус заказа
    if (status === "Delivered") {
      const orderIdResult = await new Promise((resolve, reject) => {
        db.get(
          "SELECT OrderID FROM Shipping WHERE ShippingID = ?",
          [shippingId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.OrderID : null);
          }
        );
      });

      if (orderIdResult) {
        db.run(
          `UPDATE Orders SET Status = 'Delivered' WHERE OrderID = ?`,
          [orderIdResult],
          (err) => {
            if (err)
              console.error(
                "Ошибка обновления статуса заказа на 'Delivered':",
                err
              );
          }
        );
      }
    }

    const updatedShipping = await new Promise((resolve, reject) => {
      db.get(GET_SHIPPING_BY_ID_QUERY, [shippingId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    const formattedShipping = {
      id: updatedShipping.ShippingID,
      orderId: updatedShipping.OrderID,
      clientName: updatedShipping.ClientName,
      trackingNumber: updatedShipping.TrackingNumber,
      carrier: updatedShipping.Carrier,
      shippingDate: updatedShipping.ShippingDate.split(" ")[0],
      deliveryDate: updatedShipping.DeliveryDate
        ? updatedShipping.DeliveryDate.split(" ")[0]
        : null,
      status: updatedShipping.Status,
      totalAmount: parseFloat(updatedShipping.TotalAmount).toFixed(2),
    };

    return res.json(formattedShipping);
  } catch (err) {
    console.error("Ошибка SQLite при обновлении доставки:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при обновлении доставки." });
  }
});

// DELETE /shipping/:id: Удаление записи о доставке
router.delete(
  "/shipping/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    const shippingId = parseInt(req.params.id);

    try {
      const runQuery = new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM Shipping 
                     WHERE ShippingID = ?`,
          [shippingId],
          function (err) {
            if (err) return reject(err);
            resolve(this.changes);
          }
        );
      });

      const changes = await runQuery;

      if (changes === 0) {
        return res
          .status(404)
          .json({ message: "Запись о доставке не найдена." });
      }

      console.log(`[SQLite] Успешно удалена доставка ID: ${shippingId}`);
      return res.status(204).send();
    } catch (err) {
      console.error("Ошибка SQLite при удалении доставки:", err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при удалении доставки." });
    }
  }
);

// =================================================================
// 4. РОУТЫ ДЛЯ ОТМЕН (CRUD)
// =================================================================

// GET /cancellations: Получение списка всех отмен
router.get("/cancellations", protect, authorize("admin"), async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(GET_ALL_CANCELLATIONS_QUERY, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const cancellationList = rows.map((item) => ({
      id: item.CancellationID,
      orderId: item.OrderID,
      reason: item.Reason,
      cancellationDate: item.CancellationDate
        ? item.CancellationDate.split(" ")[0]
        : "N/A",
      totalAmount: parseFloat(item.TotalAmount).toFixed(2),
      initiator:
        item.ClientInitiatorName || item.AdminProcessorName || "Система",
    }));

    return res.json(cancellationList);
  } catch (err) {
    console.error("Ошибка SQLite при получении списка отмен:", err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера при загрузке данных об отменах." });
  }
});

// POST /cancellations: Создание новой записи об отмене
router.post("/cancellations", protect, authorize("admin"), async (req, res) => {
  const adminId = req.user.id;
  const { orderId, reason } = req.body;

  if (!orderId || !reason) {
    return res
      .status(400)
      .json({ message: "Требуются OrderID и Reason (причина отмены)." });
  }

  try {
    const runQuery = new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Cancellations (OrderID, AdminID, CancellationDate, Reason)
                     VALUES (?, ?, DATETIME('now'), ?)`,
        [orderId, adminId, reason],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    const cancellationId = await runQuery;

    db.run(
      `UPDATE Orders SET Status = 'Canceled' WHERE OrderID = ?`,
      [orderId],
      (err) => {
        if (err)
          console.error("Ошибка обновления статуса заказа после отмены:", err);
      }
    );

    const newCancellation = await new Promise((resolve, reject) => {
      db.get(GET_CANCELLATION_BY_ID_QUERY, [cancellationId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!newCancellation) {
      return res.status(500).json({
        message:
          "Отмена создана, но не удалось получить связанные данные для ответа.",
      });
    }

    const formattedCancellation = {
      id: newCancellation.CancellationID,
      orderId: newCancellation.OrderID,
      reason: newCancellation.Reason,
      cancellationDate: newCancellation.CancellationDate.split(" ")[0],
      totalAmount: parseFloat(newCancellation.TotalAmount).toFixed(2),
      initiator: newCancellation.AdminProcessorName,
    };

    return res.status(201).json(formattedCancellation);
  } catch (err) {
    console.error("Ошибка SQLite при добавлении отмены:", err);
    if (
      err.message.includes("UNIQUE constraint failed: Cancellations.OrderID")
    ) {
      return res.status(409).json({ message: "Этот заказ уже был отменен." });
    }
    return res
      .status(500)
      .json({ message: "Ошибка сервера при добавлении отмены." });
  }
});

// DELETE /cancellations/:id: Удаление записи об отмене
router.delete(
  "/cancellations/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    const cancellationId = parseInt(req.params.id);

    try {
      const runQuery = new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM Cancellations 
                     WHERE CancellationID = ?`,
          [cancellationId],
          function (err) {
            if (err) return reject(err);
            resolve(this.changes);
          }
        );
      });

      const changes = await runQuery;

      if (changes === 0) {
        return res
          .status(404)
          .json({ message: "Запись об отмене не найдена." });
      }

      console.log(
        `[SQLite] Успешно удалена запись об отмене ID: ${cancellationId}`
      );
      return res.status(204).send();
    } catch (err) {
      console.error("Ошибка SQLite при удалении отмены:", err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при удалении отмены." });
    }
  }
);

// --- РОУТЫ ДЛЯ ВОЗВРАТОВ (REFUNDS) ---
// Получить все возвраты (Только для админов)
router.get("/refunds", protect, authorize("admin"), async (req, res) => {
  try {
    // Здесь должна быть логика получения данных из таблицы 'Refunds'
    // Пока используем заглушку.
    const refundsData = [
      {
        id: 1,
        orderId: 101,
        cancellationId: 5,
        date: "2025-11-20",
        amount: 150.0,
        status: "Completed",
        initiatedBy: "Admin",
      },
      {
        id: 2,
        orderId: 103,
        cancellationId: 7,
        date: "2025-11-21",
        amount: 50.5,
        status: "Pending",
        initiatedBy: "Client",
      },
    ];
    res.json(refundsData);
  } catch (error) {
    console.error("Ошибка при получении возвратов:", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера при получении возвратов." });
  }
});

module.exports = router;
