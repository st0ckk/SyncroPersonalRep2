import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/Button";
function CashRegisterMovementForm({
    id,
    submitting,
    onSubmit,
    onCancel,
}) {

    //Formulario
    const [form, setForm] = useState(() => {
        return {
            cashRegisterId : null,
            cashRegisterMovementType: "",
            cashRegisterMovementDescription: "",
            cashRegisterMovementAmount: null,
            cashRegisterMovementManual: null,
        };
    })

    //Guardar informacion
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            cashRegisterId : id,
            cashRegisterMovementType: form.cashRegisterMovementType.trim(),
            cashRegisterMovementDescription: form.cashRegisterMovementDescription.trim(),
            cashRegisterMovementAmount: Number(form.cashRegisterMovementAmount),
            cashRegisterMovementManual: true,
        }
        onSubmit(payload);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    useEffect(() => {
    }, []);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    Movimiento manual de caja
                </h3>

                <form className="register-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Monto de movimiento</label>
                        <input
                            type="number"
                            value={form.cashRegisterMovementAmount}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    cashRegisterMovementAmount:
                                        e.target.value === null
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                            placeholder="Monto inicial."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo de movimiento</label>
                        <select
                            name="cashRegisterMovementType"
                            value={form.cashRegisterMovementType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione el tipo de movimiento</option>
                            <option value="income">Ingreso</option>
                            <option value="expense">Gasto</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Descripcion de movimiento</label>
                        <input
                            type="text"
                            name="cashRegisterMovementDescription"
                            value={form.cashRegisterMovementDescription}
                            onChange={handleChange}
                            placeholder="Ej: Razon para el ingreso de este movimiento."
                        />
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={submitting}
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,

        document.getElementById('modal-movement-register-root')
    );
}



export default CashRegisterMovementForm;