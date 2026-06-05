import "./layout.css";

export default function Footer() {
    return (
        <footer className="app-footer">
            SyncroCR 2.0.3 © 2025-{new Date().getFullYear()} all rights reserved
        </footer>
    );
}
