import { useState } from "react";

function EquipoTab({ empleados, setEmpleados }) {
  const [editId, setEditId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [baseHoraria, setBaseHoraria] = useState("");

  function resetForm() {
    setEditId(null);
    setNombre("");
    setCargo("");
    setBaseHoraria("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim) return;

    const baseNum = baseHoraria ? Number(baseHoraria) : null;

    if (editId) {
      // Editar
      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id === editId
            ? { ...emp, nombre: nombreTrim, cargo, baseHoraria: baseNum }
            : emp
        )
      );
    } else {
      // Crear
      setEmpleados((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          nombre: nombreTrim,
          cargo,
          baseHoraria: baseNum,
        },
      ]);
    }

    resetForm();
  }

  function handleEdit(emp) {
    setEditId(emp.id);
    setNombre(emp.nombre);
    setCargo(emp.cargo || "");
    setBaseHoraria(emp.baseHoraria ?? "");
  }

  function handleDelete(id) {
    if (!window.confirm("¿Borrar este empleado?")) return;
    setEmpleados((prev) => prev.filter((e) => e.id !== id));
    if (editId === id) resetForm();
  }

  return (
    <section className="app-tab">
      
      <h2>Equipo</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: 20,
          padding: 15,
          background: "#fafafa",
          borderRadius: 4,
          border: "1px solid #ddd",
        }}
      >
        <label
          style={{ display: "block", margin: "10px 0 5px", fontWeight: 500 }}
        >
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: "1px solid #ddd",
              borderRadius: 3,
            }}
          />
        </label>

        <label
          style={{ display: "block", margin: "10px 0 5px", fontWeight: 500 }}
        >
          Cargo
          <input
            type="text"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: "1px solid #ddd",
              borderRadius: 3,
            }}
          />
        </label>

        <label
          style={{ display: "block", margin: "10px 0 5px", fontWeight: 500 }}
        >
          Base horaria (h/semana)
          <input
            type="number"
            min="0"
            value={baseHoraria}
            onChange={(e) => setBaseHoraria(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: "1px solid #ddd",
              borderRadius: 3,
            }}
          />
        </label>

        <div style={{ marginTop: 10 }}>
          <button
            type="submit"
            style={{
              padding: "8px 15px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: 3,
              fontSize: 13,
              marginRight: 6,
            }}
          >
            {editId ? "Guardar cambios" : "Guardar empleado"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "8px 15px",
              background: "#777",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: 3,
              fontSize: 13,
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                background: "#f0f0f0",
                padding: 8,
                border: "1px solid #ddd",
                textAlign: "left",
                fontSize: 12,
              }}
            >
              Nombre
            </th>
            <th
              style={{
                background: "#f0f0f0",
                padding: 8,
                border: "1px solid #ddd",
                textAlign: "left",
                fontSize: 12,
              }}
            >
              Cargo
            </th>
            <th
              style={{
                background: "#f0f0f0",
                padding: 8,
                border: "1px solid #ddd",
                textAlign: "left",
                fontSize: 12,
              }}
            >
              Base
            </th>
            <th
              style={{
                background: "#f0f0f0",
                padding: 8,
                border: "1px solid #ddd",
                textAlign: "left",
                fontSize: 12,
              }}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {empleados.length === 0 && (
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: 8,
                  border: "1px solid #ddd",
                  fontSize: 13,
                  color: "#666",
                }}
              >
                No hay empleados todavía.
              </td>
            </tr>
          )}
          {empleados.map((emp) => (
            <tr key={emp.id}>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {emp.nombre}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {emp.cargo || ""}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {emp.baseHoraria != null ? emp.baseHoraria : ""}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                <button
                  onClick={() => handleEdit(emp)}
                  style={{
                    padding: "4px 8px",
                    marginRight: 4,
                    fontSize: 11,
                    borderRadius: 3,
                    border: "none",
                    cursor: "pointer",
                    background: "#1976d2",
                    color: "#fff",
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(emp.id)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 11,
                    borderRadius: 3,
                    border: "none",
                    cursor: "pointer",
                    background: "#e91e63",
                    color: "#fff",
                  }}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default EquipoTab;
