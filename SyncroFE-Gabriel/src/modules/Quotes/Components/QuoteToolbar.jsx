import Button from "../../../components/Button";

export default function QuoteToolbar({ onNewQuote }) {
    return (
        <div className="quote-toolbar">
            <h2>Cotizaciones</h2>
            <div className="toolbar-actions">
                <Button variant="primary" onClick={onNewQuote}>
                    + Nueva cotización
                </Button>
            </div>
        </div>
    );
}
