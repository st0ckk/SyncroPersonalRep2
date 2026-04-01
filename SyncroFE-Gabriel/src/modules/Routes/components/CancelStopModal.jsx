import { useState } from "react";

export default function CancelStopModal({ open, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal route-modal" style={{ width: "min(600px, 95vw)" }}>
        <h3>Cancelar entrega</h3>
        <p>Debes indicar el motivo.</p>

        <textarea
          rows="4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. cliente cerrado, dirección incorrecta, no contestó..."
        />

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (!note.trim()) {
                alert("Debes escribir el motivo.");
                return;
              }
              onConfirm(note.trim());
              setNote("");
            }}
          >
            Confirmar cancelación
          </button>
        </div>
      </div>
    </div>
  );
}