CREATE DATABASE IF NOT EXISTS actividades_deportivas;

USE actividades_deportivas;


CREATE TABLE disciplina (
    id_disciplina  INT          NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100) NOT NULL,
    descripcion    VARCHAR(255),
    CONSTRAINT pk_disciplina PRIMARY KEY (id_disciplina),
    CONSTRAINT uq_disciplina_nombre UNIQUE (nombre)
);

CREATE TABLE espacio_deportivo (
    id_espacio  INT          NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    ubicacion   VARCHAR(255),
    capacidad   INT,
    CONSTRAINT pk_espacio PRIMARY KEY (id_espacio),
    CONSTRAINT uq_espacio_nombre UNIQUE (nombre)
);

CREATE TABLE estudiante (
    id_estudiante  INT          NOT NULL AUTO_INCREMENT,
    documento      VARCHAR(20)  NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    carrera        VARCHAR(150) NOT NULL,
    facultad       VARCHAR(150) NOT NULL,
    activo         TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_estudiante  PRIMARY KEY (id_estudiante),
    CONSTRAINT uq_documento   UNIQUE (documento),
    CONSTRAINT uq_email       UNIQUE (email)
);

CREATE TABLE actividad (
    id_actividad  INT          NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(150) NOT NULL,
    id_disciplina INT          NOT NULL,
    id_espacio    INT          NOT NULL,
    cupo_maximo   INT          NOT NULL,
    dia           ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')
                               NOT NULL,       
    horario       TIME         NOT NULL,
    estado        ENUM('abierta','cerrada','finalizada','cancelada')
                               NOT NULL DEFAULT 'abierta',
    CONSTRAINT pk_actividad     PRIMARY KEY (id_actividad),
    CONSTRAINT fk_act_disciplina FOREIGN KEY (id_disciplina)
        REFERENCES disciplina(id_disciplina),
    CONSTRAINT fk_act_espacio   FOREIGN KEY (id_espacio)
        REFERENCES espacio_deportivo(id_espacio),
    CONSTRAINT chk_cupo         CHECK (cupo_maximo > 0)
);

CREATE TABLE inscripcion (
    id_inscripcion   INT       NOT NULL AUTO_INCREMENT,
    id_estudiante    INT       NOT NULL,
    id_actividad     INT       NOT NULL,
    estado           ENUM('confirmada','en_espera','cancelada')
                              NOT NULL DEFAULT 'confirmada',
    fecha_inscripcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    orden_espera     INT                DEFAULT NULL,  -- solo si el estado = 'en espera'
    CONSTRAINT pk_inscripcion   PRIMARY KEY (id_inscripcion),
    CONSTRAINT fk_ins_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES estudiante(id_estudiante),
    CONSTRAINT fk_ins_actividad  FOREIGN KEY (id_actividad)
        REFERENCES actividad(id_actividad),
    -- un estudiante no puede inscribirse dos veces a la misma actividad
    CONSTRAINT uq_est_act        UNIQUE (id_estudiante, id_actividad)
);

CREATE TABLE asistencia (
    id_asistencia  INT     NOT NULL AUTO_INCREMENT,
    id_inscripcion INT     NOT NULL,
    fecha          DATE    NOT NULL,
    presente       TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT pk_asistencia    PRIMARY KEY (id_asistencia),
    CONSTRAINT fk_asis_insc     FOREIGN KEY (id_inscripcion)
        REFERENCES inscripcion(id_inscripcion),
    -- no puede haber dos registros para el mismo inscripto en la misma fecha
    CONSTRAINT uq_insc_fecha    UNIQUE (id_inscripcion, fecha)
);

CREATE TABLE usuarios (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           ENUM('admin', 'consulta') NOT NULL DEFAULT 'consulta',
    activo        TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 


