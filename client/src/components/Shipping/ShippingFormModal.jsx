import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const ShippingFormModal = ({ show, handleClose, onSave, editingItem }) => {
  const initialState = {
    orderId: "",
    trackingNumber: "",
    carrier: "",
    deliveryDate: "",
    status: "Shipped",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const isEditing = !!editingItem;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        orderId: editingItem.orderId || "",
        trackingNumber: editingItem.trackingNumber || "",
        carrier: editingItem.carrier || "",
        deliveryDate: editingItem.deliveryDate || "",
        status: editingItem.status || "Shipped",
      });
    } else {
      setFormData(initialState);
    }
  }, [editingItem, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        response = await axios.post(
          "http://localhost:5000/api/data/shipping",
          formData,
          config
        );
      }

      onSave(response.data, isEditing);
      handleClose();
    } catch (err) {
      console.error(
        "Ошибка сохранения данных о доставке:",
        err.response || err
      );

      let msg = "Ошибка сервера при сохранении.";
      if (err.response) {
        if (err.response.status === 409) {
          msg =
            "Заказ уже имеет запись о доставке. Пожалуйста, закройте окно и отредактируйте существующую запись.";
        } else if (err.response.data && err.response.data.message) {
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

          <Form.Group className="mb-3">
            <Form.Label>Ожидаемая дата доставки</Form.Label>
            <Form.Control
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
          </Form.Group>

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
