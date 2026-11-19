import { useState } from 'react'
import { BotonVolver } from '../components/Comunes'
import { codigoPremioValido } from '../services/pasaporte'

// Página para el punto de información de la alcaldía (no aparece en el menú).
// Se abre con .../#/verificar y revisa que el código del premio no sea inventado.
export default function Verificar() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState(null)

  return (
    <>
      <header className="cabecera-simple">
        <BotonVolver />
        <span>Verificar premio</span>
      </header>
      <main className="contenido">
        <h1 className="titulo-ficha">Verificar código de premio</h1>
        <p className="descripcion">
          Para el punto de información de la alcaldía. Escriba el código que muestra el turista en su celular.
        </p>
        <form
          className="formulario"
          onSubmit={(e) => {
            e.preventDefault()
            setResultado(codigoPremioValido(codigo))
          }}
        >
          <input
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value.toUpperCase())
              setResultado(null)
            }}
            placeholder="RM-0000-0"
            aria-label="Código del premio"
            autoCapitalize="characters"
          />
          <button type="submit" className="boton boton--primario boton--ancho" disabled={!codigo.trim()}>
            Verificar
          </button>
        </form>
        {resultado === true && (
          <p className="aviso aviso--ok" role="status">
            Código válido. Anote el código en la planilla de premios entregados para que no se use dos veces.
          </p>
        )}
        {resultado === false && (
          <p className="error" role="alert">
            Código no válido. Pídale al turista que abra su pantalla de premio en la app.
          </p>
        )}
      </main>
    </>
  )
}
