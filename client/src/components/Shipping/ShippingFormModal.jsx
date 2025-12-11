// src/components/ShippingFormModal.jsx

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const ShippingFormModal = ({ show, handleClose, onSave, editingItem }) => {
  // Начальное состояние формы
  const initialState = {
    orderId: "",
    trackingNumber: "",
    carrier: "",
    deliveryDate: "", // формат YYYY-MM-DD
    status: "Shipped", // По умолчанию "Отправлено" при создании
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Определяем, являемся ли мы в режиме редактирования
  const isEditing = !!editingItem;

  // Эффект для загрузки данных редактируемого элемента в форму
  useEffect(() => {
    if (isEditing) {
      // Приводим данные к формату, который ждет форма
      setFormData({
        orderId: editingItem.orderId || "",
        trackingNumber: editingItem.trackingNumber || "",
        carrier: editingItem.carrier || "",
        // backend возвращает 'YYYY-MM-DD' для DeliveryDate,
        // что подходит для input type="date"
        deliveryDate: editingItem.deliveryDate || "",
        status: editingItem.status || "Shipped",
      });
    } else {
      setFormData(initialState); // Сброс для режима создания
    }
  }, [editingItem, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null); // Сброс ошибки при изменении полей
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Проверка обязательных полей
    if (!formData.orderId || !formData.trackingNumber || !formData.carrier) {
      setError("Пожалуйста, заполните ID заказа, Трекинг № и Перевозчика.");
      setLoading(false);
      return;
    }

    try {
      let response;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isEditing) {
        // РЕЖИМ РЕДАКТИРОВАНИЯ (PUT)
        // Отправляем только те поля, которые можно редактировать,
        // OrderID не должен меняться при редактировании доставки
        const updatePayload = {
          status: formData.status,
          deliveryDate: formData.deliveryDate,
          trackingNumber: formData.trackingNumber,
          carrier: formData.carrier,
        };

        response = await axios.put(
          `http://localhost:5000/api/data/shipping/${editingItem.id}`,
          updatePayload,
          config
        );
      } else {
        // РЕЖИМ СОЗДАНИЯ (POST)
        response = await axios.post(
          "http://localhost:5000/api/data/shipping",
          formData,
          config
        );
      }

      // Вызываем внешний обработчик для обновления списка
      onSave(response.data, isEditing);
      handleClose(); // Закрываем модальное окно
    } catch (err) {
      console.error(
        "Ошибка сохранения данных о доставке:",
        err.response || err
      );

      let msg = "Ошибка сервера при сохранении.";
      if (err.response) {
        if (err.response.status === 409) {
          // КОНКРЕТНАЯ ОБРАБОТКА КОНФЛИКТА (UNIQUE CONSTRAINT)
          msg =
            "Заказ уже имеет запись о доставке. Пожалуйста, закройте окно и отредактируйте существующую запись.";
        } else if (err.response.data && err.response.data.message) {
          // Сообщение от сервера (например, "Необходимо указать ID заказа...")
          msg = err.response.data.message;
        } else {
          msg = `Ошибка: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (
        err.code === "ERR_NETWORK" ||
        err.message.includes("refused")
      ) {
        msg =
          "Не удалось подключиться к серверу. Убедитесь, что сервер запущен.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Функция сброса состояния и закрытия
  const handleModalClose = () => {
    setError(null);
    setFormData(initialState);
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? "Редактировать доставку" : "Добавить новую доставку"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* Order ID - Только для режима создания */}
          {!isEditing && (
            <Form.Group className="mb-3">
              <Form.Label>ID Заказа</Form.Label>
              <Form.Control
                type="number"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="Введите ID Заказа (например, 5)"
                required
                min="1"
              />
              <Form.Text className="text-muted">
                Убедитесь, что заказ с таким ID существует.
              </Form.Text>
            </Form.Group>
          )}

          {/* Tracking Number */}
          <Form.Group className="mb-3">
            <Form.Label>Трекинг №</Form.Label>
            <Form.Control
              type="text"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              placeholder="Введите номер отслеживания"
              required
            />
          </Form.Group>

          {/* Carrier */}
          <Form.Group className="mb-3">
            <Form.Label>Перевозчик</Form.Label>
            <Form.Control
              type="text"
              name="carrier"
              value={formData.carrier}
              onChange={handleChange}
              placeholder="Введите название перевозчика (DHL, Почта и т.п.)"
              required
            />
          </Form.Group>

          {/* Delivery Date */}
          <Form.Group className="mb-3">
            <Form.Label>Ожидаемая дата доставки</Form.Label>
            <Form.Control
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Status - Только для режима редактирования */}
          {isEditing && (
            <Form.Group className="mb-3">
              <Form.Label>Статус Доставки</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Ожидание</option>
                <option value="Shipped">Отправлено</option>
                <option value="In Transit">В пути</option>
                <option value="Delivered">Доставлено</option>
                <option value="Exception">Проблема</option>
              </Form.Select>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleModalClose}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Сохранение..."
            : isEditing
            ? "Сохранить изменения"
            : "Создать запись"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShippingFormModal;
