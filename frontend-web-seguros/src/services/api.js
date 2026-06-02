const API_URL =
"http://localhost:8000/api";

export async function getData(endpoint){

try{

const response =
await fetch(
`${API_URL}${endpoint}`
);

if(!response.ok){

throw new Error(
"Error al obtener datos"
);

}

return await response.json();

}

catch(error){

console.error(error);

return [];

}

}

/* CLIENTES */

export async function obtenerClientes(){

return getData(
"/clientes"
);

}

/* SEGUROS */

export async function obtenerSeguros(){

return getData(
"/seguros"
);

}

/* CONTACTO */

export async function enviarFormulario(data){

try{

const response =
await fetch(
`${API_URL}/contacto`,
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify(data)

}

);

return await response.json();

}

catch(error){

console.log(error);

}

}