import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/leads", label: "Leads" },
  { path: "/cotizaciones", label: "Cotizaciones" },
  { path: "/seguros", label: "Seguros" },
  { path: "/clientes", label: "Clientes" },
  { path: "/polizas", label: "Pólizas" },
  { path: "/imagenes", label: "Imágenes" },
  { path: "/usuarios", label: "Usuarios", soloAdmin: true },
];

export default function Layout() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-52 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <p className="font-bold text-sm">Panel Admin</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded mt-1 inline-block">{user?.rol}</span>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems
            .filter((item) => !item.soloAdmin || user?.rol === "admin")
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${isActive ? "bg-gray-700 font-semibold" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <button
          onClick={handleLogout}
          className="p-4 text-sm text-gray-400 hover:text-white border-t border-gray-700 text-left"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
