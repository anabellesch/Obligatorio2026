import client from './client'

export const getActividadesMasInscriptos = () => client.get('/reportes/actividades-mas-inscriptos').then(r => r.data.data)
export const getActividadesConCupo = () => client.get('/reportes/actividades-con-cupo').then(r => r.data.data)
export const getInscriptosPorDisciplina = () => client.get('/reportes/inscriptos-por-disciplina').then(r => r.data.data)
export const getInscriptosPorCarrera = () => client.get('/reportes/inscriptos-por-carrera').then(r => r.data.data)
export const getOcupacionActividades = () => client.get('/reportes/ocupacion-actividades').then(r => r.data.data)
export const getAsistenciaPorActividad = () => client.get('/reportes/asistencia-por-actividad').then(r => r.data.data)
export const getEstudiantesConInasistencias = () => client.get('/reportes/estudiantes-con-inasistencias').then(r => r.data.data)
export const getEstudiantesActivos = () => client.get('/reportes/estudiantes-mas-activos').then(r => r.data.data)
export const getListaEspera = () => client.get('/reportes/lista-de-espera').then(r => r.data.data)