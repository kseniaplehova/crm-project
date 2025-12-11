-- Пример: server/sql/queries/get_order_details.sql

SELECT 
    od.Quantity,
    od.PriceAtOrder,
    p.Name AS ProductName,
    p.Description AS ProductDescription 
FROM 
    OrderDetails od
JOIN 
    Products p ON od.ProductID = p.ProductID
WHERE 
    od.OrderID = ?;