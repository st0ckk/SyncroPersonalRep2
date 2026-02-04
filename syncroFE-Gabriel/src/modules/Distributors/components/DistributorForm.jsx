import { useState } from "react";

const emptyDistributor = {
    distributorCode: "",
    name: "",
    email: "",
    phone: "",
};

export default function DistributorForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(() => {
        if (!initialValues) return emptyDistributor;

        return {
            distributorCode: initialValues.distributorCode ?? "",
            name: initialValues.name ?? "",
            email: initialValues.email ?? "",
            phone: initialValues.phone ?? "",
        };
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.distributorCode.trim()) {
            alert("El código es obligatorio");
            return;
        }

        if (!form.name.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        const payload = {
            distributorCode: form.distributorCode.trim(),
            name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
        };

        onSubmit(payload);
    };

    return (
        <form className="distributors-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Cedula Juridica</label>
                <input
                    name="distributorCode"
                    value={form.distributorCode}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Nombre</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Teléfono</label>
                <input
                    name="phone"
                    value={form.phone}
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
