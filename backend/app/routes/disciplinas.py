from flask import Blueprint, request
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found, conflict, server_error
from app.utils.validators import required_fields
import mysql.connector

bp = Blueprint("disciplinas", __name__)


@bp.route("/", methods=["GET"])
def listar():
    return ok(query("SELECT * FROM disciplina ORDER BY nombre"))


@bp.route("/<int:id>", methods=["GET"])
def obtener(id):
    d = query("SELECT * FROM disciplina WHERE id_disciplina = %s", (id,), one=True)
    if not d:
        return not_found("Disciplina no encontrada")
    return ok(d)


@bp.route("/", methods=["POST"])
def crear():
    data = request.get_json(silent=True) or {}
    err = required_fields(data, ["nombre"])
    if err:
        return error(err)
    try:
        new_id = execute(
            "INSERT INTO disciplina (nombre, descripcion) VALUES (%s, %s)",
            (data["nombre"], data.get("descripcion", ""))
        )
        return created(query("SELECT * FROM disciplina WHERE id_disciplina=%s", (new_id,), one=True))
    except mysql.connector.IntegrityError:
        return conflict("Ya existe una disciplina con ese nombre")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>", methods=["PUT"])
def actualizar(id):
    d = query("SELECT * FROM disciplina WHERE id_disciplina = %s", (id,), one=True)
    if not d:
        return not_found("Disciplina no encontrada")
    data = request.get_json(silent=True) or {}
    err = required_fields(data, ["nombre"])
    if err:
        return error(err)
    try:
        execute(
            "UPDATE disciplina SET nombre=%s, descripcion=%s WHERE id_disciplina=%s",
            (data["nombre"], data.get("descripcion", d["descripcion"]), id)
        )
        return ok(query("SELECT * FROM disciplina WHERE id_disciplina=%s", (id,), one=True))
    except mysql.connector.IntegrityError:
        return conflict("Ya existe una disciplina con ese nombre")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>", methods=["DELETE"])
def eliminar(id):
    d = query("SELECT * FROM disciplina WHERE id_disciplina = %s", (id,), one=True)
    if not d:
        return not_found("Disciplina no encontrada")
    try:
        execute("DELETE FROM disciplina WHERE id_disciplina = %s", (id,))
        return ok(msg="Disciplina eliminada")
    except mysql.connector.IntegrityError:
        return conflict("No se puede eliminar: hay actividades asociadas a esta disciplina")
    except Exception as e:
        return server_error(str(e))