import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { segurosDestacados } from "../data/siteData";

const regionesComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  Tarapacá: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  Antofagasta: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  Atacama: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  Coquimbo: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  Valparaíso: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llay-Llay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  Maule: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  Ñuble: ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Treguaco", "San Carlos", "Coihueco", "Ñiquén", "San Fabián", "San Nicolás"],
  Biobío: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  Aysén: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  Magallanes: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"],
};

function Cotizador() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    rut: "",
    correo: "",
    telefono: "",
    region: "",
    comuna: "",
    seguro: "",
    mensaje: "",
  });

  const [busquedaRegion, setBusquedaRegion] = useState("");
  const [busquedaComuna, setBusquedaComuna] = useState("");

  const regiones = Object.keys(regionesComunas);

  const regionesFiltradas = regiones.filter((region) =>
    region.toLowerCase().includes(busquedaRegion.toLowerCase())
  );

  const todasLasComunas = regiones.flatMap((region) =>
    regionesComunas[region].map((comuna) => ({
      comuna,
      region,
    }))
  );

  const comunasFiltradas = todasLasComunas.filter((item) =>
    `${item.comuna} ${item.region}`
      .toLowerCase()
      .includes(busquedaComuna.toLowerCase())
  );

  function cambiarDato(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  }

  function seleccionarRegion(region) {
    setFormulario({
      ...formulario,
      region,
      comuna: "",
    });

    setBusquedaRegion(region);
    setBusquedaComuna("");
  }

  function seleccionarComuna(item) {
    setFormulario({
      ...formulario,
      region: item.region,
      comuna: item.comuna,
    });

    setBusquedaRegion(item.region);
    setBusquedaComuna(item.comuna);
  }

  function enviarCotizacion(e) {
    e.preventDefault();

    if (
      !formulario.nombre ||
      !formulario.rut ||
      !formulario.correo ||
      !formulario.telefono ||
      !formulario.region ||
      !formulario.comuna ||
      !formulario.seguro
    ) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    console.log("Solicitud enviada", formulario);

    navigate("/cotizacion-exitosa");
  }

  return (
    <>
      <Header />

      <section className="cotizador">
        <div className="cotizador-header">
          <span>Cotizador</span>
          <h1>Cotiza tu seguro</h1>
          <p>Completa tus datos y un asesor te contactará.</p>
        </div>

        <div className="cotizador-box">
          <form className="cotizador-form" onSubmit={enviarCotizacion}>
            <div>
              <label>Nombre completo *</label>
              <input
                name="nombre"
                required
                value={formulario.nombre}
                onChange={cambiarDato}
                placeholder="Ej: Matías González"
              />
            </div>

            <div>
              <label>RUT *</label>
              <input
                name="rut"
                required
                value={formulario.rut}
                onChange={cambiarDato}
                placeholder="12.345.678-9"
              />
            </div>

            <div>
              <label>Correo *</label>
              <input
                type="email"
                name="correo"
                required
                value={formulario.correo}
                onChange={cambiarDato}
                placeholder="correo@ejemplo.cl"
              />
            </div>

            <div>
              <label>Teléfono *</label>
              <input
                name="telefono"
                required
                value={formulario.telefono}
                onChange={cambiarDato}
                placeholder="+56 9 XXXX XXXX"
              />
            </div>

            <div className="search-field">
              <label>Buscar región *</label>
              <input
                required
                value={busquedaRegion}
                onChange={(e) => {
                  setBusquedaRegion(e.target.value);
                  setFormulario({
                    ...formulario,
                    region: "",
                    comuna: "",
                  });
                }}
                placeholder="Ej: Maule"
              />

              {busquedaRegion && !formulario.region && (
                <div className="suggestions">
                  {regionesFiltradas.map((region) => (
                    <button
                      type="button"
                      key={region}
                      onClick={() => seleccionarRegion(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="search-field">
              <label>Buscar comuna *</label>
              <input
                required
                value={busquedaComuna}
                onChange={(e) => {
                  setBusquedaComuna(e.target.value);
                  setFormulario({
                    ...formulario,
                    comuna: "",
                  });
                }}
                placeholder="Ej: Talca"
              />

              {busquedaComuna && !formulario.comuna && (
                <div className="suggestions">
                  {comunasFiltradas.slice(0, 12).map((item) => (
                    <button
                      type="button"
                      key={`${item.region}-${item.comuna}`}
                      onClick={() => seleccionarComuna(item)}
                    >
                      {item.comuna} — {item.region}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label>Tipo de seguro *</label>
              <select
                name="seguro"
                required
                value={formulario.seguro}
                onChange={cambiarDato}
              >
                <option value="">Selecciona seguro</option>

                {segurosDestacados.map((seguro) => (
                  <option key={seguro.id} value={seguro.titulo}>
                    {seguro.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="cotizador-full">
              <label>Mensaje</label>
              <textarea
                name="mensaje"
                value={formulario.mensaje}
                onChange={cambiarDato}
                placeholder="Cuéntanos brevemente qué necesitas"
              />
            </div>

            <button type="submit">Enviar solicitud</button>
          </form>

          <div className="cotizador-info">
            <h2>¿Qué pasa después?</h2>

            <ul>
              <li>Recibimos tu solicitud de cotización.</li>
              <li>Analizamos las mejores opciones según tus necesidades.</li>
              <li>Un asesor de Prieto & Correa se pondrá en contacto contigo.</li>
              <li>Te acompañamos para resolver dudas y comparar alternativas.</li>
              <li>Recibes una propuesta personalizada para tomar tu decisión.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Cotizador;