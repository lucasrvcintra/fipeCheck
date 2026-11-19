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

export async function getDetails(query: import('@/types/fipe').VehicleQuery, signal?: AbortSignal): Promise<import('@/types/fipe').VehicleDetails> {
  const path = [query.type, query.brand, query.model, query.year].map(encodeURIComponent).join('/');
  const data = await request(`/fipe/detalhes/v1/${path}`, signal);
  if (!data || typeof data !== 'object' || !('valor' in data) || typeof data.valor !== 'string' || !('codigoFipe' in data) || !('modelo' in data) || !('mesReferencia' in data)) throw new Error('Detalhes inválidos recebidos da BrasilAPI.');
  return data as import('@/types/fipe').VehicleDetails;
}
