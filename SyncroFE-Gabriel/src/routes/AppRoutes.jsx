import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

import Login from "../pages/Login";
import VerifyTotp from "../pages/VerifyTotp";
import RecoverPasswordPage from "../pages/RecoverPasswordPage";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../auth/ProtectedRoute";
import ForcePasswordChangeGuard from "./ForcePasswordChangeGuard";

import ChangePasswordPage from "../modules/Profile/pages/ChangePasswordPage";
import ProfilePage from "../modules/Profile/pages/ProfilePage";

import UsersPage from "../modules/Users/pages/UsersPage";
import AssetsPage from "../modules/Assets/pages/AssetsPage";
import SchedulesPage from "../modules/Schedules/pages/SchedulesPage";

import RoutesMonitoringPage from "../modules/Routes/pages/RoutesMonitoringPage";
import RouteTemplatesPage from "../modules/RouteTemplates/pages/RouteTemplatesPage";
import RoutesPage from "../modules/Routes/pages/RoutesPage";

import StockPage from "../modules/Stock/pages/StockPage";
import DistributorPage from "../modules/Distributors/pages/DistributorPage";
import ClientsPage from "../modules/Clients/pages/ClientsPage";
import ClientDetailPage from "../modules/Clients/pages/ClientDetailPage";
import ClientsMapPage from "../modules/Clients/pages/ClientsMapPage";
import ClientForm from "../modules/Clients/components/ClientForm";
import QuotesPage from "../modules/Quotes/pages/QuotesPage";

import VentasPage from "../modules/Sales/pages/VentasPage";
import FacturacionPage from "../modules/Invoices/pages/FacturacionPage";

import ClientAccountsPage from "../modules/ClientAccounts/pages/ClientAccountsPage";

import RegistersPage from "../modules/CashRegisters/pages/CashRegistersPage";
import DashboardPage from "../modules/Dashboard/pages/DashboardPage";
import AuditLogsPage from "../modules/AuditLogs/pages/AuditLogsPage";
import ReportsPage from "../modules/Reports/pages/ReportsPage";
import SellerReportsPage from "../modules/SellerReports/pages/SellerReportsPage";
import PermissionsPage from "../modules/Permissions/pages/PermissionsPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-totp" element={<VerifyTotp />} />
            <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />
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
                {/* Dashboard por rol */}
                <Route index element={<DashboardPage />} />

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
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="usuarios">
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Clientes */}
                <Route
                    path="/clientes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]} screenKey="clientes">
                            <ClientsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes/nuevo"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="clientes">
                            <ClientForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes/editar/:id"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="clientes">
                            <ClientForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clientes/:id"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]} screenKey="clientes">
                            <ClientDetailPage />
                        </ProtectedRoute>
                    }
                />

                {/* Mapa */}
                <Route
                    path="/mapa-clientes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor", "Chofer"]} screenKey="mapa-clientes">
                            <ClientsMapPage />
                        </ProtectedRoute>
                    }
                />

                {/* Activos */}
                <Route
                    path="/activos"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="activos">
                            <AssetsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Horarios */}
                <Route
                    path="/horarios"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="horarios">
                            <SchedulesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Facturación Electrónica */}
                <Route
                    path="/facturacion"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="facturacion">
                            <FacturacionPage />
                        </ProtectedRoute>
                    }
                />

                {/* Stock */}
                <Route
                    path="/stock"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="stock">
                            <StockPage />
                        </ProtectedRoute>
                    }
                />

                {/* Distribuidores */}
                <Route
                    path="/distributors"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="distributors">
                            <DistributorPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas */}
                <Route
                    path="/rutas"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Chofer"]} screenKey="rutas">
                            <RoutesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/rutas/monitoreo"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="rutas-monitoreo">
                            <RoutesMonitoringPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/plantillas-rutas"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="plantillas-rutas">
                            <RouteTemplatesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Cotizaciones */}
                <Route
                    path="/cotizaciones"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="cotizaciones">
                            <QuotesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Ventas */}
                <Route
                    path="/ventas"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="ventas">
                            <VentasPage />
                        </ProtectedRoute>
                    }
                />

                {/* Cajas */}
                <Route
                    path="/cajas"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="cajas">
                            <RegistersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Cuentas de crédito */}
                <Route
                    path="/cuentas-credito"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="cuentas-credito">
                            <ClientAccountsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Reportes globales (admin) */}
                <Route
                    path="/reportes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="reportes">
                            <ReportsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Mis Reportes (vendedor) */}
                <Route
                    path="/mis-reportes"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador", "Vendedor"]} screenKey="mis-reportes">
                            <SellerReportsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Logs del sistema */}
                <Route
                    path="/logs"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]} screenKey="logs">
                            <AuditLogsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Configuración de permisos (admin) */}
                <Route
                    path="/configuracion/permisos"
                    element={
                        <ProtectedRoute allowedRoles={["SuperUsuario", "Administrador"]}>
                            <PermissionsPage />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* 404 - catch-all */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}