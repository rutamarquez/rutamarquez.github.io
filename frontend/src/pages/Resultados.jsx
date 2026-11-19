import { BotonVolver } from '../components/Comunes'

function BarraIndicador({ indicador, total }) {
  return (
    <article className="indicador">
      <div className="indicador__cifra">
        <strong>{indicador.sin}</strong>
        <span>de {total}</span>
      </div>
      <div className="indicador__texto">
        <h3>{indicador.titulo}</h3>
        <p>{indicador.descripcion}</p>
        <div
          className="barra-dato"
          role="img"
          aria-label={`${indicador.porcentajeSin} % sin ${indicador.titulo}`}
        >
          <span style={{ width: `${indicador.porcentajeSin}%` }} />
        </div>
        <p className="indicador__porcentaje">{indicador.porcentajeSin} %</p>
      </div>
    </article>
  )
}

function Pruebas({ pruebas }) {
  if (!pruebas.disponible) {
    return (
      <p className="nota">
        Los resultados se publicarán después de las jornadas de prueba con emprendedores y visitantes.
      </p>
    )
  }
  const { tareas_guiadas: tareas, encuesta_emprendedores: encuesta } = pruebas
  return (
    <>
      <h3 className="subtitulo">Tareas guiadas ({tareas.participantes} participantes)</h3>
      <ul className="lista-datos">
        {tareas.tareas.map((t) => (
          <li key={t.tarea}>
            <span>{t.tarea}</span>
            <strong>
              {t.completaron} de {tareas.participantes}
            </strong>
          </li>
        ))}
      </ul>
      <h3 className="subtitulo">Encuesta a emprendedores ({encuesta.participantes} participantes)</h3>
      <ul className="lista-datos">
        <li>
          <span>Encuentran clara la información de su negocio</span>
          <strong>{encuesta.informacion_clara_pct} %</strong>
        </li>
        <li>
          <span>Creen que sirve para atraer visitantes</span>
          <strong>{encuesta.util_para_atraer_visitantes_pct} %</strong>
        </li>
      </ul>
    </>
  )
}

export default function Resultados({ datos }) {
  const d = datos.diagnostico
  const maximo = Math.max(...d.porMunicipio.map((m) => m.total))
  return (
    <>
      <header className="cabecera-simple">
        <BotonVolver />
        <span>Resultados</span>
      </header>
      <main className="contenido">
        <h1 className="titulo-ficha">Diagnóstico de visibilidad digital</h1>
        <p className="descripcion">
          Se encuestó a {d.totalEmprendimientos} emprendimientos turísticos de {d.totalMunicipios} municipios de
          la Provincia de Márquez y zonas cercanas. Estos son los resultados que dieron origen a Ruta Márquez.
        </p>

        <section className="indicadores" aria-label="Indicadores">
          {d.indicadores.map((i) => (
            <BarraIndicador key={i.titulo} indicador={i} total={d.totalEmprendimientos} />
          ))}
        </section>

        <section>
          <h2 className="titulo-seccion">Emprendimientos por municipio</h2>
          <ul className="barras-municipio">
            {d.porMunicipio.map((m) => (
              <li key={m.municipio}>
                <span>{m.municipio}</span>
                <div className="barra-dato barra-dato--verde">
                  <span style={{ width: `${(100 * m.total) / maximo}%` }} />
                </div>
                <strong>{m.total}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="titulo-seccion">Resultados de las pruebas del prototipo</h2>
          <Pruebas pruebas={d.pruebas} />
        </section>

        <p className="nota nota--centrada">
          Fuente: encuesta "Queremos conocer tu emprendimiento", Prácticas de Responsabilidad Social, 2026. Datos
          actualizados el {new Date(`${d.actualizado}T12:00:00`).toLocaleDateString('es-CO', { dateStyle: 'long' })}.
        </p>
      </main>
    </>
  )
}
