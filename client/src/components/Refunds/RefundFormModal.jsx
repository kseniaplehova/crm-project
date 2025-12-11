// src/components/Refunds/RefundFormModal.jsx

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const RefundFormModal = ({ show, handleClose, onSave }) => {
  const initialState = {
    orderId: "",
    amount: "",
    reason: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (show) {
      setFormData(initialState);
      setError(null);
    }
  }, [show]);

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

    if (!formData.orderId || !formData.amount || !formData.reason) {
      setError("Заполните все поля.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        orderId: parseInt(formData.orderId),
        amount: parseFloat(formData.amount),
        reason: formData.reason,
      };

      // POST запрос на создание возврата
      const response = await axios.post(
        "http://localhost:5000/api/data/refunds",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSave(response.data);
      handleClose();
    } catch (err) {
      console.error("Ошибка создания возврата:", err.response || err);
      const msg =
        err.response?.data?.message || "Ошибка сервера при создании возврата.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError(null);
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
        <Modal.Title>Создание записи о возврате</Modal.Title>
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
              placeholder="Введите ID заказа"
              required
              min="1"
            />
            <Form.Text className="text-muted">
              Убедитесь, что заказ существует и подходит для возврата.
            </Form.Text>
          </Form.Group>

          {/* Amount */}
          <Form.Group className="mb-3">
            <Form.Label>Сумма возврата ($)</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Введите сумму"
              required
              min="0.01"
              step="0.01"
            />
          </Form.Group>

          {/* Reason */}
          <Form.Group className="mb-3">
            <Form.Label>Причина возврата</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Например: Отмена заказа, брак товара и т.д."
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
        <Button variant="success" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Зарегистрировать возврат"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RefundFormModal;
