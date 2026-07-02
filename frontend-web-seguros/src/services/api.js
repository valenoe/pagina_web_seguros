export const API_URL = "http://localhost:8000";

// Convierte una foto (URL relativa del backend, data: o http) en algo mostrable
// por <img src>. El backend devuelve rutas tipo "/uploads/fotos/xxx" → hay que
// anteponerle el host del backend.
export function fotoUrl(foto) {
  if (!foto) return "";
  if (foto.startsWith("data:") || foto.startsWith("http") || foto.startsWith("blob:")) {
    return foto;
  }
  return `${API_URL}${foto}`;
}

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
LOGIN / REGISTRO
======================================== */

export async function login(data) {
  return apiPost("/auth/login", data);
}

export async function loginCliente(data) {
  return apiPost("/auth/login", data);
}

export async function registroCliente(data) {
  return apiPost("/auth/registro", data);
}

export async function verificarRutDisponible(rut, tipo_cliente) {
  try {
    const params = new URLSearchParams({ rut, tipo_cliente });
    const res = await fetch(`${API_URL}/auth/verificar-rut?${params}`);
    if (!res.ok) return true;
    const data = await res.json();
    return data.disponible;
  } catch {
    return true;
  }
}

/* ========================================
PORTAL CLIENTE
======================================== */

export async function getMiCuenta(token) {
  return apiFetch("/portal/perfil", {
    headers: authHeaders(token),
  });
}

export async function actualizarMiCuenta(token, data) {
  return apiPut("/portal/perfil", data, {
    headers: authHeaders(token),
  });
}

export async function subirFotoPerfil(token, archivo) {
  const formData = new FormData();
  formData.append("foto", archivo);

  const res = await fetch(`${API_URL}/portal/perfil/foto`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function subirDocumento(token, archivo, { polizaId, nombre, tipo } = {}) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  if (polizaId) formData.append("poliza_id", polizaId);
  if (nombre) formData.append("nombre", nombre);
  if (tipo) formData.append("tipo", tipo);

  const res = await fetch(`${API_URL}/portal/documentos/subir`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `Error ${res.status}`);
  }
  return res.json();
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

// Sin uso: la pestaña "Coberturas" de Mis Seguros se eliminó (las coberturas
// exactas viven en el PDF de la póliza → pestaña Documentos). Se deja comentada
// por si el broker nuevo llega a devolver coberturas estructuradas más adelante.
// export async function getMisCoberturas(token) {
//   try {
//     return await apiFetch("/portal/mis-coberturas", {
//       headers: authHeaders(token),
//     });
//   } catch {
//     const polizas = await getMisPolizas(token);
//
//     return polizas.map((p) => ({
//       id_poliza: p.id_poliza,
//       seguro: p.seguro?.nombre,
//       compania: p.compania,
//       numero_poliza: p.numero_poliza,
//       coberturas: [],
//     }));
//   }
// }

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
  try {
    return await apiFetch("/portal/mis-pagos", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

export async function getMetodosPago(token) {
  try {
    return await apiFetch("/portal/metodos-pago", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

/* ========================================
SINIESTROS
======================================== */

export async function getMisSiniestros(token) {
  try {
    return await apiFetch("/portal/mis-siniestros", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

export async function crearSiniestro(token, data) {
  try {
    return await apiPost("/portal/mis-siniestros", data, {
      headers: authHeaders(token),
    });
  } catch {
    return { ok: false };
  }
}

export async function reportarSiniestro(token, data) {
  return crearSiniestro(token, data);
}

/* ========================================
BENEFICIOS
======================================== */

export async function getMisBeneficios(token) {
  try {
    return await apiFetch("/portal/mis-beneficios", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

/* ========================================
ALERTAS
======================================== */

export async function getMisAlertas(token) {
  try {
    return await apiFetch("/portal/mis-alertas", {
      headers: authHeaders(token),
    });
  } catch {
    return [];
  }
}

/* ========================================
ASISTENCIA
======================================== */

export async function solicitarAsistencia(token, data) {
  try {
    return await apiPost("/portal/asistencia", data, {
      headers: authHeaders(token),
    });
  } catch {
    return { ok: false };
  }
}