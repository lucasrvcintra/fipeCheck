export type VehicleType = "carros" | "motos" | "caminhoes";
export type Option = { value: string; label: string };
export type VehicleQuery = {
  type: VehicleType;
  brand: string;
  model: string;
  year: string;
};
export type VehicleDetails = {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
  tipoVeiculo: number;
  siglaCombustivel: string;
  dataConsulta: string;
};
export type Favorite = {
  id: string;
  query: VehicleQuery;
  details: VehicleDetails;
  savedAt: string;
};
export function vehicleId(query: VehicleQuery) {
  return [query.type, query.brand, query.model, query.year].join(":");
}
export function isVehicleDetails(value: unknown): value is VehicleDetails {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    [
      "valor",
      "marca",
      "modelo",
      "combustivel",
      "codigoFipe",
      "mesReferencia",
      "siglaCombustivel",
      "dataConsulta",
    ].every((key) => typeof data[key] === "string") &&
    typeof data.anoModelo === "number" &&
    Number.isFinite(data.anoModelo) &&
    typeof data.tipoVeiculo === "number"
  );
}
export function isFavoriteList(value: unknown): value is Favorite[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every((item) => {
    const query = item?.query;
    if (
      !query ||
      !["carros", "motos", "caminhoes"].includes(query.type) ||
      !["brand", "model", "year"].every(
        (key) => typeof query[key] === "string" && query[key].length > 0,
      ) ||
      !isVehicleDetails(item.details) ||
      typeof item.savedAt !== "string" ||
      !Number.isFinite(Date.parse(item.savedAt)) ||
      item.id !== vehicleId(query) ||
      ids.has(item.id)
    )
      return false;
    ids.add(item.id);
    return true;
  });
}

// Alguns endpoints FIPE não retornam dataConsulta; nesse caso, usamos a recepção pelo app.
export function normalizeDetails(
  value: unknown,
  receivedAt: string,
): VehicleDetails {
  if (!value || typeof value !== "object")
    throw new Error("Detalhes inválidos recebidos da BrasilAPI.");
  const data = {
    ...value,
    dataConsulta:
      "dataConsulta" in value && typeof value.dataConsulta === "string"
        ? value.dataConsulta
        : receivedAt,
  };
  if (!isVehicleDetails(data))
    throw new Error("Detalhes inválidos recebidos da BrasilAPI.");
  return data;
}
