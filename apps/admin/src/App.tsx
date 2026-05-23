import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth.js";
import { createAppRouter } from "./router.js";

function AppWithAuth() {
  const { token } = useAuth();
  const router = useMemo(() => createAppRouter(!!token), [token]);
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
