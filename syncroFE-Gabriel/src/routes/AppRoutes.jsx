import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

import StockPage from "../modules/Stock/pages/StockPage";
import DistributorPage from "../modules/Distributors/pages/DistributorPage";

import ClientsPage from "../modules/Clients/Pages/ClientsPage";
import ClientDetailPage from "../modules/Clients/Pages/ClientDetailPage";
import ClientsMapPage from "../modules/Clients/Pages/ClientsMapPage";
import ClientForm from "../modules/Clients/Components/ClientForm";

import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../auth/ProtectedRoute";
import UsersPage from "../modules/Users/pages/UsersPage";
import ProfilePage from "../modules/Profile/pages/ProfilePage";


export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>Home</div>} />

  
<Route path="/usuarios" element={<UsersPage />} />
<Route path="/profile" element={<ProfilePage />} />

      
        <Route
          path="clientes"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="clientes/nuevo"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
              <ClientForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="clientes/editar/:id"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
              <ClientForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="clientes/:id"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
              <ClientDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="mapa-clientes"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
              <ClientsMapPage />
            </ProtectedRoute>
          }
        />

        {/* Facturación */}
        <Route
          path="facturacion"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
              <div>Facturación</div>
            </ProtectedRoute>
          }
        />

        {/* Stock */}
        <Route
          path="stock"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
              <StockPage />
            </ProtectedRoute>
          }
        />

        {/* Distribuidores */}
        <Route
          path="distributors"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
              <DistributorPage />
            </ProtectedRoute>
          }
        />

        {/* Reportes */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
              <div>Reportes</div>
            </ProtectedRoute>
          }
        />

        {/* Rutas */}
        <Route
          path="rutas"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Chofer"]}>
              <div>Rutas</div>
            </ProtectedRoute>
          }
        />

        {/* Ventas */}
        <Route
          path="ventas"
          element={
            <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
              <div>Ventas</div>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
