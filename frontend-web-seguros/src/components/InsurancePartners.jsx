const aseguradoras = [
  { nombre: "SURA", logo: "/SURA.png" },
  { nombre: "BCI", logo: "/BCI.png" },
  { nombre: "HDI", logo: "/HDI.png" },
  { nombre: "MAPFRE", logo: "/MAPFRE.png" },
  { nombre: "Consorcio", logo: "/Consorcio.png" },
  { nombre: "Chubb", logo: "/Chubb.png" },
  { nombre: "Renta Nacional", logo: "/Renta Nacional.png" },
  { nombre: "Southbridge", logo: "/Southbridge.png" },
  { nombre: "Zurich", logo: "/Zurich.png" },
  { nombre: "AVLA", logo: "/AVLA.png" },
  { nombre: "Orsan", logo: "/Orsan.png" },
  { nombre: "FID Seguros", logo: "/FID Seguros.png" },
  { nombre: "Continental", logo: "/Continental.png" },
  { nombre: "Europ Assistance", logo: "/Europ Assitence.png" },
];

function InsurancePartners() {
  const loop = [...aseguradoras, ...aseguradoras];

  return (
    <section className="partners-section">

      <div className="partners-header">

        <span>Compañías asociadas</span>

        <h2>
          Trabajamos con aseguradoras líderes
        </h2>

        <p>
          Seleccionamos alternativas para entregar una propuesta adecuada
          a cada cliente.
        </p>

      </div>

      <div className="partners-carousel">

        <div className="partners-track">

          {loop.map((item, index) => (
            <div
              className="partner-slide"
              key={`${item.nombre}-${index}`}
            >

              <img
                src={item.logo}
                alt={item.nombre}
              />

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default InsurancePartners;