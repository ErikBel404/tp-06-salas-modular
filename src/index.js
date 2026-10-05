
const { crearServicioReservas } = require("./servicios/reservas");

const { crearApp } = require("./app");

const { leerConfiguracion } = require("./configuracion");

// Datos iniciales
const reservas = [
  {
    id: 1,
    estudiante: "Ana García",
    email: "ana.garcia@example.com",
    sala: "Sala Norte",
    fecha: "2026-04-10",
    turno: "Mañana",
    personas: 3,
  },
  {
    id: 2,
    estudiante: "Carlos Gómez",
    email: "carlos.gomez@example.com",
    sala: "Sala Sur",
    fecha: "2026-04-10",
    turno: "Tarde",
    personas: 2,
  },
  {
    id: 3,
    estudiante: "Lucía Fernández",
    email: "lucia.f@example.com",
    sala: "Sala Multimedia",
    fecha: "2026-04-11",
    turno: "Noche",
    personas: 5,
  },
  {
    id: 4,
    estudiante: "Martín Rodríguez",
    email: "martin.r@example.com",
    sala: "Sala Norte",
    fecha: "2026-04-12",
    turno: "Tarde",
    personas: 4,
  },
];

function main() {
  const { puerto, formatoRegistro } = leerConfiguracion();

  const serviciosReservas = crearServicioReservas(reservas);

  const app = crearApp({ serviciosReservas, formatoRegistro });

  app.listen(puerto, () => {
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });
}

main();
