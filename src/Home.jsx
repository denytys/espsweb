import React, { useState } from "react";
import { RightCircleOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { Button, Menu, Layout } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import AppHeader from "./pages/Header";
import {
  FolderOutput,
  FolderSymlink,
  LayoutDashboard,
  Settings,
  SquaresExclude,
} from "lucide-react";

const { Sider, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: "dashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
    },
    {
      key: "incoming",
      icon: <FolderSymlink size={16} />,
      label: "Incoming Certificate",
    },
    {
      key: "outgoing",
      icon: <FolderOutput size={16} />,
      label: "Outgoing Certificate",
    },
    {
      key: "admin",
      icon: <Settings size={16} />,
      label: "Menu Admin",
      children: [
        { key: "admin/admin-mitra", label: "Negara Mitra" },
        { key: "admin/admin-users", label: "User Management" },
        { key: "admin/admin-settings", label: "Validation Tool" },
      ],
    },
  ];

  const onMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  return (
    <Layout className="w-full min-h-screen text-left">
      <Sider collapsible collapsed={collapsed} trigger={null} theme="light">
        <div className="flex justify-start p-2">
          <img src="logo_login.png" alt="logo" width="100" className="mb-1" />
        </div>

        <div className="p-2 text-left">
          <Button type="primary" onClick={toggleCollapsed}>
            {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
          </Button>
        </div>
        <Menu
          mode="inline"
          theme="light"
          items={items}
          onClick={onMenuClick}
          selectedKeys={[location.pathname.substring(1)]}
          style={{
            fontSize: "12px",
          }}
        />
      </Sider>

      <Layout>
        <AppHeader />
        <Content className="bg-gray-100 p-2">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
