import { useState } from 'react'
import Icono from '../components/Icono'
import { BotonVolver, NoEncontrado } from '../components/Comunes'
import { volver } from '../hooks/useNavegacion'
import { ETIQUETAS, publicarResena, resenasActivas } from '../services/resenas'

const PALABRAS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

export default function Resena({ datos, id }) {
  const e = datos.porId.get(Number(id))
  const [calificacion, setCalificacion] = useState(0)
  const [etiquetas, setEtiquetas] = useState([])
  const [texto, setTexto] = useState('')
  const [autor, setAutor] = useState('')
  const [estado, setEstado] = useState('editando') // editando | enviando | enviada | error

  if (!e) return <NoEncontrado />

  async function enviar(evento) {
    evento.preventDefault()
    setEstado('enviando')
    try {
      await publicarResena({ emprendimientoId: e.id, calificacion, etiquetas, texto, autor })
      setEstado('enviada')
    } catch {
      setEstado('error')
    }
  }

  if (estado === 'enviada') {
    return (
      <main className="contenido contenido--centrado">
        <div className="sello-grande">
          <Icono nombre="check" tamano={40} />
        </div>
        <h1 className="titulo-ficha">¡Gracias por tu reseña!</h1>
        <p>Ayudas a que más viajeros conozcan {e.nombre}.</p>
        <button type="button" className="boton boton--primario" onClick={() => volver(`/ficha/${e.id}`)}>
          Volver a la ficha
        </button>
      </main>
    )
  }

  return (
    <>
      <header className="cabecera-simple">
        <BotonVolver alternativa={`/ficha/${e.id}`} />
        <span>{e.nombre}</span>
      </header>
      <main className="contenido">
        <h1 className="titulo-ficha">¿Cómo te fue en tu visita?</h1>
        {!resenasActivas ? (
          <p className="nota">Las reseñas estarán disponibles muy pronto.</p>
        ) : (
          <form className="formulario" onSubmit={enviar}>
            <fieldset className="calificacion">
              <legend className="sr-only">Calificación</legend>
              <div className="calificacion__estrellas">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} estrellas`}
                    aria-pressed={calificacion === n}
                    onClick={() => setCalificacion(n)}
                    className={n <= calificacion ? 'activa' : ''}
                  >
                    <Icono nombre="estrella" tamano={34} relleno={n <= calificacion} />
                  </button>
                ))}
              </div>
              <p className="calificacion__palabra">{PALABRAS[calificacion] || 'Toca las estrellas'}</p>
            </fieldset>

            <fieldset>
              <legend>Lo que más te gustó</legend>
              <div className="chips">
                {ETIQUETAS.map((t) => {
                  const activa = etiquetas.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      className={activa ? 'chip chip--activa' : 'chip'}
                      aria-pressed={activa}
                      onClick={() =>
                        setEtiquetas((lista) => (activa ? lista.filter((x) => x !== t) : [...lista, t]))
                      }
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <label>
              Cuéntale a otros viajeros
              <textarea
                rows={4}
                maxLength={500}
                value={texto}
                onChange={(ev) => setTexto(ev.target.value)}
                placeholder="¿Qué hiciste? ¿Qué recomiendas?"
              />
            </label>
            <label>
              Tu nombre y ciudad
              <input
                maxLength={60}
                value={autor}
                onChange={(ev) => setAutor(ev.target.value)}
                placeholder="Ej.: Laura, Bogotá"
              />
            </label>
            <p className="nota">No necesitas crear una cuenta. Tu reseña será pública.</p>
            {estado === 'error' && (
              <p className="error" role="alert">
                No se pudo publicar. Revise su conexión e intente de nuevo.
              </p>
            )}
            <button
              type="submit"
              className="boton boton--primario boton--ancho"
              disabled={!calificacion || estado === 'enviando'}
            >
              {estado === 'enviando' ? 'Publicando…' : 'Publicar reseña'}
            </button>
          </form>
        )}
      </main>
    </>
  )
}
