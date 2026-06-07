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
  // Sin código de país: asumir +56 y tomar solo dígitos
  return { code: "+56", numero: value.replace(/\D/g, "") };
}

export default function PhoneInput({ placeholder, value, onChange, name, required = false }) {
  const { code: codeInit, numero: numInit } = parsear(value);
  const [code, setCode] = useState(codeInit);
  const [numero, setNumero] = useState(numInit);
  const emitido = useRef(false);

  useEffect(() => {
    const { code: c, numero: n } = parsear(value);
    setCode(c);
    setNumero(n);
    // Emitir valor normalizado si difiere del valor original (ej: teléfono sin código de país)
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
    onChange(solo ? `${code}${solo}` : "");
  }

  function handleCode(e) {
    setCode(e.target.value);
    onChange(numero ? `${e.target.value}${numero}` : "");
  }

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      <select
        value={code}
        onChange={handleCode}
        style={{ flexShrink: 0, width: "8rem" }}
      >
        {PAISES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name} ({p.code})
          </option>
        ))}
      </select>
      <input
        name={name}
        type="tel"
        value={numero}
        onChange={handleNumero}
        placeholder={placeholder || "912345678"}
        required={required}
        autoComplete="off"
        style={{ flex: 1 }}
      />
    </div>
  );
}
