import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { imagenesApi } from "../services/api";
import DataTable from "../components/DataTable";
import Modal, { Field, CheckField, SubmitBtn } from "../components/Modal";

const EMPTY = { nombre: "", url: "", descripcion: "", seccion: "", activo: true };

const COLUMNS = [
  { key: "id_imagen", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "url", label: "URL", render: (v) => <a href={v} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">{v}</a> },
  { key: "seccion", label: "Sección" },
  { key: "activo", label: "Activo", render: (v) => v ? "✓" : "✗" },
];

export default function Imagenes() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { setData(await imagenesApi.list(token)); } catch (e) { setError(e.message); }
  }

  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }

  function abrirEditar(item) { setForm({ ...item, descripcion: item.descripcion ?? "", seccion: item.seccion ?? "" }); setModal({ mode: "edit", item }); }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar imagen "${item.nombre}"?`)) return;
    try { await imagenesApi.remove(token, item.id_imagen); cargar(); } catch (e) { alert(e.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, descripcion: form.descripcion || null, seccion: form.seccion || null };
      modal.mode === "create" ? await imagenesApi.create(token, payload) : await imagenesApi.update(token, modal.item.id_imagen, payload);
      setModal(null); cargar();
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Imágenes</h1>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "create" }); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Nueva</button>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} onEdit={abrirEditar} onDelete={eliminar} />
      {modal && (
        <Modal title={modal.mode === "create" ? "Nueva Imagen" : "Editar Imagen"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Nombre" value={form.nombre} onChange={set("nombre")} required />
            <Field label="URL" value={form.url} onChange={set("url")} required />
            <Field label="Descripción" value={form.descripcion} onChange={set("descripcion")} />
            <Field label="Sección" value={form.seccion} onChange={set("seccion")} />
            <CheckField label="Activo" checked={form.activo} onChange={set("activo")} />
            <SubmitBtn loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
