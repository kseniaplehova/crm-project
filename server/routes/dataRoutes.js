const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Импорт экземпляра БД должен быть ТОЛЬКО ОДИН РАЗ
const { db } = require("../config/db");

// =================================================================
// 1. РОУТЫ ДЛЯ КЛИЕНТОВ (CRUD)
// =================================================================

// GET /clients: Получение списка всех клиентов
router.get("/clients", authMiddleware, async (req, res) => {
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

    // Преобразование данных для фронтенда
    const clients = rows.map((client) => ({
      id: client.ClientID,
      name: client.Name,
      email: client.Email,
      phone: client.Phone,
      role: client.Role,
      // CreatedDate в SQLite - это строка TEXT.
      created: client.CreatedDate
        ? client.CreatedDate.split(" ")[0] // Берем только дату
        : "N/A",
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
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const { name, email, phone } = req.body;

    // В реальном проекте здесь должен быть сгенерированный bcrypt-хеш.
    const tempPasswordHash = "temporary-hash";

    try {
      const runQuery = new Promise((resolve, reject) => {
        // SQLite: INSERT, возвращает ID через this.lastID
        db.run(
          `INSERT INTO Clients (Name, Email, Phone, Role, CreatedDate, PasswordHash)
           VALUES (?, ?, ?, 'client', DATETIME('now'), ?)`,
          [name, email, phone, tempPasswordHash],
          function (err) {
            if (err) return reject(err);
            // Используем this.lastID для получения сгенерированного ClientID
            resolve(this.lastID);
          }
        );
      });

      const clientId = await runQuery;

      // Получаем полные данные для ответа
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
router.put(
  "/clients/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
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
            resolve(this.changes); // this.changes показывает кол-во измененных строк
          }
        );
      });

      const changes = await runQuery;

      if (changes === 0) {
        return res.status(404).json({ message: "Клиент не найден." });
      }

      // Возвращаем обновленные данные (для UI)
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
  }
);

// DELETE /clients/:id: Удаление клиента
router.delete(
  "/clients/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
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

      // Возвращаем 204 No Content
      return res.status(204).send();
    } catch (err) {
      console.error("Ошибка SQLite при удалении клиента:", err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при удалении данных." });
    }
  }
);

// =================================================================
// 2. РОУТЫ ДЛЯ ЗАКАЗОВ (CRUD)
// =================================================================

// GET /orders: Получение списка всех заказов (ЭТОТ РОУТ НУЖНО ДОБАВИТЬ)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      // JOIN для получения имени клиента
      db.all(
        `SELECT 
            o.OrderID, o.ClientID, c.Name as ClientName, 
            o.OrderDate, o.Status, o.TotalAmount
         FROM Orders o
         JOIN Clients c ON o.ClientID = c.ClientID
         ORDER BY o.OrderDate DESC`,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
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
});

// POST /orders: Создание нового заказа
router.post(
  "/orders",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const { clientId, totalAmount, status = "New" } = req.body;

    if (!clientId || !totalAmount) {
      return res
        .status(400)
        .json({ message: "Требуются ClientID и TotalAmount." });
    }

    try {
      const runQuery = new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO Orders (ClientID, OrderDate, Status, TotalAmount)
           VALUES (?, DATETIME('now'), ?, ?)`,
          [clientId, status, totalAmount],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID); // Получаем ID созданного заказа
          }
        );
      });

      const orderId = await runQuery;

      // Получаем полные данные, включая имя клиента
      const newOrder = await new Promise((resolve, reject) => {
        db.get(
          `SELECT 
             o.OrderID, o.ClientID, c.Name as ClientName, 
             o.OrderDate, o.Status, o.TotalAmount
           FROM Orders o
           JOIN Clients c ON o.ClientID = c.ClientID
           WHERE o.OrderID = ?`,
          [orderId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
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

// PUT /orders/:id: Обновление заказа
router.put(
  "/orders/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status, totalAmount } = req.body;

    if (!status && !totalAmount) {
      return res
        .status(400)
        .json({ message: "Необходимо указать статус или сумму." });
    }

    try {
      const updates = [];
      const params = [];
      if (status) {
        updates.push("Status = ?");
        params.push(status);
      }
      if (totalAmount) {
        updates.push("TotalAmount = ?");
        params.push(totalAmount);
      }

      params.push(orderId); // Последний параметр для WHERE

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

      // Возвращаем обновленный объект заказа (для UI)
      const updatedOrder = await new Promise((resolve, reject) => {
        db.get(
          `SELECT 
             o.OrderID, o.ClientID, c.Name as ClientName, 
             o.OrderDate, o.Status, o.TotalAmount
           FROM Orders o
           JOIN Clients c ON o.ClientID = c.ClientID
           WHERE o.OrderID = ?`,
          [orderId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
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
  }
);

// DELETE /orders/:id: Удаление заказа
router.delete(
  "/orders/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
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
  }
);

// =================================================================
// 3. РОУТЫ ДЛЯ ДОСТАВКИ (CRUD)
// =================================================================

// GET /shipping: Получение списка всех доставок
router.get("/shipping", authMiddleware, async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      // JOIN для получения номера заказа и имени клиента
      db.all(
        `SELECT 
            s.ShippingID, s.OrderID, s.TrackingNumber, s.Carrier, 
            s.ShippingDate, s.DeliveryDate, s.Status, 
            o.TotalAmount, c.Name as ClientName
         FROM Shipping s
         JOIN Orders o ON s.OrderID = o.OrderID
         JOIN Clients c ON o.ClientID = c.ClientID
         ORDER BY s.ShippingDate DESC`,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
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
router.post(
  "/shipping",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const { orderId, trackingNumber, carrier, deliveryDate } = req.body;

    if (!orderId || !trackingNumber || !carrier) {
      return res
        .status(400)
        .json({ message: "Требуются OrderID, TrackingNumber и Carrier." });
    }

    try {
      const runQuery = new Promise((resolve, reject) => {
        // ShippingDate устанавливается на DATETIME('now')
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

      // Обновляем статус заказа на 'Shipped'
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

      // Получаем полную информацию для ответа
      const newShipping = await new Promise((resolve, reject) => {
        db.get(
          `SELECT s.ShippingID, s.OrderID, s.TrackingNumber, s.Carrier, 
             s.ShippingDate, s.DeliveryDate, s.Status, 
             o.TotalAmount, c.Name as ClientName
           FROM Shipping s
           JOIN Orders o ON s.OrderID = o.OrderID
           JOIN Clients c ON o.ClientID = c.ClientID
           WHERE s.ShippingID = ?`,
          [shippingId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      });

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
  }
);

// PUT /shipping/:id: Обновление статуса или даты доставки
router.put(
  "/shipping/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
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

    params.push(shippingId); // Последний параметр для WHERE

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
        return res
          .status(404)
          .json({ message: "Запись о доставке не найдена." });
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

      // Получаем обновленную запись для ответа
      const updatedShipping = await new Promise((resolve, reject) => {
        db.get(
          `SELECT s.ShippingID, s.OrderID, s.TrackingNumber, s.Carrier, 
             s.ShippingDate, s.DeliveryDate, s.Status, 
             o.TotalAmount, c.Name as ClientName
           FROM Shipping s
           JOIN Orders o ON s.OrderID = o.OrderID
           JOIN Clients c ON o.ClientID = c.ClientID
           WHERE s.ShippingID = ?`,
          [shippingId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
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
  }
);

// DELETE /shipping/:id: Удаление записи о доставке
router.delete(
  "/shipping/:id",
  authMiddleware,
  roleMiddleware("admin"),
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

module.exports = router;
