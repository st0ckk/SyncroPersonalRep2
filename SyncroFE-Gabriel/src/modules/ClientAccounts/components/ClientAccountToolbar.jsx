export default function ClientAccountToolbar({ onNewCreditAccount }) {
    return (
        <div className="caccount-toolbar">
            <h2>Cuentas de credito</h2>
            <div className="toolbar-actions">
                <button className="btn-primary" onClick={onNewCreditAccount}>
                    + Nueva cuenta
                </button>
            </div>
            
        </div>
    );
}