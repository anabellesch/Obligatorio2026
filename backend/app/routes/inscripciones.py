from flask import Blueprint, request
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found, conflict, server_error
from app.utils.validators import required_fields
import mysql.connector
from app.utils.auth import require_jwt
from app.utils.auth import require_role

bp = Blueprint("inscripciones", __name__)


@bp.route("/", methods=["GET"])
@require_jwt
@require_role("admin", "profesor", "estudiante")
def listar():
    """Lista inscripciones con filtros opcionales: ?id_actividad=X o ?id_estudiante=X"""
    id_actividad  = request.args.get("id_actividad")
    id_estudiante = request.args.get("id_estudiante")
    estado        = request.args.get("estado")

    sql = """
        SELECT i.*,
               e.nombre AS estudiante_nombre, e.apellido AS estudiante_apellido, e.documento,
               a.nombre AS actividad_nombre, a.dia, a.horario,
               d.nombre AS disciplina
          FROM inscripcion i
          JOIN estudiante e ON i.id_estudiante = e.id_estudiante
          JOIN actividad  a ON i.id_actividad  = a.id_actividad
          JOIN disciplina d ON a.id_disciplina = d.id_disciplina
         WHERE 1=1
    """
    params = []
    if id_actividad:
        sql += " AND i.id_actividad = %s"
        params.append(id_actividad)
    if id_estudiante:
        sql += " AND i.id_estudiante = %s"
        params.append(id_estudiante)
    if estado:
        sql += " AND i.estado = %s"
        params.append(estado)

    sql += " ORDER BY i.fecha_inscripcion DESC"
    return ok(query(sql, tuple(params)))


@bp.route("/<int:id>", methods=["GET"])
@require_jwt
@require_role("admin", "profesor", "estudiante")
def obtener(id):
    ins = query(
        """SELECT i.*,
                  e.nombre AS estudiante_nombre, e.apellido AS estudiante_apellido,
                  a.nombre AS actividad_nombre
             FROM inscripcion i
             JOIN estudiante e ON i.id_estudiante = e.id_estudiante
             JOIN actividad  a ON i.id_actividad  = a.id_actividad
            WHERE i.id_inscripcion = %s""",
        (id,), one=True
    )
    if not ins:
        return not_found("Inscripción no encontrada")
    return ok(ins)


@bp.route("/", methods=["POST"])
@require_jwt
@require_role("admin", "estudiante")
def inscribir():
    """
    Reglas de negocio aplicadas en el trigger de BD:
      RN1/RN6 - actividad debe estar abierta
      RN2/RN3 - cupo: confirmada o en_espera
      RN4     - unique (id_estudiante, id_actividad)
    El backend valida los datos antes de llegar a la BD.
    """
    data = request.get_json(silent=True) or {}
    err = required_fields(data, ["id_estudiante", "id_actividad"])
    if err:
        return error(err)

    est = query(
        "SELECT id_estudiante FROM estudiante WHERE id_estudiante=%s AND activo=1",
        (data["id_estudiante"],), one=True
    )
    if not est:
        return not_found("Estudiante no encontrado")

    act = query("SELECT * FROM actividad WHERE id_actividad=%s", (data["id_actividad"],), one=True)
    if not act:
        return not_found("Actividad no encontrada")

    if act["estado"] != "abierta":
        return error(f"No se puede inscribir: la actividad está '{act['estado']}'", 422)

   
    existe = query(
        "SELECT id_inscripcion FROM inscripcion WHERE id_estudiante=%s AND id_actividad=%s",
        (data["id_estudiante"], data["id_actividad"]), one=True
    )
    if existe:
        return conflict("El estudiante ya está inscripto en esta actividad")

    try:
        
        new_id = execute(
            """INSERT INTO inscripcion (id_estudiante, id_actividad)
               VALUES (%s, %s)""",
            (data["id_estudiante"], data["id_actividad"])
        )
        ins = query(
            """SELECT i.*,
                      e.nombre AS estudiante_nombre, e.apellido AS estudiante_apellido,
                      a.nombre AS actividad_nombre
                 FROM inscripcion i
                 JOIN estudiante e ON i.id_estudiante = e.id_estudiante
                 JOIN actividad  a ON i.id_actividad  = a.id_actividad
                WHERE i.id_inscripcion = %s""",
            (new_id,), one=True
        )
        msg = "Inscripción confirmada" if ins["estado"] == "confirmada" else "Inscripción en lista de espera"
        return created(ins, msg)

    except mysql.connector.Error as e:
        
        return error(str(e), 422)
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>", methods=["DELETE"])
@require_jwt
@require_role("admin", "estudiante")
def cancelar(id):
    """Cancela una inscripción (baja lógica cambiando estado a 'cancelada')."""
    ins = query("SELECT * FROM inscripcion WHERE id_inscripcion = %s", (id,), one=True)
    if not ins:
        return not_found("Inscripción no encontrada")

    if ins["estado"] == "cancelada":
        return conflict("La inscripción ya está cancelada")

    execute(
        "UPDATE inscripcion SET estado='cancelada' WHERE id_inscripcion=%s", (id,)
    )
    return ok(msg="Inscripción cancelada correctamente")