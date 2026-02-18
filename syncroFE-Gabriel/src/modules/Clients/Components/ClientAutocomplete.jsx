import { useEffect, useState } from "react";
import { getClientLookup } from "../../../api/clients.api";

export default function ClientAutoComplete({ onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            const res = await getClientLookup();
            const q = query.toLowerCase();

            setResults(
                (res.data ?? []).filter(c =>
                    c.clientName.toLowerCase().includes(q) ||
                    c.clientId.includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="autocomplete">
            <input
                placeholder="Buscar cliente..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />

            {results.length > 0 && (
                <ul className="dropdown">
                    {results.map(c => (
                        <li
                            key={c.clientId}
                            onClick={() => {
                                onSelect(c);
                                setQuery(c.clientName);
                                setResults([]);
                            }}
                        >
                            <strong>{c.clientName}</strong>
                            <span className="muted">
                                {" "}({c.clientId})
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
