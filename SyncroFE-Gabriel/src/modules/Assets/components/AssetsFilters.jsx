export default function AssetsFilters({
    users,
    selectedUserId,
    onUserChange
}) {
    return (
        <div className="assets-filters">
            <select
                value={selectedUserId}
                onChange={(e) => onUserChange(e.target.value)}
            >
                <option value="">Todos los usuarios</option>
                {users.map(u => (
                    <option key={u.userId} value={u.userId}>
                        {u.userName} {u.userLastname}
                    </option>
                ))}
            </select>
        </div>
    );
}