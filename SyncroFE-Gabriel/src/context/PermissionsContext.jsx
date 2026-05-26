import { createContext, useContext, useEffect, useState, useCallback } from "react";

const PermissionsContext = createContext({ screens: [], loaded: false });

export function PermissionsProvider({ children }) {
    const [screens, setScreens] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const fetchPermissions = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoaded(true);
            return;
        }
        try {
            // Use plain fetch to avoid the axios error interceptor (Swal popups)
            const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setScreens(data ?? []);
            }
        } catch {
            // non-critical — leave screens empty
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return (
        <PermissionsContext.Provider value={{ screens, loaded }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    return useContext(PermissionsContext);
}
