const API_URL = "http://localhost:3000";

export async function getScheduleFull(id) {
  const res = await fetch(`${API_URL}/schedules/${id}/full`);
  return res.json();
}

export async function getTeachers() {
  const res = await fetch(`${API_URL}/teachers`);
  return res.json();
}

export async function createClass(data) {
  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}