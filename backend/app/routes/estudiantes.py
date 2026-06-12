from flask import Blueprint, request
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found, conflict, server_error
from app.utils.validators import required_fields, valid_email
import mysql.connector
from app.utils.auth import require_jwt
from app.utils.auth import require_role

bp = Blueprint("estudiante", __name__)
 
FIELDS_REQUIRED = ["documento", "nombre", "apellido", "email", "carrera", "facultad"]

def get_or_404(id_estudiante):
    return query("SELECT * FROM estudiante WHERE id_estudiante = %s AND activo = 1", (id_estudiante,), one=True)

@bp.route("/", methods=["GET"])
@require_jwt
@require_role("admin", "profesor")
def listar ():
    estudiante = query ("SELECT * FROM estudiante WHERE activo = 1 ORDER BY apellido, nombre")
    return ok(estudiante)

@bp.route("/<int:id_estudiante>", methods=["GET"])
@require_jwt
@require_role("admin", "profesor")
def obtener(id_estudiante):
    est = get_or_404(id_estudiante)
    if not est:
        return not_found("Estudiante no encontrado")
    return ok(est)


@bp.route("/", methods=["POST"])
@require_jwt
@require_role("admin")
def crear ():
    data = request.get_json(silent=True) or {}
 
    err = required_fields(data, FIELDS_REQUIRED)
    if err:
        return error(err)
 
    if not valid_email(data["email"]):
        return error("El email no tiene un formato válido")
 
    try:
        new_id = execute(
            """INSERT INTO estudiante (documento, nombre, apellido, email, carrera, facultad)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (data["documento"], data["nombre"], data["apellido"],
             data["email"], data["carrera"], data["facultad"])
        )
        est = query("SELECT * FROM estudiante WHERE id_estudiante = %s", (new_id,), one=True)
        return created(est, "Estudiante creado correctamente")
 
    except mysql.connector.IntegrityError as e:
        msg = str(e)
        if "documento" in msg:
            return conflict("Ya existe un estudiante con ese documento")
        if "email" in msg:
            return conflict("Ya existe un estudiante con ese email")
        return conflict("Error de integridad en los datos")
    except Exception as e:
        return server_error(str(e))

@bp.route("/<int:id_estudiante>", methods=["PUT"])
@require_jwt
@require_role("admin")
def actualizar(id_estudiante):
    est = get_or_404(id_estudiante)
    if not est:
        return not_found("Estudiante no encontrado")
 
    data = request.get_json(silent=True) or {}
 
    err = required_fields(data, FIELDS_REQUIRED)
    if err:
        return error(err)
 
    if not valid_email(data["email"]):
        return error("El email no tiene un formato válido")
 
    try:
        execute(
            """UPDATE estudiante
               SET documento=%s, nombre=%s, apellido=%s, email=%s, carrera=%s, facultad=%s
               WHERE id_estudiante=%s""",
            (data["documento"], data["nombre"], data["apellido"],
             data["email"], data["carrera"], data["facultad"], id_estudiante)
        )
        est = query("SELECT * FROM estudiante WHERE id_estudiante = %s", (id_estudiante,), one=True)
        return ok(est, "Estudiante actualizado correctamente")
 
    except mysql.connector.IntegrityError as e:
        msg = str(e)
        if "documento" in msg:
            return conflict("Ya existe un estudiante con ese documento")
        if "email" in msg:
            return conflict("Ya existe un estudiante con ese email")
        return conflict("Error de integridad en los datos")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id_estudiante>", methods=["DELETE"])
@require_jwt
@require_role("admin")
def eliminar(id_estudiante):
    est = get_or_404(id_estudiante)

    if not est:
        return not_found("Estudiante no encontrado")

    try:
        execute(
            "UPDATE estudiante SET activo = 0 WHERE id_estudiante = %s",
            (id_estudiante,)
        )
        return ok(msg="Estudiante eliminado correctamente")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id_estudiante>/inscripciones", methods=["GET"]) #n CONSLUTA ADICIONAL PARA OBTENER LAS INSCRIPCIONES DE UN ESTUDIANTE
@require_jwt
@require_role("admin", "profesor", "estudiante")
def inscripciones_del_estudiante(id_estudiante):
    est = get_or_404(id_estudiante)
    if not est:
        return not_found("Estudiante no encontrado")
 
    rows = query(
        """SELECT i.id_inscripcion, i.estado, i.fecha_inscripcion, i.orden_espera,
                  a.nombre AS actividad, a.dia, a.horario, a.estado AS estado_actividad,
                  d.nombre AS disciplina
             FROM inscripcion i
             JOIN actividad a  ON i.id_actividad  = a.id_actividad
             JOIN disciplina d ON a.id_disciplina = d.id_disciplina
            WHERE i.id_estudiante = %s
            ORDER BY i.fecha_inscripcion DESC""",
        (id_estudiante,)
    )
    return ok(rows)