import { useEffect, useState } from "react";
import { getUsers } from "../../../api/users.api";
import {
    getAllScreens,
    getUserPermissions,
    setUserPermissions,
    getRolePermissions,
    setRolePermissions,
} from "../../../api/permissions.api";
import Swal from "sweetalert2";
import "./PermissionsPage.css";

// Role defaults mirror the MENU in Sidebar.jsx
const ROLE_DEFAULTS = {
    SuperUsuario:  ["dashboard","clientes","cotizaciones","cuentas-credito","facturacion","mapa-clientes","mis-reportes","ventas","cajas","distributors","stock","rutas-monitoreo","plantillas-rutas","rutas","activos","horarios","usuarios","reportes","logs"],
    Administrador: ["dashboard","clientes","cotizaciones","cuentas-credito","facturacion","mapa-clientes","mis-reportes","ventas","cajas","distributors","stock","rutas-monitoreo","plantillas-rutas","rutas","activos","horarios","usuarios","reportes","logs"],
    Vendedor:      ["dashboard","clientes","cotizaciones","cuentas-credito","facturacion","mapa-clientes","mis-reportes","ventas","cajas"],
    Chofer:        ["dashboard","clientes","mapa-clientes","rutas"],
};

const CONFIGURABLE_ROLES = ["Vendedor", "Chofer"];

export default function PermissionsPage() {
    const [tab, setTab] = useState("usuario");
    const [screens, setScreens] = useState([]);

    // Por usuario
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userChecked, setUserChecked] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSaving, setUserSaving] = useState(false);

    // Por perfil
    const [selectedRole, setSelectedRole] = useState(CONFIGURABLE_ROLES[0]);
    const [roleChecked, setRoleChecked] = useState([]);
    const [roleLoading, setRoleLoading] = useState(false);
    const [roleSaving, setRoleSaving] = useState(false);

    useEffect(() => {
        getAllScreens().then((r) => setScreens(r.data));
        getUsers().then((r) => setUsers(r.data));
    }, []);

    // Load permissions when user is selected
    useEffect(() => {
        if (!selectedUser) return;
        setUserLoading(true);
        getUserPermissions(selectedUser.userId)
            .then((r) => setUserChecked(r.data ?? []))
            .finally(() => setUserLoading(false));
    }, [selectedUser]);

    // Load permissions when role tab changes
    useEffect(() => {
        if (tab !== "perfil") return;
        setRoleLoading(true);
        getRolePermissions(selectedRole)
            .then((r) => setRoleChecked(r.data ?? []))
            .finally(() => setRoleLoading(false));
    }, [selectedRole, tab]);

    const roleDefaults = selectedUser
        ? ROLE_DEFAULTS[selectedUser.userRole] ?? []
        : [];

    const toggleUserScreen = (key) => {
        if (roleDefaults.includes(key)) return; // default — can't toggle
        setUserChecked((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const saveUserPermissions = async () => {
        setUserSaving(true);
        try {
            await setUserPermissions(selectedUser.userId, userChecked);
            Swal.fire({ icon: "success", title: "Guardado", text: "Permisos actualizados.", timer: 1500, showConfirmButton: false });
        } finally {
            setUserSaving(false);
        }
    };

    const roleDefForRole = ROLE_DEFAULTS[selectedRole] ?? [];

    const toggleRoleScreen = (key) => {
        if (roleDefForRole.includes(key)) return;
        setRoleChecked((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const saveRolePermissions = async () => {
        setRoleSaving(true);
        try {
            await setRolePermissions(selectedRole, roleChecked);
            Swal.fire({ icon: "success", title: "Guardado", text: "Permisos del perfil actualizados.", timer: 1500, showConfirmButton: false });
        } finally {
            setRoleSaving(false);
        }
    };

    // Group screens by group
    const grouped = screens.reduce((acc, s) => {
        (acc[s.group] = acc[s.group] || []).push(s);
        return acc;
    }, {});

    return (
        <div className="perm-page">
            <h1 className="perm-title">Configuración de permisos</h1>
            <p className="perm-subtitle">
                Asigna pantallas adicionales a usuarios o perfiles más allá de sus accesos por defecto.
            </p>

            <div className="perm-tabs">
                <button
                    className={`perm-tab${tab === "usuario" ? " perm-tab-active" : ""}`}
                    onClick={() => setTab("usuario")}
                >
                    Por Usuario
                </button>
                <button
                    className={`perm-tab${tab === "perfil" ? " perm-tab-active" : ""}`}
                    onClick={() => setTab("perfil")}
                >
                    Por Perfil
                </button>
            </div>

            {/* ─── TAB: Por Usuario ─── */}
            {tab === "usuario" && (
                <div className="perm-panel">
                    <div className="perm-selector-row">
                        <label>Usuario:</label>
                        <select
                            className="perm-select"
                            value={selectedUser?.userId ?? ""}
                            onChange={(e) => {
                                const u = users.find((u) => u.userId === +e.target.value);
                                setSelectedUser(u ?? null);
                            }}
                        >
                            <option value="">— Seleccionar usuario —</option>
                            {users.map((u) => (
                                <option key={u.userId} value={u.userId}>
                                    {u.userName} {u.userLastname} ({u.userRole})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedUser && (
                        <>
                            <p className="perm-hint">
                                Las pantallas en gris son accesos por defecto del perfil <strong>{selectedUser.userRole}</strong> y no se pueden quitar. Marca las adicionales que quieres habilitar.
                            </p>

                            {userLoading ? (
                                <p className="perm-loading">Cargando permisos...</p>
                            ) : (
                                <div className="perm-groups">
                                    {Object.entries(grouped).map(([group, items]) => (
                                        <div key={group} className="perm-group">
                                            <h3 className="perm-group-title">{group}</h3>
                                            <div className="perm-screen-list">
                                                {items.map((s) => {
                                                    const isDefault = roleDefaults.includes(s.key);
                                                    const isChecked = isDefault || userChecked.includes(s.key);
                                                    return (
                                                        <label
                                                            key={s.key}
                                                            className={`perm-screen-item${isDefault ? " perm-default" : ""}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                disabled={isDefault}
                                                                onChange={() => toggleUserScreen(s.key)}
                                                            />
                                                            <span>{s.label}</span>
                                                            {isDefault && <span className="perm-badge-default">Rol</span>}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="perm-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={saveUserPermissions}
                                    disabled={userSaving || userLoading}
                                >
                                    {userSaving ? "Guardando..." : "Guardar permisos"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ─── TAB: Por Perfil ─── */}
            {tab === "perfil" && (
                <div className="perm-panel">
                    <div className="perm-selector-row">
                        <label>Perfil:</label>
                        <select
                            className="perm-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {CONFIGURABLE_ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <p className="perm-hint">
                        Las pantallas en gris ya son accesos por defecto del perfil <strong>{selectedRole}</strong>. Marca las adicionales que quieres otorgar a todos los usuarios de este perfil.
                    </p>

                    {roleLoading ? (
                        <p className="perm-loading">Cargando permisos...</p>
                    ) : (
                        <div className="perm-groups">
                            {Object.entries(grouped).map(([group, items]) => (
                                <div key={group} className="perm-group">
                                    <h3 className="perm-group-title">{group}</h3>
                                    <div className="perm-screen-list">
                                        {items.map((s) => {
                                            const isDefault = roleDefForRole.includes(s.key);
                                            const isChecked = isDefault || roleChecked.includes(s.key);
                                            return (
                                                <label
                                                    key={s.key}
                                                    className={`perm-screen-item${isDefault ? " perm-default" : ""}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={isDefault}
                                                        onChange={() => toggleRoleScreen(s.key)}
                                                    />
                                                    <span>{s.label}</span>
                                                    {isDefault && <span className="perm-badge-default">Rol</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="perm-actions">
                        <button
                            className="btn btn-primary"
                            onClick={saveRolePermissions}
                            disabled={roleSaving || roleLoading}
                        >
                            {roleSaving ? "Guardando..." : "Guardar permisos del perfil"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
