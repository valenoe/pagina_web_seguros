const API_URL = "http://localhost:8000";

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function loginAdmin(login, password) {
  return apiFetch("/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
}

function crudFor(path) {
  return {
    list: (token) => apiFetch(`/admin/${path}`, { headers: authHeaders(token) }),
    get: (token, id) => apiFetch(`/admin/${path}/${id}`, { headers: authHeaders(token) }),
    create: (token, data) => apiFetch(`/admin/${path}`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),
    update: (token, id, data) => apiFetch(`/admin/${path}/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),
    remove: (token, id) => apiFetch(`/admin/${path}/${id}`, { method: "DELETE", headers: authHeaders(token) }),
  };
}

export const leadsApi = { list: (token) => apiFetch("/admin/leads", { headers: authHeaders(token) }) };
export const cotizacionesApi = { list: (token) => apiFetch("/admin/cotizaciones", { headers: authHeaders(token) }) };
export const segurosApi = crudFor("seguros");
export const clientesApi = crudFor("clientes");
export const polizasApi = crudFor("polizas");
export const imagenesApi = crudFor("imagenes");
export const usuariosApi = crudFor("usuarios");
