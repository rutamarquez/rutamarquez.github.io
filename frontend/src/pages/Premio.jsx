import Icono from '../components/Icono'
import { BotonVolver } from '../components/Comunes'
import { usePasaporte } from '../hooks/usePasaporte'

export default function Premio({ datos }) {
  const ruta = datos.rutas[0]
  const { premio, faltan, total } = usePasaporte(ruta)

  if (!premio) {
    return (
      <main className="contenido contenido--centrado">
        <BotonVolver alternativa="/sellos" />
        <div className="sello-grande sello-grande--bloqueado">
          <Icono nombre="regalo" tamano={40} />
        </div>
        <h1 className="titulo-ficha">Aún no tienes el premio</h1>
        <p>
          Te {faltan === 1 ? 'falta' : 'faltan'} {faltan} de {total} paradas. Cuando las completes, aquí aparecerá
          tu código para reclamar el {ruta.premio.nombre}.
        </p>
        <a className="boton boton--primario" href="#/ruta">
          Ver la ruta
        </a>
      </main>
    )
  }

  async function compartir() {
    const texto = `¡Completé la ${ruta.nombre} de Ruta Márquez! ${ruta.paradas.length} emprendimientos rurales en ${ruta.municipios.join(', ')}, Boyacá.`
    const url = window.location.href.split('#')[0]
    try {
      if (navigator.share) await navigator.share({ title: 'Ruta Márquez', text: texto, url })
      else window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank')
    } catch {
      /* el usuario canceló */
    }
  }

  return (
    <div className="pantalla-premio">
      <BotonVolver alternativa="/sellos" claro />
      <div className="medalla">
        <small>{ruta.nombre}</small>
        <strong>
          {total}/{total}
        </strong>
        <em>Márquez</em>
      </div>
      <h1>¡Completaste la ruta!</h1>
      <p>
        Visitaste {total} emprendimientos en {ruta.municipios.join(', ').replace(/, ([^,]*)$/, ' y $1')}. Este es tu
        premio.
      </p>

      <section className="caja caja--premio">
        <h2>{ruta.premio.nombre}</h2>
        <ul className="puntos">
          {ruta.premio.incluye.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <div className="codigo-premio">
          <small>Tu código</small>
          <strong>{premio.codigo}</strong>
        </div>
        <p className="nota">
          Muéstralo en el {ruta.premio.lugar_reclamo.charAt(0).toLowerCase() + ruta.premio.lugar_reclamo.slice(1)}{' '}
          para reclamar el kit.
        </p>
      </section>

      <button type="button" className="boton boton--mostaza boton--ancho" onClick={compartir}>
        <Icono nombre="compartir" tamano={18} /> Compartir mi logro
      </button>
      <a className="enlace enlace--claro" href="#/directorio">
        Descubrir más emprendimientos
      </a>
    </div>
  )
}
