import { useEffect, useState } from 'react';
import { getOptions } from '@/services/fipeApi';
import { errorMessage } from '@/services/api';
import type { Option } from '@/types/fipe';
export function useOptions(path: string | null) {
  const [state, setState] = useState<{ attempt: number; path: string | null; options: Option[]; loading: boolean; error: string | null }>({ attempt: -1, path: null, options: [], loading: false, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    getOptions(path, controller.signal).then(options => {
      if (!controller.signal.aborted) setState({ attempt, path, options, loading: false, error: null });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ attempt, path, options: [], loading: false, error: errorMessage(error) });
    });
    return () => controller.abort();
  }, [path, attempt]);
  const current = state.path === path && state.attempt === attempt ? state : { options: [], loading: !!path, error: null };
  return { ...current, retry: () => setAttempt(n => n + 1) };
}
