import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Alert,
  message,
  Popconfirm,
  Tag,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  BoxPlotOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import ShippingFormModal from "./ShippingFormModal";

const { Title } = Typography;
const API_URL_BASE = "/api/data/shipping";

const ShippingList = () => {
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { token } = useAuth();

  const fetchShipping = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case "Delivered":
        color = "green";
        break;
      case "Shipped":
        color = "blue";
        break;
      case "In Transit":
        color = "cyan";
        break;
      case "Exception":
        color = "red";
        break;
      case "Pending":
      default:
        color = "gold";
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
  };

  const handleSave = (savedItem, isEditing) => {
    message.success(
      `Запись о доставке #${savedItem.id} успешно ${
        isEditing ? "обновлена" : "создана"
      }.`
    );

    handleCancel();
    setTimeout(fetchShipping, 100);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success(`Запись о доставке ID ${id} успешно удалена.`);
      fetchShipping();
    } catch (err) {
      console.error("Ошибка при удалении доставки:", err.response || err);
      const errorMessage =
        err.response?.data?.message || "Не удалось удалить запись.";
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Заказ ID",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: "Клиент",
      dataIndex: "clientName",
      key: "clientName",
      sorter: (a, b) => a.clientName.localeCompare(b.clientName),
    },
    {
      title: "Трекинг №",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      render: (text) => <strong>{text || "N/A"}</strong>,
    },
    {
      title: "Перевозчик",
      dataIndex: "carrier",
      key: "carrier",
      sorter: (a, b) => a.carrier.localeCompare(b.carrier),
    },
    {
      title: "Отправлено",
      dataIndex: "shippingDate",
      key: "shippingDate",
      render: (text) => (text ? new Date(text).toLocaleDateString() : "N/A"),
      sorter: (a, b) => new Date(a.shippingDate) - new Date(b.shippingDate),
    },
    {
      title: "Доставка",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      render: (text) => (text ? new Date(text).toLocaleDateString() : "N/A"),
      sorter: (a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate),
    },
    {
      title: "Сумма",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => `€ ${amount}`,
      sorter: (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Изменить
          </Button>
          <Popconfirm
            title={`Вы уверены, что хотите удалить запись ID: ${record.id}?`}
            description="Это действие нельзя будет отменить."
            onConfirm={() => handleDelete(record.id)}
            okText="Да, удалить"
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
        <BoxPlotOutlined /> Управление доставками ({shippingData.length})
      </Title>

      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal(null)}
        >
          Добавить доставку
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchShipping}
          loading={loading}
        >
          Обновить данные
        </Button>
      </Space>

      {error && (
        <Alert
          message="Ошибка загрузки"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={shippingData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Нет записей о доставке." }}
      />

      <ShippingFormModal
        show={isModalVisible}
        handleClose={handleCancel}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </Card>
  );
};

export default ShippingList;
