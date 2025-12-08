import React, { useState } from "react";
import axios from "axios";
import "./ClientModal.css"; // Будет создан ниже

// URL для создания нового клиента
const API_URL = "http://localhost:5000/api/data/clients";

const ClientModal = ({ show, handleClose, onClientAdded }) => {
  // Состояние для полей формы
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Если модальное окно не должно отображаться, возвращаем null
  if (!show) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Ошибка аутентификации. Пожалуйста, войдите снова.");
      return;
    }

    try {
      const clientData = { name, email, phone };

      // Отправляем защищенный запрос на сервер
      const response = await axios.post(API_URL, clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Предполагаем, что сервер вернул объект клиента
      const newClient = response.data;
      setMessage(`Клиент "${newClient.name}" успешно добавлен!`);

      // Вызываем функцию обратного вызова для обновления списка в ClientList
      onClientAdded(newClient);

      // Очистка формы
      setName("");
      setEmail("");
      setPhone("");

      // Закрываем модальное окно через 1 секунду после успеха
      setTimeout(handleClose, 1000);
    } catch (error) {
      console.error("Error adding client:", error);
      setMessage(error.response?.data?.message || "Ошибка добавления клиента.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={handleClose}>
          &times;
        </button>
        <h3>Добавить нового клиента</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group-modal">
            <label>ФИО:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group-modal">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group-modal">
            <label>Телефон:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-save">
            Сохранить
          </button>
        </form>

        {message && <p className="modal-message">{message}</p>}
      </div>
    </div>
  );
};

export default ClientModal;
