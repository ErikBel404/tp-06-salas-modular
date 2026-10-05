# Trabajo Práctico 06 - Refactorización modular de reservas

Aplicación web de gestión de reservas de salas de estudio desarrollada sobre Node.js y Express, refactorizada en una arquitectura modular por capas sin alterar el contrato funcional original.

---

## Proyecto de partida y cambios

El punto de partida corresponde a la entrega funcional del **TP 05** (aplicación monolítica de reservas de salas de estudio con middlewares, vistas EJS y almacenamiento en memoria).

### Cambios realizados:
* **Separación de responsabilidades:** Se desacoplaron las capas del sistema dividiendo el código en arranque (`index.js`), configuración del entorno (`configuracion.js`), inicialización de la app y pipeline (`app.js`), ruteo (`rutas/reservas.js`), controladores (`controladores/reservas.js`), lógica de negocio (`servicios/reservas.js`) y middlewares (`middleware/solicitudes.js` y `middleware/reservas.js`).
* **Configuración desacoplada y externa:** Implementación de lectura, tipado y validación estricta de variables de entorno (`PORT` y `NODE_ENV`).
* **Inyección de dependencias:** El servicio de reservas gestiona la colección de datos y se inyecta como dependencia en los controladores, garantizando una única fuente de la verdad para todas las operaciones (incluida la ruta `/estado`).
* **Alineación de calidad:** Incorporación de ESLint y Prettier con scripts de verificación y formateo estático automatizado.

---

## Instalación y ejecución

### Requisitos previos
* Node.js (v20 o superior recomendado)
* npm

### Pasos de instalación y puesta en marcha
1. Clonar el repositorio y ubicarse en la raíz del proyecto:

```bash
   git clone <URL_DEL_REPOSITORIO>
   cd tp-06-salas-modular
```

2. Instalar las dependencias del proyecto:
```bash
   npm install
```

3. Ejecutar la aplicación en modo estándar (utiliza valores predeterminados PORT=3000 y NODE_ENV=development sin requerir archivo .env):
```bash
   npm start
```

4. Ejecutar la aplicación leyendo un archivo .env local: este comando ejecuta node --env-file=.env src/index.js, por lo que requiere la existencia previa del archivo .env en la raíz.

```bash
   npm run start:local
```   

## Configuración del entorno
La aplicación lee las siguientes variables de entorno procesadas por src/configuracion.js:


| Variable | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `PORT` | Entero (1 - 65535) | `3000` | Puerto en el que escucha el servidor HTTP. Valores no enteros o fuera de rango interrumpen el arranque arrojando un error explícito. |
| `NODE_ENV` | String | `development` | Define el entorno de ejecución. Si su valor es `production`, Morgan utiliza el formato de registro `combined`. Para cualquier otro valor, utiliza `dev`. |

### Configuración del registro
La variable NODE_ENV solo diferencia el formato del registro emitido por Morgan:

* Desarrollo (dev): Formato conciso y coloreado por código de estado HTTP para agilizar la depuración en terminal.

* Producción (combined): Formato estándar de log de acceso Apache con información detallada (IP remota, fecha, agente de usuario, referrer).

El repositorio versiona una plantilla de configuración en .env.example con valores no sensibles:

```bash
PORT=3000
NODE_ENV=development
```

## Mapa de módulos y dependencias

### Estructura del proyecto

```bash
tp-06-salas-modular/
├── datos/
│   └── constantes.js
├── public/
│   └── css/
│       └── estilos.css
├── src/
│   ├── controladores/
│   │   └── reservas.js
│   ├── middleware/
│   │   ├── reservas.js
│   │   └── solicitudes.js
│   ├── rutas/
│   │   └── reservas.js
│   ├── servicios/
│   │   └── reservas.js
│   ├── app.js
│   ├── configuracion.js
│   └── index.js
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── reservas/
│   │   ├── detalle.ejs
│   │   ├── lista.ejs
│   │   └── nueva.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
└── README.md
```

Justificaciones de diseño y límites arquitectónicos

* ¿Por qué el servicio no usa res ni EJS ni códigos HTTP? El servicio representa la lógica de negocio pura y la manipulación de datos en memoria. Al desacoplarlo del protocolo HTTP y de los objetos req y res, la lógica de datos se mantiene reutilizable, agnóstica de la interfaz (podría responder a una API REST, comandos CLI o tests unitarios) y libre de efectos colaterales de transporte.

* ¿Qué hace el controlador? El controlador actúa como puente entre la capa HTTP y la de negocio: extrae y castea parámetros de req, invoca los métodos correspondientes del servicio inyectado, selecciona la vista EJS a renderizar o emite la respuesta en JSON, y establece los códigos de estado HTTP (200, 302, 404).

* ¿Por qué el router declara caminos relativos? El enrutador (src/rutas/reservas.js) se monta en src/app.js bajo el prefijo base /reservas. Definir rutas relativas (/, /nueva, /:id) previene duplicaciones accidentales en los paths (como /reservas/reservas), facilita el mantenimiento y permite reubicar el módulo en otro prefijo sin modificar las rutas internas.

* ¿Dónde vive el único arreglo de reservas y qué ocurrirá al reiniciar? El arreglo reside en la memoria volátil del proceso Node.js, encapsulado dentro de la clausura de la instancia única de crearServicioReservas inicializada en src/index.js. Al reiniciar el servidor (por detención manual, caída o reinicio del proceso), el estado en memoria se destruye y el servicio vuelve a inicializarse con la lista semilla original de 4 reservas.

## Pipeline y contrato de rutas

### Orden del Pipeline de Middlewares
Cada solicitud entrante atraviesa estrictamente la siguiente secuencia en src/app.js:

1. morgan(formatoRegistro): Registro HTTP según el entorno configurado.

2. crearSolicitudes(): Genera e inyecta en res.locals.solicitudId el identificador correlativo con prefijo BIB-XXXX.

3. medirDuracion: Inicia el temporizador de alta resolución (process.hrtime.bigint()) y registra en consola la duración de la petición al dispararse el evento finish.

4. expressLayouts: Habilita el motor de plantillas con layout centralizado (layouts/main.ejs).

5. express.static: Sirve archivos estáticos desde el directorio /public (incluyendo /css/estilos.css).

6. express.urlencoded({ extended: false }): Parsea cuerpos de formularios HTML.

7. express.json(): Parsea cuerpos con formato JSON.

8. Rutas de aplicación:

   * GET /: Vista de inicio.

   * GET /estado: JSON con diagnóstico y cantidad actual de reservas.

9. Enrutador modular app.use("/reservas", reservasRouter):

   * Aplica prepararAreaReservas (fija res.locals.seccion).
   * GET /reservas: Listado de reservas.
   * GET /reservas/nueva: Formulario de alta (declarado antes de /:id para evitar capturas accidentales).
   * GET /reservas/:id: Detalle de reserva o 404 si el ID no existe.
   * POST /reservas: Validación de datos con validarReserva -> Redirección 302 si es válido; respuesta 400 si es inválido.

10. Middleware terminal 404: Renderiza views/no-encontrado.ejs con código 404 para cualquier ruta no mapeada.

### Contrato de rutas

| Método | Ruta | Estado HTTP | Respuesta / Vista |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | 200 | Renderiza `views/inicio.ejs` |
| `GET` | `/estado` | 200 | JSON con diagnóstico: servicio, cantidad (`contar`), `solicitudId` (`BIB-`) y lista |
| `GET` | `/reservas` | 200 | Renderiza `views/reservas/lista.ejs` con el arreglo de reservas |
| `GET` | `/reservas/nueva` | 200 | Renderiza `views/reservas/nueva.ejs` con salas y turnos permitidos |
| `GET` | `/reservas/:id` | 200 / 404 | `200`: `views/reservas/detalle.ejs` \| `404`: `views/no-encontrado.ejs` |
| `POST` | `/reservas` | 302 / 400 | Válido: `302` redirect a `/reservas` \| Inválido: `400` renderiza `views/reservas/nueva` |
| `GET` | `/css/estilos.css` | 200 | Archivo CSS servido por `express.static` desde `public/` |
| `*` | `/url-inexistente` | 404 | Middleware final 404: renderiza `views/no-encontrado.ejs` |

---

### Matriz antes / después

| Caso de prueba | Estado esperado | Evidencia TP 05 (Línea de base) | Evidencia TP 06 (Modular) |
| :--- | :---: | :--- | :--- |
| **Inicio y CSS** | 200 | Carga bienvenida y `/css/estilos.css` (200). | Carga vista y estilos con ID correlativo `BIB-` visible. |
| **Estado inicial** | 200 | JSON con 4 reservas iniciales. | JSON con `reservas: 4` e ID `BIB-0002`. |
| **Listado y detalle existente** | 200 | Lista con 4 elementos; `/reservas/1` abre datos de Ana García. | Mismos datos del TP 05; detalle funcional. |
| **Detalle inexistente** | 404 | `/reservas/999` devuelve 404 HTML sin caída del servidor. | `/reservas/999` renderiza `no-encontrado.ejs` (404). |
| **Formulario de alta** | 200 | Formulario con selectores de sala y turno. | Carga idéntica con opciones pobladas desde constantes. |
| **POST vacío / sin campos oblig.** | 400 | 400 con mensaje de campos obligatorios. | 400 sin llamar a `next()`; no altera el arreglo. |
| **POST email inválido (sin @)** | 400 | 400 por falta de caracter `@` en correo. | 400 conserva valores previos; no genera alta. |
| **POST sala / turno no permitido** | 400 | 400 rechaza valor ajeno a la lista permitida. | 400 rechaza valor; renderiza con mensaje de error. |
| **POST personas inválidas (0, 7)** | 400 | 400 personas debe ser entero entre 1 y 6. | 400 personas fuera de rango; sin alta. |
| **POST válido** | 302 -> 200 | 302 a `/reservas`; `/estado` sube a 5. | Redirección 302; `/estado` sincronizado en 5. |
| **URL inexistente** | 404 | `/inexistente` responde 404 HTML. | 404 capturado en middleware final `no-encontrado`. |
| **Reinicio de servidor** | 200 | Vuelve a las 4 reservas iniciales. | Arreglo en memoria se resetea a 4 semillas. |
| **Puerto alternativo (`PORT=4000`)** | 200 | N/A (puerto hardcodeado en 3000). | Servidor levanta y responde en el nuevo puerto configurado. |
| **Puerto inválido (`PORT=99999`)** | No inicia | N/A (sin validación de entorno). | Error explícito: `PORT debe ser un entero entre 1 y 65535`. |


## Formato y análisis estático

### Scripts disponibles

* Formateo de código:
```bash
   npm run format
```
* Verificación de formateo:
```bash
   npm run format:check
```

* Análisis estático:
```bash
   npm run lint
```

* Verificación integral:
```bash
   npm run check
``` 

### Resultados de la verificacion estatica

```bash
$ npm run check

> tp-06-salas-modular@1.0.0 check
> npm run format:check && npm run lint

> tp-06-salas-modular@1.0.0 format:check
> prettier --check src

Checking formatting...
All matched files are use prettier code style!

> tp-06-salas-modular@1.0.0 lint
> eslint src
```

## Persistencia temporal y límites
* Persistencia en memoria: La aplicación almacena los datos de las reservas exclusivamente en una colección en memoria RAM (Array). No se implementa persistencia en base de datos ni en el sistema de archivos (fs), cumpliendo con el alcance del trabajo práctico.

* Ciclo de vida del estado: Las altas registradas a través de solicitudes POST persisten únicamente durante el tiempo de ejecución del proceso. Si el servidor se detiene, se reinicia o sufre un fallo, el estado volátil se descarta y el servicio se reinicia con las cuatro reservas de prueba iniciales.



