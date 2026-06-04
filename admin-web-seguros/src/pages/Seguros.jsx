import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { segurosApi } from "../services/api";
import DataTable from "../components/DataTable";
import Modal, { Field, CheckField, SubmitBtn } from "../components/Modal";

const EMPTY = { nombre: "", descripcion: "", permite_digital: false, permite_tradicional: true, url_externa: "", seguro_activo: true, categoria: "Otros", orden_display: 0 };

const COLUMNS = [
  { key: "id_seguro", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "categoria", label: "Categoría" },
  { key: "permite_digital", label: "Digital", render: (v) => v ? "Sí" : "No" },
  { key: "permite_tradicional", label: "Tradicional", render: (v) => v ? "Sí" : "No" },
  { key: "seguro_activo", label: "Activo", render: (v) => v ? "✓" : "✗" },
  { key: "orden_display", label: "Orden" },
];

export default function Seguros() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { setData(await segurosApi.list(token)); } catch (e) { setError(e.message); }
  }

  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }

  function abrirEditar(item) { setForm({ ...item, url_externa: item.url_externa ?? "", descripcion: item.descripcion ?? "" }); setModal({ mode: "edit", item }); }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;
    try { await segurosApi.remove(token, item.id_seguro); cargar(); } catch (e) { alert(e.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, orden_display: Number(form.orden_display), url_externa: form.url_externa || null, descripcion: form.descripcion || null };
      modal.mode === "create" ? await segurosApi.create(token, payload) : await segurosApi.update(token, modal.item.id_seguro, payload);
      setModal(null); cargar();
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Seguros</h1>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "create" }); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Nuevo</button>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} onEdit={abrirEditar} onDelete={eliminar} />
      {modal && (
        <Modal title={modal.mode === "create" ? "Nuevo Seguro" : "Editar Seguro"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Nombre" value={form.nombre} onChange={set("nombre")} required />
            <Field label="Descripción" value={form.descripcion} onChange={set("descripcion")} />
            <Field label="Categoría" value={form.categoria} onChange={set("categoria")} required />
            <Field label="URL externa" value={form.url_externa} onChange={set("url_externa")} />
            <Field label="Orden display" type="number" value={form.orden_display} onChange={set("orden_display")} />
            <div className="flex gap-4 flex-wrap">
              <CheckField label="Permite digital" checked={form.permite_digital} onChange={set("permite_digital")} />
              <CheckField label="Permite tradicional" checked={form.permite_tradicional} onChange={set("permite_tradicional")} />
              <CheckField label="Activo" checked={form.seguro_activo} onChange={set("seguro_activo")} />
            </div>
            <SubmitBtn loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
