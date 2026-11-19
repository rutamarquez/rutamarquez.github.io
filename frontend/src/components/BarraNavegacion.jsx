import Icono from './Icono'

const SECCIONES = [
  { camino: '/', nombre: 'Inicio', icono: 'inicio' },
  { camino: '/ruta', nombre: 'Ruta', icono: 'ruta' },
  { camino: '/sellos', nombre: 'Sellos', icono: 'sello' },
  { camino: '/directorio', nombre: 'Directorio', icono: 'lista' },
]

export default function BarraNavegacion({ activa }) {
  return (
    <nav className="barra" aria-label="Secciones">
      {SECCIONES.map((s) => (
        <a
          key={s.camino}
          href={`#${s.camino}`}
          className={activa === s.camino ? 'barra__item barra__item--activo' : 'barra__item'}
          aria-current={activa === s.camino ? 'page' : undefined}
        >
          <Icono nombre={s.icono} tamano={19} />
          <span>{s.nombre}</span>
        </a>
      ))}
    </nav>
  )
}
