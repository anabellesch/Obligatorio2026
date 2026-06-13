# Sistema de Gestión de Actividades Deportivas Universitarias
 
Aplicación web para la gestión de actividades deportivas de una universidad: estudiantes, disciplinas, espacios deportivos, actividades, inscripciones, asistencias y reportes/estadísticas, con autenticación y permisos por rol (admin, profesor, estudiante).

- **Frontend:** React + Vite, React Router, Context API, Axios, Recharts.
- **Backend:** Python + Flask (API REST organizada en blueprints), JWT (PyJWT) + bcrypt para autenticación.
- **Base de datos:** MySQL 8, con schema, seeds y triggers (reglas de negocio: control de cupo, lista de espera, validación de asistencias, etc.).
- **Infraestructura:** Docker + Docker Compose (3 servicios: `db`, `backend`, `frontend`).

## Estructura del proyecto
 
```
Obligatorio2026/
├── backend/          # API Flask
│   ├── app/
│   │   ├── routes/   # Blueprints: auth, estudiantes, actividades, inscripciones, etc.
│   │   └── utils/     # Auth (JWT), validadores, helpers de respuesta
│   ├── config.py
│   ├── run.py
│   └── Dockerfile
├── frontend/         # App React (Vite)
│   ├── src/
│   │   ├── api/       # Clientes Axios por entidad
│   │   ├── components/
│   │   ├── context/   # AuthContext (login, permisos)
│   │   └── pages/      # Estudiantes, Actividades, Inscripciones, Reportes, etc.
│   └── Dockerfile
├── database/
│   ├── schema.sql     # Definición de tablas
│   ├── seeds.sql      # Datos iniciales (usuarios, permisos, catálogos)
│   └── triggers.sql   # Triggers de reglas de negocio
└── docker-compose.yml
```

## Requisitos previos
 
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados (no es necesario instalar Python, Node ni MySQL en la máquina local: todo corre dentro de los contenedores).

## Cómo levantar el proyecto
 
1. Clonar el repositorio:
```bash
   git clone https://github.com/anabellesch/Obligatorio2026.git
   cd Obligatorio2026
```

2. Construir las imágenes:
```bash
   docker compose build
```

3. Levantar todos los servicios en segundo plano:
```bash
   docker compose up -d
```
 La primera vez que se levanta el contenedor de la base de datos, MySQL ejecuta automáticamente los scripts de `database/` (`schema.sql`, `seeds.sql`, `triggers.sql`) para crear la base, las tablas, los datos iniciales y los triggers.

 4. Verificar que los contenedores estén corriendo:
```bash
   docker compose ps
```
 El backend espera a que la base de datos esté saludable (`healthcheck`) antes de arrancar.

 ### Credenciales iniciales
 
El seed crea un usuario `admin` y contraseña `admin123` con permisos totales sobre el sistema.

## API
 
La API expone sus endpoints bajo el prefijo `/api`, agrupados por entidad:
 
- `/api/auth` — login, registro, sesión, permisos, usuarios
- `/api/estudiantes`
- `/api/disciplinas`
- `/api/espacios`
- `/api/actividades`
- `/api/inscripciones`
- `/api/asistencias`
- `/api/reportes` — reportes y estadísticas para el rol admin
- `/api/catalogos`
El acceso a cada sección está controlado por un sistema de permisos por rol (`admin`, `profesor`, `estudiante`), definido en la tabla `permisos` y devuelto por la API al iniciar sesión.
