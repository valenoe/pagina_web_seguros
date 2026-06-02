import Header from "../components/Header";

import Footer from "../components/Footer";

function Dashboard(){

return(

<>

<Header />

<section className="dashboard">

<div className="dashboard-sidebar">

<h2>

Portal Clientes

</h2>

<button>

Resumen

</button>

<button>

Mis pólizas

</button>

<button>

Cotizaciones

</button>

<button>

Siniestros

</button>

<button>

Documentos

</button>

<button>

Perfil

</button>

</div>

<div className="dashboard-main">

<div className="dashboard-banner">

<span>

Bienvenido

</span>

<h1>

Panel Cliente

</h1>

<p>

Consulta tus seguros,
documentos y solicitudes.

</p>

</div>

<div className="dashboard-grid">

<div className="dashboard-card">

<h2>

3

</h2>

<p>

Pólizas activas

</p>

</div>

<div className="dashboard-card">

<h2>

2

</h2>

<p>

Cotizaciones

</p>

</div>

<div className="dashboard-card">

<h2>

1

</h2>

<p>

Siniestro

</p>

</div>

<div className="dashboard-card">

<h2>

8

</h2>

<p>

Documentos

</p>

</div>

</div>

</div>

</section>

<Footer />

</>

);

}

export default Dashboard;