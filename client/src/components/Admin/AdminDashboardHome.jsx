import React, { useState, useEffect } from "react";
import { Card, Col, Row, Statistic, Spin, Alert, Typography } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  TruckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const STATS_CONFIG = [
  {
    key: "clients",
    title: "Всего Клиентов",
    icon: <UserOutlined style={{ color: "#1890ff" }} />,
    endpoint: "/api/data/clients",
  },
  {
    key: "orders",
    title: "Всего Заказов",
    icon: <ShoppingOutlined style={{ color: "#52c41a" }} />,
    endpoint: "/api/data/orders",
  },
  {
    key: "shipping",
    title: "Записей Доставки",
    icon: <TruckOutlined style={{ color: "#faad14" }} />,
    endpoint: "/api/data/shipping",
  },
  {
    key: "cancellations",
    title: "Всего Отмен",
    icon: <StopOutlined style={{ color: "#f5222d" }} />,
    endpoint: "/api/data/cancellations",
  },
];

const AdminDashboardHome = () => {
  const [counts, setCounts] = useState({
    clients: 0,
    orders: 0,
    shipping: 0,
    cancellations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Необходима авторизация.");
      setLoading(false);
      return;
    }

    const fetchAllCounts = async () => {
      const promises = STATS_CONFIG.map(async (stat) => {
        try {
          const response = await axios.get(stat.endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return { key: stat.key, count: response.data.length };
        } catch (err) {
          console.error(`Ошибка при загрузке ${stat.key}:`, err);
          return { key: stat.key, count: 0, error: true };
        }
      });

      const results = await Promise.all(promises);
      const newCounts = {};
      let hasError = false;

      results.forEach((result) => {
        newCounts[result.key] = result.count;
        if (result.error) hasError = true;
      });

      setCounts(newCounts);
      setLoading(false);
      if (hasError) {
        setError(
          "Не удалось загрузить все данные. Проверьте права доступа и подключение."
        );
      }
    };

    fetchAllCounts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
        Административная Панель (Обзор)
      </Title>

      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Загрузка статистики..." />
        </div>
      )}

      {error && (
        <Alert
          message="Ошибка Загрузки"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {!loading && (
        <Row gutter={[16, 16]}>
          {STATS_CONFIG.map((stat) => (
            <Col xs={24} sm={12} md={6} key={stat.key}>
              <Card hoverable>
                <Statistic
                  title={stat.title}
                  value={counts[stat.key]}
                  prefix={stat.icon}
                  valueStyle={{ color: stat.icon.props.style.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AdminDashboardHome;
