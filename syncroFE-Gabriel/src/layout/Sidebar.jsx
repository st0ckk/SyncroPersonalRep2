import { Link } from "react-router-dom";
import "./layout.css";

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <h2 className="logo">SyncroCR</h2>

            <nav>
                <Link to="/clientes">Clientes</Link>
                <Link to="/facturacion">Facturacion</Link>
                <Link to="/stock">Stock</Link>
                <Link to="/distributors">Distribuidores</Link>
                <Link to="/reportes">Reportes</Link>
                <Link to="/rutas">Rutas</Link>
                <Link to="/ventas">Ventas</Link>
                <Link to="/mapa-clientes">Mapa de clientes</Link>
                <Link to="/usuarios">Usuarios</Link>
                


            </nav>
        </aside>
    );
};

export default Sidebar;