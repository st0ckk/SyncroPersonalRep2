import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import "./layout.css";

export default function MainLayout() {
  const mustChange = localStorage.getItem("mustChangePassword") === "true";

  return (
    <div className="app-layout">
      {!mustChange && <Sidebar />}

      <div className="app-content">
        <Header />

        <main className="app-main">
          <Outlet />
        </main>

        {!mustChange && <Footer />}
      </div>
    </div>
  );
}
