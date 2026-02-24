import { useEffect, useState } from "react";
import { createSale, getTaxes } from "../../../api/sales.api";
import { getClients } from "../../../api/clients.api";
import { getProducts } from "../../../api/stock.api";
import "./VentasForm.css";

export default function VentasForm({ onSuccess, onCancel }) {
	// Datos del formulario
	const [clientId, setClientId] = useState("");
	const [purchasePaid, setPurchasePaid] = useState(false);
	const [taxId, setTaxId] = useState("");
	const [details, setDetails] = useState([]);

	// Datos de referencia
	const [clients, setClients] = useState([]);
	const [products, setProducts] = useState([]);
	const [taxes, setTaxes] = useState([]);

	// UI
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadData = async () => {
			try {
				const [cRes, pRes, tRes] = await Promise.all([
					getClients(),
					getProducts(),
					getTaxes(),
				]);
				setClients(cRes.data ?? []);
				setProducts(pRes.data ?? []);
				setTaxes(tRes.data ?? []);
			} catch (err) {
				console.error("Error cargando datos", err);
			}
		};
		loadData();
	}, []);

	// ── Agregar línea de producto ──
	const addLine = () => {
		setDetails([...details, { productId: "", quantity: 1 }]);
	};

	const removeLine = (index) => {
		setDetails(details.filter((_, i) => i !== index));
	};

	const updateLine = (index, field, value) => {
		const updated = [...details];
		updated[index][field] = value;
		setDetails(updated);
	};

	// ── Cálculos ──
	const getLineTotal = (line) => {
		const product = products.find((p) => p.productId === parseInt(line.productId));
		if (!product) return 0;
		return product.productPrice * line.quantity;
	};

	const subtotal = details.reduce((sum, line) => sum + getLineTotal(line), 0);

	const selectedTax = taxes.find((t) => t.taxId === parseInt(taxId));
	const taxPercentage = selectedTax ? selectedTax.percentage : 0;
	const taxAmount = subtotal * taxPercentage / 100;
	const total = subtotal + taxAmount;

	// ── Submit ──
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!clientId) return setError("Seleccione un cliente");
		if (details.length === 0) return setError("Agregue al menos un producto");

		const invalidLine = details.find((d) => !d.productId || d.quantity <= 0);
		if (invalidLine) return setError("Revise que todos los productos y cantidades sean válidos");

		try {
			setSubmitting(true);
			await createSale({
				clientId,
				purchasePaid,
				taxId: taxId ? parseInt(taxId) : null,
				details: details.map((d) => ({
					productId: parseInt(d.productId),
					quantity: parseInt(d.quantity),
				})),
			});
			onSuccess();
		} catch (err) {
			const msg = err.response?.data?.message || err.response?.data || "Error al crear la venta";
			setError(typeof msg === "string" ? msg : JSON.stringify(msg));
		} finally {
			setSubmitting(false);
		}
	};

	const formatCurrency = (amount) => `₡${parseFloat(amount || 0).toFixed(2)}`;

	return (
		<form className="ventas-form" onSubmit={handleSubmit}>
			{/* ── Cliente ── */}
			<div className="form-row">
				<label>
					Cliente
					<select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
						<option value="">Seleccione cliente</option>
						{clients.map((c) => (
							<option key={c.clientId} value={c.clientId}>
								{c.clientName}
							</option>
						))}
					</select>
				</label>

				<label>
					Impuesto
					<select value={taxId} onChange={(e) => setTaxId(e.target.value)}>
						<option value="">Sin impuesto</option>
						{taxes.map((t) => (
							<option key={t.taxId} value={t.taxId}>
								{t.taxName} ({t.percentage}%)
							</option>
						))}
					</select>
				</label>

				<label className="checkbox-label">
					<input
						type="checkbox"
						checked={purchasePaid}
						onChange={(e) => setPurchasePaid(e.target.checked)}
					/>
					Pagado
				</label>
			</div>

			{/* ── Productos ── */}
			<div className="form-section">
				<div className="section-header">
					<h4>Productos</h4>
					<button type="button" className="btn btn-outline btn-sm" onClick={addLine}>
						+ Agregar producto
					</button>
				</div>

				{details.length === 0 && (
					<p className="hint">Agregue al menos un producto a la venta</p>
				)}

				{details.map((line, i) => {
					const product = products.find((p) => p.productId === parseInt(line.productId));
					return (
						<div key={i} className="product-line">
							<select
								value={line.productId}
								onChange={(e) => updateLine(i, "productId", e.target.value)}
								required
							>
								<option value="">Seleccione producto</option>
								{products
									.filter((p) => p.isActive)
									.map((p) => (
										<option key={p.productId} value={p.productId}>
											{p.productName} — ₡{p.productPrice} (Stock: {p.productQuantity})
										</option>
									))}
							</select>

							<input
								type="number"
								min="1"
								max={product ? product.productQuantity : 9999}
								value={line.quantity}
								onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 0)}
								placeholder="Cant."
								required
							/>

							<span className="line-total">{formatCurrency(getLineTotal(line))}</span>

							<button type="button" className="btn btn-danger btn-sm" onClick={() => removeLine(i)}>
								✕
							</button>
						</div>
					);
				})}
			</div>

			{/* ── Totales ── */}
			<div className="totals">
				<div>Subtotal: <strong>{formatCurrency(subtotal)}</strong></div>
				{taxPercentage > 0 && (
					<div>Impuesto ({taxPercentage}%): <strong>{formatCurrency(taxAmount)}</strong></div>
				)}
				<div className="grand-total">Total: <strong>{formatCurrency(total)}</strong></div>
			</div>

			{error && <div className="form-error">{error}</div>}

			{/* ── Acciones ── */}
			<div className="form-actions">
				<button type="button" className="btn btn-outline" onClick={onCancel}>
					Cancelar
				</button>
				<button type="submit" className="btn btn-primary" disabled={submitting}>
					{submitting ? "Guardando..." : "Guardar venta"}
				</button>
			</div>
		</form>
	);
}