function crearServicioReservas(reservasIniciales) {
  const reservas = [...reservasIniciales];

  function listar() {
    return [...reservas];
  }

  function contar() {
    return reservas.length;
  }

  function obtenerPorId(id) {
    return reservas.find((reserva) => reserva.id === id) ?? null;
  }

  function crear(datosValidados) {
    const ultimoId = reservas.reduce(
      (mayor, reserva) => Math.max(mayor, reserva.id),
      0,
    );
    const nuevo = { id: ultimoId + 1, ...datosValidados };
    reservas.push(nuevo);
    return nuevo;
  }

  return { listar, obtenerPorId, crear, contar };
}

module.exports = { crearServicioReservas };
