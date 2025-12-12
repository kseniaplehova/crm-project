import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Alert,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const { Title } = Typography;
const API_URL = "/api/auth";

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: values.email,
        password: values.password,
      });

      const { token, user } = response.data;
      const role = user.role;

      login(token, user);
      message.success("Вход успешен! Перенаправление...");

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "client") {
        navigate("/client/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Ошибка входа:", error.response || error);
      const errorMessage =
        error.response?.data?.message ||
        "Ошибка входа. Проверьте учетные данные.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          <LoginOutlined /> Вход в CRM
        </Title>

        {error && (
          <Alert
            message="Ошибка входа"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Пожалуйста, введите ваш Email!" },
              { type: "email", message: "Введите корректный Email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: "Пожалуйста, введите ваш Пароль!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
              size="large"
            >
              Войти
            </Button>
          </Form.Item>
        </Form>

        <p style={{ textAlign: "center", marginTop: 15 }}>
          Нет аккаунта?
          <Link to="/register" style={{ marginLeft: 5 }}>
            Зарегистрируйтесь
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
