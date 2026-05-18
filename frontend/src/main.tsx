import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { applyTheme } from "./lib/theme";
import { useUIStore } from "./store/uiStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Bootstrap() {
  const darkMode = useUIStore((s) => s.darkMode);
  React.useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>,
);
