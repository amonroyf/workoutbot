export function calcularTotal(totales) {
  return Object.values(totales).reduce((acc, n) => acc + (n || 0), 0);
}
