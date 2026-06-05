import "./layout.css";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCog } from "react-icons/fa";

export default function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["SuperUsuario", "Administrador"].includes(user?.userRole);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="header">
      {onMenuToggle && (
        <button className="hamburger-btn" onClick={onMenuToggle} title="Menú">
          ☰
        </button>
      )}

      <div className="header-right">
        {isAdmin && (
          <button
            className="header-btn"
            onClick={() => navigate("/configuracion/permisos")}
            title="Configuración de permisos"
          >
            <FaCog className="user-icon" />
          </button>
        )}

        <button
          className="header-btn"
          onClick={() => navigate("/profile")}
          title="Mi perfil"
        >
          <FaUser className="user-icon" /> {user?.userName}
        </button>

        <button
          className="header-btn logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
