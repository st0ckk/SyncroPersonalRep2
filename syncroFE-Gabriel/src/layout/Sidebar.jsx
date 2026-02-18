import { Link } from "react-router-dom";
import "./layout.css";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.userRole;

  const menu = [
    { label: "Clientes", to: "/clientes", roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"] },
    { label: "Facturación", to: "/facturacion", roles: ["SuperUsuario", "Administrador", "Vendedor"] },
    { label: "Stock", to: "/stock", roles: ["SuperUsuario", "Administrador"] },
    { label: "Distribuidores", to: "/distributors", roles: ["SuperUsuario", "Administrador"] },
    { label: "Reportes", to: "/reportes", roles: ["SuperUsuario", "Administrador"] },
    { label: "Rutas", to: "/rutas", roles: ["SuperUsuario", "Administrador", "Chofer"] },
    { label: "Cotizaciones", to: "/cotizaciones", roles: ["SuperUsuario", "Administrador", "Vendedor"] },
    { label: "Ventas", to: "/ventas", roles: ["SuperUsuario", "Administrador", "Vendedor"] },
    { label: "Mapa de clientes", to: "/mapa-clientes", roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"] },
    { label: "Usuarios", to: "/usuarios", roles: ["SuperUsuario", "Administrador"] },
    { label: "Activos", to: "/activos", roles: ["SuperUsuario", "Administrador"] },
    { label: "Horarios", to: "/horarios", roles: ["SuperUsuario", "Administrador"] },
  ];

  // si no hay user aún (ej login), no renderiza sidebar
  if (!role) return null;

  return (
    <aside className="sidebar">
      <h2 className="logo">SyncroCR</h2>

      <nav>
        {menu
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
