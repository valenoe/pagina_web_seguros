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

const OTRO = "otro";

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
  // "Otro": el usuario escribe a mano un código que no está en la lista
  const [personalizado, setPersonalizado] = useState(false);
  const emitido = useRef(false);

  useEffect(() => {
    // No re-derivar desde value mientras el usuario escribe un código personalizado
    // (parsear no reconocería ese código y lo metería dentro del número).
    if (personalizado) return;
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
  }, [value, personalizado]);

  function emitir(nextCode, nextNumero) {
    onChange(nextNumero ? `${nextCode}${nextNumero}` : "");
  }

  function handleNumero(e) {
    const solo = e.target.value.replace(/\D/g, "");
    setNumero(solo);
    emitir(code, solo);
  }

  function handleSelect(e) {
    if (e.target.value === OTRO) {
      setPersonalizado(true);
      setCode("+");
      emitir("+", numero);
    } else {
      setPersonalizado(false);
      setCode(e.target.value);
      emitir(e.target.value, numero);
    }
  }

  function handleCodePersonalizado(e) {
    // Forzar un solo "+" al inicio y solo dígitos después
    const limpio = e.target.value.replace(/[^\d]/g, "");
    const nuevoCode = "+" + limpio;
    setCode(nuevoCode);
    emitir(nuevoCode, numero);
  }

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      <select
        value={personalizado ? OTRO : code}
        onChange={handleSelect}
        /* width:auto → la caja se adapta al largo del texto de cada país */
        style={{ flexShrink: 0, width: "auto" }}
      >
        {PAISES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name} ({p.code})
          </option>
        ))}
        <option value={OTRO}>Otro…</option>
      </select>

      {personalizado && (
        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={handleCodePersonalizado}
          placeholder="+00"
          aria-label="Código de país"
          style={{ flexShrink: 0, width: "4.5rem" }}
        />
      )}

      <input
        name={name}
        type="tel"
        value={numero}
        onChange={handleNumero}
        placeholder={placeholder || "912345678"}
        required={required}
        autoComplete="off"
        style={{ flex: 1, minWidth: 0 }}
      />
    </div>
  );
}
