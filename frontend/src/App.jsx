import { useCallback, useEffect, useState } from 'react'
import BarraNavegacion from './components/BarraNavegacion'
import { Cargando, ErrorCarga, NoEncontrado } from './components/Comunes'
import { useRuta } from './hooks/useNavegacion'
import { municipioDelQR } from './hooks/useMunicipioQR'
import { cargarTodo } from './services/datos'
import Directorio from './pages/Directorio'
import Ficha from './pages/Ficha'
import Inicio from './pages/Inicio'
import Premio from './pages/Premio'
import Resena from './pages/Resena'
import Resultados from './pages/Resultados'
import Ruta from './pages/Ruta'
import Sellos from './pages/Sellos'
import Verificar from './pages/Verificar'

// Pantallas que muestran la barra de navegación inferior y qué botón queda activo.
const CON_BARRA = { '': '/', directorio: '/directorio', ruta: '/ruta', sellos: '/sellos', ficha: '/directorio', resultados: '/' }

export default function App() {
  const { partes, params } = useRuta()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)

  const cargar = useCallback(() => {
    setError(false)
    cargarTodo()
      .then(setDatos)
      .catch(() => setError(true))
  }, [])
  useEffect(() => {
    cargar()
  }, [cargar])

  if (error) return <ErrorCarga alReintentar={cargar} />
  if (!datos) return <Cargando />

  const [seccion = '', id] = partes
  const municipioQR = municipioDelQR(datos.emprendimientos)

  let pantalla
  switch (seccion) {
    case '':
      pantalla = <Inicio datos={datos} municipioQR={municipioQR} />
      break
    case 'directorio':
      pantalla = <Directorio key={params.toString()} datos={datos} params={params} />
      break
    case 'ficha':
      pantalla = <Ficha key={id} datos={datos} id={id} />
      break
    case 'ruta':
      pantalla = <Ruta datos={datos} />
      break
    case 'sellos':
      pantalla = <Sellos datos={datos} />
      break
    case 'premio':
      pantalla = <Premio datos={datos} />
      break
    case 'resena':
      pantalla = <Resena key={id} datos={datos} id={id} />
      break
    case 'resultados':
      pantalla = <Resultados datos={datos} />
      break
    case 'verificar':
      pantalla = <Verificar />
      break
    default:
      pantalla = <NoEncontrado />
  }

  const activa = CON_BARRA[seccion]
  return (
    <div className={activa ? 'app app--con-barra' : 'app'}>
      {pantalla}
      {activa && <BarraNavegacion activa={activa} />}
    </div>
  )
}
