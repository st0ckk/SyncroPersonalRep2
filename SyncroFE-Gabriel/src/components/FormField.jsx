import "./FormField.css";

export default function FormField({
  label,
  required,
  fullWidth,
  children,
  className = "",
}) {
  return (
    <div
      className={`form-field ${fullWidth ? "form-field-full" : ""} ${className}`.trim()}
    >
      {label && (
        <label className="form-field-label">
          {label}
          {required && <span className="form-field-required">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
