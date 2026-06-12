from flask import Blueprint, request, g
import bcrypt
import jwt
import datetime
from config import Config
from app.db import query
from app.utils.responses import ok, error, not_found
from app.utils.auth import require_jwt 
from app.db import query, execute
from app.utils.responses import ok, created, error, not_found

bp = Blueprint("auth", __name__)

PUBLIC_ROLES = {"profesor", "estudiante"}
def _make_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "rol": user["rol"],
        "id_estudiante": user.get("id_estudiante"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXP_HOURS),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def _user_by_username(username: str):
    return query(
        "SELECT id, username, password_hash, rol, activo, id_estudiante FROM usuarios WHERE username = %s",
        (username,),
        one=True,
    )


def _get_permisos(rol : str):
    rows = query(
        "SELECT seccion, puede_ver, puede_modificar FROM permisos WHERE rol = %s",
        (rol,),
    )
    return {r["seccion"]: {"ver": bool(r["puede_ver"]), "modificar": bool(r["puede_modificar"])} for r in rows}


@bp.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = (body.get("password") or "").strip()

    if not username or not password:
        return error("Usuario y contraseña son obligatorios", 400)

    user = _user_by_username(username)
    if not user or not user["activo"]:
        return error("Credenciales inválidas", 401)

    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode('utf-8')):
        return error("Credenciales inválidas", 401)

    permisos = _get_permisos(user["rol"])
    token = _make_token(user)
    return ok(
        data={"token": token, "username": user["username"], "rol": user["rol"], "id_estudiante": user.get("id_estudiante"), "permisos": permisos,},
        msg="Sesión iniciada",
    )


@bp.route("/logout", methods=["POST"])
@require_jwt
def logout():
    return ok(msg="Sesión cerrada")


@bp.route("/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = (body.get("password") or "").strip()
    rol = (body.get("rol") or "usuario").strip()
    id_estudiante = body.get("id_estudiante")

    if not username or not password:
        return error("Usuario y contraseña son obligatorios", 400)

    if rol not in PUBLIC_ROLES:
        return error("Rol no permitido", 400)

    existing = _user_by_username(username)
    if existing:
        return error("El usuario ya existe", 409)

    if rol == "estudiante" and id_estudiante:
        if not id_estudiante:
            return error("Debe indicar el ID de estudiante", 400)

        est = query("SELECT id_estudiante FROM estudiante WHERE id_estudiante = %s AND activo = 1", (id_estudiante,), one=True)
        if not est:
            return error("El estudiante no existe o no está activo", 400)

    ya_vinculado = query(
        "SELECT id FROM usuarios WHERE id_estudiante = %s",
        (id_estudiante,),
        one=True,
    )
    if ya_vinculado:
        return error("El estudiante ya tiene un usuario asociado", 409)

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    new_id = execute ("""INSERT INTO usuarios (username, password_hash, rol, activo, id_estudiante) VALUES (%s, %s, %s, 1, %s)""",
        (username, password_hash, rol, id_estudiante if rol == "estudiante" else None)
    )

    return created (data={"id": new_id, "username": username, "rol": rol}, msg="Usuario creado")

@bp.route("/me", methods=["GET"])
@require_jwt
def me():
    permisos = _get_permisos(g.current_user["rol"])
    return ok(
        data={"username": g.current_user["username"], "rol": g.current_user["rol"], "permisos": permisos},
    )

@bp.route("/permisos", methods=["GET"])
@require_jwt
def permisos():
    permisos = _get_permisos(g.current_user["rol"])
    return ok(data=permisos)

@bp.route("/usuarios", methods=["GET"])
@require_jwt
def list_users():
    rows = query("SELECT id, username, rol, id_estudiante, activo, creado_en FROM usuarios ORDER BY id")
    return ok(data=rows)


@bp.route("/usuarios/<int:uid>", methods=["PUT"])
@require_jwt
def update_user(uid):

    body = request.get_json(silent=True) or {}
    activo = (body.get("activo"))
    rol = body.get("rol")

    if activo is None and rol is None:
        return error("NAda que actualizar", 400)

    if rol and rol not in ("admin", "profesor", "estudiante"):
        return error("Rol no válido", 400)

    if activo is not None:
        execute("UPDATE usuarios SET activo = %s WHERE id = %s", (int(bool(activo)), uid))
    
    if rol: 
        execute("UPDATE usuarios SET rol = %s WHERE id = %s", (rol, uid))

    return ok(msg="Usuario actualizado")


