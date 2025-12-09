import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientList.css";
import ClientModal from "./ClientModal";

// --- УДАЛЯЕМ МОК-ДАННЫЕ ---
// const INITIAL_CLIENTS = [...]

const API_URL_BASE = "http://localhost:5000/api/data/clients";

const ClientList = () => {
  // Используем пустой массив по умолчанию, loading = true для первого запроса
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true); // Изменено на true
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  // Функции для управления модальным окном
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null); // Важно: очищаем данные редактирования
  };
  const handleEditClick = (client) => {
    setEditingClient(client); // Загружаем данные клиента в форму
    setIsModalOpen(true);
  };
  const handleClientUpdated = (updatedClient) => {
    setClients(
      clients.map((client) =>
        // Если ID совпадает, заменяем старый объект на новый
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  // Функция для обновления списка после добавления нового клиента (Create)
  const handleNewClientAdded = (newClient) => {
    setClients([newClient, ...clients]);
  };

  // --- ФУНКЦИЯ УДАЛЕНИЯ КЛИЕНТА (Delete) ---
  const handleDelete = async (clientId) => {
    if (
      !window.confirm(
        `Вы уверены, что хотите удалить клиента с ID ${clientId}?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
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
      setError(error.response?.data?.message || "Ошибка удаления.");
    }
  };
  // ----------------------------------------

  // --- АКТИВИРУЕМ useEffect ДЛЯ ЗАГРУЗКИ ДАННЫХ (Read) ---
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Ошибка аутентификации. Не найден токен.");
        setLoading(false);
        return;
      }

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
  }, []);
  // ----------------------------------------------------

  if (loading) {
    return (
      <div className="client-list-container">
        <p className="status-message-list">Загрузка данных из SQL...</p>
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
      {/* ... (h2, button "+ Добавить Клиента") ... */}

      <table className="client-table">
        {/* ... (thead) ... */}
        <tbody>
          {clients.map((client) => (
            <tr key={client.id || client.email}>
              {/* ... (ячейки с данными) ... */}
              <td>
                {/* --- КНОПКА "РЕДАКТИРОВАТЬ" --- */}
                <button
                  className="btn-edit"
                  onClick={() => handleEditClick(client)}
                >
                  Редактировать
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(client.id)}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ClientModal
        show={isModalOpen}
        handleClose={closeModal}
        onClientAdded={handleNewClientAdded}
        // Передаем данные редактируемого клиента (будет null при добавлении)
        clientData={editingClient}
        // Передаем функцию, которая обновит список на клиенте
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
};

export default ClientList;
