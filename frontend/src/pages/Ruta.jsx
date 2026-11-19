import { useMemo } from 'react'
import Icono from '../components/Icono'
import MapaRuta from '../components/MapaRuta'
import { Progreso } from '../components/Comunes'
import { usePasaporte } from '../hooks/usePasaporte'
import { urlArchivo } from '../services/datos'

export default function Ruta({ datos }) {
  const ruta = datos.rutas[0]
  const { sellos, hechos, total } = usePasaporte(ruta)
  const puntos = useMemo(
    () =>
      ruta.paradas.map((p) => {
        const e = datos.porId.get(p.emprendimiento)
        return { ...p, ...e, numero: p.numero }
      }),
    [ruta, datos.porId],
  )

  return (
    <>
      <header className="cabecera cabecera--ruta">
        <p className="sobretitulo sobretitulo--claro">
          {ruta.duracion} · {ruta.paradas.length} paradas · {ruta.transporte.toLowerCase()}
        </p>
        <h1>{ruta.nombre}</h1>
        <p className="cabecera__sub">{ruta.subtitulo}</p>
        <MapaRuta puntos={puntos} sellos={sellos} />
      </header>

      <main className="contenido">
        <div className="avance">
          <Progreso hechos={hechos} total={total} />
          <span>
            {hechos} de {total} sellos
          </span>
        </div>
        <p className="descripcion">{ruta.descripcion}</p>

        <ol className="linea-tiempo">
          {puntos.map((p) => {
            const hecho = Boolean(sellos[p.id])
            return (
              <li key={p.id} className={hecho ? 'parada parada--hecha' : 'parada'}>
                <span className="parada__marca" aria-label={hecho ? 'Visitada' : `Parada ${p.numero}`}>
                  {hecho ? <Icono nombre="check" tamano={16} /> : p.numero}
                </span>
                <a className="parada__tarjeta" href={`#/ficha/${p.id}`}>
                  <p className="sobretitulo">
                    {p.hora} · {p.municipio}
                  </p>
                  <h2>{p.nombre}</h2>
                  <p>{p.actividad}</p>
                </a>
                {p.minutos_a_siguiente && (
                  <p className="parada__trayecto">
                    <Icono nombre="carro" tamano={15} /> unos {p.minutos_a_siguiente} min en carro
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        <a className="boton boton--secundario boton--ancho" href={urlArchivo(`itinerario-${ruta.id}.pdf`)} download>
          <Icono nombre="descargar" tamano={18} /> Descargar itinerario en PDF
        </a>
        <p className="nota nota--centrada">Guárdalo antes de salir: en algunas veredas no hay señal.</p>
      </main>
    </>
  )
}
