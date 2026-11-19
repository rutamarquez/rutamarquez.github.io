import Icono from './Icono'
import { ir, volver } from '../hooks/useNavegacion'

/** Cuadro con la inicial del negocio (se usa mientras no haya fotos). */
export function Inicial({ nombre, grande = false }) {
  return (
    <div className={grande ? 'inicial inicial--grande' : 'inicial'} aria-hidden="true">
      {nombre.replace(/^(la|el|los|las)\s+/i, '').charAt(0).toUpperCase()}
    </div>
  )
}

export function Chips({ opciones, activa, alCambiar, etiqueta }) {
  return (
    <div className="chips" role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={activa === o}
          className={activa === o ? 'chip chip--activa' : 'chip'}
          onClick={() => alCambiar(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function Buscador({ valor, alCambiar, placeholder, alEnviar }) {
  return (
    <form
      className="buscador"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        alEnviar?.()
      }}
    >
      <Icono nombre="buscar" tamano={18} />
      <input
        type="search"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
      />
    </form>
  )
}

export function BotonVolver({ alternativa = '/', claro = false }) {
  return (
    <button
      type="button"
      className={claro ? 'boton-volver boton-volver--claro' : 'boton-volver'}
      onClick={() => volver(alternativa)}
      aria-label="Volver"
    >
      <Icono nombre="atras" />
    </button>
  )
}

export function Progreso({ hechos, total, claro = false }) {
  return (
    <div
      className={claro ? 'progreso progreso--claro' : 'progreso'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={hechos}
      aria-label={`${hechos} de ${total} sellos`}
    >
      <span style={{ width: `${total ? (100 * hechos) / total : 0}%` }} />
    </div>
  )
}

/** Círculo con el avance (3/6) que aparece en el pasaporte. */
export function Anillo({ hechos, total, tamano = 64 }) {
  const r = 26
  const largo = 2 * Math.PI * r
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 64 64" className="anillo" aria-hidden="true">
      <circle cx="32" cy="32" r={r} className="anillo__fondo" />
      <circle
        cx="32"
        cy="32"
        r={r}
        className="anillo__avance"
        strokeDasharray={largo}
        strokeDashoffset={largo * (1 - (total ? hechos / total : 0))}
      />
      <text x="32" y="33" textAnchor="middle" dominantBaseline="middle">
        {hechos}/{total}
      </text>
    </svg>
  )
}

export function Cargando() {
  return (
    <div className="estado" role="status">
      <div className="girando" />
      <p>Cargando Ruta Márquez…</p>
    </div>
  )
}

export function ErrorCarga({ alReintentar }) {
  return (
    <div className="estado" role="alert">
      <p className="estado__titulo">No pudimos cargar la información</p>
      <p>Revise su conexión. En zonas rurales la señal puede ir y venir.</p>
      <button type="button" className="boton boton--primario" onClick={alReintentar}>
        Reintentar
      </button>
    </div>
  )
}

export function NoEncontrado() {
  return (
    <div className="estado">
      <p className="estado__titulo">Esta página no existe</p>
      <button type="button" className="boton boton--primario" onClick={() => ir('/')}>
        Ir al inicio
      </button>
    </div>
  )
}
