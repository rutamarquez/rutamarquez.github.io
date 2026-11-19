import { normalizar } from '../services/datos'

// Cada alcaldía puede tener su propio QR con el municipio en el enlace, por ejemplo:
//   https://rutamarquez.github.io/?municipio=tibana
// La app recuerda ese municipio durante la visita para destacarlo en el inicio.

const CLAVE = 'ruta-marquez:municipio'

export function municipioDelQR(emprendimientos) {
  const desdeEnlace = new URLSearchParams(window.location.search).get('municipio')
  if (desdeEnlace) {
    try {
      sessionStorage.setItem(CLAVE, desdeEnlace)
    } catch {
      /* sin almacenamiento */
    }
  }
  let buscado = desdeEnlace
  try {
    buscado ??= sessionStorage.getItem(CLAVE)
  } catch {
    /* sin almacenamiento */
  }
  if (!buscado) return null
  const clave = normalizar(buscado).replace(/[^a-z]/g, '')
  const encontrado = emprendimientos.find(
    (e) => normalizar(e.municipio).replace(/[^a-z]/g, '') === clave,
  )
  return encontrado?.municipio ?? null
}
