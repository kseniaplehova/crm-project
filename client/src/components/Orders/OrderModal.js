import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientModal.css"; // Переиспользуем стили модального окна клиента

// URL для работы с заказами
const API_URL_ORDERS = "http://localhost:5000/api/data/orders";
// URL для получения списка клиентов (для выпадающего списка)
const API_URL_CLIENTS = "http://localhost:5000/api/data/clients";

// Принимаем orderData для режима редактирования, а также onOrderAdded/onOrderUpdated
const OrderModal = ({
  show,
  handleClose,
  onOrderAdded,
  onOrderUpdated,
  orderData,
}) => {
  const isEditing = !!orderData;
  const [clients, setClients] = useState([]); // Список клиентов для выпадающего списка

  const [clientId, setClientId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("New");

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // Загрузка клиентов
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- 1. Загрузка списка клиентов при открытии ---
  useEffect(() => {
    const fetchClients = async () => {
      setDataLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(API_URL_CLIENTS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (err) {
        console.error("Ошибка загрузки клиентов для модалки:", err);
        setError("Не удалось загрузить список клиентов.");
      } finally {
        setDataLoading(false);
      }
    };

    // Загружаем клиентов только один раз при монтировании компонента или при необходимости
    if (show && clients.length === 0) {
      fetchClients();
    }
  }, [show, clients.length]); // Зависимость от show, чтобы запустить, если список пуст

  // --- 2. Заполнение формы при редактировании ---
  useEffect(() => {
    if (show) {
      setError(null);
      setSuccessMessage(null);
      if (isEditing && orderData) {
        // Режим редактирования: заполняем поля
        setClientId(orderData.clientId || "");
        setTotalAmount(orderData.totalAmount || "");
        setStatus(orderData.status || "New");
      } else {
        // Режим добавления: очищаем поля и ставим клиента по умолчанию (если есть)
        setClientId(clients.length > 0 ? clients[0].id : "");
        setTotalAmount("");
        setStatus("New");
      }
    }
  }, [isEditing, orderData, show, clients]);

  // --- 3. ФУНКЦИЯ ОТПРАВКИ ФОРМЫ (POST или PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Ошибка аутентификации.");
      setLoading(false);
      return;
    }

    const orderDataToSend = {
      clientId: parseInt(clientId), // Убедимся, что это число
      totalAmount: parseFloat(totalAmount), // Убедимся, что это число
      status,
    };

    let url = API_URL_ORDERS;
    let method = "post";

    if (isEditing) {
      url = `${API_URL_ORDERS}/${orderData.id}`;
      method = "put";
    }

    try {
      const response = await axios({
        method: method,
        url: url,
        data: orderDataToSend,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Обработка успеха
      if (isEditing) {
        onOrderUpdated(response.data);
        setSuccessMessage(`Заказ ID ${orderData.id} успешно обновлен!`);
      } else {
        onOrderAdded(response.data);
        setSuccessMessage("Заказ успешно добавлен!");
        // Очистка формы после добавления
        setTotalAmount("");
        setStatus("New");
      }
    } catch (err) {
      console.error(
        `Ошибка ${isEditing ? "редактирования" : "добавления"} заказа:`,
        err
      );
      setError(
        err.response?.data?.message ||
          `Ошибка ${isEditing ? "редактирования" : "добавления"}.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  const title = isEditing
    ? `Редактирование Заказа ID ${orderData.id}`
    : "Добавить новый заказ";

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{title}</h3>

        {error && <p className="modal-error">{error}</p>}
        {successMessage && <p className="modal-success">{successMessage}</p>}

        {dataLoading ? (
          <p>Загрузка данных...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* 1. Выбор Клиента */}
            <div className="form-group">
              <label>Клиент:</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                disabled={isEditing} // В режиме редактирования ID клиента обычно не меняют
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} (ID: {client.id})
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="modal-error">
                  Нет доступных клиентов. Добавьте клиента.
                </p>
              )}
            </div>

            {/* 2. Сумма Заказа */}
            <div className="form-group">
              <label>Сумма:</label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
                min="0"
              />
            </div>

            {/* 3. Статус Заказа */}
            <div className="form-group">
              <label>Статус:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="New">Новый</option>
                <option value="Pending">Ожидает оплаты</option>
                <option value="Processing">В обработке</option>
                <option value="Shipped">Отправлен</option>
                <option value="Completed">Завершен</option>
                <option value="Cancelled">Отменен</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="btn-save"
                disabled={loading || dataLoading}
              >
                {loading
                  ? "Обработка..."
                  : isEditing
                  ? "Сохранить изменения"
                  : "Добавить Заказ"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
              >
                Закрыть
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
