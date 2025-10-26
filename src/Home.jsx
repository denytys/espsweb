import React, { useState, useEffect } from "react";
import { RightCircleOutlined, LeftCircleOutlined } from "@ant-design/icons";
import {
  FcHome,
  FcAcceptDatabase,
  FcDocument,
  FcSettings,
} from "react-icons/fc";
import { Button, Menu, Layout, ConfigProvider, theme } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Header from "./pages/Header";
// import {
//   FolderOutput,
//   FolderSymlink,
//   LayoutDashboard,
//   Settings,
// } from "lucide-react";

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
