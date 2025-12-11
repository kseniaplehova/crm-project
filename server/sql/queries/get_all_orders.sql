-- Запрос для получения списка всех заказов (GET /orders)
-- Использует JOIN, так как заказ всегда должен принадлежать клиенту.
SELECT 
    o.OrderID, o.ClientID, c.Name as ClientName, 
    o.OrderDate, o.Status, o.TotalAmount
FROM Orders o
JOIN Clients c ON o.ClientID = c.ClientID
