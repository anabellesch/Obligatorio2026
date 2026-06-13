from flask import Flask
from flask_cors import CORS

from app.routes.estudiantes   import bp as estudiantes_bp
from app.routes.disciplinas   import bp as disciplinas_bp
from app.routes.espacios      import bp as espacios_bp
from app.routes.actividades   import bp as actividades_bp
from app.routes.inscripciones import bp as inscripciones_bp
from app.routes.asistencias   import bp as asistencias_bp
from app.routes.reportes      import bp as reportes_bp
from app.routes.auth         import bp as auth_bp 
from app.routes.catalogos import bp as catalogos_bp


def create_app():
    app = Flask(__name__)

    CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"],)

    app.register_blueprint(estudiantes_bp,   url_prefix="/api/estudiantes")
    app.register_blueprint(disciplinas_bp,   url_prefix="/api/disciplinas")
    app.register_blueprint(espacios_bp,      url_prefix="/api/espacios")
    app.register_blueprint(actividades_bp,   url_prefix="/api/actividades")
    app.register_blueprint(inscripciones_bp, url_prefix="/api/inscripciones")
    app.register_blueprint(asistencias_bp,   url_prefix="/api/asistencias")
    app.register_blueprint(reportes_bp,      url_prefix="/api/reportes")
    app.register_blueprint(auth_bp,          url_prefix="/api/auth")
    app.register_blueprint(catalogos_bp,     url_prefix="/api/catalogos")

    @app.route("/api/health")
    def health():
        return {"ok": True, "message": "API funcionando"}

    return app