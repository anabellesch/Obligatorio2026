USE actividades_deportivas; 

/**
DELIMITER $$

CREATE TRIGGER trg_validad_actividad_abierta
BEFORE INSERT ON inscripcion
FOR EACH ROW
BEGIN
    DECLARE estadoActividad VARCHAR(20);
    
    SELECT estado
    INTO estadoActividad
    FROM actividad
    WHERE id_actividad O NEW.id_actividad;

    IF estadoActividad <> 'abierta' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La actividad no acepta nuevas inscripciones';
    END IF;

END$$
DELIMITER;

DELIMITER $$
**/

CREATE TRIGGER trg_controlar_cupo
BEFORE INSERT ON inscripcion
FOR EACH ROW
BEGIN
    DECLARE cupo INT;
    DECLARE cantidad_confirmados INT;
    DECLARE siguiente_espera INT;

    SELECT cupo_maximo
    INTO cupo
    FROM actividad
    WHERE id_actividad = NEW.id_actividad;

    SELECT COUNT(*)
    INTO cantidad_confirmados
    FROM inscripcion
    WHERE id_actividad = NEW.id_actividad
    AND estado = 'confirmada';

    IF cantidad_confirmados >= cupo THEN

        SET NEW.estado = 'en_espera';

        SELECT COALESCE(MAX(orden_espera),0)+1
        INTO siguiente_espera
        FROM inscripcion
        WHERE id_actividad = NEW.id_actividad
        AND estado='en_espera';

        SET NEW.orden_espera = siguiente_espera;

    ELSE

        SET NEW.estado='confirmada';
        SET NEW.orden_espera=NULL;

    END IF;

END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_validar_asistencia
BEFORE INSERT ON asistencia
FOR EACH ROW
BEGIN

    DECLARE estadoInscripcion VARCHAR(20);

    SELECT estado
    INTO estadoInscripcion
    FROM inscripcion
    WHERE id_inscripcion = NEW.id_inscripcion;

    IF estadoInscripcion <> 'confirmada' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'Solo se puede registrar asistencia de inscripciones confirmadas';
    END IF;

END$$

DELIMITER ;


