const API_URL = "http://localhost:8000";

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

async function apiPost(endpoint, body) {
  return apiFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// Seguros
export async function obtenerSeguros() {
  return apiFetch("/seguros/");
}

export async function obtenerSeguro(id) {
  return apiFetch(`/seguros/${id}`);
}

export async function registroCliente(data) {
  return apiPost("/auth/registro", data);
}

// Contacto — { nombre, email, telefono?, mensaje? }
export async function enviarContacto(data) {
  return apiPost("/contacto/", data);
}

// Cotizaciones — { id_seguro, nombre, rut, tipo_cliente, email, telefono, canal, mensaje?, datos_adicionales? }
export async function enviarCotizacion(data) {
  return apiPost("/cotizaciones/", data);
}

// Auth — { rut, tipo_cliente, password }
export async function login(data) {
  return apiPost("/auth/login", data);
}

// Portal (requiere JWT)
export async function getMisCotizaciones(token) {
  return apiFetch("/portal/mis-cotizaciones", { headers: authHeaders(token) });
}

export async function getMisPolizas(token) {
  return apiFetch("/portal/mis-polizas", { headers: authHeaders(token) });
}

export async function getDetallePoliza(token, id) {
  return apiFetch(`/portal/mis-polizas/${id}`, { headers: authHeaders(token) });
}

export async function getMiPerfil(token) {
  return apiFetch("/portal/perfil", { headers: authHeaders(token) });
}
