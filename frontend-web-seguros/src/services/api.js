const API_URL = "http://localhost:8000";

/* ========================================
BASE FETCH
======================================== */

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);

  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  return res.json();
}

async function apiPost(endpoint, body, options = {}) {
  return apiFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
  });
}

async function apiPut(endpoint, body, options = {}) {
  return apiFetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
  });
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/* ========================================
SEGUROS PÚBLICOS
======================================== */

export async function obtenerSeguros() {
  return apiFetch("/seguros/");
}

export async function obtenerSeguro(id) {
  return apiFetch(`/seguros/${id}`);
}

/* ========================================
CONTACTO / COTIZACIÓN
======================================== */

export async function enviarContacto(data) {
  return apiPost("/contacto/", data);
}

export async function enviarCotizacion(data) {
  return apiPost("/cotizaciones/", data);
}

/* ========================================
LOGIN
======================================== */

export async function login(data) {
  return apiPost("/auth/login", data);
}

export async function loginCliente(data) {
  return apiPost("/auth/login", data);
}

/* ========================================
PORTAL CLIENTE
======================================== */

export async function getMiCuenta(token) {
  return apiFetch("/portal/mi-cuenta", {
    headers: authHeaders(token),
  });
}

export async function actualizarMiCuenta(token, data) {
  return apiPut("/portal/mi-cuenta", data, {
    headers: authHeaders(token),
  });
}

export async function subirFotoPerfil(token, data) {
  return apiPost("/portal/mi-cuenta/foto", data, {
    headers: authHeaders(token),
  });
}

/* ========================================
RESUMEN PORTAL
======================================== */

export async function getResumenPortal(token) {
  try {
    const polizas = await getMisPolizas(token);

    return {
      segurosActivos:
        polizas?.filter(
          (p) => p.estado === "activa" || p.estado === "vigente"
        ).length || 0,

      companias:
        [...new Set(polizas?.map((p) => p.compania))].length || 0,

      proximoVencimiento:
        polizas?.length
          ? polizas.map((p) => p.fecha_vencimiento).sort()[0]
          : null,

      polizas: polizas || [],
    };
  } catch {
    return {
      segurosActivos: 0,
      companias: 0,
      proximoVencimiento: null,
      polizas: [],
    };
  }
}

/* ========================================
PÓLIZAS
======================================== */

export async function getMisPolizas(token) {
  return apiFetch("/portal/mis-polizas", {
    headers: authHeaders(token),
  });
}

export async function getDetallePoliza(token, id) {
  return apiFetch(`/portal/mis-polizas/${id}`, {
    headers: authHeaders(token),
  });
}

/* ========================================
COBERTURAS
======================================== */

export async function getMisCoberturas(token) {
  try {
    return await apiFetch("/portal/mis-coberturas", {
      headers: authHeaders(token),
    });
  } catch {
    const polizas = await getMisPolizas(token);

    return polizas.map((p) => ({
      id_poliza: p.id_poliza,
      seguro: p.seguro?.nombre,
      compania: p.compania,
      numero_poliza: p.numero_poliza,
      coberturas: [],
    }));
  }
}

/* ========================================
BENEFICIARIOS
======================================== */

export async function getMisBeneficiarios(token) {
  try {
    return await apiFetch("/portal/mis-beneficiarios", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

/* ========================================
DOCUMENTOS
======================================== */

export async function getMisDocumentos(token) {
  try {
    return await apiFetch("/portal/mis-documentos", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

/* ========================================
COTIZACIONES
======================================== */

export async function getMisCotizaciones(token) {
  return apiFetch("/portal/mis-cotizaciones", {
    headers: authHeaders(token),
  });
}

/* ========================================
PAGOS
======================================== */

export async function getMisPagos(token) {
  return apiFetch("/portal/mis-pagos", {
    headers: authHeaders(token),
  });
}

export async function getMetodosPago(token) {
  return apiFetch("/portal/metodos-pago", {
    headers: authHeaders(token),
  });
}

/* ========================================
SINIESTROS
======================================== */

export async function getMisSiniestros(token) {
  return apiFetch("/portal/mis-siniestros", {
    headers: authHeaders(token),
  });
}

export async function crearSiniestro(token, data) {
  return apiPost("/portal/mis-siniestros", data, {
    headers: authHeaders(token),
  });
}

export async function reportarSiniestro(token, data) {
  return crearSiniestro(token, data);
}

/* ========================================
BENEFICIOS
======================================== */

export async function getMisBeneficios(token) {
  return apiFetch("/portal/mis-beneficios", {
    headers: authHeaders(token),
  });
}

/* ========================================
ALERTAS
======================================== */

export async function getMisAlertas(token) {
  return apiFetch("/portal/mis-alertas", {
    headers: authHeaders(token),
  });
}

/* ========================================
ASISTENCIA
======================================== */

export async function solicitarAsistencia(token, data) {
  return apiPost("/portal/asistencia", data, {
    headers: authHeaders(token),
  });
}