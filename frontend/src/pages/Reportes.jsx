import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import * as api from '../api/reportes'

const COLORS = ['#2d7a4f','#3aaa6a','#6ee7a0','#b7f5d0','#f39c12','#e74c3c','#3498db','#9b59b6']

function Section({ title, children }) {
  return (
    <div className="card" style={{marginBottom:20}}>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--gray-100)'}}>{title}</h2>
      {children}
    </div>
  )
}

function SimpleTable({ cols, rows, empty }) {
  if (!rows?.length) return <div className="empty"><p>{empty || 'Sin datos'}</p></div>
  return (
    <div className="table-wrapper">
      <table>
        <thead><tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((r,i) => (
          <tr key={i}>{cols.map(c => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  )
}

export default function Reportes() {
  const [state, setState] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getActividadesMasInscriptos(),
      api.getActividadesConCupo(),
      api.getInscriptosPorDisciplina(),
      api.getInscriptosPorCarrera(),
      api.getOcupacionActividades(),
      api.getAsistenciaPorActividad(),
      api.getEstudiantesConInasistencias(),
      api.getEstudiantesActivos(),
      api.getListaEspera(),
    ]).then(([top, cupo, disciplina, carrera, ocupacion, asistencia, inasistencias, activos, espera]) => {
      setState({ top, cupo, disciplina, carrera, ocupacion, asistencia, inasistencias, activos, espera })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Cargando reportes...</div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Reportes</h1><p>Análisis y estadísticas del sistema</p></div>
      </div>

      {/* 1. Top actividades */}
      <Section title="1. Actividades con más inscriptos confirmados">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={state.top?.slice(0,8)} margin={{left:-10}}>
            <XAxis dataKey="nombre" tick={{fontSize:11}} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{fontSize:11}} />
            <Tooltip />
            <Bar dataKey="total_confirmados" fill="#2d7a4f" radius={[4,4,0,0]} name="Inscriptos" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* 2. Cupos disponibles */}
      <Section title="2. Actividades con cupos disponibles">
        <SimpleTable
          rows={state.cupo}
          cols={[
            { key:'nombre', label:'Actividad' },
            { key:'disciplina', label:'Disciplina' },
            { key:'dia', label:'Día' },
            { key:'confirmados', label:'Inscriptos' },
            { key:'cupo_maximo', label:'Cupo máx.' },
            { key:'cupos_disponibles', label:'Disponibles', render: r => <strong style={{color:'var(--green)'}}>{r.cupos_disponibles}</strong> },
          ]}
          empty="No hay actividades con cupo disponible"
        />
      </Section>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* 3. Por disciplina */}
        <div className="card">
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>3. Inscriptos por disciplina</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={state.disciplina} dataKey="total_inscriptos" nameKey="disciplina" cx="50%" cy="50%" outerRadius={80} label={({disciplina,percent})=>`${disciplina} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {state.disciplina?.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Por carrera */}
        <div className="card">
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>4. Inscriptos por carrera</h2>
          <SimpleTable
            rows={state.carrera?.slice(0,6)}
            cols={[
              { key:'carrera', label:'Carrera' },
              { key:'facultad', label:'Facultad' },
              { key:'total_inscriptos', label:'Total', render: r => <strong>{r.total_inscriptos}</strong> },
            ]}
          />
        </div>
      </div>

      {/* 5. Ocupación */}
      <Section title="5. Porcentaje de ocupación por actividad">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Actividad</th><th>Disciplina</th><th>Confirmados / Cupo</th><th style={{width:160}}>Ocupación</th></tr></thead>
            <tbody>
              {state.ocupacion?.map((a,i) => {
                const pct = a.pct_ocupacion || 0
                const cls = pct >= 90 ? 'danger' : pct >= 60 ? 'warning' : ''
                return (
                  <tr key={i}>
                    <td><strong>{a.nombre}</strong></td>
                    <td>{a.disciplina}</td>
                    <td>{a.confirmados} / {a.cupo_maximo}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="progress-bar" style={{flex:1}}>
                          <div className={`progress-fill ${cls}`} style={{width:`${pct}%`}} />
                        </div>
                        <span style={{fontSize:12,fontWeight:600,minWidth:36}}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 6. Asistencia */}
      <Section title="6. Porcentaje de asistencia por actividad">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={state.asistencia} margin={{left:-10}}>
            <XAxis dataKey="nombre" tick={{fontSize:11}} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{fontSize:11}} domain={[0,100]} tickFormatter={v=>`${v}%`} />
            <Tooltip formatter={v=>`${v}%`} />
            <Bar dataKey="pct_asistencia" fill="#3aaa6a" radius={[4,4,0,0]} name="% Asistencia" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* 7. Inasistencias */}
      <Section title="7. Estudiantes con 3 o más inasistencias">
        <SimpleTable
          rows={state.inasistencias}
          cols={[
            { key:'nombre', label:'Nombre', render:r=><strong>{r.apellido}, {r.nombre}</strong> },
            { key:'documento', label:'Documento' },
            { key:'carrera', label:'Carrera' },
            { key:'actividad', label:'Actividad' },
            { key:'inasistencias', label:'Inasistencias', render:r=><span style={{color:'var(--red)',fontWeight:700}}>{r.inasistencias}</span> },
          ]}
          empty="¡Ningún estudiante tiene 3 o más inasistencias!"
        />
      </Section>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* 8a. Más activos */}
        <div className="card">
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>8a. Estudiantes más activos</h2>
          <SimpleTable
            rows={state.activos}
            cols={[
              { key:'nombre', label:'Estudiante', render:r=>`${r.apellido}, ${r.nombre}` },
              { key:'carrera', label:'Carrera' },
              { key:'actividades_confirmadas', label:'Actividades', render:r=><strong style={{color:'var(--green)'}}>{r.actividades_confirmadas}</strong> },
            ]}
          />
        </div>

        {/* 8b. Lista de espera */}
        <div className="card">
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>8b. Lista de espera</h2>
          <SimpleTable
            rows={state.espera}
            cols={[
              { key:'actividad', label:'Actividad' },
              { key:'cupo_maximo', label:'Cupo' },
              { key:'en_lista_espera', label:'En espera', render:r=><strong style={{color:'var(--yellow)'}}>{r.en_lista_espera}</strong> },
            ]}
            empty="No hay actividades con lista de espera"
          />
        </div>
      </div>
    </div>
  )
}