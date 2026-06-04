import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { polizasApi } from "../services/api";
import DataTable from "../components/DataTable";
import Modal, { Field, SelectField, SubmitBtn } from "../components/Modal";

const EMPTY = { cliente_id: "", seguro_id: "", cotizacion_id: "", numero_poliza: "", compania: "", fecha_inicio: "", fecha_vencimiento: "", prima: "", estado: "activa", origen: "digital" };

const COLUMNS = [
  { key: "id_poliza", label: "ID" },
  { key: "cliente_id", label: "Cliente ID" },
  { key: "seguro_id", label: "Seguro ID" },
  { key: "numero_poliza", label: "N° Póliza" },
  { key: "compania", label: "Compañía" },
  { key: "prima", label: "Prima" },
  { key: "estado", label: "Estado" },
  { key: "fecha_vencimiento", label: "Vencimiento", render: (v) => v ? new Date(v).toLocaleDateString("es-CL") : "—" },
];

export default function Polizas() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { setData(await polizasApi.list(token)); } catch (e) { setError(e.message); }
  }

  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }

  function abrirEditar(item) {
    setForm({
      ...item,
      cotizacion_id: item.cotizacion_id ?? "",
      numero_poliza: item.numero_poliza ?? "",
      compania: item.compania ?? "",
      fecha_inicio: item.fecha_inicio ?? "",
      fecha_vencimiento: item.fecha_vencimiento ?? "",
      prima: item.prima ?? "",
    });
    setModal({ mode: "edit", item });
  }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar póliza ID ${item.id_poliza}?`)) return;
    try { await polizasApi.remove(token, item.id_poliza); cargar(); } catch (e) { alert(e.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        cliente_id: Number(form.cliente_id),
        seguro_id: Number(form.seguro_id),
        cotizacion_id: form.cotizacion_id ? Number(form.cotizacion_id) : null,
        prima: form.prima ? Number(form.prima) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        numero_poliza: form.numero_poliza || null,
        compania: form.compania || null,
      };
      modal.mode === "create" ? await polizasApi.create(token, payload) : await polizasApi.update(token, modal.item.id_poliza, payload);
      setModal(null); cargar();
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Pólizas</h1>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "create" }); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Nueva</button>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} onEdit={abrirEditar} onDelete={eliminar} />
      {modal && (
        <Modal title={modal.mode === "create" ? "Nueva Póliza" : "Editar Póliza"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Cliente ID" type="number" value={form.cliente_id} onChange={set("cliente_id")} required />
            <Field label="Seguro ID" type="number" value={form.seguro_id} onChange={set("seguro_id")} required />
            <Field label="Cotización ID (opcional)" type="number" value={form.cotizacion_id} onChange={set("cotizacion_id")} />
            <Field label="N° Póliza" value={form.numero_poliza} onChange={set("numero_poliza")} />
            <Field label="Compañía" value={form.compania} onChange={set("compania")} />
            <Field label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={set("fecha_inicio")} />
            <Field label="Fecha vencimiento" type="date" value={form.fecha_vencimiento} onChange={set("fecha_vencimiento")} />
            <Field label="Prima" type="number" value={form.prima} onChange={set("prima")} />
            <SelectField label="Estado" value={form.estado} onChange={set("estado")} options={[{ value: "activa", label: "Activa" }, { value: "vencida", label: "Vencida" }, { value: "cancelada", label: "Cancelada" }]} />
            <SelectField label="Origen" value={form.origen} onChange={set("origen")} options={[{ value: "digital", label: "Digital" }, { value: "tradicional", label: "Tradicional" }]} />
            <SubmitBtn loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
