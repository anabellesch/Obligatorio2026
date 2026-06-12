from flask import Blueprint
from app.db import query
from app.utils.responses import ok
from app.utils.auth import require_jwt
from app.utils.auth import require_role

bp = Blueprint("reportes", __name__)


@bp.route("/actividades-mas-inscriptos", methods=["GET"])
@require_jwt
@require_role("admin")
def actividades_mas_inscriptos():
    rows = query("""
        SELECT a.id_actividad, a.nombre, d.nombre AS disciplina,
               COUNT(i.id_inscripcion) AS total_confirmados
          FROM actividad a
          JOIN inscripcion i ON a.id_actividad = i.id_actividad
          JOIN disciplina d  ON a.id_disciplina = d.id_disciplina
         WHERE i.estado = 'confirmada'
         GROUP BY a.id_actividad, a.nombre, d.nombre
         ORDER BY total_confirmados DESC
    """)
    return ok(rows)


@bp.route("/actividades-con-cupo", methods=["GET"])
@require_jwt
@require_role("admin")
def actividades_con_cupo():
    rows = query("""
        SELECT a.id_actividad, a.nombre, a.cupo_maximo, a.dia, a.horario,
               d.nombre AS disciplina, e.nombre AS espacio,
               COUNT(i.id_inscripcion) AS confirmados,
               a.cupo_maximo - COUNT(i.id_inscripcion) AS cupos_disponibles
          FROM actividad a
          LEFT JOIN inscripcion i
                 ON a.id_actividad = i.id_actividad AND i.estado = 'confirmada'
          JOIN disciplina d       ON a.id_disciplina = d.id_disciplina
          JOIN espacio_deportivo e ON a.id_espacio    = e.id_espacio
         WHERE a.estado = 'abierta'
         GROUP BY a.id_actividad, a.nombre, a.cupo_maximo, a.dia, a.horario,
                  d.nombre, e.nombre
        HAVING cupos_disponibles > 0
         ORDER BY cupos_disponibles DESC
    """)
    return ok(rows)


@bp.route("/inscriptos-por-disciplina", methods=["GET"])
@require_jwt
@require_role("admin")
def inscriptos_por_disciplina():
    rows = query("""
        SELECT d.nombre AS disciplina,
               COUNT(i.id_inscripcion) AS total_inscriptos
          FROM disciplina d
          JOIN actividad a   ON d.id_disciplina = a.id_disciplina
          JOIN inscripcion i ON a.id_actividad  = i.id_actividad
         WHERE i.estado = 'confirmada'
         GROUP BY d.id_disciplina, d.nombre
         ORDER BY total_inscriptos DESC
    """)
    return ok(rows)


@bp.route("/inscriptos-por-carrera", methods=["GET"])
@require_jwt
@require_role("admin")
def inscriptos_por_carrera():
    rows = query("""
        SELECT e.carrera, e.facultad,
               COUNT(DISTINCT i.id_estudiante) AS total_inscriptos
          FROM estudiante e
          JOIN inscripcion i ON e.id_estudiante = i.id_estudiante
         WHERE i.estado = 'confirmada'
         GROUP BY e.carrera, e.facultad
         ORDER BY total_inscriptos DESC
    """)
    return ok(rows)

@bp.route("/ocupacion-actividades", methods=["GET"])
@require_jwt
@require_role("admin")
def ocupacion_actividades():
    rows = query("""
        SELECT a.id_actividad, a.nombre, a.cupo_maximo, a.estado,
               d.nombre AS disciplina,
               COUNT(i.id_inscripcion) AS confirmados,
               ROUND(COUNT(i.id_inscripcion) * 100.0 / a.cupo_maximo, 1) AS pct_ocupacion
          FROM actividad a
          LEFT JOIN inscripcion i
                 ON a.id_actividad = i.id_actividad AND i.estado = 'confirmada'
          JOIN disciplina d ON a.id_disciplina = d.id_disciplina
         GROUP BY a.id_actividad, a.nombre, a.cupo_maximo, a.estado, d.nombre
         ORDER BY pct_ocupacion DESC
    """)
    return ok(rows)

@bp.route("/asistencia-por-actividad", methods=["GET"])
@require_jwt
@require_role("admin")
def asistencia_por_actividad():
    rows = query("""
        SELECT a.id_actividad, a.nombre,
               COUNT(asis.id_asistencia)                              AS total_registros,
               SUM(asis.presente)                                     AS presentes,
               ROUND(SUM(asis.presente) * 100.0 /
                     NULLIF(COUNT(asis.id_asistencia), 0), 1)        AS pct_asistencia
          FROM actividad a
          JOIN inscripcion i   ON a.id_actividad    = i.id_actividad
          JOIN asistencia asis ON i.id_inscripcion  = asis.id_inscripcion
         GROUP BY a.id_actividad, a.nombre
         ORDER BY pct_asistencia DESC
    """)
    return ok(rows)


@bp.route("/estudiantes-con-inasistencias", methods=["GET"])
@require_jwt
@require_role("admin")
def estudiantes_con_inasistencias():
    rows = query("""
        SELECT e.id_estudiante, e.nombre, e.apellido, e.documento, e.carrera,
               a.nombre AS actividad,
               SUM(CASE WHEN asis.presente = 0 THEN 1 ELSE 0 END) AS inasistencias
          FROM estudiante e
          JOIN inscripcion  i    ON e.id_estudiante  = i.id_estudiante
          JOIN actividad    a    ON i.id_actividad   = a.id_actividad
          JOIN asistencia   asis ON i.id_inscripcion = asis.id_inscripcion
         WHERE i.estado = 'confirmada'
         GROUP BY e.id_estudiante, e.nombre, e.apellido, e.documento, e.carrera,
                  a.id_actividad, a.nombre
        HAVING inasistencias >= 3
         ORDER BY inasistencias DESC
    """)
    return ok(rows)


@bp.route("/estudiantes-mas-activos", methods=["GET"])
@require_jwt
@require_role("admin")
def estudiantes_mas_activos():
    rows = query("""
        SELECT e.nombre, e.apellido, e.carrera,
               COUNT(i.id_inscripcion) AS actividades_confirmadas
          FROM estudiante e
          JOIN inscripcion i ON e.id_estudiante = i.id_estudiante
         WHERE i.estado = 'confirmada'
         GROUP BY e.id_estudiante, e.nombre, e.apellido, e.carrera
         ORDER BY actividades_confirmadas DESC
         LIMIT 10
    """)
    return ok(rows)



@bp.route("/lista-de-espera", methods=["GET"])
@require_jwt
@require_role("admin")
def lista_de_espera():
    rows = query("""
        SELECT a.nombre AS actividad, a.cupo_maximo,
               COUNT(CASE WHEN i.estado = 'en_espera' THEN 1 END) AS en_lista_espera
          FROM actividad a
          JOIN inscripcion i ON a.id_actividad = i.id_actividad
         WHERE i.estado = 'en_espera'
         GROUP BY a.id_actividad, a.nombre, a.cupo_maximo
         ORDER BY en_lista_espera DESC
    """)
    return ok(rows)


@bp.route("/ocupacion-espacios", methods=["GET"])
@require_jwt
@require_role("admin")
def ocupacion_espacios():
    rows = query("""
        SELECT ed.nombre AS espacio, ed.ubicacion,
               COUNT(DISTINCT a.id_actividad)  AS actividades_activas,
               COALESCE(SUM(ic.confirmados), 0) AS total_alumnos
          FROM espacio_deportivo ed
          JOIN actividad a ON ed.id_espacio = a.id_espacio AND a.estado = 'abierta'
          LEFT JOIN (
              SELECT id_actividad, COUNT(*) AS confirmados
                FROM inscripcion
               WHERE estado = 'confirmada'
               GROUP BY id_actividad
          ) ic ON a.id_actividad = ic.id_actividad
         GROUP BY ed.id_espacio, ed.nombre, ed.ubicacion
         ORDER BY total_alumnos DESC
    """)
    return ok(rows)