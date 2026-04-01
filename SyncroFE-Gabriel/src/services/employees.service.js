import { API_BASE_URL } from "./api";

const BASE_URL = `${API_BASE_URL}/api/employees`;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export async function getEmployees() {
  const res = await fetch(API_URL, { headers: authHeader() });
  if (!res.ok) throw new Error("Error");
  return res.json();
}

export async function createEmployee(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error");
}

export async function changeEmployeeRole(userId, role) {
  const res = await fetch(
    `http://localhost:5000/api/employees/${userId}/role`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ role }),
    }
  );

  if (!res.ok) throw new Error("Error cambiando rol");
}