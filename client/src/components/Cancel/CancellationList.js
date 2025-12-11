import React from "react";

const CancellationList = () => {
  return (
    <div className="list-container">
      <h2>Управление Отменами и Возвратами</h2>
      <p>
        Здесь будет отображаться список всех отмененных заказов и запросов на
        возврат средств.
      </p>

      {/* В будущем здесь будет таблица отмен */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px dashed #ccc",
        }}
      >
        Временная заглушка таблицы отмен...
      </div>
    </div>
  );
};

export default CancellationList;
