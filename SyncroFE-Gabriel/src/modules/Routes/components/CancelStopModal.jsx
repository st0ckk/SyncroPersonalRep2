import { useState } from "react";
import Button from "../../../components/Button";
import Swal from "sweetalert2";

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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!note.trim()) {
                await Swal.fire({ icon: "warning", title: "Atención", text: "Debes escribir el motivo." });
                return;
              }
              onConfirm(note.trim());
              setNote("");
            }}
          >
            Confirmar cancelación
          </Button>
        </div>
      </div>
    </div>
  );
}