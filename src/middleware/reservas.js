// Listas de valores permitidos
const {
  salasPermitidas,
  turnosPermitidos,
} = require("./../../datos/constantes");

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

// Middleware de validación del formulario de reservas
function validarReserva(req, res, next) {
  const valores = req.body ?? {};

  const estudiante = String(valores.estudiante ?? "").trim();
  const email = String(valores.email ?? "").trim();
  const sala = String(valores.sala ?? "").trim();
  const fecha = String(valores.fecha ?? "").trim();
  const turno = String(valores.turno ?? "").trim();
  const personas = Number(valores.personas);

  //Campos obligatorios
  if (!estudiante || !email || !sala || !fecha || !turno) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: "Todos los campos son obligatorios.",
      valores: valores,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  //Email con validación
  if (!email.includes("@")) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: "El correo electrónico debe ser válido y contener '@'.",
      valores: valores,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  // Sala verificadda
  if (!salasPermitidas.includes(sala)) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: "La sala seleccionada no es válida.",
      valores: valores,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  //Turno verificado
  if (!turnosPermitidos.includes(turno)) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: "El turno seleccionado no es válido.",
      valores: valores,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  // 5. Cantidad de personas: entre 1 y 6
  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: "La cantidad de personas debe ser un número entero entre 1 y 6.",
      valores: valores,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  // Preparación del objeto validado
  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
}

module.exports = { prepararAreaReservas, validarReserva };
