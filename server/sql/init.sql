-- server/sql/init.sql

-- Таблица для пользователей/клиентов
CREATE TABLE IF NOT EXISTS Clients (
    ClientID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    Phone TEXT,
    Role TEXT DEFAULT 'client' CHECK(Role IN ('client', 'admin')),
    CreatedDate TEXT NOT NULL
);

-- Таблица для заказов
CREATE TABLE IF NOT EXISTS Orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    ClientID INTEGER NOT NULL,
    OrderDate TEXT NOT NULL,
    Status TEXT DEFAULT 'New',
    TotalAmount REAL NOT NULL,
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID)
);

-- --- НОВЫЙ БЛОК: Таблица для доставки ---
CREATE TABLE IF NOT EXISTS Shipping (
    ShippingID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER UNIQUE NOT NULL, -- Доставка привязана к одному заказу
    TrackingNumber TEXT UNIQUE,
    Carrier TEXT,                     -- Перевозчик (например, DHL, FedEx)
    ShippingDate TEXT NOT NULL,       -- Дата отправки
    DeliveryDate TEXT,                -- Ожидаемая или фактическая дата доставки
    Status TEXT DEFAULT 'Pending' CHECK(Status IN ('Pending', 'Shipped', 'In Transit', 'Delivered', 'Exception')),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);
-- ---------------------------------------


-- --- БЛОК АДМИНИСТРАТОРА (Исправлено) ---
-- 1. Сначала удаляем старую запись, чтобы гарантировать, что новый хэш применится
DELETE FROM Clients WHERE Email = 'admin@crm.com';

-- 2. Добавление тестового администратора (Пароль: adminpassword)
INSERT INTO Clients (ClientID, Name, Email, PasswordHash, Role, CreatedDate)
VALUES (
    1, 
    'Admin User', 
    'admin@crm.com', 
    -- Хеш для 'adminpassword' (сгенерирован bcrypt)
    '$2b$10$R9Uu5MOrKj4Dtfx51TSQo.mxUokJ9ytr92S4MwNqD.0nRttdUTQzS', 
    'admin', 
    DATETIME('now')
);
-- -----------------------------------------