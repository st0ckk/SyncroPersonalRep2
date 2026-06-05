export default function Button({
  children,
  variant = "outline",
  size,
  className = "",
  type = "button",
  ...props
}) {
  const cls = [
    "btn",
    `btn-${variant}`,
    size ? `btn-${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}
