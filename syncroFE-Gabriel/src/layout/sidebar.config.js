export const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    roles: ["SuperUsuario", "Administrador"],
  },
  {
    label: "Clientes",
    path: "/clientes",
    roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
  },
  {
    label: "Nuevo Cliente",
    path: "/clientes/nuevo",
    roles: ["SuperUsuario", "Administrador", "Vendedor"],
  },
  {
    label: "Stock",
    path: "/stock",
    roles: ["SuperUsuario", "Administrador"],
  },
  {
    label: "Distribuidores",
    path: "/distributors",
    roles: ["SuperUsuario", "Administrador"],
  },
  {
    label: "Rutas",
    path: "/rutas",
    roles: ["SuperUsuario", "Administrador", "Chofer"],
  },
  {
  label: "Plantillas de rutas",
  to: "/plantillas-rutas",
  roles: ["SuperUsuario", "Administrador", "Vendedor"]
},
  {
    label: "Ventas",
    path: "/ventas",
    roles: ["SuperUsuario", "Administrador", "Vendedor"],
  },
  {
    label: "Reportes",
    path: "/reportes",
    roles: ["SuperUsuario", "Administrador"],
  },
];
