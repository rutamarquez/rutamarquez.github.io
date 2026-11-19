import { useState } from 'react'
import Icono from './Icono'
import { usePasaporte } from '../hooks/usePasaporte'
import { registrarSello } from '../services/pasaporte'

export default function RegistrarSello({ ruta, parada, nombre }) {
  const { sellos, premio } = usePasaporte(ruta)
  const [codigo, setCodigo] = useState('')
  const [estado, setEstado] = useState(null) // null | 'revisando' | 'error'

  if (sellos[parada.emprendimiento]) {
    return (
      <section className="caja-sello caja-sello--hecho">
        <Icono nombre="check" tamano={22} />
        <div>
          <h2>Sello registrado</h2>
          <p>
            {premio ? (
              <a href="#/premio">¡Completaste la ruta! Ver mi premio</a>
            ) : (
              <a href="#/sellos">Ver mi pasaporte</a>
            )}
          </p>
        </div>
      </section>
    )
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEstado('revisando')
    const valido = await registrarSello(ruta, parada, codigo)
    setEstado(valido ? null : 'error')
    if (valido) setCodigo('')
  }

  return (
    <section className="caja-sello" aria-labelledby="titulo-sello">
      <h2 id="titulo-sello">¿Estás en {nombre}?</h2>
      <p>Pide el código de 4 dígitos al emprendedor y gana el sello de esta parada.</p>
      <form className="formulario-sello" onSubmit={enviar}>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          pattern="\d{4}"
          placeholder="0000"
          aria-label="Código de 4 dígitos"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value.replace(/\D/g, ''))
            setEstado(null)
          }}
          aria-invalid={estado === 'error'}
        />
        <button type="submit" className="boton boton--primario" disabled={codigo.length !== 4 || estado === 'revisando'}>
          Registrar sello
        </button>
      </form>
      {estado === 'error' && (
        <p className="error" role="alert">
          Ese código no coincide. Revíselo con el emprendedor.
        </p>
      )}
    </section>
  )
}
