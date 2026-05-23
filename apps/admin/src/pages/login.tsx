import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Alert, Divider, Typography } from "antd";
import { useAuth } from "../hooks/use-auth.js";

const { Title, Text } = Typography;

export function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ textAlign: "center", paddingBottom: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#1d4ed8",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 24,
            margin: "0 auto",
          }}
        >
          S
        </div>
        <Title level={4} style={{ marginTop: 12 }}>
          ورود به پنل مدیریت
        </Title>
        <Text type="secondary">اسمارتیز ادمین</Text>
      </div>
      <Divider style={{ margin: "16px 0" }} />
      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="ایمیل"
          name="email"
          rules={[{ required: true, message: "ایمیل الزامی است" }]}
        >
          <Input dir="ltr" placeholder="admin@smartiz.app" />
        </Form.Item>
        <Form.Item
          label="رمز عبور"
          name="password"
          rules={[{ required: true, message: "رمز عبور الزامی است" }]}
        >
          <Input.Password dir="ltr" placeholder="********" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            ورود
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
