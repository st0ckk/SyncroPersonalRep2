import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import "./layout.css";

export default function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-content">
                <Header  />

                <main className="app-main">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}