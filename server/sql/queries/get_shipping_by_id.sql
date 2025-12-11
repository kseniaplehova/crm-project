-- Запрос для получения одной записи доставки (используется в POST и PUT /shipping)
-- Использует LEFT JOIN для предотвращения ошибки 500, если связанные данные не найдены.
SELECT 
    s.ShippingID, s.OrderID, s.TrackingNumber, s.Carrier, 
    s.ShippingDate, s.DeliveryDate, s.Status, 
    o.TotalAmount, c.Name as ClientName
FROM Shipping s
LEFT JOIN Orders o ON s.OrderID = o.OrderID
LEFT JOIN Clients c ON o.ClientID = c.ClientID
WHERE s.ShippingID = ?;