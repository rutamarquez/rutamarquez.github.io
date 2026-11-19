import { Inicial } from './Comunes'

export default function TarjetaEmprendimiento({ emprendimiento: e, enRuta, categoria }) {
  // Si el directorio está filtrado por una categoría, se muestra esa; si no, la primera.
  const etiqueta = categoria && e.categorias.includes(categoria) ? categoria : e.categorias[0]
  return (
    <a className="tarjeta" href={`#/ficha/${e.id}`}>
      <Inicial nombre={e.nombre} />
      <div className="tarjeta__texto">
        <p className="sobretitulo">
          {e.municipio}
          {etiqueta && ` · ${etiqueta}`}
        </p>
        <h3>{e.nombre}</h3>
        <p className="tarjeta__descripcion">{e.descripcion}</p>
      </div>
      <div className="tarjeta__marcas">
        {enRuta && <span className="insignia">En ruta</span>}
        {e.acceso === 'Solo con cita previa' && <span className="insignia insignia--suave">Con cita</span>}
        {!e.provinciaMarquez && <span className="insignia insignia--suave">Cercano</span>}
      </div>
    </a>
  )
}
