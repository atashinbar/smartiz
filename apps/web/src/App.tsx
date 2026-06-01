import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.js";
import { useFeaturesStore } from "./stores/features.js";

function App() {
  const init = useFeaturesStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <RouterProvider router={router} />;
}

export default App;
