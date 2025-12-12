
SELECT 
    c.CancellationID, c.OrderID, c.CancellationDate, c.Reason,
    o.TotalAmount,
    admin.Name as AdminProcessorName
FROM Cancellations c
JOIN Orders o ON c.OrderID = o.OrderID
JOIN Clients admin ON c.AdminID = admin.ClientID 
WHERE c.CancellationID = ?;