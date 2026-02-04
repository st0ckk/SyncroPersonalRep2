import { useEffect, useState } from "react";
import { searchProducts } from "../../../api/stock.api";

export default function ProductAutoComplete({ onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            searchProducts(query)
                .then(res => setResults(res.data ?? []))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="autocomplete">
            <input
                type="text"
                placeholder="Buscar producto..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {loading && <div className="hint">Buscando...</div>}

            {results.length > 0 && (
                <ul className="dropdown">
                    {results.map(p => (
                        <li
                            key={p.productId}
                            onClick={() => {
                                onSelect(p);
                                setQuery(p.productName);
                                setResults([]);
                            }}
                        >
                            <strong>{p.productName}</strong>
                            <span className="muted">
                                {" "}({p.productQuantity} en stock)
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
