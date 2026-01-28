import { useState } from "react";


function formatoFechaISO(anio, mes0, dia) {
  const y = anio;
  const m = String(mes0 + 1).padStart(2, "0");
  const d = String(dia).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


function AusenciasTab({ empleados, ausencias, setAusencias }) {
    const [empleadoId, setEmpleadoId] = useState("");
    const [mes, setMes] = useState(new Date().getMonth());
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [tipo, setTipo] = useState("VACACIONES");

    const empleadoSeleccionado = empleados.find(
    (e) => e.id === empleadoId
    );


function toggleAusencia(fechaISO) {
  console.log("CLICK EN DÍA >>>", { empleadoId, fechaISO });

  if (!empleadoId) {
    console.log("NO HAY EMPLEADO SELECCIONADO");
    return;
  }

  const idx = ausencias.findIndex(
    (a) => a.empleadoId === empleadoId && a.fecha === fechaISO
  );

  console.log("IDX ENCONTRADO >>>", idx);

  if (idx >= 0) {
    const copia = [...ausencias];
    copia.splice(idx, 1);
    console.log("QUITANDO AUSENCIA");
    setAusencias(copia);
  } else {
    console.log("AÑADIENDO AUSENCIA");
    setAusencias((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        empleadoId,        // ← aquí también string, igual que en empleados
        fecha: fechaISO,
        tipo,
      },
    ]);
  }
}

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

function estiloFondoPorTipo(tipo) {
  switch (tipo) {
    case "VACACIONES":
      return "rgba(33, 150, 243, 0.15)";
    case "BAJA_MEDICA":
      return "rgba(244, 67, 54, 0.15)";
    case "PERMISO":
      return "rgba(255, 193, 7, 0.18)";
    case "AUSENCIA_INJUSTIFICADA":
      return "rgba(156, 39, 176, 0.15)";
    default:
      return "#fff";
  }
}

 
  return (
    <section className="app-tab">
       
      <h2>Vacaciones / Ausencias</h2>


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
        Tipo
        <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ marginTop: 4, padding: 6 }}
        >
            <option value="VACACIONES">Vacaciones</option>
            <option value="BAJA_MEDICA">Baja médica</option>
            <option value="PERMISO">Permiso</option>
            <option value="AUSENCIA_INJUSTIFICADA">Ausencia injustificada</option>
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
      </div>


      <p style={{ fontSize: 13, color: "#555" }}>
        Pulsa sobre un día para añadir o quitar una ausencia (de momento tipo
        &quot;vacaciones&quot;).
      </p>


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
                height: 60,
                backgroundColor: "#fff",
              }}
            ></td>
          );
        }

        const fechaISO = formatoFechaISO(anio, mes, dia);

        const ausenciasDia = ausencias.filter(
          (a) => a.empleadoId === empleadoId && a.fecha === fechaISO
        );
        const tieneAusencia = ausenciasDia.length > 0;
        const tipoDia = tieneAusencia ? ausenciasDia[0].tipo : null;

        return (
          <td
            key={j}
            onClick={() => empleadoId && toggleAusencia(fechaISO)}
            style={{
              border: "1px solid #ddd",
              padding: 6,
              height: 60,
              fontSize: 12,
              cursor: empleadoId ? "pointer" : "default",
              backgroundColor: tieneAusencia
                ? estiloFondoPorTipo(tipoDia)
                : "#fff",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{dia}</span>
            {tieneAusencia && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  background: "#e91e63",
                  color: "#fff",
                  padding: "2px 4px",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              >
                {tipoDia}
              </div>
            )}
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


export default AusenciasTab;