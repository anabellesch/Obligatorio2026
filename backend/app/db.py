import mysql.connector
from mysql.connector import pooling
from config import Config
from datetime import timedelta

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="main_pool",
            pool_size=5,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
        )
    return _pool


def get_connection():
    return get_pool().get_connection()


def _convert_timedeltas(row):
    """Convierte columnas TIME (timedelta) a string 'HH:MM:SS'."""
    for key, value in row.items():
        if isinstance(value, timedelta):
            row[key] = str(value)
    return row


def query(sql: str, params: tuple = (), one: bool = False):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params)
        result = cursor.fetchone() if one else cursor.fetchall()

        if one:
            if result is not None:
                result = _convert_timedeltas(result)
        else:
            result = [_convert_timedeltas(row) for row in result]

        return result
    finally:
        cursor.close()
        conn.close()


def execute(sql: str, params: tuple = ()):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        conn.commit()
        return cursor.lastrowid
    except mysql.connector.Error as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()