// Carga los archivos JSON que genera scripts/generar_datos.py (carpeta public/data).
// Cada archivo se pide una sola vez por visita y queda guardado en memoria.

const BASE = import.meta.env.BASE_URL
const cache = new Map()

function cargar(nombre) {
  if (!cache.has(nombre)) {
    const promesa = fetch(`${BASE}data/${nombre}.json`).then((r) => {
      if (!r.ok) throw new Error(`No se pudo cargar ${nombre} (${r.status})`)
      return r.json()
    })
    // Si falla (por ejemplo, sin señal), se borra para poder reintentar.
    promesa.catch(() => cache.delete(nombre))
    cache.set(nombre, promesa)
  }
  return cache.get(nombre)
}

export async function cargarTodo() {
  const [emprendimientos, { rutas }, diagnostico] = await Promise.all([
    cargar('emprendimientos'),
    cargar('rutas'),
    cargar('diagnostico'),
  ])
  const porId = new Map(emprendimientos.map((e) => [e.id, e]))
  // Para cada emprendimiento: en qué ruta y en qué parada está (si está en alguna).
  const paradaDe = new Map()
  for (const ruta of rutas) {
    for (const parada of ruta.paradas) {
      paradaDe.set(parada.emprendimiento, { ruta, parada })
    }
  }
  return { emprendimientos, porId, rutas, paradaDe, diagnostico }
}

export const CATEGORIAS = ['Comer', 'Dormir', 'Agroturismo', 'Senderos', 'Cultura', 'Productos locales']

// Texto sin tildes ni mayúsculas, para que buscar "tibana" encuentre "Tibaná".
export function normalizar(texto = '') {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function urlArchivo(ruta) {
  return `${BASE}${ruta}`
}
