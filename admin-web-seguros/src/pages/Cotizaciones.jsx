import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { cotizacionesApi } from "../services/api";
import DataTable from "../components/DataTable";

const COLUMNS = [
  { key: "id_cotizacion", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "rut", label: "RUT" },
  { key: "email", label: "Email" },
  { key: "seguro_id", label: "Seguro ID" },
  { key: "canal", label: "Canal" },
  { key: "estado", label: "Estado" },
  { key: "fecha_solicitud", label: "Fecha", render: (v) => v ? new Date(v).toLocaleDateString("es-CL") : "—" },
];

export default function Cotizaciones() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    cotizacionesApi.list(token).then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Cotizaciones</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} readOnly />
    </div>
  );
}
