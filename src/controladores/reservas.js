const {
  salasPermitidas,
  turnosPermitidos,
} = require("./../../datos/constantes");

function crearControladorReservas(servicioReserva) {
  function listar(req, res) {
    res.render("reservas/lista", {
      titulo: "reservas artesanales",
      reservas: servicioReserva.listar(),
    });
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: null,
      valores: {},
      salasPermitidas,
      turnosPermitidos,
    });
  }

  function mostrarDetalle(req, res) {
    const id = Number(req.params.id);
    const reserva = servicioReserva.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }
    res.render("reservas/detalle", {
      titulo: reserva.nombre,
      reserva,
    });
  }

  function crear(req, res) {
    servicioReserva.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  function listarApi(req, res) {
    res.json({
      servicio: "activo",
      reservas: servicioReserva.contar(),
      solicitudId: res.locals.solicitudId,
      lista: servicioReserva.listar(),
    });
  }

  return { listar, mostrarFormulario, mostrarDetalle, crear, listarApi };
}

module.exports = { crearControladorReservas };
