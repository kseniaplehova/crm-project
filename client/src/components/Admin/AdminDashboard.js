import React, { useState } from "react";
import { Layout, Menu, theme, Button, Typography } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";

import "./AdminDashboard.css";

import adminMenuItems from "../config/menuConfig";

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const currentPath =
    location.pathname.endsWith("/") && location.pathname !== "/"
      ? location.pathname.slice(0, -1)
      : location.pathname;

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical">
          <Title level={4} style={{ color: "white" }}>
            CRM Admin
          </Title>
        </div>

        <Menu
          theme="dark"
          defaultSelectedKeys={[currentPath]}
          selectedKeys={[currentPath]}
          mode="inline"
          items={adminMenuItems}
          onClick={handleMenuClick}
        />

        <div className="logout-button-container">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ width: collapsed ? 40 : "80%" }}
          >
            {collapsed ? "" : "Выйти"}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />

        <Content className="admin-content-area">
          <div
            className="admin-content-inner"
            style={{ background: colorBgContainer }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer className="admin-footer">
          CRM Project ©{new Date().getFullYear()} Created by Student
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
