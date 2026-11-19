export type Benchmark = "Selic" | "CDI";
export type BenchmarkRates = Record<Benchmark, number>;

export function parseRates(data: unknown): BenchmarkRates {
  if (!Array.isArray(data)) throw new Error("Resposta de taxas inválida.");
  const result: BenchmarkRates = { Selic: 0, CDI: 0 };
  for (const name of ["Selic", "CDI"] as const) {
    const item = data.find(
      (item) =>
        typeof item?.nome === "string" &&
        item.nome.trim().toLowerCase() === name.toLowerCase(),
    );
    if (
      !item ||
      typeof item.valor !== "number" ||
      !Number.isFinite(item.valor) ||
      item.valor < 0
    ) {
      throw new Error("Taxas de referência indisponíveis ou inválidas.");
    }
    result[name] = item.valor;
  }
  return result;
}
