import { useEffect, useMemo, useSyncExternalStore } from 'react'

// Navegación con # en la URL (por ejemplo .../#/ficha/12).
// Así la app funciona en GitHub Pages sin configurar el servidor, y el botón
// "atrás" del celular funciona normal.

function suscribir(aviso) {
  window.addEventListener('hashchange', aviso)
  return () => window.removeEventListener('hashchange', aviso)
}

export function useRuta() {
  const hash = useSyncExternalStore(suscribir, () => window.location.hash)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [hash])
  return useMemo(() => {
    const [camino, consulta = ''] = (hash.replace(/^#/, '') || '/').split('?')
    return { camino, partes: camino.split('/').filter(Boolean), params: new URLSearchParams(consulta) }
  }, [hash])
}

export function ir(camino) {
  window.location.hash = camino
}

export function volver(alternativa = '/') {
  if (window.history.length > 1) window.history.back()
  else ir(alternativa)
}
