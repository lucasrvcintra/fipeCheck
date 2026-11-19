export function parseNumber(text: string): number {
  const normalized = text.trim().replace(/R\$\s*/g, '').replace(/\s/g, '');
  if (!/^-?(?:\d+(?:[.,]\d+)?|\d{1,3}(?:\.\d{3})+(?:,\d+)?)$/.test(normalized)) throw new Error('Preencha um número válido. Use vírgula para os decimais.');
  const value = Number(normalized.includes(',') ? normalized.replace(/\./g, '').replace(',', '.') : normalized);
  if (!Number.isFinite(value)) throw new Error('O valor informado é muito grande.');
  return value;
}
export function nonNegative(text: string, label: string) {
  const value = parseNumber(text);
  if (value < 0) throw new Error(`${label} não pode ser negativo.`);
  return value;
}
export function money(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
export function comparePrices(a: number, b: number) { return { difference: b - a, percent: a > 0 ? (b - a) / a * 100 : null }; }
