export default function QuoteToolbar({ onNewQuote }) {
    return (
        <div className="quote-toolbar">
            <h2>Cotizaciones</h2>
            <div className="toolbar-actions">
                <button className="btn-primary" onClick={onNewQuote}>
                    + Nueva cotización
                </button>
            </div>
            
        </div>
    );
}