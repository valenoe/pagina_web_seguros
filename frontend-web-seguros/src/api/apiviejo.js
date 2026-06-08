const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (
    token &&
    token !== "undefined" &&
    token !== "null"
  ) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      "Error en la solicitud"
    );
  }

  return data;
}

/* =======================
SEGUROS
======================= */

export const obtenerSeguros = () =>
  request("/seguros/");

export const obtenerSeguro = (idSeguro) =>
  request(`/seguros/${idSeguro}`);

/* =======================
CONTACTO
======================= */

export const enviarContacto = (data) =>
  request("/contacto/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* =======================
COTIZACIONES
======================= */

export const enviarCotizacion = (data) =>
  request("/cotizaciones/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* =======================
AUTH
======================= */

export const login = (data) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const loginCliente = login;

export function logout() {
  localStorage.removeItem("token");
}

/* =======================
PORTAL CLIENTE
======================= */

export const getMisCotizaciones = () =>
  request("/portal/mis-cotizaciones");

export const getMisPolizas = () =>
  request("/portal/mis-polizas");

export const obtenerDetallePoliza = (
  idPoliza
) =>
  request(
    `/portal/mis-polizas/${idPoliza}`
  );