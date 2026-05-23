import { useNavigate } from "react-router-dom";
import { Card, Avatar, Tag, Button, Space, Typography, Row, Col } from "antd";
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/use-auth.js";

const { Title, Text } = Typography;

export function DashboardPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const initials = admin?.name
    ? admin.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    : admin?.email?.[0]?.toUpperCase() || "A";

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>داشبورد</Title>
        <Text type="secondary">به پنل مدیریت اسمارتیز خوش آمدید</Text>
      </div>

      <Card>
        <Space size="middle">
          <Avatar size={56} style={{ backgroundColor: "#e6f0ff", color: "#1d4ed8", fontSize: 20 }}>
            {initials}
          </Avatar>
          <div>
            <Title level={5} style={{ margin: 0 }}>{admin?.name || admin?.email}</Title>
            <Space>
              <Text type="secondary" dir="ltr">{admin?.email}</Text>
              <Tag color={admin?.role === "super_admin" ? "blue" : "default"}>
                <SafetyCertificateOutlined />{" "}
                {admin?.role === "super_admin" ? "سوپر ادمین" : "ادمین"}
              </Tag>
            </Space>
          </div>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <TeamOutlined style={{ color: "#999" }} />
                <Text type="secondary">مدیران سیستم</Text>
              </Space>
              <Button type="default" block onClick={() => navigate("/admins")}>
                <LeftOutlined /> مدیریت مدیران
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical">
              <Space>
                <CalendarOutlined style={{ color: "#999" }} />
                <Text type="secondary">آخرین ورود</Text>
              </Space>
              <Text strong>
                {admin?.lastLogin
                  ? new Date(admin.lastLogin).toLocaleDateString("fa-IR")
                  : "—"}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#999" }} />
                <Text type="secondary">سطح دسترسی</Text>
              </Space>
              <Text strong>
                {admin?.role === "super_admin" ? "دسترسی کامل" : "دسترسی محدود"}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
