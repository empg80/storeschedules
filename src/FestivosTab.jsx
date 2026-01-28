import { useState } from "react";
import { formatoFechaISO } from "./utils/fechas";

function FestivosTab({ festivos, setFestivos, planningFecha, setPlanningFecha }) {
  const festivosLista = Array.isArray(festivos) ? festivos : [];

  const fechaISOActual = formatoFechaISO(planningFecha);
  const esFestivoActual = festivosLista.includes(fechaISOActual);

  function toggleFestivoFecha(fechaISO) {
    setFestivos((prev) =>
      prev.includes(fechaISO)
        ? prev.filter((f) => f !== fechaISO)
        : [...prev, fechaISO]
    );
  }

  // EXPORTAR A CSV
  function exportarFestivosCSV() {
    if (festivosLista.length === 0) {
      alert("No hay festivos para exportar.");
      return;
    }

    const filas = [["fecha"], ...festivosLista.map((f) => [f])];

    const csv = filas
      .map((fila) =>
        fila
          .map((campo) => {
            const value = String(campo ?? "");
            return /[",;\n]/.test(value)
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(";")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "festivos_empresa.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // IMPORTAR DESDE CSV
  function handleImportFestivosCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;

      const lineas = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lineas.length === 0) return;

      const sinCabecera =
        lineas[0].toLowerCase().includes("fecha") ? lineas.slice(1) : lineas;

      const nuevas = sinCabecera
        .map((linea) => linea.split(/[;,]/)[0].trim())
        .filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v));

      if (nuevas.length === 0) {
        alert("No se encontraron fechas válidas en el CSV.");
        return;
      }

      setFestivos((prev) => {
        const set = new Set(prev);
        nuevas.forEach((f) => set.add(f));
        return Array.from(set).sort();
      });

      alert(`Importados ${nuevas.length} festivos.`);
      e.target.value = "";
    };

    reader.readAsText(file, "utf-8");
  }

  // ...resto de FestivosTab (JSX)

  return (
    <div
    style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",   // centrado horizontal
        alignItems: "flex-start",    // pegado arriba
        paddingTop: 40,              // separacion desde arriba
        background: "#f0f0f0",
    }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 900,
          background: "white",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Gestión de festivos</h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
  <button
    onClick={exportarFestivosCSV}
    style={{
      padding: "6px 12px",
      background: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
    }}
  >
    Exportar festivos (CSV)
  </button>

  <label
    style={{
      padding: "6px 12px",
      background: "#2196F3",
      color: "white",
      borderRadius: 4,
      cursor: "pointer",
    }}
  >
    Importar festivos (CSV)
    <input
      type="file"
      accept=".csv,text/csv"
      onChange={handleImportFestivosCSV}
      style={{ display: "none" }}
    />
  </label>
</div>


        {/* Selector de día rápido (reutilizamos planningFecha) */}
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => {
            const d = new Date(planningFecha);
            d.setDate(d.getDate() - 1);
            setPlanningFecha(d);
          }}>
            ◀ Día anterior
          </button>

          <span style={{ margin: "0 10px" }}>
            {planningFecha.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>

          <button onClick={() => {
            const d = new Date(planningFecha);
            d.setDate(d.getDate() + 1);
            setPlanningFecha(d);
          }}>
            Día siguiente ▶
          </button>
        </div>

        <button
          onClick={() => toggleFestivoFecha(fechaISOActual)}
          style={{
            marginBottom: 10,
            padding: "6px 12px",
            background: esFestivoActual ? "#f44336" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {esFestivoActual
            ? "Quitar festivo en este día"
            : "Marcar este día como festivo"}
        </button>

        {esFestivoActual && (
          <div style={{ fontSize: 12, color: "red", marginBottom: 10 }}>
            Este día está marcado como festivo.
          </div>
        )}

        {/* Lista editable de todos los festivos */}
        <div
          style={{
            marginTop: 16,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 4,
            background: "#fafafa",
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            Festivos configurados
          </div>

          {festivosLista.length > 0 ? (
            festivosLista
              .slice()
              .sort()
              .map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span>{f}</span>
                  <button
                    onClick={() =>
                      setFestivos((prev) => prev.filter((x) => x !== f))
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#f44336",
                      cursor: "pointer",
                    }}
                  >
                    Quitar
                  </button>
                </div>
              ))
          ) : (
            <div style={{ fontStyle: "italic", fontSize: 12 }}>
              No hay festivos configurados.
            </div>
          )}
        </div>

        {/* Entrada manual de fecha (por si quieres añadir rápido) */}
        <FestivoManualForm onAdd={toggleFestivoFecha} />
      </div>
    </div>
  );
}

function FestivoManualForm({ onAdd }) {
  const [valor, setValor] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!valor) return;
    onAdd(valor);   // valor ya viene como "YYYY-MM-DD" del input type="date"
    setValor("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}
    >
      <label style={{ fontSize: 12 }}>Añadir festivo:</label>
      <input
        type="date"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <button type="submit">Añadir</button>
    </form>
  );
}

export default FestivosTab;