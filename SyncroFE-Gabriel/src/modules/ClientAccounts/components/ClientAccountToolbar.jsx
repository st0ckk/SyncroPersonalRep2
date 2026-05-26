import Button from "../../../components/Button";

export default function ClientAccountToolbar({ onNewCreditAccount }) {
    return (
        <div className="caccount-toolbar">
            <h2>Cuentas de credito</h2>
            <div className="toolbar-actions">
                <Button variant="primary" onClick={onNewCreditAccount}>
                    + Nueva cuenta
                </Button>
            </div>
        </div>
    );
}
