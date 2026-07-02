import {
  obtenerSeguros,
  getResumenPortal,
  getMisPagos,
  getMisBeneficios,
  getMisSiniestros,
} from "./api";
import { corredinKnowledge } from "../knowledge/corredinKnowledge";

function normalizar(texto = "") {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function incluyeAlguna(texto, palabras) {
  return palabras.some((palabra) => texto.includes(normalizar(palabra)));
}

function detectarIntencion(texto) {
  const q = normalizar(texto);

  if (incluyeAlguna(q, ["quien es", "quienes son", "prieto", "correa", "empresa", "corredora", "trayectoria", "historia"])) return "empresa";
  if (incluyeAlguna(q, ["contacto", "telefono", "teléfono", "correo", "mail", "whatsapp", "direccion", "dirección", "ubicacion", "ubicación", "sucursal"])) return "contacto";
  if (incluyeAlguna(q, ["portal", "login", "entrar", "ingresar", "mi cuenta", "contraseña", "password", "clave"])) return "portal";
  if (incluyeAlguna(q, ["vencimiento", "vence", "vencer", "renovar", "renovacion", "renovación"])) return "vencimiento";
  if (incluyeAlguna(q, ["pago", "pagar", "cuota", "cuotas", "transferencia", "webpay", "transbank", "banco"])) return "pagos";
  if (incluyeAlguna(q, ["siniestro", "denunciar", "denuncio", "choque", "accidente", "robo", "formulario", "constancia"])) return "siniestros";
  if (incluyeAlguna(q, ["beneficio", "beneficios", "descuento", "club"])) return "beneficios";
  if (incluyeAlguna(q, ["deducible", "deducibles"])) return "deducible";
  if (incluyeAlguna(q, ["exclusion", "exclusión", "no cubre", "no me cubre", "que no cubre", "qué no cubre"])) return "exclusiones";
  if (incluyeAlguna(q, ["cobertura", "coberturas", "cubre", "cubren", "monto asegurado", "montos asegurados", "capital asegurado"])) return "coberturas";
  if (incluyeAlguna(q, ["asistencia", "asistencias", "grua", "grúa", "ruta", "viaje"])) return "asistencias";
  if (incluyeAlguna(q, ["precio", "valor", "costo", "cuanto vale", "cuánto vale", "cuanto cuesta", "cuánto cuesta", "sale", "desde", "uf", "clp"])) return "precio";
  if (incluyeAlguna(q, ["seguro", "seguros", "productos", "poliza", "póliza", "polizas", "pólizas"])) return "seguros";

  return "general";
}

function detectarSeguro(texto, segurosBackend = []) {
  const q = normalizar(texto);

  const seguroLocal = corredinKnowledge.seguros.find((seguro) => {
    const nombre = normalizar(seguro.nombre);
    const nombreVista = normalizar(seguro.nombreVista || "");
    const aliases = seguro.aliases || [];

    return (
      q.includes(nombre) ||
      (nombreVista && q.includes(nombreVista)) ||
      aliases.some((alias) => q.includes(normalizar(alias)))
    );
  });

  if (seguroLocal) return seguroLocal;

  const seguroBackend = segurosBackend.find((seguro) => {
    const nombre = normalizar(seguro.nombre || "");
    return nombre && q.includes(nombre);
  });

  if (!seguroBackend) return null;

  return {
    key: normalizar(seguroBackend.nombre),
    nombre: seguroBackend.nombre,
    aliases: [seguroBackend.nombre],
    categoria: seguroBackend.categoria,
    descripcion: seguroBackend.descripcion,
    precioUf: seguroBackend.precio_uf || seguroBackend.precioUf || seguroBackend.precio_desde || "Cotización personalizada",
    precioClp: seguroBackend.precio_clp || seguroBackend.precioClp || "Valor referencial según evaluación",
    coberturas: seguroBackend.coberturas || [],
    asistencias: seguroBackend.asistencias || [],
    exclusiones: seguroBackend.exclusiones || [],
    deducible: seguroBackend.deducible || "Depende de la compañía, plan y condiciones contratadas.",
  };
}

function formatLista(items = []) {
  if (!items.length) return "• Información pendiente de carga en el sistema.";
  return items.map((item) => `• ${item}`).join("\n");
}

function buscarSeguroBackend(seguroDetectado, segurosBackend = []) {
  if (!seguroDetectado || !Array.isArray(segurosBackend)) return null;

  const nombreLocal = normalizar(seguroDetectado.nombre);
  const aliases = seguroDetectado.aliases || [];

  return segurosBackend.find((seguro) => {
    const nombreBackend = normalizar(seguro.nombre || "");

    return (
      nombreBackend === nombreLocal ||
      nombreBackend.includes(nombreLocal) ||
      nombreLocal.includes(nombreBackend) ||
      aliases.some((alias) => nombreBackend.includes(normalizar(alias)))
    );
  });
}

function valorCampo(...campos) {
  return campos.find((campo) => campo !== undefined && campo !== null && String(campo).trim() !== "");
}

function obtenerPreciosSeguro(seguroLocal, seguroBackend) {
  const precioUf = valorCampo(
    seguroBackend?.precio_uf,
    seguroBackend?.precioUf,
    seguroBackend?.valor_uf,
    seguroBackend?.valorUf,
    seguroLocal?.precioUf
  );

  const precioClp = valorCampo(
    seguroBackend?.precio_clp,
    seguroBackend?.precioClp,
    seguroBackend?.valor_clp,
    seguroBackend?.valorClp,
    seguroLocal?.precioClp
  );

  const precioDesde = valorCampo(
    seguroBackend?.precio_desde,
    seguroBackend?.precioDesde,
    seguroBackend?.valor_desde,
    seguroBackend?.valorDesde
  );

  const moneda = valorCampo(seguroBackend?.moneda);

  return {
    precioUf: precioUf || (precioDesde && moneda === "UF" ? precioDesde : null),
    precioClp: precioClp || (precioDesde && moneda === "CLP" ? precioDesde : null),
    precioDesde: precioDesde && !precioUf && !precioClp ? `${precioDesde}${moneda ? ` ${moneda}` : ""}` : null,
  };
}

async function cargarSegurosBackend() {
  try {
    return await obtenerSeguros();
  } catch {
    return [];
  }
}

async function responderPortalCliente(intencion, token) {
  if (!token) return null;

  try {
    if (intencion === "vencimiento" || intencion === "seguros") {
      const resumen = await getResumenPortal(token);
      const polizas = resumen?.polizas || [];

      if (!polizas.length) {
        return {
          title: "Tus pólizas",
          text:
            "No encontré pólizas cargadas en tu portal todavía. Si ya tienes seguros contratados, te recomiendo contactar a tu ejecutivo para revisar la carga de información.",
        };
      }

      const proxima = [...polizas].sort((a, b) =>
        String(a.fecha_vencimiento || "").localeCompare(String(b.fecha_vencimiento || ""))
      )[0];

      if (intencion === "vencimiento") {
        return {
          title: "Fecha de vencimiento",
          text: `Según tu portal, tu próximo vencimiento registrado corresponde a ${proxima?.seguro?.nombre || "una póliza"} con compañía ${proxima?.compania || "por confirmar"}, fecha ${proxima?.fecha_vencimiento || "no informada"}.`,
        };
      }

      return {
        title: "Tus seguros activos",
        text: `En tu portal aparecen ${polizas.length} póliza(s) registrada(s). El próximo vencimiento visible es ${proxima?.fecha_vencimiento || "no informado"}.`,
      };
    }

    if (intencion === "pagos") {
      const pagos = await getMisPagos(token);

      if (!Array.isArray(pagos) || !pagos.length) {
        return {
          title: "Pagos y cuotas",
          text:
            "No encontré pagos cargados en tu portal por ahora. Los medios de pago pueden depender de la compañía y de las condiciones de tu póliza.",
        };
      }

      return {
        title: "Pagos y cuotas",
        text: `Encontré ${pagos.length} registro(s) de pago en tu portal. Revisa la sección Pagos para ver estado, vencimiento y monto asociado.`,
      };
    }

    if (intencion === "beneficios") {
      const beneficios = await getMisBeneficios(token);

      if (!Array.isArray(beneficios) || !beneficios.length) {
        return {
          title: "Beneficios",
          text:
            "Por ahora no veo beneficios cargados para tu cuenta. Cuando estén disponibles, aparecerán en la sección Beneficios del portal cliente.",
        };
      }

      return {
        title: "Beneficios disponibles",
        text: `Tienes ${beneficios.length} beneficio(s) disponible(s) en el portal. Puedes revisarlos en la sección Beneficios.`,
      };
    }

    if (intencion === "siniestros") {
      const siniestros = await getMisSiniestros(token);

      if (!Array.isArray(siniestros) || !siniestros.length) {
        return {
          title: "Siniestros",
          text:
            "No encontré siniestros registrados en tu portal. Si necesitas denunciar uno, puedes hacerlo desde el módulo Siniestros usando el formulario digital.",
        };
      }

      return {
        title: "Tus siniestros",
        text: `Encontré ${siniestros.length} siniestro(s) registrado(s) en tu portal. Puedes revisar su estado en la sección Siniestros.`,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function responderSeguro(intencion, seguroLocal, seguroBackend) {
  const nombre = seguroBackend?.nombre || seguroLocal.nombreVista || seguroLocal.nombre;
  const descripcion = seguroBackend?.descripcion || seguroLocal.descripcion;
  const coberturas = seguroBackend?.coberturas || seguroLocal.coberturas || seguroLocal.cubre || [];
  const asistencias = seguroBackend?.asistencias || seguroLocal.asistencias || seguroLocal.beneficios || [];
  const exclusiones = seguroBackend?.exclusiones || seguroLocal.exclusiones || [];
  const deducible = seguroBackend?.deducible || seguroLocal.deducible;
  const { precioUf, precioClp, precioDesde } = obtenerPreciosSeguro(seguroLocal, seguroBackend);

  if (intencion === "precio") {
    const partesPrecio = [];

    if (precioUf) partesPrecio.push(`Valor UF: ${precioUf}`);
    if (precioClp) partesPrecio.push(`Valor CLP: ${precioClp}`);
    if (precioDesde) partesPrecio.push(`Valor referencial: ${precioDesde}`);

    const precioTexto = partesPrecio.length
      ? partesPrecio.join("\n")
      : "Valor: cotización personalizada según evaluación.";

    return {
      title: `Valor de ${nombre}`,
      text:
        `${precioTexto}\n\n` +
        "Este valor es referencial y puede variar según compañía, cobertura, deducible, datos del asegurado y evaluación comercial. Para un precio exacto, lo ideal es solicitar una cotización con tus datos.",
    };
  }

  if (intencion === "coberturas") {
    return {
      title: `Coberturas de ${nombre}`,
      text: `${descripcion}\n\nCoberturas principales:\n${formatLista(coberturas)}`,
    };
  }

  if (intencion === "asistencias") {
    return {
      title: `Asistencias de ${nombre}`,
      text: `Las asistencias pueden variar según la compañía y el plan contratado. Para ${nombre}, la información disponible es:\n${formatLista(asistencias)}`,
    };
  }

  if (intencion === "exclusiones") {
    return {
      title: `Exclusiones de ${nombre}`,
      text: `Estas son exclusiones o restricciones habituales asociadas a ${nombre}:\n${formatLista(exclusiones)}\n\nLa cobertura final siempre depende de las condiciones particulares de la póliza.`,
    };
  }

  if (intencion === "deducible") {
    return {
      title: `Deducible de ${nombre}`,
      text: deducible || corredinKnowledge.conceptos.deducible,
    };
  }

  return {
    title: nombre,
    text:
      `${descripcion}\n\n` +
      `Valor UF: ${precioUf || "Cotización personalizada"}\n` +
      `Valor CLP: ${precioClp || "Según evaluación"}\n\n` +
      "También puedo ayudarte con coberturas, asistencias, deducibles, exclusiones o cómo cotizar este seguro.",
  };
}

function responderInstitucional(intencion) {
  const { empresa, contacto, portal, pagos, siniestros, conceptos } = corredinKnowledge;

  const respuestas = {
    empresa: {
      title: "¿Quién es Prieto & Correa?",
      text: `${empresa.descripcion}\n\n${empresa.propuestaValor}`,
    },
    contacto: {
      title: "Contacto Prieto & Correa",
      text: `${contacto.respuesta}\n\nTeléfono: ${contacto.telefono}\nCorreo: ${contacto.correo}\nWeb: ${contacto.web}`,
    },
    portal: {
      title: "Portal cliente",
      text: `${portal.descripcion}\n\n${portal.login}`,
    },
    vencimiento: {
      title: "Vencimiento de póliza",
      text:
        "Para revisar una fecha de vencimiento exacta necesitas iniciar sesión en el portal cliente. Si estás dentro del portal, Corredín podrá orientarte con la información disponible en tus pólizas.",
    },
    pagos: {
      title: "Métodos de pago",
      text: pagos.general,
    },
    siniestros: {
      title: "Denuncia de siniestro",
      text: `${siniestros.general}\n\n${siniestros.formulario}`,
    },
    beneficios: {
      title: "Beneficios",
      text:
        "En el portal cliente podrás encontrar beneficios y descuentos disponibles cuando estén habilitados para tu cuenta. La disponibilidad puede variar según campañas y convenios vigentes.",
    },
    deducible: {
      title: "¿Qué es un deducible?",
      text: conceptos.deducible,
    },
    coberturas: {
      title: "Coberturas",
      text: conceptos.cobertura,
    },
    exclusiones: {
      title: "Exclusiones",
      text: conceptos.exclusion,
    },
    asistencias: {
      title: "Asistencias",
      text:
        "Las asistencias son servicios adicionales que pueden venir incluidos en una póliza, como grúa, asistencia en ruta, asistencia domiciliaria, asistencia médica o apoyo en viaje. Dependen del seguro, compañía y plan contratado.",
    },
    precio: {
      title: "Valores de seguros",
      text:
        "Los valores dependen del tipo de seguro, compañía, cobertura, deducible y datos del asegurado. Si me indicas qué seguro te interesa, puedo revisar la información disponible y orientarte con el valor referencial cargado.",
    },
    seguros: {
      title: "Seguros disponibles",
      text:
        "Prieto & Correa ofrece seguros para vehículos, personas, hogar, viajes, mascotas, garantías y otros riesgos. Puedes preguntarme por un seguro específico, por ejemplo: ¿cuánto vale el seguro de auto?, ¿qué cubre el seguro hogar? o ¿qué asistencia tiene el seguro de viaje?",
    },
  };

  return respuestas[intencion] || {
    title: "Te ayudo con tu consulta",
    text:
      "Puedo ayudarte con información sobre Prieto & Correa, tipos de seguros, coberturas, deducibles, exclusiones, asistencias, pagos, siniestros, portal cliente y contacto con ejecutivos.",
  };
}

export async function responderCorredin(consulta, opciones = {}) {
  const texto = consulta?.trim();
  const token = opciones.token || localStorage.getItem("token") || localStorage.getItem("access_token");

  if (!texto) {
    return {
      title: "Escríbeme tu consulta",
      text: "Cuéntame qué necesitas saber sobre tus seguros o sobre Prieto & Correa.",
    };
  }

  const intencion = detectarIntencion(texto);
  const segurosBackend = await cargarSegurosBackend();
  const seguroLocal = detectarSeguro(texto, segurosBackend);
  const seguroBackend = buscarSeguroBackend(seguroLocal, segurosBackend);

  const respuestaPortal = await responderPortalCliente(intencion, token);
  if (respuestaPortal && !seguroLocal) return respuestaPortal;

  if (seguroLocal) {
    return responderSeguro(intencion, seguroLocal, seguroBackend);
  }

  return responderInstitucional(intencion);
}

export function mensajeWhatsAppCorredin(consulta = "") {
  const base = "Hola, soy cliente/visitante de Prieto & Correa Seguros. Necesito ayuda con una consulta.";
  const detalle = consulta ? ` Mi consulta es: ${consulta}` : "";
  return encodeURIComponent(`${base}${detalle}`);
}
