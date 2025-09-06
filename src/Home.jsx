import React, { useState, useEffect } from "react";
import { RightCircleOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { Button, Menu, Layout, ConfigProvider, theme } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Header from "./pages/Header";
import {
  FolderOutput,
  FolderSymlink,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const { Sider, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuTheme, setMenuTheme] = useState("light");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

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
    <ConfigProvider
      theme={{
        algorithm:
          menuTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout className="w-full min-h-screen text-left">
        {/* Sider */}
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          theme={menuTheme}
        >
          <div className="p-2 flex justify-between items-center">
            <Button type="primary" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
            </Button>
          </div>

          <Menu
            mode="inline"
            theme={menuTheme}
            items={items}
            onClick={onMenuClick}
            selectedKeys={[location.pathname.substring(1)]}
            style={{
              fontSize: "11px",
              background: "transparent",
              border: "none",
            }}
          />
        </Sider>

        {/* Main Layout */}
        <Layout>
          <Header menuTheme={menuTheme} setMenuTheme={setMenuTheme} />
          <Content>
            <Outlet context={{ menuTheme, setMenuTheme }} />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
