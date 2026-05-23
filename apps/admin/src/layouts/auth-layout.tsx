import { Outlet } from "react-router-dom";
import { Flex } from "antd";

export function AuthLayout() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: "100vh", padding: "0 16px", background: "#f5f5f5" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Outlet />
      </div>
    </Flex>
  );
}
