import "./Modal.css";
import { createPortal } from 'react-dom';
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
                  <button className="btn btn-danger" onClick={() => closeModal(false)}>Cancelar</button>
                  <button className="btn btn-success" onClick={() => confirmStateChange()}>Continuar</button>
              </div>
          </div>
        </div>,

      document.getElementById('modal-root')
  );
}

export default ClientStateModal;