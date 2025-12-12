CREATE TABLE IF NOT EXISTS Clients (
    ClientID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    Phone TEXT,
    Role TEXT DEFAULT 'client' CHECK(Role IN ('client', 'admin')),
    CreatedDate TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    ClientID INTEGER NOT NULL,
    OrderDate TEXT NOT NULL,
    Status TEXT DEFAULT 'New',
    TotalAmount REAL NOT NULL,
    Description TEXT,
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID)
);

CREATE TABLE IF NOT EXISTS Shipping (
    ShippingID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER UNIQUE NOT NULL,
    TrackingNumber TEXT UNIQUE,
    Carrier TEXT,
    ShippingDate TEXT NOT NULL,
    DeliveryDate TEXT,
    Status TEXT DEFAULT 'Pending' CHECK(Status IN ('Pending', 'Shipped', 'In Transit', 'Delivered', 'Exception')),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);

CREATE TABLE IF NOT EXISTS Cancellations (
    CancellationID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    ClientID INTEGER,
    AdminID INTEGER,
    CancellationDate TEXT NOT NULL,
    ProcessedDate TEXT,
    Status TEXT NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ClientID) REFERENCES Users(UserID),
    FOREIGN KEY (AdminID) REFERENCES Users(UserID)
);

CREATE TABLE IF NOT EXISTS Products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT,
    UnitPrice REAL NOT NULL 
);

CREATE TABLE IF NOT EXISTS OrderDetails (
    OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL,
    PriceAtOrder REAL NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE RESTRICT
);

DELETE FROM Clients WHERE Email = 'admin@crm.com';

INSERT INTO Clients (ClientID, Name, Email, PasswordHash, Role, CreatedDate)
VALUES (
    1, 
    'Admin User', 
    'admin@crm.com', 
    '$2b$10$R9Uu5MOrKj4Dtfx51TSQo.mxUokJ9ytr92S4MwNqD.0nRttbUTQzS', 
    'admin', 
    DATETIME('now')
);