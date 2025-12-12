import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientModal.css";

const API_URL_ORDERS = "http://localhost:5000/api/data/orders";
const API_URL_CLIENTS = "http://localhost:5000/api/data/clients";

const OrderModal = ({
  show,
  handleClose,
  onOrderAdded,
  onOrderUpdated,
  orderData,
}) => {
  const isEditing = !!orderData;
  const [clients, setClients] = useState([]);

  const [clientId, setClientId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("New");

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

    if (show && clients.length === 0) {
      fetchClients();
    }
  }, [show, clients.length]);
  useEffect(() => {
    if (show) {
      setError(null);
      setSuccessMessage(null);
      if (isEditing && orderData) {
        setClientId(orderData.clientId || "");
        setTotalAmount(orderData.totalAmount || "");
        setStatus(orderData.status || "New");
      } else {
        setClientId(clients.length > 0 ? clients[0].id : "");
        setTotalAmount("");
        setStatus("New");
      }
    }
  }, [isEditing, orderData, show, clients]);

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
      clientId: parseInt(clientId),
      totalAmount: parseFloat(totalAmount),
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

      if (isEditing) {
        onOrderUpdated(response.data);
        setSuccessMessage(`Заказ ID ${orderData.id} успешно обновлен!`);
      } else {
        onOrderAdded(response.data);
        setSuccessMessage("Заказ успешно добавлен!");
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
            <div className="form-group">
              <label>Клиент:</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                disabled={isEditing}
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
