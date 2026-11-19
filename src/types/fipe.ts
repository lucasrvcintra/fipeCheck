export type VehicleType = 'carros' | 'motos' | 'caminhoes';
export type Option = { value: string; label: string };
export type VehicleQuery = { type: VehicleType; brand: string; model: string; year: string };
export type VehicleDetails = {
  valor: string; marca: string; modelo: string; anoModelo: number; combustivel: string;
  codigoFipe: string; mesReferencia: string; tipoVeiculo: number; siglaCombustivel: string; dataConsulta: string;
};
export type Favorite = { id: string; query: VehicleQuery; details: VehicleDetails; savedAt: string };
export function vehicleId(query: VehicleQuery) { return [query.type, query.brand, query.model, query.year].join(':'); }
