/**
 * Plantilla de campos por RAMO (Opción A — config en código).
 *
 * Fuente única de la "materia asegurada" / datos específicos de cada tipo de
 * seguro. La consumen:
 *   - el Cotizador   → dibuja estos campos según el seguro elegido y los guarda
 *                      en `web_cotizaciones.datos_adicionales`.
 *   - el detalle de póliza → muestra `web_polizas.materia_asegurada` con estas
 *                            mismas etiquetas.
 *
 * Se enlaza por el `ramo` del catálogo (`web_seguros_catalogo.ramo`), NO por el
 * id del seguro → borrar/recrear un seguro en el admin no desacopla la plantilla.
 *
 * Estructura de cada campo:
 *   clave      → llave estable en el JSON (no cambiar: rompería pólizas viejas)
 *   etiqueta   → texto visible
 *   tipo       → "text" | "number" | "date" | "select" | "radio" | "multiselect" | "file"
 *   opciones   → array de strings (solo select/radio/multiselect)
 *   requerido  → true si es obligatorio en el cotizador (se valida al enviar)
 *   condicion  → { campo, igual } opcional: el campo solo aplica si otro campo
 *                tiene cierto valor (ej. "Tipo de uso" solo si Uso = Comercial)
 *
 * Ramos EXTERNOS (mascotas, rci, soap, viaje) no tienen plantilla acá: sus datos
 * vienen del broker. Se agregarán cuando lleguen esos campos.
 */

export const materiaPorRamo = {
  auto: [
    { clave: "tipo_auto", etiqueta: "Tipo de auto", tipo: "select", requerido: true,
      opciones: ["Automóvil", "Station Wagon", "Camioneta", "Furgón", "Alta Gama", "Híbrido"] },
    { clave: "marca", etiqueta: "Marca", tipo: "text", requerido: true },
    { clave: "modelo", etiqueta: "Modelo", tipo: "text", requerido: true },
    { clave: "patente", etiqueta: "Patente", tipo: "text" },
    { clave: "anio", etiqueta: "Año", tipo: "number", requerido: true },
    { clave: "estado_vehiculo", etiqueta: "Estado del vehículo", tipo: "radio",
      opciones: ["Nuevo", "Usado"] },
    { clave: "uso", etiqueta: "Uso", tipo: "radio", opciones: ["Particular", "Comercial"] },
    { clave: "tipo_uso", etiqueta: "Tipo de uso", tipo: "text",
      condicion: { campo: "uso", igual: "Comercial" } },
  ],

  hogar: [
    { clave: "tipo_vivienda", etiqueta: "Tipo de vivienda", tipo: "select", requerido: true,
      opciones: ["Casa", "Departamento"] },
    { clave: "cantidad_pisos", etiqueta: "Cantidad de pisos", tipo: "number",
      condicion: { campo: "tipo_vivienda", igual: "Casa" } },
    { clave: "cantidad_pisos_edificio", etiqueta: "Cantidad de pisos del edificio", tipo: "number",
      condicion: { campo: "tipo_vivienda", igual: "Departamento" } },
    { clave: "piso_departamento", etiqueta: "Piso del departamento", tipo: "number",
      condicion: { campo: "tipo_vivienda", igual: "Departamento" } },
    { clave: "uso", etiqueta: "Uso", tipo: "radio", opciones: ["Habitacional", "Vacacional"] },
    { clave: "tipo_construccion", etiqueta: "Tipo de construcción", tipo: "select", requerido: true,
      opciones: [
        "Sólido - Ladrillo", "Sólido - Concreto",
        "Mixto - Ladrillo/Metalcom", "Mixto - Ladrillo/Madera",
        "Mixto - Concreto/Metalcom", "Mixto - Concreto/Madera",
        "Ligero - Metalcom", "Ligero - Madera",
      ] },
    { clave: "metros_construidos", etiqueta: "Metros construidos", tipo: "number", requerido: true },
    { clave: "anio_construccion", etiqueta: "Año de construcción", tipo: "number" },
    { clave: "monto_edificacion", etiqueta: "Monto asegurado edificación (UF)", tipo: "number", requerido: true },
    { clave: "monto_contenidos", etiqueta: "Monto asegurado contenidos (UF)", tipo: "number", requerido: true },
    { clave: "cerca_canal_rio", etiqueta: "¿A menos de 100 m de canal o río?", tipo: "radio",
      opciones: ["Sí", "No"] },
    { clave: "cerca_borde_costero", etiqueta: "¿Borde costero a menos de 25 msnm?", tipo: "radio",
      opciones: ["Sí", "No"] },
    { clave: "deshabitada_30_dias", etiqueta: "¿Deshabitada por más de 30 días?", tipo: "radio",
      opciones: ["Sí", "No"] },
    { clave: "pareada_ambos_costados", etiqueta: "¿Pareada por ambos costados?", tipo: "radio",
      opciones: ["Sí", "No"] },
    { clave: "bomberos_mas_10km", etiqueta: "¿Cuerpo de bomberos a más de 10 km?", tipo: "radio",
      opciones: ["Sí", "No"] },
    { clave: "coberturas_opcionales", etiqueta: "Coberturas opcionales", tipo: "multiselect",
      opciones: ["Edificación + Contenido", "Adicional Sismo", "Opcional Robo"] },
  ],

  mujer_segura: [
    { clave: "actividad", etiqueta: "Descripción del cargo o actividad", tipo: "text", requerido: true },
    // El seguro es de accidentes personales: la "materia" es la propia persona,
    // cuyos datos (nombre, RUT, fecha nac., dirección) ya viven en web_clientes.
  ],

  garantias: [
    { clave: "tipo_garantia", etiqueta: "Tipo de garantía", tipo: "select", requerido: true,
      opciones: [
        "Seriedad de la Oferta", "Fiel Cumplimiento",
        "Correcta Inversión de Anticipos", "Correcta Ejecución de Obras",
      ] },
    { clave: "metodo_liquidacion", etiqueta: "Método de liquidación", tipo: "select",
      opciones: ["A la vista", "Ejecución inmediata"] },
    { clave: "tipo_mandante", etiqueta: "Tipo de asegurado/mandante", tipo: "radio",
      opciones: ["Público", "Privado"] },
    { clave: "razon_social", etiqueta: "Razón social / Nombre", tipo: "text", requerido: true },
    { clave: "glosa", etiqueta: "Glosa", tipo: "text" },
    { clave: "vigencia_inicial", etiqueta: "Vigencia inicial", tipo: "date", requerido: true },
    { clave: "vigencia_final", etiqueta: "Vigencia final", tipo: "date", requerido: true },
    { clave: "monto_asegurado_uf", etiqueta: "Monto asegurado (UF)", tipo: "number", requerido: true },
    { clave: "contrato_proyecto", etiqueta: "Contrato / Proyecto", tipo: "file" },
    { clave: "carpeta_tributaria", etiqueta: "Carpeta tributaria", tipo: "file" },
  ],
};

// Devuelve la plantilla de un ramo (array vacío si no tiene → ramos externos).
export function camposDeRamo(ramo) {
  return materiaPorRamo[ramo] || [];
}
