-- Запрос для получения списка всех доставок (GET /shipping)
-- Использует LEFT JOIN для предотвращения ошибки 500, если заказ или клиент отсутствуют.
SELECT 
    s.ShippingID, s.OrderID, s.TrackingNumber, s.Carrier, 
    s.ShippingDate, s.DeliveryDate, s.Status, 
    o.TotalAmount, c.Name as ClientName
FROM Shipping s
LEFT JOIN Orders o ON s.OrderID = o.OrderID
LEFT JOIN Clients c ON o.ClientID = c.ClientID
ORDER BY s.ShippingDate DESC;