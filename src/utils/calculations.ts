export function parseNumber(text: string): number {
  const normalized = text
    .trim()
    .replace(/R\$\s*/g, "")
    .replace(/\s/g, "");
  if (!/^-?(?:\d+(?:[.,]\d+)?|\d{1,3}(?:\.\d{3})+(?:,\d+)?)$/.test(normalized))
    throw new Error("Preencha um número válido. Use vírgula para os decimais.");
  const value = Number(
    normalized.includes(",")
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized,
  );
  if (!Number.isFinite(value))
    throw new Error("O valor informado é muito grande.");
  return value;
}
export function nonNegative(text: string, label: string) {
  const value = parseNumber(text);
  if (value < 0) throw new Error(`${label} não pode ser negativo.`);
  return value;
}
export function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function comparePrices(a: number, b: number) {
  return { difference: b - a, percent: a > 0 ? ((b - a) / a) * 100 : null };
}
export type UseScenario = {
  km: number;
  consumption: number;
  fuelPrice: number;
  maintenance: number;
  insurance: number;
  annualTax: number;
};
export function runningCosts(s: UseScenario) {
  if (
    Object.values(s).some((value) => !Number.isFinite(value) || value < 0) ||
    s.consumption <= 0 ||
    s.fuelPrice <= 0
  )
    throw new Error(
      "Consumo e preço do combustível devem ser positivos; os demais valores não podem ser negativos.",
    );
  const fuel = (s.km / s.consumption) * s.fuelPrice;
  const monthly = fuel + s.maintenance + s.insurance + s.annualTax / 12;
  if (
    !Number.isFinite(monthly) ||
    !Number.isFinite(monthly * 12) ||
    (s.km > 0 && !Number.isFinite(monthly / s.km))
  )
    throw new Error("Os valores informados excedem o limite do cálculo.");
  return {
    fuel,
    monthly,
    yearly: monthly * 12,
    perKm: s.km > 0 ? monthly / s.km : null,
  };
}
export function estimatedIpva(price: number, percent: number) {
  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(percent) ||
    percent < 0 ||
    percent > 100
  )
    throw new Error(
      "Preço inválido ou alíquota fora do intervalo de 0 a 100%.",
    );
  return price * (percent / 100);
}
export function financing(
  price: number,
  downPayment: number,
  annualPercent: number,
  months: number,
) {
  if (
    ![price, downPayment, annualPercent, months].every(Number.isFinite) ||
    price < 0 ||
    downPayment < 0 ||
    downPayment > price ||
    annualPercent < 0 ||
    !Number.isInteger(months) ||
    months <= 0
  )
    throw new Error(
      "Confira entrada (entre zero e o preço), taxa não negativa e prazo inteiro positivo.",
    );
  const principal = price - downPayment;
  const monthlyRate = Math.expm1(Math.log1p(annualPercent / 100) / 12);
  const installment =
    principal === 0
      ? 0
      : monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate) /
          -Math.expm1(-months * Math.log1p(monthlyRate));
  const interest = Math.max(0, installment * months - principal);
  const total = downPayment + installment * months;
  if (![installment, interest, total].every(Number.isFinite))
    throw new Error("Os valores informados excedem o limite do financiamento.");
  return { principal, monthlyRate, installment, interest, total };
}
