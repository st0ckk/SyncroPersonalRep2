const BASE = `${import.meta.env.VITE_API_URL}/auth`;

export async function recoverRequest(email) {
  const res = await fetch(`${BASE}/recover/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Error al procesar la solicitud");
  }
  return res.json();
}

export async function recoverSetPassword(resetToken, newPassword, totpCode) {
  const res = await fetch(`${BASE}/recover/set-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword, totpCode }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Error al actualizar la contraseña");
  }
  return res.json();
}
