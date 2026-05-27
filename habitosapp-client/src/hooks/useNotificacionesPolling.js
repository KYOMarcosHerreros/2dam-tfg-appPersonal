import { useEffect, useRef } from 'react'

export function useNotificacionesPolling(callback, intervalo = 30000) {
  const intervalRef = useRef(null)

  useEffect(() => {
    // Ejecutar inmediatamente al montar
    callback()

    // Luego ejecutar cada X milisegundos
    intervalRef.current = setInterval(callback, intervalo)

    // Limpiar al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [callback, intervalo])

  return {
    detener: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    },
    reiniciar: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      callback()
      intervalRef.current = setInterval(callback, intervalo)
    }
  }
}
