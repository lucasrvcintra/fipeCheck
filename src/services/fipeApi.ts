import type { Option } from '@/types/fipe';
import { request } from './api';
export async function getOptions(path: string, signal?: AbortSignal): Promise<Option[]> {
  const data = await request(path, signal);
  if (!Array.isArray(data)) throw new Error('Lista inválida recebida da BrasilAPI.');
  return data.map((item) => {
    const label = item.nome ?? item.modelo;
    if (typeof label !== 'string' || !['string', 'number'].includes(typeof item.valor)) throw new Error('Opção inválida recebida da BrasilAPI.');
    return { label, value: String(item.valor) };
  });
}
