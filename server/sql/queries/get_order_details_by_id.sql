-- Запрос для получения всех товаров, входящих в один заказ
SELECT
    od.OrderDetailID,
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