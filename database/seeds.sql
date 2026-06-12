USE actividades_deportivas; 

INSERT INTO disciplina (nombre, descripcion)
VALUES
('Fútbol', 'Entrenamiento y partidos recreativos'),
('Básquetbol', 'Práctica deportiva en equipo'),
('Yoga', 'Actividad de relajación y flexibilidad'),
('Funcional', 'Entrenamiento físico integral'),
('Atletismo', 'Actividad física y resistencia'),
('Voleybol', 'Entrenamiento y trabajo en equipo');

INSERT INTO espacio_deportivo (nombre, ubicacion, capacidad)
VALUES
('Cancha Principal', 'Campus Norte', 40),
('Gimnasio Central', 'Edificio Deportivo', 60),
('Sala Yoga', 'Bloque C', 20),
('Pista Atletismo', 'Sector Sur', 50),
('Cancha de voley', 'Edificio Deportivo', 20);

INSERT INTO estudiante
(id_estudiante, documento, nombre, apellido, email, carrera, facultad)
VALUES
(1, '54879612', 'Luciano', 'Rodríguez', 'luciano@correo.com', 'Ingeniería en Informática', 'Ingeniería'),
(2, '51234789', 'Anabelle', 'schenck', 'ana@correo.com', 'Ingeniería en informática', 'Ingeniería'),
(3, '48956123', 'Martín', 'Gómez', 'martin@correo.com', 'Contador Público', 'Economía'),
(4, '52369874', 'Valentina', 'Silva', 'valentina@correo.com', 'Psicología', 'Psicología'),
(5, '43212343', 'Alonzo', 'Rivera', 'alonzo@gmail.com', 'Ingeniería en Alimentos', 'Química'),
(6, '45642324', 'Magdalena', 'Reyes', 'magui@gmail.com', 'Medicina', 'Medicina');

INSERT INTO actividad
(nombre, id_disciplina, id_espacio, cupo_maximo, dia, horario, estado)
VALUES
('Fútbol recreativo mixto', 1, 1, 30, 'Lunes', '18:00:00', 'abierta'),

('Yoga principiantes', 3, 3, 15, 'Miércoles', '19:00:00', 'abierta'),

('Funcional turno mañana', 4, 2, 20, 'Viernes', '08:00:00', 'cerrada'),

('Atletismo inicial', 5, 4, 25, 'Martes', '17:30:00', 'abierta'), 

('Voleybol turno mañana', 6, 5, 20, 'Jueves', '09:00:00', "finalizada");

INSERT INTO inscripcion
(id_estudiante, id_actividad, estado)
VALUES
(1, 1, 'confirmada'),
(2, 1, 'confirmada'),
(3, 2, 'confirmada'),
(4, 2, 'en_espera'),
(5, 4, 'en_espera'),
(6, 5, 'cancelada');

INSERT INTO asistencia
(id_inscripcion, fecha, presente)
VALUES
(1, '2026-05-20', 1),
(2, '2026-05-20', 0),
(3, '2026-05-21', 1),
(4,'2026-05-19', 0),
(5,'2026-05-22', 0);




INSERT INTO usuarios (username, password_hash, rol) VALUES
(
  'admin',
  '$2b$12$.xNGmT9JtOUQ1.RspInuJu4VQ3W8F7qjemZrwrVPgvxyYLthbccfW',
  'admin'
);

INSERT INTO permisos (rol, seccion, puede_ver, puede_modificar) VALUES
  ('admin','estudiantes',1,1),
  ('admin','disciplinas',1,1),
  ('admin','espacios',1,1),
  ('admin','actividades',1,1),
  ('admin','inscripciones',1,1),
  ('admin','asistencias',1,1),
  ('admin', 'reportes', 1, 1),
  ('admin', 'usuarios', 1, 1)
  ON DUPLICATE KEY UPDATE
    puede_ver = VALUES(puede_ver),
    puede_modificar = VALUES(puede_modificar);

INSERT INTO permisos (rol, seccion, puede_ver, puede_modificar) VALUES
  ('estudiante','estudiantes',0,0),
  ('estudiante','disciplinas',1,0),
  ('estudiante','espacios',1,0),
  ('estudiante','actividades',1,0),
  ('estudiante','inscripciones',1,0),
  ('estudiante','asistencias',0,0),
  ('estudiante', 'reportes', 0, 0),
  ('estudiante', 'usuarios', 0, 0)
  ON DUPLICATE KEY UPDATE
    puede_ver = VALUES(puede_ver),
    puede_modificar = VALUES(puede_modificar);

INSERT INTO permisos (rol, seccion, puede_ver, puede_modificar) VALUES
  ('profesor','estudiantes',1,0),
  ('profesor','disciplinas',1,0),
  ('profesor','espacios',1,0),
  ('profesor','actividades',1,0),
  ('profesor','inscripciones',1,0),
  ('profesor','asistencias',1,1),
  ('profesor', 'reportes', 0, 0),
  ('profesor', 'usuarios', 0, 0)
  ON DUPLICATE KEY UPDATE
    puede_ver = VALUES(puede_ver),
    puede_modificar = VALUES(puede_modificar);