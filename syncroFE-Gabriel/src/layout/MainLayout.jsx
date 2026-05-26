import { useState } from "react";
import "./layout.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { PermissionsProvider } from "../context/PermissionsContext";

export default function MainLayout() {
  const mustChange = localStorage.getItem("mustChangePassword") === "true";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PermissionsProvider>
      <div className="app-bg" />

      <div className="app-layout">
        {!mustChange && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {!mustChange && sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="app-content">
          <Header
            onMenuToggle={!mustChange ? () => setSidebarOpen((v) => !v) : undefined}
          />

          <main className="app-main">
            <Outlet />
          </main>

          {!mustChange && <Footer />}
        </div>
      </div>
    </PermissionsProvider>
  );
}
