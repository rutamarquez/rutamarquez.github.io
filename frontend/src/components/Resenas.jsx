import { useEffect, useState } from 'react'
import Icono from './Icono'
import { leerResenas, resenasActivas, resumen } from '../services/resenas'

function Estrellas({ valor, tamano = 14 }) {
  return (
    <span className="estrellas" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icono key={n} nombre="estrella" tamano={tamano} relleno={n <= Math.round(valor)} />
      ))}
    </span>
  )
}

export default function Resenas({ emprendimiento }) {
  const [resenas, setResenas] = useState(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    if (!resenasActivas) return
    let vigente = true
    leerResenas(emprendimiento.id)
      .then((r) => vigente && setResenas(r))
      .catch(() => vigente && setFallo(true))
    return () => {
      vigente = false
    }
  }, [emprendimiento.id])

  if (!resenasActivas) {
    return (
      <section className="resenas">
        <h2 className="titulo-seccion">Reseñas</h2>
        <p className="nota">Muy pronto podrás dejar tu reseña de este lugar.</p>
      </section>
    )
  }

  const total = resenas && resumen(resenas)
  return (
    <section className="resenas" aria-labelledby="titulo-resenas">
      <div className="resenas__encabezado">
        <h2 className="titulo-seccion" id="titulo-resenas">
          Reseñas
        </h2>
        {total && (
          <span className="resenas__promedio">
            <Icono nombre="estrella" tamano={16} relleno /> {total.promedio} · {total.total}{' '}
            {total.total === 1 ? 'reseña' : 'reseñas'}
          </span>
        )}
      </div>
      {fallo && <p className="nota">No se pudieron cargar las reseñas. Revise su conexión.</p>}
      {resenas?.length === 0 && <p className="nota">Todavía no hay reseñas. ¡Sé el primero!</p>}
      {resenas?.slice(0, 5).map((r) => (
        <article key={r.id} className="resena">
          <Estrellas valor={r.calificacion} />
          {r.texto && <p>{r.texto}</p>}
          {r.etiquetas?.length > 0 && <p className="resena__etiquetas">{r.etiquetas.join(' · ')}</p>}
          <p className="resena__autor">{r.autor || 'Visitante'}</p>
        </article>
      ))}
      <a className="boton boton--secundario" href={`#/resena/${emprendimiento.id}`}>
        Dejar una reseña
      </a>
    </section>
  )
}
