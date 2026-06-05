import "./Toolbar.css";

export default function Toolbar({ title, children }) {
  return (
    <div className="toolbar">
      <h2 className="toolbar-title">{title}</h2>
      <div className="toolbar-actions">{children}</div>
    </div>
  );
}
