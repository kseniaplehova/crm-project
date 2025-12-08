import React from "react";

const OrderList = () => {
  return (
    <div className="list-container">
      <h2>Управление Заказами</h2>
      <p>
        Здесь будет отображаться список всех заказов в системе (активные,
        завершенные, ожидающие оплаты).
      </p>
      <button className="btn-add" style={{ backgroundColor: "#007bff" }}>
        + Добавить Заказ
      </button>

      {/* В будущем здесь будет таблица заказов */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px dashed #ccc",
        }}
      >
        Временная заглушка таблицы заказов...
      </div>
    </div>
  );
};

export default OrderList;
