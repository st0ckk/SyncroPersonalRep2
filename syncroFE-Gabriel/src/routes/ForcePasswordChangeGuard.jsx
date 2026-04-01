import { Navigate, Outlet } from "react-router-dom";

export default function ForcePasswordChangeGuard() {
  const token = localStorage.getItem("token");
  const mustChange = localStorage.getItem("mustChangePassword") === "true";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChange) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}