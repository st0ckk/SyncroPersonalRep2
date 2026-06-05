import { createPortal } from 'react-dom';
import "./Modal.css";
import Button from "../../../../components/Button";
function ClientStateModal({ closeModal, confirmStateChange }) {
  return createPortal(
      <div className="modalBackground" onClick={() => closeModal(false)}>
          <div className="modalContainer">
              <div className="modalTitle">
                <h1>&iquest;Desea realizar este cambio?</h1>
              </div>
              <div className="modalBody">
              <p>Se cambiara el estado del cliente</p>
              </div>
              <div className="modalOptions">
                  <Button variant="danger" onClick={() => closeModal(false)}>Cancelar</Button>
                  <Button variant="success" onClick={() => confirmStateChange()}>Continuar</Button>
              </div>
          </div>
        </div>,

      document.getElementById('modal-root')
  );
}

export default ClientStateModal;