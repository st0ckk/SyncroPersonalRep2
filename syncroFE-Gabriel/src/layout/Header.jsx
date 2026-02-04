import "./layout.css";
import { useNavigate } from "react-router-dom";

export default function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔥 limpiar sesión
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // si lo guardas
    navigate("/login"); // redirigir
  };

  return (
    <header className="header">
      <div className="header-left">
        <h3>Syncro</h3>
      </div>

      <div className="header-right">
        {/* PERFIL */}
        <button
          className="header-btn"
          onClick={() => navigate("/profile")}
          title="Mi perfil"
        >
          👤 {user?.userName}
        </button>

        {/* LOGOUT */}
        <button
          className="header-btn logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          ⎋ Salir
        </button>
      </div>
    </header>
  );
}
