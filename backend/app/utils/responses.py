from flask import jsonify


def ok(data=None, msg="OK", status=200):
    body = {"ok": True, "message": msg}
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def created(data=None, msg="Creado correctamente"):
    return ok(data, msg, 201)


def error(msg="Error interno", status=400):
    return jsonify({"ok": False, "message": msg}), status


def not_found(msg="Recurso no encontrado"):
    return error(msg, 404)


def conflict(msg="Conflicto"):
    return error(msg, 409)


def server_error(msg="Error interno del servidor"):
    return error(msg, 500)