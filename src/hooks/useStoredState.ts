import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export function useStoredState<T>(key: string, initial: T, valid: (data: unknown) => data is T) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const locked = useRef(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key).then(raw => {
      const data: unknown = raw === null ? initial : JSON.parse(raw);
      if (!valid(data)) throw new Error('Formato inválido');
      if (active) { setValue(data); setReady(true); setError(undefined); }
    }).catch(() => { if (active) setError('Não foi possível ler os dados locais. Tente novamente antes de salvar.'); });
    return () => { active = false; };
  }, [key, initial, valid, attempt]);
  async function save(next: T) {
    if (!ready || locked.current) return false;
    locked.current = true; setBusy(true);
    try { await AsyncStorage.setItem(key, JSON.stringify(next)); setValue(next); setError(undefined); return true; }
    catch { setError('Não foi possível salvar no dispositivo. Seus dados anteriores foram mantidos.'); return false; }
    finally { locked.current = false; setBusy(false); }
  }
  return { value, ready, busy, error, save, retry: () => setAttempt(n => n + 1) };
}
