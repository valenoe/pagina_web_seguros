import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leadsApi } from "../services/api";
import DataTable from "../components/DataTable";

const COLUMNS = [
  { key: "id_lead", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "telefono", label: "Teléfono" },
  { key: "mensaje", label: "Mensaje" },
  { key: "fecha_contacto", label: "Fecha", render: (v) => v ? new Date(v).toLocaleDateString("es-CL") : "—" },
];

export default function Leads() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    leadsApi.list(token).then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Leads de contacto</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} readOnly />
    </div>
  );
}
