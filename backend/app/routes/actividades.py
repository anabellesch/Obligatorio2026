from flask import Blueprint, request
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found, conflict, server_error
from app.utils.validators import required_fields, valid_time, ESTADOS_ACTIVIDAD, DIAS_SEMANA
import mysql.connector

bp = Blueprint("actividades", __name__)

FIELDS_REQUIRED = ["nombre", "id_disciplina", "id_espacio", "cupo_maximo", "dia", "horario"]


def _get_or_404(id):
    return query("SELECT * FROM actividad WHERE id_actividad = %s", (id,), one=True)


@bp.route("/", methods=["GET"])
def listar():
    estado = request.args.get("estado")
    if estado:
        rows = query(
            """SELECT a.*, d.nombre AS disciplina, e.nombre AS espacio
                 FROM actividad a
                 JOIN disciplina d       ON a.id_disciplina = d.id_disciplina
                 JOIN espacio_deportivo e ON a.id_espacio    = e.id_espacio
                WHERE a.estado = %s ORDER BY a.dia, a.horario""",
            (estado,)
        )
    else:
        rows = query(
            """SELECT a.*, d.nombre AS disciplina, e.nombre AS espacio
                 FROM actividad a
                 JOIN disciplina d       ON a.id_disciplina = d.id_disciplina
                 JOIN espacio_deportivo e ON a.id_espacio    = e.id_espacio
                ORDER BY a.dia, a.horario"""
        )
    for row in rows:
        if row.get("horario"):
            row["horario"] = str(row["horario"])
    return ok(rows)


@bp.route("/<int:id>", methods=["GET"])
def obtener(id):
    a = query(
        """SELECT a.*, d.nombre AS disciplina, e.nombre AS espacio,
                  (SELECT COUNT(*) FROM inscripcion i
                    WHERE i.id_actividad = a.id_actividad AND i.estado = 'confirmada') AS confirmados,
                  (SELECT COUNT(*) FROM inscripcion i
                    WHERE i.id_actividad = a.id_actividad AND i.estado = 'en_espera') AS en_espera
             FROM actividad a
             JOIN disciplina d       ON a.id_disciplina = d.id_disciplina
             JOIN espacio_deportivo e ON a.id_espacio    = e.id_espacio
            WHERE a.id_actividad = %s""",
        (id,), one=True
    )
    if not a:
        return not_found("Actividad no encontrada")
    if a and a.get("horario"):
        a["horario"] = str(a["horario"])
    return ok(a)


@bp.route("/", methods=["POST"])
def crear():
    data = request.get_json(silent=True) or {}
    err = required_fields(data, FIELDS_REQUIRED)
    if err:
        return error(err)

    if data.get("estado") and data["estado"] not in ESTADOS_ACTIVIDAD:
        return error(f"Estado inválido. Valores posibles: {', '.join(ESTADOS_ACTIVIDAD)}")

    if data["dia"] not in DIAS_SEMANA:
        return error(f"Día inválido. Valores posibles: {', '.join(DIAS_SEMANA)}")

    if not valid_time(data["horario"]):
        return error("Horario inválido. Use formato HH:MM")

    if int(data["cupo_maximo"]) <= 0:
        return error("El cupo máximo debe ser mayor a 0")

    try:
        new_id = execute(
            """INSERT INTO actividad (nombre, id_disciplina, id_espacio, cupo_maximo, dia, horario, estado)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (data["nombre"], data["id_disciplina"], data["id_espacio"],
             data["cupo_maximo"], data["dia"], data["horario"],
             data.get("estado", "abierta"))
        )
        return created(query(
            """SELECT a.*, d.nombre AS disciplina, e.nombre AS espacio
                 FROM actividad a
                 JOIN disciplina d       ON a.id_disciplina = d.id_disciplina
                 JOIN espacio_deportivo e ON a.id_espacio    = e.id_espacio
                WHERE a.id_actividad = %s""", (new_id,), one=True
        ))
    except mysql.connector.IntegrityError as e:
        return conflict("Disciplina o espacio no existen")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>", methods=["PUT"])
def actualizar(id):
    a = _get_or_404(id)
    if not a:
        return not_found("Actividad no encontrada")

    data = request.get_json(silent=True) or {}
    err = required_fields(data, FIELDS_REQUIRED)
    if err:
        return error(err)

    if data.get("estado") and data["estado"] not in ESTADOS_ACTIVIDAD:
        return error(f"Estado inválido. Valores posibles: {', '.join(ESTADOS_ACTIVIDAD)}")

    if data["dia"] not in DIAS_SEMANA:
        return error(f"Día inválido. Valores posibles: {', '.join(DIAS_SEMANA)}")

    if not valid_time(data["horario"]):
        return error("Horario inválido. Use formato HH:MM")

    try:
        execute(
            """UPDATE actividad
               SET nombre=%s, id_disciplina=%s, id_espacio=%s, cupo_maximo=%s,
                   dia=%s, horario=%s, estado=%s
               WHERE id_actividad=%s""",
            (data["nombre"], data["id_disciplina"], data["id_espacio"],
             data["cupo_maximo"], data["dia"], data["horario"],
             data.get("estado", a["estado"]), id)
        )
        return ok(query(
            """SELECT a.*, d.nombre AS disciplina, e.nombre AS espacio
                 FROM actividad a
                 JOIN disciplina d       ON a.id_disciplina = d.id_disciplina
                 JOIN espacio_deportivo e ON a.id_espacio    = e.id_espacio
                WHERE a.id_actividad = %s""", (id,), one=True
        ))
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>/estado", methods=["PATCH"])
def cambiar_estado(id):
    a = _get_or_404(id)
    if not a:
        return not_found("Actividad no encontrada")

    data = request.get_json(silent=True) or {}
    nuevo = data.get("estado")
    if not nuevo or nuevo not in ESTADOS_ACTIVIDAD:
        return error(f"Estado inválido. Valores posibles: {', '.join(ESTADOS_ACTIVIDAD)}")

    execute("UPDATE actividad SET estado=%s WHERE id_actividad=%s", (nuevo, id))
    return ok(msg=f"Estado cambiado a '{nuevo}'")


@bp.route("/<int:id>", methods=["DELETE"])
def eliminar(id):
    a = _get_or_404(id)
    if not a:
        return not_found("Actividad no encontrada")
    try:
        execute("DELETE FROM actividad WHERE id_actividad = %s", (id,))
        return ok(msg="Actividad eliminada")
    except mysql.connector.IntegrityError:
        return conflict("No se puede eliminar: la actividad tiene inscripciones asociadas")
    except Exception as e:
        return server_error(str(e))