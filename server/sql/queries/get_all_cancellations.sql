-- Запрос для получения списка всех отмен (GET /cancellations)
-- Использует LEFT JOIN для получения имен, которые могут быть NULL.
SELECT 
    c.CancellationID, c.OrderID, c.CancellationDate, c.Reason,
    o.TotalAmount,
    client.Name as ClientInitiatorName,
    admin.Name as AdminProcessorName
FROM Cancellations c
JOIN Orders o ON c.OrderID = o.OrderID -- Отмена всегда привязана к заказу
LEFT JOIN Clients client ON c.ClientID = client.ClientID -- Может быть NULL
LEFT JOIN Clients admin ON c.AdminID = admin.ClientID     -- Может быть NULL
ORDER BY c.CancellationDate DESC;