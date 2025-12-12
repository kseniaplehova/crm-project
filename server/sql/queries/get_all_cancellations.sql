SELECT
    c.CancellationID,
    c.OrderID,
    c.CancellationDate,
    o.TotalAmount,
    client.Name AS ClientInitiatorName,
    admin.Name AS AdminProcessorName,
    c.Status
FROM Cancellations c
JOIN Orders o ON c.OrderID = o.OrderID
LEFT JOIN Clients client ON c.ClientID = client.ClientID
LEFT JOIN Clients admin ON c.AdminID = admin.ClientID
ORDER BY c.CancellationDate DESC;