import "./layout.css";

export default function Footer() {
    return (
        <footer className="app-footer">
            SyncroC © 2025-{new Date().getFullYear()} all rights reserved
        </footer>
    );
}
