/* ==================================================
CORREDÍN KNOWLEDGE BASE — PRIETO & CORREA SEGUROS
Frontend React + Vite

Este archivo es el cerebro base de Corredín.
No reemplaza al backend: complementa la información pública
mientras los valores comerciales se cargan desde el sistema.
================================================== */

export const corredinKnowledge = {
  empresa: {
    nombre: "Prieto & Correa Seguros",
    descripcion:
      "Prieto & Correa Seguros es una corredora de seguros con más de 30 años de trayectoria en la Región del Maule. Acompaña a personas, familias y empresas mediante asesoría cercana, soluciones personalizadas y apoyo durante todo el ciclo del seguro: cotización, contratación, renovación, siniestros y atención posterior.",
    propuestaValor:
      "Trabajamos para ayudarte a proteger lo que más importa, comparando alternativas y orientándote según tus necesidades reales. Nuestro foco es entregar confianza, cercanía y respaldo.",
    trayectoria:
      "Más de 30 años acompañando a personas y empresas en la Región del Maule.",
    tono:
      "Cercano, profesional, claro y orientado a simplificar el lenguaje de seguros.",
  },

  contacto: {
    whatsapp: "56966541939",
    correo: "contacto@prietocorrea.cl",
    telefono: "+56 41 246 1600",
    web: "www.prietocorrea.cl",
    respuesta:
      "Puedes contactarte con Prieto & Correa a través del formulario de contacto de la página o hablar directamente con un ejecutivo comercial por WhatsApp.",
  },

  portal: {
    descripcion:
      "El portal cliente permite revisar información relacionada con pólizas, cotizaciones, beneficios, pagos, documentos y siniestros. Algunas respuestas personalizadas requieren que el cliente haya iniciado sesión.",
    login:
      "Para ingresar al portal debes ir a la sección Clientes y seleccionar Mi Portal de Seguros. Allí puedes iniciar sesión con tus credenciales.",
    vencimientos:
      "La fecha de vencimiento de una póliza se revisa dentro del portal cliente, en la sección de pólizas o resumen de seguros.",
    pagos:
      "Los pagos y cuotas dependen de la compañía, póliza y condiciones contratadas. Cuando la información esté cargada en el portal, Corredín podrá orientarte con el estado de tus pagos.",
  },

  pagos: {
    general:
      "Los métodos de pago pueden variar según la compañía y la póliza contratada. Normalmente pueden existir pagos directos con la compañía, transferencia, cuotas pactadas u otros medios habilitados. Para confirmar el método exacto, conviene revisar tu póliza o hablar con tu ejecutivo.",
    transferencia:
      "Si deseas pagar por transferencia, lo ideal es confirmar los datos bancarios vigentes con tu ejecutivo comercial o con la compañía correspondiente antes de realizar el pago.",
  },

  siniestros: {
    general:
      "Para denunciar un siniestro debes reunir antecedentes del hecho, fecha, hora, lugar, relato, fotos, documentos, constancia si corresponde y datos de terceros involucrados. En el portal cliente puedes usar el módulo de siniestros y el formulario digital.",
    documentos:
      "Los documentos pueden variar según el tipo de siniestro, pero normalmente se solicitan fotos, denuncia o constancia si corresponde, datos del asegurado, datos del conductor, antecedentes del vehículo, relato de los hechos y datos de terceros si existen.",
    formulario:
      "El portal cuenta con un formulario de denuncia de siniestro que permite completar información en línea y descargar el documento para enviarlo al ejecutivo comercial.",
  },

  conceptos: {
    deducible:
      "El deducible es la parte del daño que paga el asegurado antes de que opere el seguro. Puede ser un monto fijo, un porcentaje o una cantidad en UF, dependiendo de las condiciones de la póliza.",
    cobertura:
      "La cobertura indica qué riesgos o eventos están protegidos por el seguro. Por ejemplo: robo, incendio, daños materiales, responsabilidad civil, asistencia médica o asistencia en viaje, según el tipo de póliza.",
    exclusion:
      "Las exclusiones son situaciones que el seguro no cubre. Por ejemplo, daños intencionales, información no declarada, uso distinto al informado o eventos fuera de las condiciones pactadas. Siempre se deben revisar las condiciones particulares de la póliza.",
    prima:
      "La prima es el valor que se paga por el seguro. Puede ser mensual, anual o según la forma de pago pactada con la compañía.",
    montoAsegurado:
      "El monto asegurado es el límite máximo que puede cubrir la póliza frente a un evento cubierto, según las condiciones contratadas.",
  },

  seguros: [
    {
      key: "auto",
      nombre: "Seguro de Autos",
      aliases: ["auto", "autos", "vehiculo", "vehículo", "carro", "camioneta", "seguro automotriz"],
      categoria: "Vehículos",
      precioUf: "Desde 2,45 UF / mes",
      precioClp: "Aprox. $95.130 CLP / mes",
      descripcion:
        "Seguro orientado a proteger vehículos frente a accidentes, robo, daños materiales y responsabilidad civil, según el plan contratado.",
      coberturas: ["Robo", "Accidentes", "Daños materiales", "Responsabilidad civil"],
      asistencias: ["Asistencia en ruta", "Vehículo de reemplazo", "Robo de accesorios"],
      exclusiones: [
        "Conducción bajo efectos del alcohol o drogas",
        "Uso distinto al declarado",
        "Daños intencionales",
        "Eventos no indicados en la póliza",
      ],
      deducible:
        "Puede existir deducible según la compañía y el plan contratado. El monto suele expresarse en UF.",
    },
    {
      key: "rci",
      nombre: "RCI Argentina",
      aliases: ["rci", "argentina", "responsabilidad civil internacional", "seguro argentina", "cruzar argentina"],
      categoria: "Vehículos",
      precioUf: "Desde 0,17 UF / día",
      precioClp: "Valor referencial según UF diaria",
      descripcion:
        "Seguro de responsabilidad civil internacional requerido para circular en Argentina con vehículo chileno.",
      coberturas: ["Daños a terceros", "Ingreso vehicular a Argentina", "Cobertura internacional"],
      asistencias: ["Contratación rápida", "Respaldo asegurador", "Orientación para viaje"],
      exclusiones: ["Daños propios del vehículo", "Eventos fuera del territorio o periodo contratado"],
      deducible: "Depende de las condiciones de la póliza emitida.",
    },
    {
      key: "soap",
      nombre: "SOAP",
      aliases: ["soap", "seguro obligatorio", "permiso circulacion", "permiso de circulacion"],
      categoria: "Vehículos",
      precioUf: "Valor anual",
      precioClp: "Según tipo de vehículo",
      descripcion:
        "Seguro obligatorio de accidentes personales exigido para obtener el permiso de circulación.",
      coberturas: ["Muerte accidental", "Gastos médicos", "Incapacidad", "Lesiones corporales"],
      asistencias: ["Protege conductor, pasajeros y peatones"],
      exclusiones: ["Daños materiales del vehículo", "Robo", "Responsabilidad civil por daños materiales"],
      deducible: "El SOAP normalmente no opera como un seguro con deducible tradicional.",
    },
    {
      key: "hogar",
      nombre: "Seguro de Hogar",
      aliases: ["hogar", "casa", "departamento", "vivienda", "inmueble"],
      categoria: "Personas",
      precioUf: "Cotización personalizada",
      precioClp: "Según características del hogar",
      descripcion:
        "Seguro orientado a proteger vivienda, estructura, contenido y riesgos asociados al hogar, según plan contratado.",
      coberturas: ["Incendio", "Sismo", "Robo", "Daños en estructura y contenido"],
      asistencias: ["Cerrajería", "Cristalería", "Gasfitería", "Electricidad"],
      exclusiones: ["Falta de mantención", "Daños intencionales", "Bienes no declarados", "Eventos excluidos por póliza"],
      deducible: "Puede aplicar deducible dependiendo del riesgo cubierto y la compañía.",
    },
    {
      key: "mujer",
      nombre: "Mujer Segura",
      aliases: ["mujer segura", "mujer", "seguro mujer"],
      categoria: "Personas",
      precioUf: "0,33 UF / año",
      precioClp: "Valor referencial anual",
      descripcion:
        "Seguro de protección económica pensado para mujeres, con coberturas asociadas a accidentes personales.",
      coberturas: ["Muerte accidental", "Incapacidad total", "Desmembramiento", "Gastos de sepelio"],
      asistencias: ["Protección económica familiar", "Para mujeres de 18 a 80 años"],
      exclusiones: ["Eventos no accidentales", "Situaciones excluidas en condiciones particulares"],
      deducible: "Depende de las condiciones del producto contratado.",
    },
    {
      key: "accidentes",
      nombre: "Seguro de Accidentes Personales",
      aliases: ["accidentes personales", "accidente personal", "accidentes", "lesiones", "invalidez"],
      categoria: "Personas",
      precioUf: "Cotización personalizada",
      precioClp: "Según plan contratado",
      descripcion:
        "Seguro que entrega protección ante lesiones, invalidez o fallecimiento accidental, según plan contratado.",
      coberturas: ["Lesiones", "Invalidez", "Fallecimiento accidental"],
      asistencias: ["Planes flexibles", "Protección personal", "Apoyo ante imprevistos"],
      exclusiones: ["Enfermedades no accidentales", "Eventos intencionales", "Actividades excluidas"],
      deducible: "Puede variar según la compañía y el plan.",
    },
    {
      key: "viaje",
      nombre: "Asistencia en Viaje",
      aliases: ["viaje", "viajes", "asistencia viaje", "asistencia en viaje", "seguro viaje", "internacional"],
      categoria: "Personas",
      precioUf: "Desde 0,32 UF / año",
      precioClp: "Valor referencial anual",
      descripcion:
        "Asistencia para viajes nacionales o internacionales, orientada a emergencias médicas y problemas durante el viaje.",
      coberturas: ["Asistencia médica", "Hospitalización", "Repatriación", "Pérdida de equipaje"],
      asistencias: ["Emergencias médicas", "Atención internacional", "Asistencia por equipaje"],
      exclusiones: ["Enfermedades preexistentes no cubiertas", "Viajes fuera de condiciones", "Eventos no declarados"],
      deducible: "Depende del plan contratado y destino.",
    },
    {
      key: "mascotas",
      nombre: "Seguro de Mascotas",
      aliases: ["mascota", "mascotas", "perro", "gato", "veterinario"],
      categoria: "Personas",
      precioUf: "Desde 0,15 UF / mes",
      precioClp: "Según plan contratado",
      descripcion:
        "Seguro orientado a perros y gatos, con apoyo frente a accidentes, enfermedades y atención veterinaria.",
      coberturas: ["Accidentes", "Enfermedades", "Atención veterinaria"],
      asistencias: ["Planes Básico, Medio y Full", "Para perros y gatos"],
      exclusiones: ["Preexistencias no declaradas", "Tratamientos excluidos", "Eventos fuera de plan"],
      deducible: "Depende del plan contratado.",
    },
    {
      key: "garantias",
      nombre: "Seguro de Garantías",
      aliases: ["garantia", "garantía", "garantias", "garantías", "licitacion", "licitación", "fiel cumplimiento"],
      categoria: "Empresas y otros",
      precioUf: "Según evaluación",
      precioClp: "Cotización personalizada",
      descripcion:
        "Seguro que respalda obligaciones contractuales frente a terceros, útil para licitaciones, obras y contratos.",
      coberturas: ["Seriedad de oferta", "Fiel cumplimiento", "Ejecución de obras"],
      asistencias: ["Ideal para licitaciones", "Respaldo contractual", "Solución para empresas"],
      exclusiones: ["Obligaciones no cubiertas", "Incumplimientos fuera de condiciones", "Riesgos no aprobados"],
      deducible: "Se determina según evaluación y condiciones de la garantía.",
    },
  ],
};
