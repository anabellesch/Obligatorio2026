from flask import Blueprint, request
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found, conflict, server_error
from app.utils.validators import required_fields
import mysql.connector
from app.utils.auth import require_jwt
from app.utils.auth import require_role

bp = Blueprint("espacios", __name__)


@bp.route("/", methods=["GET"])
@require_jwt
@require_role("admin", "profesor", "estudiante")
def listar():
    return ok(query("SELECT * FROM espacio_deportivo ORDER BY nombre"))


@bp.route("/<int:id>", methods=["GET"])
@require_jwt
@require_role("admin", "profesor", "estudiante")
def obtener(id):
    e = query("SELECT * FROM espacio_deportivo WHERE id_espacio = %s", (id,), one=True)
    if not e:
        return not_found("Espacio no encontrado")
    return ok(e)


@bp.route("/", methods=["POST"])
@require_jwt
@require_role("admin")
def crear():
    data = request.get_json(silent=True) or {}
    err = required_fields(data, ["nombre"])
    if err:
        return error(err)
    try:
        new_id = execute(
            "INSERT INTO espacio_deportivo (nombre, ubicacion, capacidad) VALUES (%s, %s, %s)",
            (data["nombre"], data.get("ubicacion", ""), data.get("capacidad"))
        )
        return created(query("SELECT * FROM espacio_deportivo WHERE id_espacio=%s", (new_id,), one=True))
    except mysql.connector.IntegrityError:
        return conflict("Ya existe un espacio con ese nombre")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>", methods=["PUT"])
@require_jwt
@require_role("admin")
def actualizar(id):
    e = query("SELECT * FROM espacio_deportivo WHERE id_espacio = %s", (id,), one=True)
    if not e:
        return not_found("Espacio no encontrado")
    data = request.get_json(silent=True) or {}
    err = required_fields(data, ["nombre"])
    if err:
        return error(err)
    try:
        execute(
            "UPDATE espacio_deportivo SET nombre=%s, ubicacion=%s, capacidad=%s WHERE id_espacio=%s",
            (data["nombre"], data.get("ubicacion", e["ubicacion"]), data.get("capacidad", e["capacidad"]), id)
        )
        return ok(query("SELECT * FROM espacio_deportivo WHERE id_espacio=%s", (id,), one=True))
    except mysql.connector.IntegrityError:
        return conflict("Ya existe un espacio con ese nombre")
    except Exception as e:
        return server_error(str(e))


@bp.route("/<int:id>", methods=["DELETE"])
@require_jwt
@require_role("admin")
def eliminar(id):
    e = query("SELECT * FROM espacio_deportivo WHERE id_espacio = %s", (id,), one=True)
    if not e:
        return not_found("Espacio no encontrado")
    try:
        execute("DELETE FROM espacio_deportivo WHERE id_espacio = %s", (id,))
        return ok(msg="Espacio eliminado")
    except mysql.connector.IntegrityError:
        return conflict("No se puede eliminar: hay actividades asociadas a este espacio")
    except Exception as e:
        return server_error(str(e))