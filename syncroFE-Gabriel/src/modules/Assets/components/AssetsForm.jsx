import { useState, useEffect } from "react";

export default function AssetsForm({
    initialValues,
    users,
    submitting,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState({
        assetName: "",
        description: "",
        serialNumber: "",
        observations: "",
        userId: "",
        assignmentDate: "",
        isActive: true,
    });

    useEffect(() => {
        if (initialValues) {
            setForm({
                assetId: initialValues.assetId,
                assetName: initialValues.assetName || "",
                description: initialValues.description || "",
                serialNumber: initialValues.serialNumber || "",
                observations: initialValues.observations || "",
                userId: initialValues.userId || "",
                assignmentDate: initialValues.assignmentDate
                    ? initialValues.assignmentDate.split("T")[0]
                    : "",
                isActive: initialValues.isActive ?? true,
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            userId: parseInt(form.userId),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Nombre del activo *</label>
                <input
                    name="assetName"
                    value={form.assetName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Número de serie</label>
                <input
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Asignado a *</label>
                <select
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccione usuario</option>
                    {users.map((u) => (
                        <option key={u.userId} value={u.userId}>
                            {u.userName} {u.userLastname}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Fecha de asignación *</label>
                <input
                    type="date"
                    name="assignmentDate"
                    value={form.assignmentDate}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Observaciones</label>
                <textarea
                    name="observations"
                    value={form.observations}
                    onChange={handleChange}
                />
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? "Guardando..." : "Guardar"}
                </button>

                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}