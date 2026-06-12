import re


def required_fields(data: dict, fields: list) -> str | None:
    """Devuelve mensaje de error si falta algún campo, None si todo ok."""
    missing = [f for f in fields if not data.get(f) and data.get(f) != 0]
    if missing:
        return f"Campos requeridos faltantes: {', '.join(missing)}"
    return None


def valid_email(email: str) -> bool:
    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    return bool(re.match(pattern, email))


def valid_time(t: str) -> bool:
    """Valida formato HH:MM o HH:MM:SS"""
    pattern = r"^\d{2}:\d{2}(:\d{2})?$"
    return bool(re.match(pattern, t))


ESTADOS_ACTIVIDAD = {"abierta", "cerrada", "finalizada", "cancelada"}
DIAS_SEMANA = {"Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"}