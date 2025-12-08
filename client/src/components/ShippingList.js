import React from "react";

const ShippingList = () => {
  return (
    <div className="list-container">
      <h2>Управление Доставкой</h2>
      <p>
        Здесь будет отображаться список всех активных доставок, статусы трекинга
        и информация о курьерах.
      </p>

      {/* В будущем здесь будет таблица доставок */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px dashed #ccc",
        }}
      >
        Временная заглушка таблицы доставок...
      </div>
    </div>
  );
};

export default ShippingList;
