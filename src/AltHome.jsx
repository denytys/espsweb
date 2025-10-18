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
  const [isTransparent, setIsTransparent] = useState(false);

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

  const handleToggle = () => {
    setCollapsed(!collapsed);

    setIsTransparent(false);

    setTimeout(() => {
      setIsTransparent(true);
    }, 3000);
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
        <Button
          type="primary"
          onClick={handleToggle}
          style={{
            position: "fixed",
            top: 65,
            left: collapsed ? 16 : 210,
            zIndex: 1100,
            transition: "all 0.8s ease",
            opacity: isTransparent ? 0.3 : 1,
            backgroundColor: "#1677ff",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            color: "#fff",
            fontSize: 15,
          }}
        >
          {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
        </Button>

        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          theme={menuTheme}
          width={200}
          style={{
            position: "absolute",
            height: "100vh",
            left: collapsed ? "-200px" : "0",
            top: 0,
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
        >
          <div className="mt-4 ml-4 mb-2">
            <img src="logo_login.png" alt="logo" width="100" />
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
