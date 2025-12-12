// src/config/menuConfig.js (или src/components/Admin/menuConfig.js)

import React from "react";
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  TruckOutlined,
  StopOutlined,
} from "@ant-design/icons";

const adminMenuItems = [
  { key: "/admin", icon: <HomeOutlined />, label: "Обзор (Статистика)" },
  {
    key: "/admin/clients",
    icon: <UserOutlined />,
    label: "Управление Клиентами",
  },
  {
    key: "/admin/orders",
    icon: <ShoppingOutlined />,
    label: "Управление Заказами",
  },
  {
    key: "/admin/shipping",
    icon: <TruckOutlined />,
    label: "Управление Доставкой",
  },
  {
    key: "/admin/cancellations",
    icon: <StopOutlined />,
    label: "Управление Отменами",
  },
];

export default adminMenuItems;
