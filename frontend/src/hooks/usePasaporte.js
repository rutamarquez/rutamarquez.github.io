import { useEffect, useState } from 'react'
import { premioDe, sellosDe } from '../services/pasaporte'

/** Sellos y premio de una ruta; se actualiza solo cuando se registra un sello. */
export function usePasaporte(ruta) {
  const leer = () => ({ sellos: ruta ? sellosDe(ruta.id) : {}, premio: ruta ? premioDe(ruta.id) : null })
  const [estado, setEstado] = useState(leer)
  useEffect(() => {
    const actualizar = () => setEstado(leer())
    actualizar()
    window.addEventListener('pasaporte', actualizar)
    window.addEventListener('storage', actualizar)
    return () => {
      window.removeEventListener('pasaporte', actualizar)
      window.removeEventListener('storage', actualizar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta?.id])
  const total = ruta?.paradas.length ?? 0
  const hechos = ruta ? ruta.paradas.filter((p) => estado.sellos[p.emprendimiento]).length : 0
  return { ...estado, hechos, total, faltan: total - hechos }
}
