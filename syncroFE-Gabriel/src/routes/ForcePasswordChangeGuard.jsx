import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ForcePasswordChangeGuard() {
  const mustChange = localStorage.getItem("mustChangePassword") === "true";
  const location = useLocation();

  if (mustChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
