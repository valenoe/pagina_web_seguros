const API_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Error en la solicitud");
  }

  return data;
}

export function obtenerSeguros() {
  return request("/seguros/");
}

export function obtenerSeguro(idSeguro) {
  return request(`/seguros/${idSeguro}`);
}

export function enviarContacto(data) {
  return request("/contacto/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function enviarCotizacion(data) {
  return request("/cotizaciones/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginCliente(data) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function obtenerMisCotizaciones() {
  return request("/portal/mis-cotizaciones");
}

export function obtenerMisPolizas() {
  return request("/portal/mis-polizas");
}

export function obtenerDetallePoliza(idPoliza) {
  return request(`/portal/mis-polizas/${idPoliza}`);
}