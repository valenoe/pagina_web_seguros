import { useEffect, useRef, useState } from "react";

const PAISES = [
  { code: "+56", name: "Chile" },
  { code: "+54", name: "Argentina" },
  { code: "+51", name: "Perú" },
  { code: "+57", name: "Colombia" },
  { code: "+52", name: "México" },
  { code: "+55", name: "Brasil" },
  { code: "+591", name: "Bolivia" },
  { code: "+598", name: "Uruguay" },
  { code: "+595", name: "Paraguay" },
  { code: "+593", name: "Ecuador" },
  { code: "+1", name: "EEUU/Canadá" },
  { code: "+34", name: "España" },
];

function parsear(value) {
  if (!value) return { code: "+56", numero: "" };
  const sorted = [...PAISES].sort((a, b) => b.code.length - a.code.length);
  const pais = sorted.find((p) => value.startsWith(p.code));
  if (pais) {
    return { code: pais.code, numero: value.slice(pais.code.length).replace(/\D/g, "") };
  }
  // Sin código de país reconocido: asumir +56 y conservar solo dígitos
  return { code: "+56", numero: value.replace(/\D/g, "") };
}

export default function PhoneInput({ label, value, onChange, required = false }) {
  const { code: codeInit, numero: numInit } = parsear(value);
  const [code, setCode] = useState(codeInit);
  const [numero, setNumero] = useState(numInit);
  const emitido = useRef(false);

  useEffect(() => {
    const { code: c, numero: n } = parsear(value);
    setCode(c);
    setNumero(n);
    // Si el valor guardado no tiene formato válido (ej: "912345678" sin prefijo),
    // emitir inmediatamente el valor normalizado para que el form lo tome.
    const normalizado = n ? `${c}${n}` : "";
    if (!emitido.current && value && normalizado !== value) {
      emitido.current = true;
      onChange(normalizado);
    } else if (normalizado === value) {
      emitido.current = false;
    }
  }, [value]);

  function handleNumero(e) {
    const solo = e.target.value.replace(/\D/g, "");
    setNumero(solo);
    onChange(`${code}${solo}`);
  }

  function handleCode(e) {
    setCode(e.target.value);
    onChange(`${e.target.value}${numero}`);
  }

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div className="flex gap-1">
        <select
          value={code}
          onChange={handleCode}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 shrink-0"
        >
          {PAISES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={numero}
          onChange={handleNumero}
          required={required}
          placeholder="912345678"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
