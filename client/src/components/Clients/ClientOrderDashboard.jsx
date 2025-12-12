import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Alert,
  message,
  Typography,
  Table,
  Tag,
  Modal,
  Space,
} from "antd";
import { SendOutlined, ReloadOutlined, StopOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { confirm } = Modal;

const API_ENDPOINT_ORDERS = "/api/data/orders";

const ClientOrderDashboard = () => {
  const [form] = Form.useForm();
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const fetchClientOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINT_ORDERS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClientOrders(response.data);
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setError("Не удалось загрузить ваши заказы.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientOrders();
  }, []);

  const handleRowClick = async (record) => {
    const orderId = record.id;
    console.log("Кликнули на заказ ID:", orderId);
    setSelectedOrderDetails(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Токен не найден.");

      const detailsResponse = await axios.get(
        `/api/data/orders/${orderId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedOrderDetails(detailsResponse.data);
    } catch (error) {
      console.error("Ошибка загрузки деталей заказа:", error);
      setSelectedOrderDetails([]);
    }
  };

  const handleOrderSubmit = async (values) => {
    setFormLoading(true);
    setError(null);

    const orderData = {
      ...values,
      status: "New",
    };

    try {
      await axios.post(API_ENDPOINT_ORDERS, orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      message.success("Заказ успешно создан и отправлен администратору!");
      form.resetFields();
      fetchClientOrders();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Не удалось создать заказ.";
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    confirm({
      title: "Вы уверены, что хотите отменить этот заказ?",
      icon: <StopOutlined style={{ color: "red" }} />,
      content:
        "Отменить можно только новые заказы. Вы не сможете восстановить его.",
      okText: "Да, отменить",
      okType: "danger",
      cancelText: "Нет",
      async onOk() {
        try {
          await axios.patch(
            `${API_ENDPOINT_ORDERS}/${orderId}/cancel`,
            {}, // <--- ИЗМЕНЕНИЕ ЗДЕСЬ
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          message.success(`Заказ #${orderId} отменен.`);
          fetchClientOrders();
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || "Не удалось отменить заказ.";
          message.error(errorMessage);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "New":
        return <Tag color="blue">Новый</Tag>;
      case "Processing":
        return <Tag color="gold">В работе</Tag>;
      case "Completed":
        return <Tag color="green">Выполнен</Tag>;
      case "Cancelled":
        return <Tag color="red">Отменен</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Описание товара",
      dataIndex: "description",
      key: "description",
      // Добавьтеellipsis: true, чтобы длинные описания не ломали макет
      ellipsis: true,
    },
    {
      title: "Сумма",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `€ ${amount}`,
    },

    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "New" && (
            <Button
              icon={<StopOutlined />}
              danger
              onClick={() => handleCancelOrder(record.id)}
              size="small"
            >
              Отменить
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Личный Кабинет Заказов
      </Title>

      {/* Секция 1: Форма Добавления Заказа */}
      <Card
        title="Сделать Новый Заказ"
        style={{ marginBottom: 30 }}
        extra={
          <Button
            onClick={fetchClientOrders}
            icon={<ReloadOutlined />}
            loading={loading}
            type="default"
          >
            Обновить
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          name="client_order_form"
          onFinish={handleOrderSubmit}
        >
          <Form.Item
            name="totalAmount"
            label="Общая сумма (€)"
            rules={[{ required: true, message: "Введите сумму!" }]}
          >
            <InputNumber
              min={0.01}
              step={0.01}
              formatter={(value) =>
                `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/[\€\s,]/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Краткое описание заказа"
            rules={[
              { required: true, message: "Опишите, что вы заказываете." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Например: 50 красных футболок размера XL"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              icon={<SendOutlined />}
              style={{ width: "100%" }}
            >
              Создать заказ
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Секция 2: Список Заказов и Статус */}
      <Card title="Ваши Заказы" style={{ marginBottom: 30 }}>
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
        <Table
          columns={columns}
          dataSource={clientOrders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "У вас пока нет заказов." }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </Card>
    </div>
  );
};

export default ClientOrderDashboard;
