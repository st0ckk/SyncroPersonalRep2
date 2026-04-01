import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const mustChangePassword =
    localStorage.getItem("mustChangePassword") === "true";

  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  const role =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}