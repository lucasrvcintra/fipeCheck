const BASE = "https://brasilapi.com.br/api";
export async function request(
  path: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 20000);
  try {
    const response = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(
        `Não foi possível consultar a BrasilAPI (HTTP ${response.status}).`,
      );
    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
export function errorMessage(error: unknown) {
  return error instanceof Error && error.name !== "AbortError"
    ? error.message
    : "Consulta interrompida ou tempo esgotado. Tente novamente.";
}
