import { useEffect, useState } from "react";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import { getEmployees } from "../services/employees.service";



export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
const user = JSON.parse(localStorage.getItem("user"));
const roles = JSON.parse(localStorage.getItem("roles")) || [];

if (!roles.includes("SuperUsuario") && !roles.includes("Administrador")) {
  return <Navigate to="/unauthorized" />;
}

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      alert("Error cargando empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="employees-page">
      <div className="employees-header">
        <h2>Empleados</h2>

        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Agregar empleado
        </button>
      </div>

      {showForm && (
        <EmployeeForm
          onClose={() => setShowForm(false)}
          onSaved={loadEmployees}
        />
      )}

      {loading ? (
        <p>Cargando empleados...</p>
      ) : (
        <EmployeeTable employees={employees} onRefresh={loadEmployees} />
      )}
    </div>
  );
}
