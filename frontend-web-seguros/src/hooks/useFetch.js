import {
useEffect,
useState
}
from "react";

function useFetch(fn){

const[
data,
setData
]=useState([]);

const[
loading,
setLoading
]=useState(true);

useEffect(()=>{

async function load(){

const result =
await fn();

setData(result);

setLoading(false);

}

load();

},[]);

return{
data,
loading
};

}

export default useFetch;