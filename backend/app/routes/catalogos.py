from flask import Blueprint
import mysql.connector
from app.utils.responses import ok
from app.utils.auth import require_jwt
from app.db import get_connection

bp = Blueprint("catalogos", __name__)

@bp.route("/carreras", methods=["GET"])
@require_jwt
def carreras():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT DISTINCT carrera
        FROM estudiante
        ORDER BY carrera
    """)

    return ok(cur.fetchall())


@bp.route("/facultades", methods=["GET"])
@require_jwt
def facultades():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT DISTINCT facultad
        FROM estudiante
        ORDER BY facultad
    """)

    return ok(cur.fetchall())