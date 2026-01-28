import { useState } from "react";
import { colorFondoAusencia } from "./utils/ausenciasColor";
import { formatoFechaISO } from "./utils/fechas";

const HORA_INICIO = 6;
const HORA_FIN = 23; // exclusiva
const MINUTOS_TOTAL = (HORA_FIN - HORA_INICIO) * 60;

function horaToMinutos(h) {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
}
function formatoFechaHumana(d) {
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function duracionTurnoHoras(turno) {
  const [hIni, mIni] = turno.inicio.split(":").map(Number);
  const [hFin, mFin] = turno.fin.split(":").map(Number);
  const inicio = hIni + mIni / 60;
  const fin = hFin + mFin / 60;
  return Math.max(0, fin - inicio);
}

function horasDiaEmpleado(emp) {
  // por ejemplo: horas semanales / 5 días
  if (!emp.horasSemanales) return 0;
  return emp.horasSemanales / 5;
}

function getISOWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

function PlanningTab({ empleados, turnos, setTurnos, ausencias, notas, setNotas, notasDiaGlobal, setNotasDiaGlobal, festivos, setFestivos}) {
  const festivosLista = Array.isArray(festivos) ? festivos : [];
  
  const [planningFecha, setPlanningFecha] = useState(new Date());
  const [empleadoIdSel, setEmpleadoIdSel] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [notaTexto, setNotaTexto] = useState("");
  const [notaGlobalTexto, setNotaGlobalTexto] = useState("");
  const [verSemana, setVerSemana] = useState(false);
  
  
  const semanaISO = getISOWeekNumber(planningFecha);

 // 3) fechaActual, inicioSemana, finSemana (tal como ya tenías)
  const fechaISOActual = formatoFechaISO(planningFecha);

  const esFestivo = festivosLista.includes(fechaISOActual)

  const listaGlobalDelDia = Array.isArray(notasDiaGlobal) ? notasDiaGlobal : [];

  const notaGlobalDelDia = listaGlobalDelDia.find((n) => n.fecha === fechaISOActual) || null;

  const fechaActual = new Date(planningFecha);
  
  // inicio de semana (lunes)
  const diaSemana = fechaActual.getDay(); // 0=Dom, 1=Lun...
  const offsetLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicioSemana = new Date(fechaActual);
  inicioSemana.setDate(fechaActual.getDate() + offsetLunes);
  inicioSemana.setHours(0, 0, 0, 0);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);

  // dias visuales de la semana
  const diasSemana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicioSemana);
    d.setDate(inicioSemana.getDate() + i);
    diasSemana.push(d);
  }

  const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
  finMes.setHours(23, 59, 59, 999);


function handleAddNotaDia() {
  if (!empleadoIdSel || !notaTexto.trim()) return;

  const fechaISO = formatoFechaISO(planningFecha);
  setNotas((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      empleadoId: empleadoIdSel,
      fecha: fechaISO,
      texto: notaTexto.trim(),
    },
  ]);

  setNotaTexto("");
}

function handleAddNotaGlobalDia() {
  if (!notaGlobalTexto.trim()) return;

  const fechaISO = formatoFechaISO(planningFecha);
  setNotasDiaGlobal((prev) => {
    const sinEseDia = prev.filter((n) => n.fecha !== fechaISO);
    return [
      ...sinEseDia,
      {
        fecha: fechaISO,
        texto: notaGlobalTexto.trim(),
      },
    ];
  });
  setNotaGlobalTexto("");
}


  function cambiarDia(delta) {
    setPlanningFecha((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  }

  function handleAddTurno() {
    if (!empleadoIdSel || !inicio || !fin) return;
    if (horaToMinutos(fin) <= horaToMinutos(inicio)) {
      alert("La hora de fin debe ser posterior al inicio");
      return;
    }

    const fechaISO = formatoFechaISO(planningFecha);
    if (festivosLista.includes(fechaISO)) {
      alert("Este día es festivo. No se pueden añadir turnos.");
      return;
    }
    const ausenciasDiaSel = ausencias.filter(
      (a) => a.empleadoId === empleadoIdSel && a.fecha === fechaISO
    );
    if (ausenciasDiaSel.length > 0) {
      alert("Este empleado tiene vacaciones/permiso/baja este día. No se pueden añadir turnos.");
      return;
    }
    // 2) Comprobar si ya tiene turno ese día
  const turnosDiaSel = turnos.filter(
    (t) => t.empleadoId === empleadoIdSel && t.fecha === fechaISO
  );
  if (turnosDiaSel.length > 0) {
    const confirmar = window.confirm(
      "Este empleado ya tiene turno este día. ¿Quieres añadir otro de todas formas?"
    );
    if (!confirmar) return;
  }

    setTurnos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        empleadoId: empleadoIdSel,
        fecha: fechaISO,
        inicio,
        fin,
      },
    ]);

    setInicio("");
    setFin("");
  }

  function handleDeleteTurno(id) {
    if (!window.confirm("¿Borrar este turno?")) return;
    setTurnos((prev) => prev.filter((t) => t.id !== id));
  }

  
function exportarVistaSemanalACSV() {
  const filas = [];

  // Cabecera
  const cabecera = ["Empleado"];
  diasSemana.forEach((d, idx) => {
    const nombreDia = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][idx];
    const fecha = d.toLocaleDateString("es-ES");
    cabecera.push(`${nombreDia} ${fecha}`);
  });
  filas.push(cabecera);

  // Filas empleados
  empleados.forEach((emp) => {
    const fila = [emp.nombre];

    diasSemana.forEach((d) => {
      const fechaISO = formatoFechaISO(d);
      const turnosDia = turnos.filter(
        (t) => t.empleadoId === emp.id && t.fecha === fechaISO
      );
      const turnosTexto = turnosDia
        .map((t) => `${t.inicio} - ${t.fin}`)
        .join("; ");
      fila.push(turnosTexto || "");
    });

    filas.push(fila);
  });

  // Convertir a CSV
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
  link.download = `Planificacion_${formatoFechaISO(diasSemana[0])}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

  // ---------------- Resumen de horas ----------------

  const resumenHoras = empleados.map((emp) => {
  const turnosEmpleado = turnos.filter((t) => t.empleadoId === emp.id);
  const ausenciasEmpleado = ausencias.filter((a) => a.empleadoId === emp.id);

  const horasBaseDia = horasDiaEmpleado(emp);
  
  // Día
  const horasTurnoDia = turnosEmpleado
    .filter((t) => t.fecha === fechaISOActual)
    .reduce((total, t) => total + duracionTurnoHoras(t), 0);

  const tieneVacacionesDia = ausenciasEmpleado.some(
    (a) => a.fecha === fechaISOActual && a.tipo === "VACACIONES"
  );

  const horasVacacionesDia = tieneVacacionesDia ? horasBaseDia : 0;
  const horasDia = horasTurnoDia + horasVacacionesDia;

  // Semana
  const horasSemana = turnosEmpleado
    .filter((t) => {
      const f = new Date(t.fecha);
      return f >= inicioSemana && f <= finSemana;
    })
    .reduce((total, t) => total + duracionTurnoHoras(t), 0)
    +
    ausenciasEmpleado
      .filter((a) => {
        const f = new Date(a.fecha);
        return (
          f >= inicioSemana &&
          f <= finSemana &&
          a.tipo === "VACACIONES"
        );
      })
      .reduce((total) => total + horasBaseDia, 0);

    // Mes
  const horasMes = turnosEmpleado
    .filter((t) => {
      const f = new Date(t.fecha);
      return f >= inicioMes && f <= finMes;
    })
    .reduce((total, t) => total + duracionTurnoHoras(t), 0)
    +
    ausenciasEmpleado
      .filter((a) => {
        const f = new Date(a.fecha);
        return (
          f >= inicioMes &&
          f <= finMes &&
          a.tipo === "VACACIONES"
        );
      })
      .reduce((total) => total + horasBaseDia, 0);
  
  const baseSemanal = emp.baseHoraria || 0;
  const diferencia = horasSemana - baseSemanal;
  const horasExtra = diferencia > 0 ? diferencia : 0;
  
  const notaGlobalDelDia =
  notasDiaGlobal.find((n) => n.fecha === fechaISOActual) || null;

  

  return {
    empleadoNombre: emp.nombre,
    horasDia,
    horasSemana,
    horasMes,
    baseSemanal,
    horasExtra,
    diferencia
  };
});  
  
 return (
    <section className="app-tab">

      <h2>Planning diario</h2>




      {/* Cabecera fecha */}
  <div 
  style={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: 40, 
    fontWeight: 500,
    cursor: "pointer",
    }}>

      Semana {semanaISO}
  </div>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 15,
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <button
      onClick={() => cambiarDia(-1)}
      style={{
        padding: "8px 12px",
        background: "#1976d2",
        color: "#fff",
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
      }}
    >
      &lt;
    </button>

    <input
      type="date"
      value={formatoFechaISO(planningFecha)}  // "YYYY-MM-DD"
      onChange={(e) => {
        const [year, month, day] = e.target.value.split("-").map(Number);
        setPlanningFecha(new Date(year, month - 1, day));
      }}
      style={{
        padding: "6px 8px",
        fontSize: 14,
        borderRadius: 4,
        border: "1px solid #ccc",
        cursor: "pointer",
      }}
    />

    <button
      onClick={() => cambiarDia(1)}
      style={{
        padding: "8px 12px",
        background: "#1976d2",
        color: "#fff",
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
      }}
    >
      &gt;
    </button>

    <button
      onClick={() => setVerSemana(!verSemana)}
      style={{
        padding: "8px 12px",
        background: verSemana ? "#388e3c" : "#1976d2",
        color: "#fff",
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
      }}
    >
      {verSemana ? "Vista día" : "Vista semana"}
    </button>
    
  </div>
</div>
<div
  style={{
    marginTop: 10,
    padding: 8,
    border: "1px solid #ddd",
    borderRadius: 4,
    background: "#fafafa",
    fontSize: 12,
  }}
>
  <div style={{ marginBottom: 6, fontWeight: "bold" }}>
    Festivos Tienda
  </div>

  {/* Botón para marcar/desmarcar el día actual como festivo */}
  <button
    onClick={() => {
      const hoyISO = formatoFechaISO(planningFecha);
      if (festivos.includes(hoyISO)) {
        // quitar
        setFestivos((prev) => prev.filter((f) => f !== hoyISO));
      } else {
        // añadir
        setFestivos((prev) => [...prev, hoyISO]);
      }
    }}
    style={{
      padding: "4px 8px",
      marginRight: 8,
    }}
  >
    {esFestivo ? "Quitar festivo en este día" : "Marcar este día como festivo"}
  </button>

  {/* Lista rápida de festivos */}
  {festivosLista.length > 0 ? (
  <div style={{ marginTop: 6 }}>
    {festivosLista
      .slice()
      .sort()
      .map((f) => (
        <span key={f} /* ... */>
          {f}
          <button
            onClick={() =>
              setFestivos((prev) => prev.filter((x) => x !== f))
            }
          >
            ×
          </button>
        </span>
      ))}
  </div>
) : (
  <div style={{ marginTop: 4, fontStyle: "italic" }}>
    No hay festivos configurados.
  </div>
)}

</div>


{notaGlobalDelDia && (
  <div className="nota-global-del-dia"
    style={{
      marginBottom: 8,
      padding: "4px 6px",
      borderRadius: 3,
      background: "#ff0055",
      border: "1px solid #000000",
      fontSize: 13,
    }}
  >
    Nota del día: {notaGlobalDelDia.texto}
  </div>
)}

{verSemana && (
   <div
    style={{
      marginBottom: 15,
      padding: 10,
      background: "#fafafa",
      borderRadius: 4,
      border: "1px solid #ddd",
      overflowX: "auto",
    }}
  >
     <button
      onClick={exportarVistaSemanalACSV}
      style={{
        marginBottom: 10,
        padding: "8px 16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      Exportar semana (CSV)
    </button>
    
    <table
      className="table-basic"
      style={{ width: "100%", borderCollapse: "collapse", fontSize: 12,textAlign: "center" }}
    >
      <thead>
        <tr>
          <th>Empleado</th>
{diasSemana.map((d, idx) => {
  const fechaISO = formatoFechaISO(d);
  const esFestivoSemana = festivosLista.includes(fechaISO);

  return (
    <th
      key={idx}
      style={{
        backgroundColor: esFestivoSemana ? "#ffe5e5" : undefined,
      }}
    >
      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][idx]}
      <br />
      {d.toLocaleDateString("es-ES")}
    </th>
  );
})}

        </tr>
      </thead>
      <tbody>
  {empleados.map((emp) => (
    <tr key={emp.id}>
      <td>{emp.nombre}</td>
      {diasSemana.map((d, idx) => {
        const fechaISO = formatoFechaISO(d);
        const esFestivoSemana = festivosLista.includes(fechaISO);

        const turnosDia = turnos.filter(
          (t) => t.empleadoId === emp.id && t.fecha === fechaISO
        );
        const ausenciasDia = ausencias.filter(
          (a) => a.empleadoId === emp.id && a.fecha === fechaISO
        );

        const etiquetaAus = ausenciasDia
          .map((a) =>
            a.tipo === "VACACIONES"
              ? "V"
              : a.tipo === "PERMISO"
              ? "P"
              : a.tipo === "BAJA_MEDICA"
              ? "B"
              : a.tipo === "AUSENCIA_INJUSTIFICADA"
              ? "A"
              : ""
          )
          .join(" ");

        return (
          <td
            key={idx}
            style={{
              backgroundColor: esFestivoSemana ? "#ffe5e5" : undefined,
            }}
          >
            {turnosDia.length > 0 &&
              turnosDia.map((t) => (
                <div key={t.id}>
                  {t.inicio} - {t.fin}
                </div>
              ))}

            {etiquetaAus && (
              <div style={{ marginTop: 2, fontSize: 10 }}>{etiquetaAus}</div>
            )}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>

    </table>
  </div>
 
)}


  <div style={{ marginBottom: 10 }}>
  <input
    type="text"
    placeholder="Nota global del día (p.ej. Visita del área manager)"
    value={notaGlobalTexto}
    onChange={(e) => setNotaGlobalTexto(e.target.value)}
    style={{ width: "70%", padding: 6, marginRight: 8 }}
  />
  <button
    type="button"
    onClick={handleAddNotaGlobalDia}
    style={{
      padding: "6px 10px",
      background: "#455a64",
      color: "#fff",
      border: "none",
      borderRadius: 3,
      cursor: "pointer",
    }}
  >
    Guardar nota día
  </button>
</div>
 
      {/* Formulario turno */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 15,
          alignItems: "flex-end",
          background: "#fafafa",
          padding: 10,
          borderRadius: 4,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column" }}>
          Empleado
          <select
            value={empleadoIdSel}
            onChange={(e) => setEmpleadoIdSel(e.target.value)}
            style={{ marginTop: 4, padding: 6 }}
          >
            <option value="">Selecciona...</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Inicio
          <input
            type="time"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            style={{ marginTop: 4, padding: 6 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Fin
          <input
            type="time"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            style={{ marginTop: 4, padding: 6 }}
          />
        </label>

        <button
          onClick={handleAddTurno}
          disabled={esFestivo}
          style={{
            padding: "8px 15px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          Añadir turno
        </button>
        
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
  <input
    type="text"
    placeholder="Anotación para este día"
    value={notaTexto}
    onChange={(e) => setNotaTexto(e.target.value)}
    style={{ flex: 1, padding: 6 }}
  />
  <button
    type="button"
    onClick={handleAddNotaDia}
    style={{
      padding: "6px 10px",
      background: "#607d8b",
      color: "#fff",
      border: "none",
      borderRadius: 3,
      cursor: "pointer",
    }}
  >
    Guardar nota
  </button>
</div>
      </div>

      {esFestivo && (
          <div style={{ fontSize: 24, color: "#d32f2f", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            DÍA FESTIVO
          </div>
        )}

      {/* Cabecera de horas */}
      <div
        style={{
          marginLeft: 150,
          borderLeft: "1px solid #ddd",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex" }}>
          {Array.from({ length: HORA_FIN - HORA_INICIO }).map((_, i) => {
            const h = HORA_INICIO + i;
            return (
              <div
                key={h}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  borderRight: "1px solid #eee",
                  padding: "4px 0",
                  fontWeight: "bold",
                }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid por empleado */}
      <div style={{ borderTop: "1px solid #ddd" }}>
        {empleados.map((emp) => {
            const turnosDia = turnos.filter(
                (t) => t.empleadoId === emp.id && t.fecha === fechaISOActual
            );

           const ausenciasDia = ausencias.filter(
            (a) => a.empleadoId === emp.id && a.fecha === fechaISOActual
                );
            const tieneAusencia = ausenciasDia.length > 0;
            const tipoAusencia = tieneAusencia ? ausenciasDia[0].tipo : null;
            const notasDia = notas.filter(
              (n) => n.empleadoId === emp.id && n.fecha === fechaISOActual
            );

            return (
                <div
                    key={emp.id}
                    style={{
                        borderBottom: "1px solid #eee",
                        padding: "4px 0",
                        minHeight: 40,                        
                    }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                    style={{
                        width: 150,
                        paddingRight: 10,
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    {emp.nombre}
                </div>

                <div
                    style={{
                    position: "relative",
                    flex: 1,
                    height: 32,
                    backgroundColor: tieneAusencia
                        ? colorFondoAusencia(tipoAusencia)   // mismo helper que en Ausencias
                        : "#fff",
                    backgroundImage: tieneAusencia
                        ? "none"
                        : "linear-gradient(to right, #fafafa 1px, transparent 1px)",
                    backgroundSize: "calc(100% / 14) 100%",
                    borderLeft: "1px solid #ddd",
}}
>
                    {turnosDia.map((t) => {
                            const inicioMin = horaToMinutos(t.inicio);
                            const finMin = horaToMinutos(t.fin);
                            const base = HORA_INICIO * 60;

                            const startOffset = Math.max(0, inicioMin - base);
                            const endOffset = Math.min(
                                MINUTOS_TOTAL,
                                finMin - base
                            );
                            const widthMin = Math.max(0, endOffset - startOffset);

                            const leftPercent =
                                (startOffset / MINUTOS_TOTAL) * 100;
                            const widthPercent =
                                (widthMin / MINUTOS_TOTAL) * 100;

                            return (
                                <div
                                key={t.id}
                                style={{
                                    position: "absolute",
                                    top: 4,
                                    height: 24,
                                    background: "#4caf50",
                                    color: "#fff",
                                    fontSize: 11,
                                    padding: "2px 4px",
                                    borderRadius: 3,
                                    boxSizing: "border-box",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                }}
                                >
                                <span>
                                    {t.inicio}–{t.fin}
                                </span>
                                <button
                                    onClick={() => handleDeleteTurno(t.id)}
                                    style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#fff",
                                    cursor: "pointer",
                                    marginLeft: 4,
                                    fontSize: 12,
                                    }}
                                >
                                    ✕
                                </button>
                                </div>
                            );
                            })}{/* Leyenda del tipo de ausencia, como en Resumen */}
  {tieneAusencia && (
    <div
      style={{
        position: "absolute",
        right: 4,
        bottom: 4,
        fontSize: 11,
        padding: "2px 4px",
        borderRadius: 2,
        color: "#fff",
        background:
          tipoAusencia === "VACACIONES"
            ? "#3f51b5"
            : tipoAusencia === "PERMISO"
            ? "#ff9800"
            : tipoAusencia === "BAJA_MEDICA"
            ? "#e91e63"
            : tipoAusencia === "AUSENCIA_INJUSTIFICADA"
            ? "#9c27b0"
            : "#9e9e9e",
      }}
    >
      {tipoAusencia === "VACACIONES"
        ? "Vacaciones"
        : tipoAusencia === "PERMISO"
        ? "Permiso"
        : tipoAusencia === "BAJA_MEDICA"
        ? "Baja médica"
        : tipoAusencia === "AUSENCIA_INJUSTIFICADA"
        ? "Ausencia injustificada"
        : tipoAusencia}
    </div>
  )}
    </div>
        </div>
        {/* NOTAS DEL DÍA, debajo de la barra */}
        {notasDia.map((n) => (
          <div
            key={n.id}
            style={{
              marginTop: 2,
              marginLeft: 150,            // alineado con la barra (mismo ancho que nombre)
              fontSize: 11,
              padding: "2px 4px",
              borderRadius: 2,
              background: "#fff8e1",
              border: "1px solid #ffecb3",
              color: "#795548",
            }}
          >
            Nota: {n.texto}
          </div>
  ))}
</div>


    );
})}
      </div>
      {/* Resumen de horas */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            width: "100%",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            border: "1px solid #1976d2",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1e88e5, #42a5f5)",
              color: "#fff",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
              }}
            >
              Resumen de horas
            </h3>
            <span
              style={{
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              Día: {formatoFechaHumana(planningFecha)}
            </span>
          </div>

          <div style={{ padding: 16 }}>
            <div className="table-wrapper">
              <table className="table-basic">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>
                      Empleado</th>
                    <th style={{ width: "20%", textAlign: "right" }}>
                      Horas día
                    </th>
                    <th style={{ width: "20%", textAlign: "right" }}>
                      Horas semana
                    </th>
                    <th style={{ width: "20%", textAlign: "right" }}>
                      Horas mes
                    </th>
                    <th style={{ width: "20%", textAlign: "right" }}>
                      Base semanal
                    </th>
                    <th style={{ width: "20%", textAlign: "right" }}>
                      Horas extra
                    </th>
                  </tr>
                </thead>
                <tbody>
  {resumenHoras.map((row) => {
    const diferencia = row.horasSemana - row.baseSemanal;

    let colorSemana = "inherit";
    if (diferencia === 0) {
      colorSemana = "green";   // justo base horaria
    } else if (diferencia < 0) {
      colorSemana = "red";     // por debajo de base
    }

    return (
      <tr key={row.empleadoNombre}>
        <td>{row.empleadoNombre}</td>

        <td style={{ textAlign: "right" }}>
          {row.horasDia.toFixed(2)}
        </td>

        <td style={{ textAlign: "right", color: colorSemana }}>
          {row.horasSemana.toFixed(2)}
        </td>

        <td style={{ textAlign: "right" }}>
          {row.horasMes.toFixed(2)}
        </td>

        <td style={{ textAlign: "right" }}>
          {row.baseSemanal.toFixed(2)}
        </td>

        <td
          style={{
            textAlign: "right",
            color: row.horasExtra > 0 ? "red" : "inherit",
          }}
        >
          {row.horasExtra.toFixed(2)}
        </td>
      </tr>
    );
  })}
</tbody>

              </table>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

export default PlanningTab;
