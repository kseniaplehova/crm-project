import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Button,
  Space,
  message,
  Modal,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RedoOutlined,
  PlusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import axios from "axios";
import CancellationFormModal from "./CancellationFormModal";

const { Title } = Typography;
const { confirm } = Modal;

const API_ENDPOINT_CANCELLATIONS = "/api/data/cancellations";

const AdminCancellationDashboard = () => {
  const { token } = useAuth();
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchCancellations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINT_CANCELLATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCancellations(response.data);
    } catch (err) {
      console.error("Ошибка загрузки заявок на отмену:", err);
      setError(
        "Не удалось загрузить список заявок. Проверьте сервер и SQL-запросы."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCancellations();
    }
  }, [token, fetchCancellations]);

  const getStatusTag = (status) => {
    switch (status) {
      case "Pending":
        return <Tag color="gold">Ожидание</Tag>;
      case "Approved":
        return <Tag color="green">Одобрено</Tag>;
      case "Rejected":
        return <Tag color="red">Отклонено</Tag>;
      case "Canceled":
        return <Tag color="red">Отменено</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleProcessCancellation = (id, newStatus) => {
    confirm({
      title: `Вы уверены, что хотите ${
        newStatus === "Approved" ? "одобрить" : "отклонить"
      } эту заявку?`,
      content: `Это действие ${
        newStatus === "Approved"
          ? "отменит соответствующий заказ"
          : "оставит заказ без изменений"
      }.`,
      okText: newStatus === "Approved" ? "Да, Одобрить" : "Да, Отклонить",
      okType: newStatus === "Approved" ? "primary" : "danger",
      cancelText: "Нет",
      async onOk() {
        try {
          await axios.patch(
            `${API_ENDPOINT_CANCELLATIONS}/${id}/status`,
            {
              newStatus,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          message.success(
            `Заявка #${id} успешно ${
              newStatus === "Approved" ? "одобрена" : "отклонена"
            }.`
          );
          fetchCancellations();
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || "Не удалось обработать заявку.";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleModalSave = (newCancellation) => {
    message.success(
      `Запись об отмене заказа №${newCancellation.orderId} успешно создана.`
    );
    setIsModalVisible(false);
    fetchCancellations();
  };

  const columns = [
    {
      title: "ID Заявки",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "ID Заказа",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: "Сумма",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount) => `${amount} €.`,
      align: "right",
      sorter: (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
    },
    {
      title: "Инициатор",
      dataIndex: "initiator",
      key: "initiator",
      sorter: (a, b) => a.initiator.localeCompare(b.initiator),
    },
    {
      title: "Дата заявки",
      dataIndex: "cancellationDate",
      key: "cancellationDate",
      render: (text) => (text ? new Date(text).toLocaleDateString() : "N/A"),
      sorter: (a, b) =>
        new Date(a.cancellationDate) - new Date(b.cancellationDate),
    },
    { title: "Причина", dataIndex: "reason", key: "reason", ellipsis: true },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      width: 150,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Действия",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size="small">
          {record.status === "Pending" && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                type="primary"
                size="small"
                onClick={() => handleProcessCancellation(record.id, "Approved")}
              >
                Одобрить
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                danger
                size="small"
                onClick={() => handleProcessCancellation(record.id, "Rejected")}
              >
                Отклонить
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2} style={{ marginBottom: 16 }}>
        <StopOutlined /> Панель Управления Заявками на Отмену
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Создать Отмену (Админ)
          </Button>
          <Button
            onClick={fetchCancellations}
            icon={<RedoOutlined />}
            loading={loading}
            type="default"
          >
            Обновить
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Ошибка загрузки данных"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 15 }}
        />
      )}
      <Table
        columns={columns}
        dataSource={cancellations}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Нет активных заявок на отмену." }}
      />

      <CancellationFormModal
        show={isModalVisible}
        handleClose={() => setIsModalVisible(false)}
        onSave={handleModalSave}
        orderIdToCancel={null}
      />
    </Card>
  );
};

export default AdminCancellationDashboard;
