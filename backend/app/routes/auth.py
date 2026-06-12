from flask import Blueprint, request, g
import bcrypt
import jwt
import datetime
from config import Config
from app.db import query
from app.utils.responses import ok, error, not_found
from app.utils.auth import require_jwt 

bp = Blueprint("auth", __name__)


def _make_token(user: dict) -> str:
    payload = {
        "sub": user["id"],
        "username": user["username"],
        "rol": user["rol"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXP_HOURS),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def _user_by_username(username: str):
    return query(
        "SELECT id, username, password_hash, rol, activo FROM usuarios WHERE username = %s",
        (username,),
        one=True,
    )



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

    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return error("Credenciales inválidas", 401)

    token = _make_token(user)
    return ok(
        data={"token": token, "username": user["username"], "rol": user["rol"]},
        msg="Sesión iniciada",
    )


@bp.route("/logout", methods=["POST"])
@require_jwt
def logout():
    return ok(msg="Sesión cerrada")


@bp.route("/me", methods=["GET"])
@require_jwt
def me():
    return ok(
        data={"username": g.current_user["username"], "rol": g.current_user["rol"]},
        msg="OK",
    )