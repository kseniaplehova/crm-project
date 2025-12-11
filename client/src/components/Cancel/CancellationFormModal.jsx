// src/components/CancellationFormModal.jsx

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const CancellationFormModal = ({
  show,
  handleClose,
  onSave,
  orderIdToCancel,
}) => {
  const initialState = {
    orderId: orderIdToCancel || "", // ID Заказа, который отменяем
    reason: "", // Причина отмены
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Обновляем orderId при изменении prop
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      orderId: orderIdToCancel || "",
    }));
  }, [orderIdToCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.orderId || !formData.reason) {
      setError("Пожалуйста, укажите ID Заказа и причину отмены.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        orderId: parseInt(formData.orderId), // Убедимся, что ID — число
        reason: formData.reason,
      };

      // Отправляем запрос POST на создание отмены
      const response = await axios.post(
        "http://localhost:5000/api/data/cancellations",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Если успешно, вызываем колбэк для обновления списка и закрываем модальное окно
      onSave(response.data);
      handleClose();
    } catch (err) {
      console.error("Ошибка создания отмены:", err.response || err);
      // Обрабатываем 409 Conflict (уже отменен)
      const msg =
        err.response?.status === 409
          ? "Этот заказ уже был отменен ранее."
          : err.response?.data?.message ||
            "Ошибка сервера при создании отмены.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <Modal.Title>Отмена заказа</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* Order ID */}
          <Form.Group className="mb-3">
            <Form.Label>ID Заказа</Form.Label>
            <Form.Control
              type="number"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              placeholder="Введите ID заказа для отмены"
              required
              min="1"
            />
            <Form.Text className="text-muted">
              Отмена заказа автоматически меняет его статус на "Canceled".
            </Form.Text>
          </Form.Group>

          {/* Reason */}
          <Form.Group className="mb-3">
            <Form.Label>Причина отмены</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Например: Запрос клиента, нет в наличии и т.д."
              required
              rows={3}
            />
          </Form.Group>
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
        <Button variant="danger" onClick={handleSubmit} disabled={loading}>
          {loading ? "Отмена..." : "Подтвердить отмену"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancellationFormModal;
