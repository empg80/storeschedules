import { useState } from "react";

function formatoFechaISO(anio, mes0, dia) {
  const y = anio;
  const m = String(mes0 + 1).padStart(2, "0");
  const d = String(dia).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function ResumenTab({ empleados, turnos, ausencias }) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [mes, setMes] = useState(new Date().getMonth()); // 0-11
  const [anio, setAnio] = useState(new Date().getFullYear());

  const empleadoSeleccionado = empleados.find((e) => (e.id) === (empleadoId));

  function construirDiasMes() {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const numDias = ultimoDia.getDate();

    let offset = primerDia.getDay() - 1; // 0=Dom,1=Lun...
    if (offset < 0) offset = 6;

    const semanas = [];
    let diaActual = 1;
    for (let fila = 0; fila < 6; fila++) {
      const filaDias = [];
      for (let col = 0; col < 7; col++) {
        if ((fila === 0 && col < offset) || diaActual > numDias) {
          filaDias.push(null);
        } else {
          filaDias.push(diaActual);
          diaActual++;
        }
      }
      semanas.push(filaDias);
      if (diaActual > numDias) break;
    }
    return semanas;
  }

const semanas = construirDiasMes();
  const hoyISO = formatoFechaISO(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  return (
    <section className="app-tab">

      <h2>Resumen mensual</h2>

      {/* Controles */}
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
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
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
          Mes
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            style={{ marginTop: 4, padding: 6 }}
          >
            {[
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ].map((nombre, index) => (
              <option key={index} value={index}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Año
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            style={{ marginTop: 4, padding: 6, width: 100 }}
          />
        </label>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: "8px 15px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 3,
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          Imprimir / PDF
        </button>
      </div>

      {/* Calendario */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <th
                key={d}
                style={{
                  border: "1px solid #ddd",
                  padding: 6,
                  fontSize: 12,
                  background: "#f0f0f0",
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((fila, i) => (
            <tr key={i}>
              {fila.map((dia, j) => {
                if (!dia) {
                  return (
                    <td
                      key={j}
                      style={{
                        border: "1px solid #ddd",
                        padding: 6,
                        height: 80,
                        background: "#fff",
                      }}
                    ></td>
                  );
                }

                const fechaISO = formatoFechaISO(anio, mes, dia);

                const turnosDia =
                  empleadoSeleccionado && empleadoId
                    ? turnos.filter(
                        (t) =>
                          t.empleadoId === empleadoId &&
                          t.fecha === fechaISO
                      )
                    : [];

                const ausenciasDia =
                  empleadoSeleccionado && empleadoId
                    ? ausencias.filter(
                        (a) =>
                          a.empleadoId === empleadoId &&
                          a.fecha === fechaISO
                      )
                    : [];

                const esHoy = fechaISO === hoyISO;

                return (
                  <td
                    key={j}
                    style={{
                      border: "1px solid #ddd",
                      padding: 6,
                      height: 80,
                      fontSize: 12,
                      background: esHoy ? "#e3f2fd" : "#fff",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{dia}</span>

                    {/* Turnos */}
                    {turnosDia.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          marginTop: 2,
                          fontSize: 11,
                          background: "#4caf50",
                          color: "#fff",
                          padding: "2px 4px",
                          borderRadius: 2,
                        }}
                      >
                        {t.inicio}–{t.fin}
                      </div>
                    ))}

                 {/* Ausencias */}
{ausenciasDia.map((a) => (
  <div
    key={a.id}
    style={{
      marginTop: 2,
      fontSize: 11,
      padding: "2px 4px",
      borderRadius: 2,
      color: "#fff",
      background:
        a.tipo === "VACACIONES"
          ? "#3f51b5" // azul
          : a.tipo === "PERMISO"
          ? "#ff9800" // naranja
          : a.tipo === "BAJA_MEDICA"
          ? "#e91e63" // rosa/rojo
          : a.tipo === "AUSENCIA_INJUSTIFICADA"
          ? "#9c27b0" // morado
          : "#9e9e9e", // por defecto
    }}
  >
    {a.tipo === "VACACIONES"
      ? "Vacaciones"
      : a.tipo === "PERMISO"
      ? "Permiso"
      : a.tipo === "BAJA_MEDICA"
      ? "Baja médica"
      : a.tipo === "AUSENCIA_INJUSTIFICADA"
      ? "Ausencia injustificada"
      : a.tipo}
  </div>
))}

                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default ResumenTab;
