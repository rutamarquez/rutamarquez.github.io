import { useState } from 'react'
import Icono from '../components/Icono'
import { BotonVolver, Inicial, NoEncontrado } from '../components/Comunes'
import Resenas from '../components/Resenas'
import RegistrarSello from '../components/RegistrarSello'

const NOMBRES_REDES = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', web: 'Página web' }

const QUE_HACER = {
  Comer: 'Comer',
  Hospedarse: 'Hospedarse',
  'Conocer procesos campesinos': 'Conocer los procesos del campo',
  'Hacer senderismo': 'Hacer senderismo',
  'Conocer naturaleza': 'Conocer la naturaleza',
  'Conocer cultura local': 'Conocer la cultura local',
  'Comprar productos locales': 'Comprar productos locales',
  'Participar en talleres': 'Participar en talleres',
  'Conocer tradiciones': 'Conocer las tradiciones',
  'Realizar actividades de aventura': 'Actividades de aventura',
  'Actividades de relajación y reflexión': 'Actividades de relajación',
}

function enlaceWhatsApp(numero, nombre) {
  const mensaje = `Hola, vi ${nombre} en Ruta Márquez y quisiera más información.`
  return `https://wa.me/57${numero}?text=${encodeURIComponent(mensaje)}`
}

export default function Ficha({ datos, id }) {
  const e = datos.porId.get(Number(id))
  const [verRedes, setVerRedes] = useState(false)
  if (!e) return <NoEncontrado />

  const enRuta = datos.paradaDe.get(e.id)
  const redes = Object.entries(e.redes)

  return (
    <>
      <header className="foto">
        <BotonVolver alternativa="/directorio" claro />
        {enRuta && (
          <span className="insignia insignia--mostaza foto__parada">
            Parada {enRuta.parada.numero} de la ruta
          </span>
        )}
        <Inicial nombre={e.nombre} grande />
      </header>

      <main className="contenido contenido--ficha">
        <p className="etiqueta-categoria">
          {e.municipio} · {e.categorias[0] ?? 'Turismo rural'}
        </p>
        <h1 className="titulo-ficha">{e.nombre}</h1>
        <p className="ubicacion">
          <Icono nombre="pin" tamano={15} />
          {e.vereda ? `Vereda ${e.vereda}, ${e.municipio}` : e.municipio}
          {!e.provinciaMarquez && ' · cerca de la provincia'}
        </p>

        <p className="descripcion">{e.descripcion}</p>

        <div className="acciones">
          {e.acceso !== 'Proyecto en formación' && (
            <a className="accion accion--principal" href={e.comoLlegarUrl} target="_blank" rel="noopener">
              <Icono nombre="pin" />
              Cómo llegar
            </a>
          )}
          {e.whatsapp && (
            <a className="accion" href={enlaceWhatsApp(e.whatsapp, e.nombre)} target="_blank" rel="noopener">
              <Icono nombre="chat" />
              WhatsApp
            </a>
          )}
          {redes.length === 1 && (
            <a className="accion" href={redes[0][1]} target="_blank" rel="noopener">
              <Icono nombre={redes[0][0] === 'web' ? 'web' : 'redes'} />
              {NOMBRES_REDES[redes[0][0]]}
            </a>
          )}
          {redes.length > 1 && (
            <button
              type="button"
              className="accion"
              aria-expanded={verRedes}
              onClick={() => setVerRedes((v) => !v)}
            >
              <Icono nombre="redes" />
              Redes
            </button>
          )}
        </div>
        {verRedes && (
          <ul className="lista-redes">
            {redes.map(([red, url]) => (
              <li key={red}>
                <a href={url} target="_blank" rel="noopener">
                  {NOMBRES_REDES[red]}
                  <Icono nombre="derecha" tamano={16} />
                </a>
              </li>
            ))}
          </ul>
        )}
        {e.reservasUrl && (
          <a className="enlace" href={e.reservasUrl} target="_blank" rel="noopener">
            Reservar en línea
          </a>
        )}

        {(e.acceso === 'Solo con cita previa' || e.acceso === 'Proyecto en formación') && (
          <p className="aviso">
            <Icono nombre="info" tamano={18} />
            {e.acceso === 'Solo con cita previa'
              ? 'Por ahora recibe visitas solo con cita previa. Escriba por WhatsApp antes de ir.'
              : 'Es un proyecto en formación: escriba por WhatsApp para conocer cómo va.'}
          </p>
        )}
        {e.ubicacion?.aproximada && e.comoLlegarUrl.includes('/maps/search/') && (
          <p className="nota">La ubicación exacta está por confirmar. "Cómo llegar" busca el lugar por su nombre.</p>
        )}

        {e.queHacer.length > 0 && (
          <section>
            <h2 className="titulo-seccion">Qué puedes hacer</h2>
            <ul className="puntos">
              {e.queHacer.map((q) => (
                <li key={q}>{QUE_HACER[q] ?? q}</li>
              ))}
            </ul>
          </section>
        )}

        <dl className="datos-practicos">
          <div>
            <dt>
              <Icono nombre="reloj" tamano={16} /> Horario
            </dt>
            <dd>{e.horario ?? 'Consultar por WhatsApp'}</dd>
          </div>
          {e.duracion && (
            <div>
              <dt>Duración de la experiencia</dt>
              <dd>{e.duracion}</dd>
            </div>
          )}
          {e.acceso && e.acceso !== 'Solo con cita previa' && e.acceso !== 'Proyecto en formación' && (
            <div>
              <dt>Cómo es el acceso</dt>
              <dd>{e.acceso}</dd>
            </div>
          )}
        </dl>

        {enRuta && <RegistrarSello ruta={enRuta.ruta} parada={enRuta.parada} nombre={e.nombre} />}

        <Resenas emprendimiento={e} />
      </main>
    </>
  )
}
