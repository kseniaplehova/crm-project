import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
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

  const fetchCancellations = async () => {
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
  };

  useEffect(() => {
    if (token) {
      fetchCancellations();
    }
  }, [token]);

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
    fetchCancellations();
  };

  const columns = [
    { title: "ID Заявки", dataIndex: "id", key: "id", width: 100 },
    { title: "ID Заказа", dataIndex: "orderId", key: "orderId", width: 100 },
    {
      title: "Сумма",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount) => `${amount} руб.`,
    },
    { title: "Инициатор", dataIndex: "initiator", key: "initiator" },
    {
      title: "Дата заявки",
      dataIndex: "cancellationDate",
      key: "cancellationDate",
      render: (text) => text || "N/A",
    },
    { title: "Причина", dataIndex: "reason", key: "reason", ellipsis: true },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      width: 150,
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
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Панель Управления Заявками на Отмену
      </Title>
      <Card
        title="Список Заявок"
        extra={
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
        }
      >
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
          locale={{ emptyText: "Нет активных заявок на отмену." }}
        />
      </Card>
      <CancellationFormModal
        show={isModalVisible}
        handleClose={() => setIsModalVisible(false)}
        onSave={handleModalSave}
        orderIdToCancel={null}
      />
    </div>
  );
};

export default AdminCancellationDashboard;
