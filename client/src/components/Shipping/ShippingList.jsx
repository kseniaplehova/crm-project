// src/components/ShippingList.jsx (Обновленная версия)

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  Container,
  Table,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import ShippingFormModal from "./ShippingFormModal"; // <<< ИМПОРТ МОДАЛЬНОГО ОКНА

const ShippingList = () => {
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояние для управления модальным окном
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Объект для редактирования

  const { token } = useAuth();

  // Функция для получения данных
  const fetchShipping = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/data/shipping",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShippingData(response.data);
    } catch (err) {
      console.error("Ошибка при получении данных о доставке:", err);
      setError(
        "Не удалось загрузить данные о доставке. Проверьте соединение с сервером."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchShipping();
    }
  }, [token, fetchShipping]);

  // Утилита для цвета статуса (оставлена без изменений)
  const getStatusVariant = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "primary";
      case "In Transit":
        return "info";
      case "Exception":
        return "danger";
      case "Pending":
      default:
        return "secondary";
    }
  };

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---

  // 1. Открытие модального окна для создания/редактирования
  const handleOpenModal = (item = null) => {
    setEditingItem(item); // null для создания, объект для редактирования
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // 2. Обработка сохранения из модального окна (POST/PUT)
  const handleSave = (savedItem, isEditing) => {
    if (isEditing) {
      // Обновление существующего элемента в списке
      setShippingData((prevData) =>
        prevData.map((item) => (item.id === savedItem.id ? savedItem : item))
      );
    } else {
      // Добавление нового элемента в начало списка
      setShippingData((prevData) => [savedItem, ...prevData]);
    }

    // !!! ДОБАВЬТЕ ЭТОТ ВЫЗОВ ДЛЯ ГАРАНТИРОВАННОЙ СИНХРОНИЗАЦИИ !!!
    // Это гарантирует, что даже если локальное обновление провалится,
    // через секунду список обновится с сервера.
    // Если fetchShipping() будет вызываться слишком быстро,
    // добавьте небольшой таймаут.
    setTimeout(fetchShipping, 100);
  };
  // 3. Обработка удаления (DELETE)
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `Вы уверены, что хотите удалить запись о доставке ID: ${id}?`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/data/shipping/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Удаление из локального состояния после успешного ответа
      setShippingData((prevData) => prevData.filter((item) => item.id !== id));
      alert(`Запись о доставке ID ${id} успешно удалена.`);
    } catch (err) {
      console.error("Ошибка при удалении доставки:", err.response || err);
      setError("Не удалось удалить запись. Возможно, она уже не существует.");
    }
  };

  // --- РЕНДЕРИНГ ---

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Загрузка данных о доставке...</p>
      </Container>
    );
  }

  if (error && !shippingData.length) {
    // Показываем ошибку, только если нет данных
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchShipping}>Повторить попытку</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📦 Управление доставками ({shippingData.length})</h2>
        <Button variant="success" onClick={() => handleOpenModal(null)}>
          + Добавить доставку
        </Button>
      </div>
      {error && <Alert variant="warning">{error}</Alert>}{" "}
      {/* Показываем ошибку поверх списка */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Заказ ID</th>
            <th>Клиент</th>
            <th>Трекинг №</th>
            <th>Перевозчик</th>
            <th>Отправлено</th>
            <th>Доставка</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {shippingData.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center">
                Нет записей о доставке.
              </td>
            </tr>
          ) : (
            shippingData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.orderId}</td>
                <td>{item.clientName}</td>
                <td>
                  <strong>{item.trackingNumber || "N/A"}</strong>
                </td>
                <td>{item.carrier}</td>
                <td>{item.shippingDate}</td>
                <td>{item.deliveryDate || "N/A"}</td>
                <td>{item.totalAmount}</td>
                <td>
                  <Badge bg={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenModal(item)}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {/* МОДАЛЬНОЕ ОКНО ФОРМЫ */}
      <ShippingFormModal
        show={showModal}
        handleClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </Container>
  );
};

export default ShippingList;
