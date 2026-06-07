import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { clientesApi } from "../services/api";
import DataTable from "../components/DataTable";
import Modal, { Field, SelectField, CheckField, SubmitBtn } from "../components/Modal";
import PhoneInput from "../components/PhoneInput";

const EMPTY = { rut: "", tipo_cliente: "persona", nombre_o_razon_social: "", email: "", telefono: "", cliente_activo: true };

const COLUMNS = [
  { key: "id_cliente", label: "ID" },
  { key: "rut", label: "RUT" },
  { key: "nombre_o_razon_social", label: "Nombre" },
  { key: "tipo_cliente", label: "Tipo" },
  { key: "email", label: "Email" },
  { key: "telefono", label: "Teléfono" },
  { key: "cliente_activo", label: "Activo", render: (v) => v ? "✓" : "✗" },
];

export default function Clientes() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { setData(await clientesApi.list(token)); } catch (e) { setError(e.message); }
  }

  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }

  function abrirEditar(item) { setForm({ ...item, email: item.email ?? "", telefono: item.telefono ?? "" }); setModal({ mode: "edit", item }); }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar cliente "${item.nombre_o_razon_social}"?`)) return;
    try { await clientesApi.remove(token, item.id_cliente); cargar(); } catch (e) { alert(e.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, email: form.email || null, telefono: form.telefono || null };
      modal.mode === "create" ? await clientesApi.create(token, payload) : await clientesApi.update(token, modal.item.id_cliente, payload);
      setModal(null); cargar();
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Clientes</h1>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "create" }); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Nuevo</button>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} onEdit={abrirEditar} onDelete={eliminar} />
      {modal && (
        <Modal title={modal.mode === "create" ? "Nuevo Cliente" : "Editar Cliente"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="RUT" value={form.rut} onChange={set("rut")} required />
            <Field label="Nombre / Razón social" value={form.nombre_o_razon_social} onChange={set("nombre_o_razon_social")} required />
            <SelectField label="Tipo" value={form.tipo_cliente} onChange={set("tipo_cliente")} options={[{ value: "persona", label: "Persona" }, { value: "empresa", label: "Empresa" }]} />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} />
            <PhoneInput label="Teléfono" value={form.telefono} onChange={set("telefono")} />
            <CheckField label="Activo" checked={form.cliente_activo} onChange={set("cliente_activo")} />
            <SubmitBtn loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
