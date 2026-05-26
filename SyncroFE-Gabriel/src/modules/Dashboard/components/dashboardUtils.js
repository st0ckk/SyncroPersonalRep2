// ── Formateo ──

export const formatCurrency = (amount) =>
    `₡${parseFloat(amount || 0).toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("es-CR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ── Chart helpers ──

export const getBarHeight = (value, max) => {
    if (!max || max === 0) return "4px";
    const pct = Math.max((value / max) * 100, 3);
    return `${pct}%`;
};

// ── Activity badges ──

export const getActivityBadge = (action) => {
    const a = (action || "").toUpperCase();

    if (a.includes("LOGIN"))
        return { cls: "login", label: "Login" };

    if (a.includes("SALE") || a.includes("PURCHASE") || a.includes("CREATED"))
        return { cls: "sale", label: "Venta" };

    if (a.includes("DELETE") || a.includes("LOCKED"))
        return { cls: "delete", label: "Eliminación" };

    return { cls: "other", label: action || "Otro" };
};
