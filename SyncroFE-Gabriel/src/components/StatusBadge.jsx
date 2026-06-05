import "./StatusBadge.css";

const VARIANT_MAP = {
  active: "success",
  activo: "success",
  aprobada: "success",
  abierta: "success",
  accepted: "success",
  inactive: "danger",
  inactivo: "danger",
  rechazada: "danger",
  cerrada: "danger",
  rejected: "danger",
  cancelada: "danger",
  error: "danger",
  pending: "warning",
  pendiente: "warning",
  sent: "info",
  expirada: "muted",
  suspendida: "muted",
};

export default function StatusBadge({ status, label, variant }) {
  const resolvedVariant =
    variant || VARIANT_MAP[String(status).toLowerCase()] || "muted";
  const displayLabel = label || status;

  return (
    <span className={`status-badge status-badge-${resolvedVariant}`}>
      {displayLabel}
    </span>
  );
}
