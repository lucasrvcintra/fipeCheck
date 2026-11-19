import { useEffect, useState } from "react";
import { request, errorMessage } from "@/services/api";
import { parseRates, type BenchmarkRates } from "@/utils/rates";

type RateData = { values: BenchmarkRates; receivedAt: string };
export function useRates() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    attempt: number;
    data?: RateData;
    error?: string;
  }>({ attempt: -1 });
  useEffect(() => {
    const controller = new AbortController();
    request("/taxas/v1", controller.signal)
      .then((response) => {
        const values = parseRates(response);
        if (!controller.signal.aborted)
          setState({
            attempt,
            data: { values, receivedAt: new Date().toLocaleString("pt-BR") },
          });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ attempt, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [attempt]);
  const current = state.attempt === attempt;
  return {
    loading: !current,
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    retry: () => setAttempt((n) => n + 1),
  };
}
export type RatesResource = ReturnType<typeof useRates>;
