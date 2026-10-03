function crearSolicitudes() {
  let numeroSolicitudes = 0;

  // Middleware Identificador
  return function identificarSolicitud(req, res, next) {
    numeroSolicitudes += 1;
    res.locals.solicitudId = `BIB-${String(numeroSolicitudes).padStart(4, "0")}`;
    next();
  };
}

// Middleware Medición
function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on("finish", () => {
    const fin = process.hrtime.bigint();
    const milisegundos = Number(fin - inicio) / 1_000_000;
    console.log(
      `[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${milisegundos.toFixed(2)} ms`,
    );
  });
  next();
}

module.exports = { crearSolicitudes, medirDuracion };
