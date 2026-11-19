import Icono from '../components/Icono'
import { Anillo } from '../components/Comunes'
import { usePasaporte } from '../hooks/usePasaporte'

export default function Sellos({ datos }) {
  const ruta = datos.rutas[0]
  const { sellos, premio, hechos, total } = usePasaporte(ruta)

  return (
    <>
      <header className="cabecera cabecera--pasaporte">
        <Anillo hechos={hechos} total={total} tamano={72} />
        <div>
          <p className="sobretitulo sobretitulo--claro">{ruta.nombre}</p>
          <h1>Tu pasaporte</h1>
          <p className="cabecera__sub">Completa las {total} paradas y reclama tu premio.</p>
        </div>
      </header>

      <main className="contenido">
        <ol className="sellos">
          {ruta.paradas.map((p) => {
            const e = datos.porId.get(p.emprendimiento)
            const hecho = Boolean(sellos[p.emprendimiento])
            return (
              <li key={p.emprendimiento}>
                <a href={`#/ficha/${e.id}`} className={hecho ? 'sello sello--hecho' : 'sello'}>
                  <span className="sello__circulo">
                    {hecho ? (
                      <>
                        <Icono nombre="check" tamano={16} />
                        <small>{e.municipio}</small>
                      </>
                    ) : (
                      p.numero
                    )}
                  </span>
                  <span className="sello__nombre">{e.nombre}</span>
                </a>
              </li>
            )
          })}
        </ol>

        <section className="caja">
          <h2>¿Cómo gano un sello?</h2>
          <ol className="pasos">
            <li>Visita el emprendimiento de la parada.</li>
            <li>Pide el código de 4 dígitos al emprendedor.</li>
            <li>Escríbelo en su ficha y deja tu reseña.</li>
          </ol>
        </section>

        <a className={premio ? 'tarjeta-premio' : 'tarjeta-premio tarjeta-premio--bloqueada'} href="#/premio">
          <span className="tarjeta-premio__icono">
            <Icono nombre="regalo" tamano={22} />
          </span>
          <div>
            <h2>Premio {ruta.premio.nombre}</h2>
            <p>{premio ? '¡Ya puedes reclamarlo!' : ruta.premio.incluye.join(' + ')}</p>
          </div>
          <Icono nombre="derecha" tamano={18} />
        </a>
      </main>
    </>
  )
}
