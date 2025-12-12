SELECT 
    o.OrderID, 
    o.ClientID, 
    c.Name AS ClientName,  -- Имя клиента, полученное из Clients
    o.OrderDate, 
    o.Status, 
    o.TotalAmount,
    o.Description          -- Описание заказа (новое поле)
FROM Orders o
JOIN Clients c ON o.ClientID = c.ClientID
WHERE o.OrderID = ?