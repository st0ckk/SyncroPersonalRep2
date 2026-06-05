import "./PageCard.css";

export default function PageCard({ children, className = "" }) {
  return (
    <div className={`page-container ${className}`.trim()}>
      <div className="page-card">{children}</div>
    </div>
  );
}
