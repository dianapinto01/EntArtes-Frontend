const API_URL = "http://localhost:3000/api/v1";
const JSON_HEADERS = { "Content-Type": "application/json" };

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Erro na API";
    throw new Error(message);
  }

  return data;
}

export async function login(credentials) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(credentials),
  });

  return parseResponse(res);
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });

  return parseResponse(res);
}

export async function getScheduleFull(id) {
  const res = await fetch(`${API_URL}/schedules/${id}/full`);
  return res.json();
}

export async function getTeachers() {
  const res = await fetch(`${API_URL}/teachers`);
  return res.json();
}

export async function getCoachingTypes() {
  const res = await fetch(`${API_URL}/coaching-types`);
  return parseResponse(res);
}

export async function getCoachingTeachers() {
  const res = await fetch(`${API_URL}/teachers`);
  return parseResponse(res);
}

export async function createCoachingRequest(data) {
  const res = await fetch(`${API_URL}/pedidos-coaching`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function getCoachingRequests(userId) {
  const res = await fetch(`${API_URL}/pedidos-coaching/responsavel/${userId}`);
  return parseResponse(res);
}

export async function cancelCoachingRequest(id) {
  const auth = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const token = auth.accessToken;
  const res = await fetch(`${API_URL}/pedidos-coaching/${id}/cancelar`, {
    method: "PATCH",
    headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
  });
  return parseResponse(res);
}

export async function getModalities() {
  const res = await fetch(`${API_URL}/modalities`);
  return parseResponse(res);
}

export async function getAlunosByResponsavel(responsavelId) {
  const res = await fetch(`${API_URL}/session-students/responsavel/${responsavelId}`);
  return parseResponse(res);
}

export async function createClass(data) {
  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}