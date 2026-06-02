import Header from "../components/Header";

import Footer from "../components/Footer";

import {
useNavigate
}

from
"react-router-dom";

function Clientes(){

const navigate=
useNavigate();

function ingresar(e){

e.preventDefault();

navigate(
"/clientes/dashboard"
);

}

return(

<>

<Header />

<section className="clientes">

<div className="clientes-box">

<h1>

Acceso Clientes

</h1>

<p>

Ingresa al portal.

</p>

<form
onSubmit={
ingresar
}
>

<input
placeholder="Correo"
/>

<input
placeholder="Contraseña"
type="password"
/>

<button>

Ingresar

</button>

</form>

</div>

</section>

<Footer />

</>

);

}

export default Clientes;