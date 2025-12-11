-- Запрос для получения одной записи отмены (используется в POST /cancellations)
-- Использует JOIN для обеспечения стабильности при возврате результата.
SELECT 
    c.CancellationID, c.OrderID, c.CancellationDate, c.Reason,
    o.TotalAmount,
    admin.Name as AdminProcessorName
FROM Cancellations c
JOIN Orders o ON c.OrderID = o.OrderID
JOIN Clients admin ON c.AdminID = admin.ClientID -- Админ должен быть, так как POST роут требует AdminID
WHERE c.CancellationID = ?;