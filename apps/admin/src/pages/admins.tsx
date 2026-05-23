import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/use-auth.js";
import {
  Button, Input, Tag, Card, Modal, Form, Select,
  Table, Dropdown, Alert, Space, Typography,
} from "antd";
import type { MenuProps, TableColumnsType } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EllipsisOutlined,
  PoweroffOutlined,
  ExclamationCircleFilled,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Admin {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isActive: number;
  lastLogin: string | null;
  createdAt: string;
}

export function AdminsPage() {
  const { admin: currentUser, authFetch } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionAdmin, setActionAdmin] = useState<Admin | null>(null);
  const [form] = Form.useForm();

  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchAdmins = async () => {
    setError("");
    try {
      const res = await authFetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.data);
      } else {
        setError(data.message || "خطا در دریافت لیست مدیران");
      }
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ name: "", email: "", password: "", role: "admin" });
    setModalOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditing(admin);
    form.resetFields();
    form.setFieldsValue({
      name: admin.name || "",
      email: admin.email,
      password: "",
      role: admin.role,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      let res: Response;
      if (editing) {
        const body: Record<string, string> = { name: values.name, role: values.role };
        if (values.password) body.password = values.password;
        res = await authFetch(`/api/admin/admins/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await authFetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        form.setFields([{ name: "email", errors: [data.message || "خطا در ذخیره"] }]);
        return;
      }
      setModalOpen(false);
      fetchAdmins();
    } catch {
      // validation errors handled by form
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (admin: Admin) => {
    try {
      const res = await authFetch(`/api/admin/admins/${admin.id}/toggle`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "خطا در تغییر وضعیت");
        return;
      }
      fetchAdmins();
    } catch {
      setError("خطا در اتصال به سرور");
    }
  };

  const getRowMenuItems = (admin: Admin): MenuProps["items"] => [
    { key: "edit", icon: <EditOutlined />, label: "ویرایش" },
    {
      key: "toggle",
      icon: <PoweroffOutlined />,
      label: admin.isActive ? "غیرفعال کردن" : "فعال کردن",
    },
  ];

  const handleRowMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (!actionAdmin) return;
    if (key === "edit") openEdit(actionAdmin);
    if (key === "toggle") toggleActive(actionAdmin);
  };

  const columns: TableColumnsType<Admin> = [
    {
      title: "نام",
      dataIndex: "name",
      render: (v: string | null) => v || "—",
    },
    {
      title: "ایمیل",
      dataIndex: "email",
      render: (v: string) => <span dir="ltr">{v}</span>,
    },
    {
      title: "نقش",
      dataIndex: "role",
      render: (role: string) => (
        <Tag color={role === "super_admin" ? "blue" : "default"}>
          {role === "super_admin" ? "سوپر ادمین" : "ادمین"}
        </Tag>
      ),
    },
    {
      title: "وضعیت",
      dataIndex: "isActive",
      render: (v: number) => (
        <Tag color={v ? "green" : "red"}>{v ? "فعال" : "غیرفعال"}</Tag>
      ),
    },
    {
      title: "آخرین ورود",
      dataIndex: "lastLogin",
      render: (v: string | null) =>
        v ? new Date(v).toLocaleDateString("fa-IR") : "—",
    },
    ...(isSuperAdmin
      ? [
          {
            title: "",
            key: "actions",
            width: 48,
            render: (_: unknown, record: Admin) => (
              <Dropdown
                menu={{
                  items: getRowMenuItems(record),
                  onClick: handleRowMenuClick,
                }}
                trigger={["click"]}
              >
                <Button
                  type="text"
                  icon={<EllipsisOutlined />}
                  size="small"
                  onClick={() => setActionAdmin(record)}
                />
              </Dropdown>
            ),
          },
        ]
      : []),
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>مدیریت مدیران</Title>
          <Text type="secondary">مدیریت دسترسی‌ها و حساب‌های مدیران سیستم</Text>
        </div>
        {isSuperAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            افزودن مدیر
          </Button>
        )}
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          icon={<ExclamationCircleFilled />}
        />
      )}

      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>لیست مدیران</span>
            <Tag>{admins.length} نفر</Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: "هیچ مدیری یافت نشد" }}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? "ویرایش مدیر" : "افزودن مدیر جدید"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? "ذخیره تغییرات" : "ایجاد مدیر"}
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical" style={{ paddingTop: 8 }}>
          <Form.Item label="نام" name="name">
            <Input placeholder="نام مدیر" />
          </Form.Item>
          <Form.Item
            label="ایمیل"
            name="email"
            rules={editing ? [] : [{ required: true, message: "ایمیل الزامی است" }]}
          >
            <Input dir="ltr" placeholder="admin@smartiz.app" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            label={editing ? "رمز عبور جدید (خالی = بدون تغییر)" : "رمز عبور"}
            name="password"
            rules={editing ? [] : [{ required: true, message: "رمز عبور الزامی است" }]}
          >
            <Input.Password dir="ltr" placeholder="••••••••" />
          </Form.Item>
          <Form.Item label="نقش" name="role">
            <Select
              options={[
                { value: "admin", label: "ادمین" },
                { value: "super_admin", label: "سوپر ادمین" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
