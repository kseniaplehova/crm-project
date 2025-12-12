import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, InputNumber, Alert, Select } from "antd";
import axios from "axios";

import "../Clients/ClientModal";
const OrderFormModal = ({
  visible,
  onCancel,
  onSuccess,
  currentOrder,
  clients,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setError(null);
      if (currentOrder) {
        form.setFieldsValue({
          clientId: currentOrder.clientId,
          status: currentOrder.status,
          totalAmount: currentOrder.totalAmount,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, currentOrder, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    const endpoint = `/api/data/orders${
      currentOrder ? "/" + currentOrder.id : ""
    }`;
    const method = currentOrder ? "put" : "post";

    try {
      const response = await axios({
        method: method,
        url: endpoint,
        data: values,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      onSuccess(response.data);
      form.resetFields();
    } catch (err) {
      console.error("Ошибка сохранения заказа:", err.response || err);
      const errorMessage =
        err.response?.data?.message || "Не удалось сохранить данные заказа.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={currentOrder ? "Редактировать заказ" : "Создать новый заказ"}
      visible={visible}
      onCancel={onCancel}
      style={{ border: "2px solid red", zIndex: 99999 }}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {currentOrder ? "Сохранить" : "Создать заказ"}
        </Button>,
      ]}
    >
      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 15 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        name="order_form"
        onFinish={handleSubmit}
        initialValues={{ status: "New" }}
      >
        <Form.Item
          name="clientId"
          label="Клиент (ID)"
          rules={[{ required: true, message: "Пожалуйста, выберите клиента!" }]}
        >
          <Select
            showSearch
            placeholder="Выберите клиента"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            disabled={!!currentOrder}
          >
            {clients &&
              clients.map((client) => (
                <Select.Option key={client.id} value={client.id}>
                  {client.name} (ID: {client.id})
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="totalAmount"
          label="Общая сумма (€)"
          rules={[{ required: true, message: "Пожалуйста, введите сумму!" }]}
        >
          <InputNumber
            min={0.01}
            step={0.01}
            formatter={(value) =>
              `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\€\s?|(,*)/g, "")}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Статус заказа"
          rules={[{ required: true, message: "Пожалуйста, выберите статус!" }]}
        >
          <Select>
            <Select.Option value="New">Новый</Select.Option>
            <Select.Option value="Processing">В обработке</Select.Option>
            <Select.Option value="Shipped">Отправлен</Select.Option>
            <Select.Option value="Delivered">Доставлен</Select.Option>
            <Select.Option value="Canceled">Отменен</Select.Option>
            <Select.Option value="Refunded">Возврат</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderFormModal;
