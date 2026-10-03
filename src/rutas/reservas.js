const express = require("express");

const {
  prepararAreaReservas,
  validarReserva,
} = require("./../middleware/reservas");

function crearRouterReservas(controladoresReservas) {
  const reservasRouter = express.Router();

  reservasRouter.use(prepararAreaReservas);

  // GET /reservas
  reservasRouter.get("/", controladoresReservas.listar);

  // GET /reservas/nueva
  reservasRouter.get("/nueva", controladoresReservas.mostrarFormulario);

  // GET /reservas/:id
  reservasRouter.get("/:id", controladoresReservas.mostrarDetalle);

  // POST /reservas
  reservasRouter.post("/", validarReserva, controladoresReservas.crear);

  return reservasRouter;
}

module.exports = { crearRouterReservas };
