export default function DataTable({ columns, data, onEdit, onDelete, readOnly = false }) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 border-b border-gray-200 font-semibold whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {!readOnly && <th className="px-3 py-2 border-b border-gray-200 font-semibold">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (readOnly ? 0 : 1)} className="px-3 py-6 text-center text-gray-400">
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 border-b border-gray-100 max-w-xs truncate">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">
                    <button onClick={() => onEdit(row)} className="text-blue-600 hover:underline mr-3 text-xs">Editar</button>
                    <button onClick={() => onDelete(row)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
