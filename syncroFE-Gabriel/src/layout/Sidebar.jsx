import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./layout.css";

// Grupos colapsables del sidebar (grupos e ítems en orden alfabético)
const MENU = [
  // Dashboard siempre primero
  {
    label: "Dashboard",
    to: "/",
    roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
  },

  // Grupos ordenados A→Z
  {
    group: "Comercial",
    roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
    items: [
      {
        label: "Clientes",
        to: "/clientes",
        roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
      },
      {
        label: "Cotizaciones",
        to: "/cotizaciones",
        roles: ["SuperUsuario", "Administrador", "Vendedor"],
      },
      {
        label: "Cuentas de crédito",
        to: "/cuentas-credito",
        roles: ["SuperUsuario", "Administrador", "Vendedor"],
      },
      {
        label: "Facturación",
        to: "/facturacion",
        roles: ["SuperUsuario", "Administrador", "Vendedor"],
      },
      {
        label: "Mapa de clientes",
        to: "/mapa-clientes",
        roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
      },
      {
        label: "Ventas",
        to: "/ventas",
        roles: ["SuperUsuario", "Administrador", "Vendedor"],
      },
    ],
  },

  {
    group: "Inventario",
    roles: ["SuperUsuario", "Administrador"],
    items: [
      {
        label: "Distribuidores",
        to: "/distributors",
        roles: ["SuperUsuario", "Administrador"],
      },
      {
        label: "Stock",
        to: "/stock",
        roles: ["SuperUsuario", "Administrador"],
      },
    ],
  },

  {
    group: "Logística",
    roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
    items: [
      {
        label: "Monitoreo rutas",
        to: "/rutas/monitoreo",
        roles: ["SuperUsuario", "Administrador"],
      },
      {
        label: "Plantillas de rutas",
        to: "/plantillas-rutas",
        roles: ["SuperUsuario", "Administrador", "Vendedor"],
      },
      {
        label: "Rutas",
        to: "/rutas",
        roles: ["SuperUsuario", "Administrador", "Chofer"],
      },
    ],
  },

  {
    group: "Personal",
    roles: ["SuperUsuario", "Administrador"],
    items: [
      {
        label: "Activos",
        to: "/activos",
        roles: ["SuperUsuario", "Administrador"],
      },
      {
        label: "Horarios",
        to: "/horarios",
        roles: ["SuperUsuario", "Administrador"],
      },
      {
        label: "Usuarios",
        to: "/usuarios",
        roles: ["SuperUsuario", "Administrador"],
      },
    ],
  },

  // Reportes al final
  {
    label: "Reportes",
    to: "/reportes",
    roles: ["SuperUsuario", "Administrador"],
  },
];

const Sidebar = ({ open, onClose }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.userRole;
  const { pathname } = useLocation();

  // Determina qué grupo contiene la ruta activa (para abrirlo por defecto)
  const defaultOpen = MENU.filter((item) => item.group).reduce((acc, item) => {
    const hasActive = item.items.some((i) => pathname.startsWith(i.to));
    if (hasActive) acc[item.group] = true;
    return acc;
  }, {});

  const [openGroups, setOpenGroups] = useState(defaultOpen);

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  if (!role) return null;

  return (
    <aside className={`sidebar${open ? " sidebar-open" : ""}`}>
      <button className="sidebar-close-btn" onClick={onClose}>✕</button>
      <h2 className="logo">SyncroCR</h2>

      <nav className="sidebar-nav">
        {MENU.map((item) => {
          // Item suelto
          if (!item.group) {
            if (!item.roles.includes(role)) return null;
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link${isActive ? " sidebar-link-active" : ""}`}
                onClick={onClose}
              >
                {item.label}
              </Link>
            );
          }

          // Grupo — filtrar ítems visibles para este rol
          const visibleItems = item.items.filter((i) => i.roles.includes(role));
          if (visibleItems.length === 0) return null;

          const isExpanded = !!openGroups[item.group];
          const hasActive = visibleItems.some((i) => pathname.startsWith(i.to));

          return (
            <div key={item.group} className="sidebar-group">
              <button
                className={`sidebar-group-header${hasActive ? " sidebar-group-active" : ""}`}
                onClick={() => toggleGroup(item.group)}
              >
                <span>{item.group}</span>
                <span className={`sidebar-chevron${isExpanded ? " sidebar-chevron-open" : ""}`}>
                  ›
                </span>
              </button>

              {isExpanded && (
                <div className="sidebar-group-items">
                  {visibleItems.map((i) => {
                    const isActive = pathname.startsWith(i.to);
                    return (
                      <Link
                        key={i.to}
                        to={i.to}
                        className={`sidebar-link sidebar-link-nested${isActive ? " sidebar-link-active" : ""}`}
                        onClick={onClose}
                      >
                        {i.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
