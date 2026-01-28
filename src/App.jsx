import { useEffect, useState } from "react";
import "./App.css";
import EquipoTab from "./EquipoTab";
import PlanningTab from "./PlanningTab";
import FestivosTab from "./FestivosTab";
import AusenciasTab from "./AusenciasTab";
import ResumenTab from "./ResumenTab";

const TABS = ["equipo", "planning", "festivos", "ausencias", "resumen"];

const TAB_LABELS = {
  equipo: "Equipo",
  planning: "Planning",
  festivos: "Festivos",
  ausencias: "Vacaciones/Ausencias",
  resumen: "Resumen",
};

function App() {
  const [tabActiva, setTabActiva] = useState("equipo");
  const [empleados, setEmpleados] = useState(() => {
    const saved = localStorage.getItem("empleados");
    return saved ? JSON.parse(saved) : [];
  });

  const [turnos, setTurnos] = useState(() => {
    const saved = localStorage.getItem("turnos");
    return saved ? JSON.parse(saved) : [];
  });

  const [ausencias, setAusencias] = useState(() => {
    const saved = localStorage.getItem("ausencias");
    return saved ? JSON.parse(saved) : [];
  });

  const [notas, setNotas] = useState(() => {
    const saved = localStorage.getItem("notas");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [notasDiaGlobal, setNotasDiaGlobal] = useState(() => {
    const saved = localStorage.getItem("notasDiaGlobal");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

const [festivos, setFestivos] = useState(() => {
  const saved = localStorage.getItem("festivosEmpresa");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
});

const exportarFestivosCSV = (festivosLista) => {
  festivosLista = Array.isArray(festivosLista) ? festivosLista : [];
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
};

const [planningFecha, setPlanningFecha] = useState(new Date());

  useEffect(() => {
    localStorage.setItem("empleados", JSON.stringify(empleados));
  }, [empleados]);

  useEffect(() => {
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }, [turnos]);

  useEffect(() => {
    localStorage.setItem("ausencias", JSON.stringify(ausencias));
  }, [ausencias]);
  
  useEffect(() => {
    localStorage.setItem("notas", JSON.stringify(notas));
  }, [notas]);

  useEffect(() => {
    localStorage.setItem("notasDiaGlobal", JSON.stringify(notasDiaGlobal));
  }, [notasDiaGlobal]);

useEffect(() => {
  localStorage.setItem("festivosEmpresa", JSON.stringify(festivos));
}, [festivos]);

function exportarDatosJSON() {
  const payload = {
    empleados,
    turnos,
    ausencias,
    notas,
    notasDiaGlobal,
    festivos,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gestor_horarios_backup.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importarDatosJSON(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result;
    if (typeof text !== "string") return;

    try {
      const data = JSON.parse(text);

      if (Array.isArray(data.empleados)) setEmpleados(data.empleados);
      if (Array.isArray(data.turnos)) setTurnos(data.turnos);
      if (Array.isArray(data.ausencias)) setAusencias(data.ausencias);
      if (Array.isArray(data.notas)) setNotas(data.notas);
      if (Array.isArray(data.notasDiaGlobal)) setNotasDiaGlobal(data.notasDiaGlobal);
      if (Array.isArray(data.festivos)) setFestivos(data.festivos);

      alert("Datos importados correctamente.");
    } catch (err) {
      console.error(err);
      alert("El fichero no tiene el formato esperado.");
    }

    e.target.value = "";
  };

  reader.readAsText(file, "utf-8");
}

return (
    <div>
      <header className="app-header">
        <h1 className="app-header-title">Gestión de Horarios</h1>

        <nav className="app-nav">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={
                "app-nav-button" +
                (tabActiva === tab ? " app-nav-button--active" : "")
              }
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>
      </header>

          <div style={{ marginBottom: 10, marginTop: 5, marginRight: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={exportarDatosJSON}>
              Exportar todos los datos (JSON)
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
              Importar datos (JSON)
              <input
                type="file"
                accept="application/json"
                onChange={importarDatosJSON}
                style={{ display: "none" }}
              />
            </label>
          </div>


      <main className="app-main">
      {tabActiva === "equipo" && (
        <EquipoTab empleados={empleados} setEmpleados={setEmpleados} />
      )}

      {tabActiva === "planning" && (
        <PlanningTab
          empleados={empleados}
          turnos={turnos}
          setTurnos={setTurnos}
          ausencias={ausencias}
          notas={notas}
          setNotas={setNotas}
          notasDiaGlobal={notasDiaGlobal}
          setNotasDiaGlobal={setNotasDiaGlobal}
          festivos={festivos}
          setFestivos={setFestivos}
          planningFecha={planningFecha}
          setPlanningFecha={setPlanningFecha}
        />
      )}

      {tabActiva === "festivos" && (
        <FestivosTab
          festivos={festivos}
          setFestivos={setFestivos}
          planningFecha={planningFecha}
          setPlanningFecha={setPlanningFecha}
          exportarFestivosCSV={exportarFestivosCSV}
        />
      )}

      {tabActiva === "ausencias" && (
        <AusenciasTab
          empleados={empleados}
          ausencias={ausencias}
          setAusencias={setAusencias}
        />
      )}

      {tabActiva === "resumen" && (
        <ResumenTab
          empleados={empleados}
          turnos={turnos}
          ausencias={ausencias}
        />
      )}
    </main>
    </div>
  );
}

export default App;
