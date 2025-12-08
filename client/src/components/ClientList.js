import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientList.css";
import ClientModal from "./ClientModal"; // <-- Импортируем модальное окно

// Временный массив мок-данных с добавлением поля 'role'
const INITIAL_CLIENTS = [
  {
    id: 1,
    name: "Иванов И.И.",
    email: "ivanov@example.com",
    created: "2023-10-01",
    role: "client",
  },
  {
    id: 2,
    name: "Петрова А.С.",
    email: "petrova@example.com",
    created: "2023-10-15",
    role: "client",
  },
  {
    id: 3,
    name: "Сидоров П.В.",
    email: "sidorov@example.com",
    created: "2023-11-05",
    role: "client",
  },
];

const ClientList = () => {
  // Добавляем состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Используем INITIAL_CLIENTS как начальное состояние
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [loading, setLoading] = useState(false); // Установим false, пока не настроен реальный fetch
  const [error, setError] = useState(null);

  // Функции для управления модальным окном
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Функция для обновления списка после добавления нового клиента
  const handleNewClientAdded = (newClient) => {
    // Добавляем нового клиента в начало списка
    setClients([newClient, ...clients]);
  };

  /* * ВРЕМЕННО КОММЕНТИРУЕМ useEffect, 
    * так как роут /admin-dashboard возвращает не список, а сообщение.
    * Позже мы вернемся к реальной загрузке данных.
    
    useEffect(() => {
        // ... (логика fetchClient остается пока неактивной)
    }, []);
    */

  if (loading) {
    return (
      <div className="client-list-container">
        <p className="status-message-list">Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-list-container">
        <p
          className="status-message-list"
          style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="client-list-container">
      <h2>Панель Администратора (Список Клиентов)</h2>
      <button className="btn-add" onClick={openModal}>
        + Добавить Клиента
      </button>

      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Дата регистрации</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            // Важно: Убедитесь, что здесь нет пробелов, которые могут быть восприняты как текст
            <tr key={client.id || client.email}>
              <td>{client.id}</td>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.role || "N/A"}</td>
              <td>{client.created}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ClientModal
        show={isModalOpen} // Передаем состояние видимости
        handleClose={closeModal} // Передаем функцию закрытия
        onClientAdded={handleNewClientAdded} // Передаем функцию обновления списка
      />
    </div>
  );
};

export default ClientList;
