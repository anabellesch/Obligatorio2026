from flask import Blueprint, request
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found, conflict, server_error
from app.utils.validators import required_fields
import mysql.connector
from app.utils.auth import require_jwt
from app.utils.auth import require_role

bp = Blueprint("asistencias", __name__)


@bp.route("/", methods=["GET"])
@require_jwt
@require_role("admin", "profesor")
def listar():
    """Filtros opcionales: ?id_inscripcion=X o ?id_actividad=X&fecha=YYYY-MM-DD"""
    id_inscripcion = request.args.get("id_inscripcion")
    id_actividad   = request.args.get("id_actividad")
    fecha          = request.args.get("fecha")

    sql = """
        SELECT asis.*,
               e.nombre AS estudiante_nombre, e.apellido AS estudiante_apellido,
               a.nombre AS actividad_nombre
          FROM asistencia asis
          JOIN inscripcion i ON asis.id_inscripcion = i.id_inscripcion
          JOIN estudiante  e ON i.id_estudiante     = e.id_estudiante
          JOIN actividad   a ON i.id_actividad      = a.id_actividad
         WHERE 1=1
    """
    params = []
    if id_inscripcion:
        sql += " AND asis.id_inscripcion = %s"
        params.append(id_inscripcion)
    if id_actividad:
        sql += " AND i.id_actividad = %s"
        params.append(id_actividad)
    if fecha:
        sql += " AND asis.fecha = %s"
        params.append(fecha)

    sql += " ORDER BY asis.fecha DESC, e.apellido"
    return ok(query(sql, tuple(params)))


@bp.route("/", methods=["POST"])
@require_jwt
@require_role("admin", "profesor")
def registrar():
    """
    Registra asistencia para un estudiante confirmado.
    RN5 aplicada también en el trigger de BD.
    Acepta tanto un registro individual como un lote (lista).
    """
    data = request.get_json(silent=True) or {}

    registros = data.get("registros")
    if registros is None:
  
        registros = [data]

    err = required_fields(registros[0], ["id_inscripcion", "fecha"])
    if err:
        return error(err)

    resultados = []
    errores    = []

    for reg in registros:
        id_ins  = reg.get("id_inscripcion")
        fecha   = reg.get("fecha")
        presente = 1 if reg.get("presente", True) else 0

    
        ins = query(
            "SELECT estado FROM inscripcion WHERE id_inscripcion = %s", (id_ins,), one=True
        )
        if not ins:
            errores.append({"id_inscripcion": id_ins, "error": "Inscripción no encontrada"})
            continue
        if ins["estado"] != "confirmada":
            errores.append({"id_inscripcion": id_ins, "error": "Solo se registra asistencia de inscripciones confirmadas"})
            continue

        try:
            new_id = execute(
                "INSERT INTO asistencia (id_inscripcion, fecha, presente) VALUES (%s, %s, %s)",
                (id_ins, fecha, presente)
            )
            resultados.append({"id_asistencia": new_id, "id_inscripcion": id_ins, "fecha": fecha, "presente": bool(presente)})
        except mysql.connector.IntegrityError:

            execute(
                "UPDATE asistencia SET presente=%s WHERE id_inscripcion=%s AND fecha=%s",
                (presente, id_ins, fecha)
            )
            resultados.append({"id_inscripcion": id_ins, "fecha": fecha, "presente": bool(presente), "actualizado": True})
        except mysql.connector.Error as e:
            errores.append({"id_inscripcion": id_ins, "error": str(e)})

    if errores and not resultados:
        return error(errores[0]["error"], 422)

    return created({"registrados": resultados, "errores": errores},
                   f"{len(resultados)} asistencia(s) registrada(s)")


@bp.route("/<int:id>", methods=["PUT"])
@require_jwt
@require_role("admin", "profesor")
def actualizar(id):
    asis = query("SELECT * FROM asistencia WHERE id_asistencia = %s", (id,), one=True)
    if not asis:
        return not_found("Registro de asistencia no encontrado")

    data = request.get_json(silent=True) or {}
    presente = 1 if data.get("presente", True) else 0
    execute("UPDATE asistencia SET presente=%s WHERE id_asistencia=%s", (presente, id))
    return ok(msg="Asistencia actualizada")


@bp.route("/<int:id>", methods=["DELETE"])
@require_jwt
@require_role("admin", "profesor")
def eliminar(id):
    asis = query("SELECT * FROM asistencia WHERE id_asistencia = %s", (id,), one=True)
    if not asis:
        return not_found("Registro de asistencia no encontrado")
    execute("DELETE FROM asistencia WHERE id_asistencia = %s", (id,))
    return ok(msg="Registro eliminado")