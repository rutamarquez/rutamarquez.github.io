// Pasaporte de sellos. Se guarda en el propio celular (localStorage), sin cuentas ni servidor.
//
// Cómo se valida un sello: el emprendedor le dice al turista un código de 4 dígitos.
// La app no tiene los códigos escritos: tiene su "huella" SHA-256 (ver scripts/generar_datos.py).
// Se calcula la huella de lo que escribe el turista y se compara.
//
// Limitación conocida (prototipo): como son 4 dígitos, alguien con conocimientos técnicos
// podría probar las 10.000 combinaciones. Para una versión final, la validación debería
// hacerse en un servidor o con Firebase.

const CLAVE = 'ruta-marquez:pasaporte:v1'

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? {}
  } catch {
    return {}
  }
}

function guardar(datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos))
  } catch {
    // Navegación privada o almacenamiento lleno: el sello vale solo en esta visita.
  }
  window.dispatchEvent(new Event('pasaporte'))
}

export function sellosDe(rutaId) {
  return leer()[rutaId]?.sellos ?? {}
}

export function premioDe(rutaId) {
  return leer()[rutaId]?.premio ?? null
}

async function sha256(texto) {
  const bytes = new TextEncoder().encode(texto)
  const huella = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(huella)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Devuelve true si el código es correcto y registra el sello. */
export async function registrarSello(ruta, parada, codigo) {
  const limpio = String(codigo).replace(/\D/g, '')
  if (limpio.length !== 4) return false
  const huella = await sha256(`${ruta.id}:${parada.emprendimiento}:${limpio}`)
  if (huella !== parada.huellaCodigo) return false

  const datos = leer()
  const deRuta = datos[ruta.id] ?? { sellos: {} }
  deRuta.sellos[parada.emprendimiento] = new Date().toISOString()
  if (!deRuta.premio && Object.keys(deRuta.sellos).length >= ruta.paradas.length) {
    deRuta.premio = { codigo: generarCodigoPremio(), fecha: new Date().toISOString() }
  }
  datos[ruta.id] = deRuta
  guardar(datos)
  return true
}

// ---------------------------------------------------------------------------
// Código del premio: RM-NNNN-D, donde D es un dígito de control (algoritmo de Luhn,
// el mismo de las tarjetas). Con él, la alcaldía puede revisar en #/verificar que el
// código no fue inventado al azar.
// ---------------------------------------------------------------------------
function digitoLuhn(numero) {
  let suma = 0
  ;[...numero].reverse().forEach((d, i) => {
    let n = Number(d) * (i % 2 === 0 ? 2 : 1)
    if (n > 9) n -= 9
    suma += n
  })
  return String((10 - (suma % 10)) % 10)
}

function generarCodigoPremio() {
  const aleatorio = crypto.getRandomValues(new Uint16Array(1))[0] % 9000
  const numero = String(1000 + aleatorio)
  return `RM-${numero}-${digitoLuhn(numero)}`
}

export function codigoPremioValido(codigo) {
  const m = /^RM-?(\d{4})-?(\d)$/i.exec(String(codigo).trim())
  return Boolean(m) && digitoLuhn(m[1]) === m[2]
}
