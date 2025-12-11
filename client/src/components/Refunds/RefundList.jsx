// src/components/Refunds/RefundList.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Table, Button, Alert, Spinner } from "react-bootstrap";
import RefundFormModal from "./RefundFormModal";

const RefundList = () => {
  const [refundData, setRefundData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { token } = useAuth();

  // Функция для получения данных
  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/data/refunds",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRefundData(response.data);
    } catch (err) {
      console.error("Ошибка при получении данных о возвратах:", err);
      setError(
        "Не удалось загрузить данные о возвратах. Проверьте соединение."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchRefunds();
    }
  }, [token, fetchRefunds]);

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Обработка сохранения из модального окна (POST)
  const handleSave = (savedItem) => {
    // Добавление нового возврата в начало списка
    setRefundData((prevData) => [savedItem, ...prevData]);
  };

  // Функция для стилизации статуса
  const getStatusVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "danger";
      default:
        return "secondary";
    }
  };

  // --- РЕНДЕРИНГ ---

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Загрузка данных о возвратах...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>💰 Управление возвратами ({refundData.length})</h2>
        <Button variant="success" onClick={handleOpenModal}>
          + Зарегистрировать возврат
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Заказ ID</th>
            <th>Сумма ($)</th>
            <th>Дата</th>
            <th>Статус</th>
            <th>Причина</th>
            <th>Инициатор</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {refundData.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Нет записей о возвратах.
              </td>
            </tr>
          ) : (
            refundData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.orderId}</td>
                <td>
                  <span className="text-success fw-bold">
                    ${item.amount.toFixed(2)}
                  </span>
                </td>
                <td>{item.date}</td>
                <td>
                  <Alert
                    variant={getStatusVariant(item.status)}
                    className="p-1 mb-0 text-center"
                  >
                    {item.status}
                  </Alert>
                </td>
                <td>{item.reason}</td>
                <td>{item.initiatedBy}</td>
                <td>
                  {/* В реальной системе здесь были бы кнопки "Изменить статус" или "Подтвердить" */}
                  <Button variant="outline-secondary" size="sm" disabled>
                    Детали
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* МОДАЛЬНОЕ ОКНО ФОРМЫ */}
      <RefundFormModal
        show={showModal}
        handleClose={handleCloseModal}
        onSave={handleSave}
      />
    </Container>
  );
};

export default RefundList;
