import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Card,
  Spin,
  Alert,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import OrderFormModal from "./OrderFormModal";

const { Title } = Typography;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]); // Добавляем состояние для клиентов
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Функция для загрузки данных (заказов и клиентов)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Загрузка заказов
      const ordersResponse = await axios.get("/api/data/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(ordersResponse.data);

      // Загрузка клиентов (нужно для Select в модальном окне)
      const clientsResponse = await axios.get("/api/data/clients", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClients(clientsResponse.data);
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setError("Не удалось загрузить данные о заказах или клиентах.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    console.log("Кнопка нажата!");
    setCurrentOrder(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentOrder(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`/api/data/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Заказ успешно удален.");
      fetchData(); // Перезагружаем список
    } catch (err) {
      console.error("Ошибка удаления заказа:", err);
      message.error("Ошибка при удалении заказа.");
    }
  };

  const handleSuccess = (newOrder) => {
    message.success(
      `Заказ #${newOrder.id} успешно ${currentOrder ? "обновлен" : "создан"}.`
    );
    setIsModalVisible(false);
    fetchData(); // Перезагружаем список
  };

  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case "New":
        color = "blue";
        break;
      case "Processing":
        color = "geekblue";
        break;
      case "Shipped":
        color = "purple";
        break;
      case "Delivered":
        color = "green";
        break;
      case "Canceled":
        color = "volcano";
        break;
      case "Refunded":
        color = "red";
        break;
      default:
        color = "default";
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const columns = [
    {
      title: "# ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Клиент",
      dataIndex: "clientName",
      key: "clientName",
      sorter: (a, b) => a.clientName.localeCompare(b.clientName),
    },
    {
      title: "Дата заказа",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Описание товара",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Сумма",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `€ ${amount}`,
      sorter: (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
      align: "right",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Изменить
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить этот заказ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2}>
        <ShoppingCartOutlined /> Управление Заказами
      </Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleCreate}
        style={{ marginBottom: 16, position: "relative", zIndex: 100 }}
      >
        Добавить заказ
      </Button>

      {error && (
        <Alert
          message="Ошибка загрузки"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Нет данных о заказах." }}
      />

      <OrderFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleSuccess}
        currentOrder={currentOrder}
        clients={clients} // Передаем список клиентов
      />
    </Card>
  );
};

export default OrderList;
