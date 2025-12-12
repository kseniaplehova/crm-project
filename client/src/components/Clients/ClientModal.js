import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientModal.css";

const API_URL = "http://localhost:5000/api/data/clients";

const ClientModal = ({
  show,
  handleClose,
  onClientAdded,
  onClientUpdated,
  clientData,
}) => {
  const isEditing = !!clientData;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isEditing && clientData) {
      setName(clientData.name || "");
      setEmail(clientData.email || "");
      setPhone(clientData.phone || "");
      setRole(clientData.role || "client");
      setError(null);
      setSuccessMessage(null);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("client");
      setError(null);
      setSuccessMessage(null);
    }
  }, [isEditing, clientData, show]);

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

    const clientDataToSend = { name, email, phone, role };
    let url = API_URL;
    let method = "post";

    if (isEditing) {
      url = `${API_URL}/${clientData.id}`;
      method = "put";
    }

    try {
      const response = await axios({
        method: method,
        url: url,
        data: clientDataToSend,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isEditing) {
        onClientUpdated(response.data);
        setSuccessMessage("Клиент успешно обновлен!");
      } else {
        onClientAdded(response.data);
        setSuccessMessage("Клиент успешно добавлен!");
        setName("");
        setEmail("");
        setPhone("");
        setRole("client");
      }
    } catch (err) {
      console.error(
        `Ошибка ${isEditing ? "редактирования" : "добавления"} клиента:`,
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

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>
          {isEditing
            ? `Редактирование клиента ID ${clientData.id}`
            : "Добавить нового клиента"}
        </h3>

        {error && <p className="modal-error">{error}</p>}
        {successMessage && <p className="modal-success">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ФИО:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Телефон:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {isEditing && (
            <div className="form-group">
              <label>Роль:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading
                ? "Обработка..."
                : isEditing
                ? "Сохранить изменения"
                : "Добавить"}
            </button>
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
