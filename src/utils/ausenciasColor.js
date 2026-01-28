// ausenciasColors.js
export function colorFondoAusencia(tipo) {
  switch (tipo) {
    case "VACACIONES":
      return "rgba(33, 150, 243, 0.15)";      // azul
    case "BAJA_MEDICA":
      return "rgba(244, 67, 54, 0.15)";       // rojo
    case "PERMISO":
      return "rgba(255, 193, 7, 0.18)";       // amarillo
    case "AUSENCIA_INJUSTIFICADA":
      return "rgba(156, 39, 176, 0.15)";      // morado
    default:
      return "transparent";
  }
}

export function colorChipAusencia(tipo) {
  switch (tipo) {
    case "VACACIONES":
      return "#3f51b5";    // azul
    case "PERMISO":
      return "#ff9800";    // naranja
    case "BAJA_MEDICA":
      return "#e91e63";    // rosa/rojo
    case "AUSENCIA_INJUSTIFICADA":
      return "#9c27b0";    // morado
    default:
      return "#9e9e9e";
  }
}
