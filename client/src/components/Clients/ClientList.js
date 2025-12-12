import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import ClientFormModal from "./ClientModal.js";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const API_URL_BASE = "/api/data/clients";

const ClientList = () => {
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const fetchClients = useCallback(async () => {
    if (!token) {
      setError("Ошибка аутентификации. Не найден токен.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients(response.data);
    } catch (err) {
      console.error("Ошибка загрузки клиентов:", err);
      setError(
        "Не удалось загрузить данные клиентов. Проверьте сервер и токен."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleDelete = async (clientId) => {
    if (user && user.id === clientId) {
      message.error(
        "Вы не можете удалить свою собственную учетную запись администратора."
      );
      return;
    }

    if (!token) {
      message.error("Ошибка аутентификации. Пожалуйста, войдите снова.");
      return;
    }

    try {
      await axios.delete(`${API_URL_BASE}/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Клиент успешно удален.");
      fetchClients();
    } catch (error) {
      console.error("Ошибка удаления клиента:", error);
      const errorMessage =
        error.response?.status === 409
          ? "Невозможно удалить клиента: существуют связанные заказы."
          : error.response?.data?.message || "Ошибка удаления.";

      message.error(errorMessage);
    }
  };

  const handleSuccess = (client) => {
    message.success(
      `Клиент успешно ${editingClient ? "обновлен" : "добавлен"}.`
    );
    closeModal();
    fetchClients();
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      width: 80,
    },
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Телефон",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "—",
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Дата Создания",
      dataIndex: "created",
      key: "created",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить этого клиента?"
            description="Это может привести к проблемам с заказами."
            onConfirm={() => handleDelete(record.id)}
            okText="Да, удалить"
            cancelText="Нет"
            disabled={user && user.id === record.id}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={user && user.id === record.id}
            >
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
        <UserOutlined /> Управление Клиентами
      </Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingClient(null);
          openModal();
        }}
        style={{ marginBottom: 16 }}
      >
        Добавить Клиента
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
        dataSource={clients}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Нет данных о клиентах." }}
      />

      <ClientFormModal
        show={isModalOpen}
        handleClose={closeModal}
        onClientAdded={handleSuccess}
        clientData={editingClient}
        onClientUpdated={handleSuccess}
      />
    </Card>
  );
};

export default ClientList;
