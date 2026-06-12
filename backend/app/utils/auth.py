from functools import wraps
from flask import request, g, jsonify
import jwt
from config import Config


def _extract_token() -> str | None:
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[7:]
    return None


def require_jwt(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"ok": False, "message": "Token requerido"}), 401

        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"ok": False, "message": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"ok": False, "message": "Token inválido"}), 401

        g.current_user = payload
        return fn(*args, **kwargs)

    return wrapper


def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if g.current_user.get("rol") not in roles:
                return jsonify({"ok": False, "message": "Acceso denegado"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator