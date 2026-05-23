import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar, Button, Space, Typography } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuth } from "../hooks/use-auth.js";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps["items"] = [
  { key: "/", icon: <DashboardOutlined />, label: "داشبورد" },
  { key: "/admins", icon: <TeamOutlined />, label: "مدیران" },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = admin?.name
    ? admin.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    : admin?.email?.[0]?.toUpperCase() || "A";

  const dropdownItems: MenuProps["items"] = [
    { key: "email", label: admin?.email, disabled: true },
    { type: "divider" },
    { key: "dashboard", icon: <DashboardOutlined />, label: "داشبورد" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "خروج", danger: true },
  ];

  const handleDropdownClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "dashboard") navigate("/");
    if (key === "logout") {
      logout();
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "#1d4ed8",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            S
          </div>
          <Text strong style={{ color: "rgba(255,255,255,0.95)", fontSize: 15 }}>
            اسمارتیز ادمین
          </Text>
        </Space>
        <Dropdown menu={{ items: dropdownItems, onClick: handleDropdownClick }} trigger={["click"]}>
          <Button type="text" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.85)" }}>
            <Avatar size="small" style={{ backgroundColor: "#e6f0ff", color: "#1d4ed8" }}>
              {initials}
            </Avatar>
            <span className="hidden md:inline">{admin?.name || admin?.email}</span>
            <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="md"
          width={220}
          theme="light"
          trigger={null}
          style={{ borderInlineStart: "1px solid #f0f0f0" }}
        >
          <div style={{ padding: "16px 8px" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              block
            />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderInlineEnd: "none" }}
          />
        </Sider>
        <Content style={{ padding: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
