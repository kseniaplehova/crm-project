import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const API_ENDPOINT = "/api/data/cancellations";

const CancellationFormModal = ({
  show,
  handleClose,
  onSave,
  orderIdToCancel,
}) => {
  const getInitialState = (id) => ({
    orderId: id || "",
    reason: "",
  });

  const [formData, setFormData] = useState(getInitialState(orderIdToCancel));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    setFormData(getInitialState(orderIdToCancel));
    setError(null);
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
        orderId: parseInt(formData.orderId),
        reason: formData.reason,
      };

      const response = await axios.post(API_ENDPOINT, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave(response.data);
      handleModalClose();
    } catch (err) {
      console.error("Ошибка создания отмены:", err.response || err);
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
    setFormData(getInitialState(orderIdToCancel));
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      backdrop="static"
      keyboard={false}
    >
           {" "}
      <Modal.Header closeButton>
                <Modal.Title>Создать запись об отмене (Админ)</Modal.Title>     {" "}
      </Modal.Header>
           {" "}
      <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}       {" "}
        <Form onSubmit={handleSubmit}>
                   {" "}
          <Form.Group className="mb-3">
                        <Form.Label>ID Заказа</Form.Label>           {" "}
            <Form.Control
              type="number"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              placeholder="Введите ID заказа для отмены"
              required
              min="1"
            />
                       {" "}
            <Form.Text className="text-muted">
                            Создание записи об отмене автоматически меняет
              статус заказа на "Cancelled".            {" "}
            </Form.Text>
                     {" "}
          </Form.Group>
                   {" "}
          <Form.Group className="mb-3">
                        <Form.Label>Причина отмены</Form.Label>           {" "}
            <Form.Control
              as="textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Например: Запрос клиента, нет в наличии, ошибка ввода."
              required
              rows={3}
            />
                     {" "}
          </Form.Group>
                 {" "}
        </Form>
             {" "}
      </Modal.Body>
           {" "}
      <Modal.Footer>
               {" "}
        <Button
          variant="secondary"
          onClick={handleModalClose}
          disabled={loading}
        >
                    Отмена        {" "}
        </Button>
               {" "}
        <Button variant="danger" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Создание..." : "Создать запись об отмене"}     
           {" "}
        </Button>
             {" "}
      </Modal.Footer>
         {" "}
    </Modal>
  );
};

export default CancellationFormModal;
