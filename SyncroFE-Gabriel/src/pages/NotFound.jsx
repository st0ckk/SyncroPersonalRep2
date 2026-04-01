import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  const snowflakes = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 12,
        delay: Math.random() * 12,
        size: 10 + Math.random() * 18,
        opacity: 0.3 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 60,
      })),
    []
  );

  return (
    <div className="notfound-page">
      {/* Copos de nieve */}
      {snowflakes.map((s) => (
        <span
          key={s.id}
          className="snowflake"
          style={{
            left: `${s.left}%`,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            "--drift": `${s.drift}px`,
          }}
        >
          ❄
        </span>
      ))}

      {/* Contenido central */}
      <div className="notfound-card">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Página no encontrada</h1>
        <p className="notfound-subtitle">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
        <button className="notfound-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    </div>
  );
}
