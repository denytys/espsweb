// src/Home.jsx
import React, { useState, useEffect } from "react";
import { RightCircleOutlined, LeftCircleOutlined } from "@ant-design/icons";
import {
  FcHome,
  FcAcceptDatabase,
  FcDocument,
  FcSettings,
  FcFaq,
} from "react-icons/fc";
import { Button, Menu, Layout, ConfigProvider, theme, message } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Header from "./pages/Header";

const { Sider, Content, Footer } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuTheme, setMenuTheme] = useState("light");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");

    if (!token || !userData) {
      message.warning("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const detil = Array.isArray(user.detil) ? user.detil : [];

      const isAdmin = detil.some(
        (r) => r.role_name === "SA" || r.apps_id === "APP004"
      );

      setHasAdminRole(isAdmin);
    } catch (err) {
      console.error("Gagal parsing data user:", err);
      sessionStorage.clear();
      navigate("/login");
    } finally {
      setLoadingUser(false);
    }
  }, [navigate]);

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
      icon: <FcHome size={20} />,
      label: "Dashboard",
    },
    {
      key: "incoming",
      icon: <FcAcceptDatabase size={20} />,
      label: "Incoming Certificate",
    },
    {
      key: "outgoing",
      icon: <FcDocument size={20} />,
      label: "Outgoing Certificate",
    },
    ...(hasAdminRole
      ? [
          {
            key: "admin",
            icon: <FcSettings size={20} />,
            label: "Menu Admin",
            children: [
              { key: "admin/admin-mitra", label: "Negara Mitra" },
              { key: "admin/admin-users", label: "User Management" },
              { key: "admin/admin-settings", label: "Validation Tool" },
            ],
          },
        ]
      : []),
  ];

  const bottomMenuItems = [
    {
      key: "pingme",
      icon: <FcFaq size={20} />,
      label: "Ping Me!",
    },
  ];

  const onMenuClick = (e) => navigate(`/${e.key}`);
  const handleToggle = () => setCollapsed((prev) => !prev);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Memuat data pengguna . . .</p>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm:
          menuTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout className="w-full min-h-screen text-left">
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          theme={menuTheme}
        >
          <div className="p-2 flex justify-between items-center">
            <Button
              type="primary"
              onClick={handleToggle}
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                color: "#fff",
                fontSize: 15,
              }}
            >
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
          <div className="pb-3">
            <Menu
              mode="inline"
              theme={menuTheme}
              items={bottomMenuItems}
              onClick={onMenuClick}
              selectedKeys={[location.pathname.substring(1)]}
              style={{
                fontSize: "11px",
                background: "transparent",
                border: "none",
              }}
            />
          </div>
        </Sider>

        {/* Main Layout */}
        <Layout>
          <Header menuTheme={menuTheme} setMenuTheme={setMenuTheme} />
          <Content>
            <Outlet context={{ menuTheme, setMenuTheme }} />
          </Content>
          <Footer
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#999",
              background: "transparent",
              padding: "8px 0",
            }}
          >
            © {new Date().getFullYear()} BARANTIN
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
