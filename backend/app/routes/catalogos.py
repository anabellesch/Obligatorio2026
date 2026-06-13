from flask import Blueprint
from app.db import get_connection, query, execute
from app.utils.responses import ok
from app.utils.auth import require_jwt

bp = Blueprint("catalogos", __name__, url_prefix="/catalogos")

@bp.route("/carreras", methods=["GET"])
@require_jwt
def carreras():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT DISTINCT carrera
            FROM estudiante
            ORDER BY carrera
        """)

        return ok(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()


@bp.route("/facultades", methods=["GET"])
@require_jwt
def facultades():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT DISTINCT facultad
            FROM estudiante
            ORDER BY facultad
        """)

        return ok(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()