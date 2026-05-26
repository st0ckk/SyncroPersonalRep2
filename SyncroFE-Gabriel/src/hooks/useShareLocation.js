import { useCallback, useEffect, useRef, useState } from "react";
import { postMyLocation } from "../api/driverLocations.api";

const SEND_INTERVAL_MS = 15_000; // cada 15 segundos

/**
 * Hook para que el chofer comparta su GPS en tiempo real.
 *
 * @param {string} driverName  Nombre del chofer (viene de useAuth)
 * @param {boolean} enabled    Se puede pausar/reanudar externamente
 * @returns {{ status, error, coords, toggle, active }}
 */
export function useShareLocation(driverName, enabled = true) {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | requesting | sharing | error | unsupported
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);

  const intervalRef = useRef(null);
  const watchRef = useRef(null);
  const latestCoords = useRef(null);

  const send = useCallback(async () => {
    if (!latestCoords.current) return;
    try {
      await postMyLocation(
        latestCoords.current.latitude,
        latestCoords.current.longitude,
        driverName
      );
    } catch {
      // silencioso — no interrumpir al chofer por un fallo de red puntual
    }
  }, [driverName]);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setError("Este dispositivo no soporta geolocalización.");
      return;
    }

    setStatus("requesting");
    setError(null);

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        latestCoords.current = { latitude, longitude };
        setCoords({ latitude, longitude });
        setStatus("sharing");
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === 1
            ? "Permiso de ubicación denegado."
            : "No se pudo obtener la ubicación."
        );
        stop();
      },
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );

    // Enviar inmediatamente y luego en intervalos
    send();
    intervalRef.current = setInterval(send, SEND_INTERVAL_MS);
    setActive(true);
  }, [send]);

  const stop = useCallback(() => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    latestCoords.current = null;
    setActive(false);
    setStatus("idle");
    setCoords(null);
  }, []);

  const toggle = useCallback(() => {
    if (active) stop();
    else start();
  }, [active, start, stop]);

  // Arrancar automáticamente si enabled=true
  useEffect(() => {
    if (enabled) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { active, status, error, coords, toggle };
}
