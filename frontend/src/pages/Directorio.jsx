import { useMemo, useState } from 'react'
import { Buscador, Chips } from '../components/Comunes'
import TarjetaEmprendimiento from '../components/TarjetaEmprendimiento'
import { CATEGORIAS, normalizar } from '../services/datos'

const TODOS = 'Todos'

export default function Directorio({ datos, params }) {
  const { emprendimientos, paradaDe } = datos
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const [categoria, setCategoria] = useState(params.get('cat') ?? TODOS)

  const resultado = useMemo(() => {
    const buscado = normalizar(texto.trim())
    return emprendimientos
      .filter((e) => categoria === TODOS || e.categorias.includes(categoria))
      .filter(
        (e) =>
          !buscado ||
          normalizar(`${e.nombre} ${e.municipio} ${e.vereda ?? ''} ${e.descripcion}`).includes(buscado),
      )
      .sort(
        (a, b) =>
          // Primero las paradas de la ruta (en su orden), después los de la provincia
          // y al final los cercanos.
          (paradaDe.get(a.id)?.parada.numero ?? 99) - (paradaDe.get(b.id)?.parada.numero ?? 99) ||
          Number(b.provinciaMarquez) - Number(a.provinciaMarquez) ||
          a.municipio.localeCompare(b.municipio) ||
          a.nombre.localeCompare(b.nombre),
      )
  }, [emprendimientos, paradaDe, texto, categoria])

  return (
    <>
      <header className="cabecera">
        <p className="sobretitulo sobretitulo--claro">Ruta Márquez</p>
        <h1>Directorio</h1>
        <Buscador valor={texto} alCambiar={setTexto} placeholder="Negocio, municipio o vereda" />
      </header>
      <main className="contenido">
        <Chips
          etiqueta="Filtrar por categoría"
          opciones={[TODOS, ...CATEGORIAS]}
          activa={categoria}
          alCambiar={setCategoria}
        />
        <p className="ayuda" aria-live="polite">
          {resultado.length} {resultado.length === 1 ? 'emprendimiento' : 'emprendimientos'}
        </p>
        <div className="lista">
          {resultado.map((e) => (
            <TarjetaEmprendimiento
              key={e.id}
              emprendimiento={e}
              enRuta={paradaDe.has(e.id)}
              categoria={categoria === TODOS ? null : categoria}
            />
          ))}
        </div>
        {resultado.length === 0 && (
          <p className="vacio">No encontramos resultados. Pruebe con otra palabra o categoría.</p>
        )}
      </main>
    </>
  )
}
