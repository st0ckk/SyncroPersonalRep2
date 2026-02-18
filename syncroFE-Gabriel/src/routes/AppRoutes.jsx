import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";

import ProtectedRoute from "../auth/ProtectedRoute";
import ForcePasswordChangeGuard from "./ForcePasswordChangeGuard";

import ChangePasswordPage from "../modules/Profile/pages/ChangePasswordPage";
import ProfilePage from "../modules/Profile/pages/ProfilePage";

import UsersPage from "../modules/Users/pages/UsersPage";
import AssetsPage from "../modules/Assets/pages/AssetsPage";
import SchedulesPage from "../modules/Schedules/pages/SchedulesPage";

import StockPage from "../modules/Stock/pages/StockPage";
import DistributorPage from "../modules/Distributors/pages/DistributorPage";

import ClientsPage from "../modules/Clients/Pages/ClientsPage";
import ClientDetailPage from "../modules/Clients/Pages/ClientDetailPage";
import ClientsMapPage from "../modules/Clients/Pages/ClientsMapPage";
import ClientForm from "../modules/Clients/Components/ClientForm";

import QuotesPage from "../modules/Quotes/Pages/QuotesPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Cambio contraseña forzado */}
            <Route element={<ForcePasswordChangeGuard />}>
                <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* Privadas con layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<div>Home</div>} />

                {/* Perfil: todos logueados */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* Usuarios: solo admin */}
                <Route
                    path="/usuarios"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Clientes */}
                <Route
                    path="/clientes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
                            <ClientsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes/nuevo"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
                            <ClientForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes/editar/:id"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
                            <ClientForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes/:id"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
                            <ClientDetailPage />
                        </ProtectedRoute>
                    }
                />

                {/* Mapa */}
                <Route
                    path="/mapa-clientes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]}>
                            <ClientsMapPage />
                        </ProtectedRoute>
                    }
                />

                {/* Activos */}
                <Route
                    path="/activos"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <AssetsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Horarios */}
                <Route
                    path="/horarios"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <SchedulesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Facturación */}
                <Route
                    path="/facturacion"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]}>
                            <div>Facturación</div>
                        </ProtectedRoute>
                    }
                />

                {/* Stock */}
                <Route
                    path="/stock"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <StockPage />
                        </ProtectedRoute>
                    }
                />

                {/* Distribuidores */}
                <Route
                    path="/distributors"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <DistributorPage />
                        </ProtectedRoute>
                    }
                />

                {/* Reportes */}
                <Route
                    path="/reportes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <div>Reportes</div>
                        </ProtectedRoute>
                    }
                />

                {/* Rutas */}
                <Route
                    path="/rutas"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Chofer"]}>
                            <div>Rutas</div>
                        </ProtectedRoute>
                    }
                />

                {/* Cotizaciones */}
                <Route
                    path="cotizaciones"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Chofer"]}>
                            <QuotesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Ventas */}
                <Route
                    path="/ventas"
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