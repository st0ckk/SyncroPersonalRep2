import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { usePermissions } from "../context/PermissionsContext";

export default function ProtectedRoute({ children, allowedRoles, screenKey }) {
  const token = localStorage.getItem("token");
  const mustChangePassword = localStorage.getItem("mustChangePassword") === "true";
  const twoFactorEnabled = localStorage.getItem("twoFactorEnabled") === "true";
  const { screens: grantedScreens, loaded } = usePermissions();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (!twoFactorEnabled && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
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

  // If this route uses screenKey, wait until permissions have loaded
  if (screenKey && !loaded) return null;

  const roleAllowed = !allowedRoles || allowedRoles.includes(role);
  const permissionGranted = screenKey && grantedScreens.includes(screenKey);

  if (!roleAllowed && !permissionGranted) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
