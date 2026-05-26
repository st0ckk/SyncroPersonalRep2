export default function CashRegisterToolbar({ onNewRegister }) {
    return (
        <div className="register-toolbar">
            <h2>Cajas</h2>
            <div className="toolbar-actions">
                <button className="btn-primary" onClick={onNewRegister}>
                    + Nueva caja
                </button>
            </div>
            
        </div>
    );
}