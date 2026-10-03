const express = require("express");
const path = require("node:path");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

const { crearSolicitudes, medirDuracion } = require("./middleware/solicitudes");

const { crearControladorReservas } = require("./controladores/reservas");

const { crearRouterReservas } = require("./rutas/reservas");

function crearApp({ serviciosReservas, formatoRegistro }) {
  const app = express();

  const controladoresReservas = crearControladorReservas(serviciosReservas);
  const reservasRouter = crearRouterReservas(controladoresReservas);

  // Configuración de motor de vistas
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layouts/main");

  // Pipeline de Middlewares Globales
  app.use(morgan(formatoRegistro));

  app.use(crearSolicitudes());
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Ruta principal
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Inicio - Sistema de Reservas" });
  });

  // Ruta /estado
  app.get("/estado", controladoresReservas.listarApi);

  // Enlace del router con /reservas

  app.use("/reservas", reservasRouter);

  // Middleware final
  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = { crearApp };
