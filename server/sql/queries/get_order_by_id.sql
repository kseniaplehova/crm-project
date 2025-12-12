SELECT 
    o.OrderID, 
    o.ClientID, 
    c.Name AS ClientName,
    o.OrderDate, 
    o.Status, 
    o.TotalAmount,
    o.Description    
FROM Orders o
JOIN Clients c ON o.ClientID = c.ClientID
WHERE o.OrderID = ?