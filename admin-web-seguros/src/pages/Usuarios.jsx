import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usuariosApi } from "../services/api";
import DataTable from "../components/DataTable";
import Modal, { Field, SelectField, CheckField, SubmitBtn } from "../components/Modal";

const EMPTY = { nombre: "", email: "", username: "", password: "", rol: "agente", activo: true };

const COLUMNS = [
  { key: "id_usuario", label: "ID" },
  { key: "username", label: "Usuario" },
  { key: "nombre", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "rol", label: "Rol" },
  { key: "activo", label: "Activo", render: (v) => v ? "✓" : "✗" },
  { key: "ultimo_ingreso", label: "Último ingreso", render: (v) => v ? new Date(v).toLocaleDateString("es-CL") : "—" },
];

export default function Usuarios() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { setData(await usuariosApi.list(token)); } catch (e) { setError(e.message); }
  }

  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }

  function abrirEditar(item) { setForm({ ...item, password: "" }); setModal({ mode: "edit", item }); }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar usuario "${item.nombre}"?`)) return;
    try { await usuariosApi.remove(token, item.id_usuario); cargar(); } catch (e) { alert(e.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal.mode === "create") {
        await usuariosApi.create(token, form);
      } else {
        const payload = { nombre: form.nombre, email: form.email, rol: form.rol, activo: form.activo };
        if (form.password) payload.password = form.password;
        await usuariosApi.update(token, modal.item.id_usuario, payload);
      }
      setModal(null); cargar();
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Usuarios internos</h1>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "create" }); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Nuevo</button>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <DataTable columns={COLUMNS} data={data} onEdit={abrirEditar} onDelete={eliminar} />
      {modal && (
        <Modal title={modal.mode === "create" ? "Nuevo Usuario" : "Editar Usuario"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Nombre" value={form.nombre} onChange={set("nombre")} required />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
            <Field label={modal.mode === "create" ? "Usuario (dejar vacío para generar automáticamente)" : "Usuario"} value={form.username} onChange={set("username")} required={modal.mode === "edit"} />
            <Field label={modal.mode === "edit" ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"} type="password" value={form.password} onChange={set("password")} required={modal.mode === "create"} />
            <SelectField label="Rol" value={form.rol} onChange={set("rol")} options={[{ value: "agente", label: "Agente" }, { value: "admin", label: "Admin" }]} />
            <CheckField label="Activo" checked={form.activo} onChange={set("activo")} />
            <SubmitBtn loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
