import { Navigate } from "react-router-dom";

export default function RequirePasswordChange({ children }) {
  const mustChangePassword =
    localStorage.getItem("mustChangePassword") === "true";

  if (mustChangePassword) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
