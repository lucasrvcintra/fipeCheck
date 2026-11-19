import { useEffect, useState } from 'react';
import { request, errorMessage } from '@/services/api';
import { Feedback } from './Feedback';
import { ThemedText } from './ThemedText';
export function RateReference() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ attempt: number; text?: string; error?: string }>({ attempt: -1 });
  useEffect(() => {
    const controller = new AbortController();
    request('/taxas/v1', controller.signal).then(data => {
      if (!Array.isArray(data)) throw new Error('Resposta de taxas inválida.');
      const rates = ['Selic', 'CDI'].map(name => {
        const item = data.find(item => typeof item?.nome === 'string' && item.nome.toLowerCase() === name.toLowerCase());
        if (!item || typeof item.valor !== 'number' || !Number.isFinite(item.valor)) throw new Error('Taxas de referência indisponíveis.');
        return `${name}: ${item.valor.toLocaleString('pt-BR')}% a.a.`;
      });
      if (!controller.signal.aborted) setState({ attempt, text: `${rates.join(' · ')}. Obtidas em ${new Date().toLocaleString('pt-BR')}. A resposta não informa a data-base das taxas.` });
    }).catch(error => { if (!controller.signal.aborted) setState({ attempt, error: errorMessage(error) }); });
    return () => controller.abort();
  }, [attempt]);
  if (state.attempt !== attempt) return <Feedback loading message="Consultando referências SELIC/CDI... A simulação manual continua disponível." />;
  return state.error ? <Feedback message={state.error} onRetry={() => setAttempt(n => n + 1)} /> : <ThemedText>{state.text} Apenas referência, sem preenchimento automático da taxa.</ThemedText>;
}
