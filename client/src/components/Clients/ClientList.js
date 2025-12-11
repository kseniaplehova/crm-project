// src/components/Clients/ClientList.js (Готовая и исправленная версия)

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientList.css";
// ИСПРАВЛЕН ИМПОРТ: Предполагаем, что файл называется ClientFormModal.jsx
import ClientFormModal from "./ClientModal.js";
import { useAuth } from "../../contexts/AuthContext";

const API_URL_BASE = "http://localhost:5000/api/data/clients";

const ClientList = () => {
  // Получаем токен и пользователя из контекста
  const { token, user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  // Функции для управления модальным окном
  const openModal = () => setIsModalOpen(true); // Используется кнопкой "Добавить"
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null); // Очищаем данные редактирования
  };

  const handleEditClick = (client) => {
    setEditingClient(client); // Загружаем данные клиента в форму
    setIsModalOpen(true);
  };

  // Обновление существующего клиента (Update)
  const handleClientUpdated = (updatedClient) => {
    setClients(
      clients.map((client) =>
        // Если ID совпадает, заменяем старый объект на новый
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  // Обновление списка после добавления нового клиента (Create)
  const handleNewClientAdded = (newClient) => {
    setClients([newClient, ...clients]);
  };

  // --- ФУНКЦИЯ УДАЛЕНИЯ КЛИЕНТА (Delete) ---
  const handleDelete = async (clientId) => {
    // Запрещаем администратору удалять самого себя
    if (user && user.id === clientId) {
      setError(
        "Вы не можете удалить свою собственную учетную запись администратора."
      );
      return;
    }

    if (
      !window.confirm(
        `Вы уверены, что хотите удалить клиента с ID ${clientId}? Это может вызвать проблемы, если у него есть заказы.`
      )
    ) {
      return;
    }

    if (!token) {
      setError("Ошибка аутентификации. Пожалуйста, войдите снова.");
      return;
    }

    try {
      await axios.delete(`${API_URL_BASE}/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Обновляем состояние, убирая удаленного клиента
      setClients(clients.filter((client) => client.id !== clientId));
    } catch (error) {
      console.error("Ошибка удаления клиента:", error);
      // Обработка ошибки, если есть связанные заказы
      const message =
        error.response?.status === 409
          ? "Невозможно удалить клиента: существуют связанные заказы."
          : error.response?.data?.message || "Ошибка удаления.";

      setError(message);
    }
  };
  // ----------------------------------------

  // --- ЗАГРУЗКА ДАННЫХ (Read) ---
  useEffect(() => {
    const fetchClients = async () => {
      if (!token) {
        setError("Ошибка аутентификации. Не найден токен.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          API_URL_BASE, // GET /api/data/clients
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setClients(response.data);
      } catch (err) {
        console.error("Ошибка загрузки клиентов:", err);
        setError(
          "Не удалось загрузить данные клиентов. Проверьте сервер и токен."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [token]);
  // ----------------------------------------------------

  // === РЕНДЕРИНГ ===
  if (loading) {
    return (
      <div className="client-list-container">
        <p className="status-message-list">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="client-list-container">
      <h2>👤 Управление Клиентами ({clients.length})</h2>

      {error && (
        <div
          className="status-message-list"
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "10px",
            margin: "10px 0",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {/* Кнопка "Добавить" теперь использует openModal */}
      <button
        className="btn-add"
        onClick={openModal}
        style={{ backgroundColor: "#007bff", margin: "10px 0" }}
      >
        + Добавить Клиента
      </button>

      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Роль</th>
            <th>Дата Создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id || client.email}>
              <td>{client.id}</td>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.phone || "—"}</td>
              <td>{client.role}</td>
              <td>{client.created}</td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => handleEditClick(client)}
                  style={{ marginRight: "5px" }}
                >
                  Редактировать
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(client.id)}
                  // Запрещаем удаление, если ID совпадает с текущим пользователем
                  disabled={user && user.id === client.id}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ИСПОЛЬЗУЕМ ИСПРАВЛЕННОЕ ИМЯ КОМПОНЕНТА: ClientFormModal */}
      <ClientFormModal
        show={isModalOpen}
        handleClose={closeModal}
        onClientAdded={handleNewClientAdded}
        clientData={editingClient}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
};

export default ClientList;
