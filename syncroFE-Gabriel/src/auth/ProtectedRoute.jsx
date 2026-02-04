import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  const decoded = jwtDecode(token);

  const role =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
