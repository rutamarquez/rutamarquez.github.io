import { useState } from 'react'
import Icono from '../components/Icono'
import { Anillo, Buscador, Progreso } from '../components/Comunes'
import TarjetaEmprendimiento from '../components/TarjetaEmprendimiento'
import { ir } from '../hooks/useNavegacion'
import { usePasaporte } from '../hooks/usePasaporte'
import { CATEGORIAS } from '../services/datos'

export default function Inicio({ datos, municipioQR }) {
  const { emprendimientos, rutas, paradaDe, diagnostico } = datos
  const ruta = rutas[0]
  const { hechos, total, faltan } = usePasaporte(ruta)
  const [texto, setTexto] = useState('')
  const municipios = new Set(emprendimientos.map((e) => e.municipio)).size
  const cercanos = municipioQR ? emprendimientos.filter((e) => e.municipio === municipioQR) : []

  return (
    <>
      <header className="portada">
        <p className="sobretitulo sobretitulo--claro">Ruta Márquez · Boyacá</p>
        <h1>
          Camina, prueba y siente <em>Márquez</em>
        </h1>
        <p>
          {emprendimientos.length} emprendimientos rurales en {municipios} municipios, a un escaneo de
          distancia.
        </p>
      </header>

      <main className="contenido">
        <Buscador
          valor={texto}
          alCambiar={setTexto}
          placeholder="¿Qué quieres vivir hoy?"
          alEnviar={() => ir(`/directorio?q=${encodeURIComponent(texto)}`)}
        />

        <div className="chips chips--desliza" aria-label="Categorías">
          {CATEGORIAS.map((c) => (
            <a key={c} className="chip" href={`#/directorio?cat=${encodeURIComponent(c)}`}>
              {c}
            </a>
          ))}
        </div>

        {ruta && (
          <section className="tarjeta-ruta" aria-labelledby="titulo-ruta">
            <div className="tarjeta-ruta__encabezado">
              <h2 id="titulo-ruta">{ruta.nombre}</h2>
              <span>
                {ruta.municipios.length} municipios · {ruta.paradas.length} paradas
              </span>
            </div>
            <ol className="municipios-ruta">
              {ruta.municipios.map((m, i) => (
                <li key={m}>
                  <span className="municipios-ruta__punto">{i + 1}</span>
                  {m}
                </li>
              ))}
            </ol>
            <a className="boton boton--mostaza" href="#/ruta">
              Empezar la ruta <Icono nombre="derecha" tamano={18} />
            </a>
          </section>
        )}

        {ruta && (
          <a className="tarjeta-pasaporte" href="#/sellos">
            <Anillo hechos={hechos} total={total} tamano={56} />
            <div>
              <h2>Tu pasaporte de sellos</h2>
              <p>
                {faltan === 0
                  ? '¡Completaste la ruta! Reclama tu premio.'
                  : `Te faltan ${faltan} ${faltan === 1 ? 'parada' : 'paradas'} para tu premio`}
              </p>
              <Progreso hechos={hechos} total={total} />
            </div>
          </a>
        )}

        {cercanos.length > 0 && (
          <section aria-labelledby="titulo-cerca">
            <h2 className="titulo-seccion" id="titulo-cerca">
              Estás en {municipioQR}
            </h2>
            <p className="ayuda">Emprendimientos de este municipio que puedes visitar hoy.</p>
            <div className="lista">
              {cercanos.slice(0, 4).map((e) => (
                <TarjetaEmprendimiento key={e.id} emprendimiento={e} enRuta={paradaDe.has(e.id)} />
              ))}
            </div>
            {cercanos.length > 4 && (
              <a className="enlace" href={`#/directorio?q=${encodeURIComponent(municipioQR)}`}>
                Ver los {cercanos.length} de {municipioQR}
              </a>
            )}
          </section>
        )}

        <a className="tarjeta-resultados" href="#/resultados">
          <Icono nombre="grafico" tamano={22} />
          <div>
            <h2>¿Por qué esta ruta?</h2>
            <p>
              {diagnostico.indicadores[0].porcentajeSin} % de los emprendimientos encuestados no aparece en
              Google Maps. Mira el diagnóstico.
            </p>
          </div>
          <Icono nombre="derecha" tamano={18} />
        </a>
      </main>
    </>
  )
}
