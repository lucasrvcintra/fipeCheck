import { test } from "node:test";
import assert from "node:assert/strict";
import { isFavoriteList, vehicleId } from "../src/types/fipe.ts";
const query = { type: "carros", brand: "56", model: "123", year: "2020-1" };
const favorite = {
  id: vehicleId(query),
  query,
  savedAt: "2026-11-18T12:00:00.000Z",
  details: {
    valor: "R$ 50.000,00",
    marca: "Teste",
    modelo: "Exemplo",
    anoModelo: 2020,
    combustivel: "Gasolina",
    codigoFipe: "001004-9",
    mesReferencia: "novembro de 2026",
    tipoVeiculo: 1,
    siglaCombustivel: "G",
    dataConsulta: "18/11/2026",
  },
};
test("validação dos favoritos antes de renderizar e salvar", () => {
  assert.equal(isFavoriteList([]), true);
  assert.equal(isFavoriteList([favorite]), true);
  assert.equal(isFavoriteList([favorite, favorite]), false);
  assert.equal(isFavoriteList([{ ...favorite, id: "outro" }]), false);
  assert.equal(
    isFavoriteList([{ ...favorite, details: { valor: "R$ 1,00" } }]),
    false,
  );
  assert.equal(
    isFavoriteList([{ ...favorite, query: { ...query, type: "aviao" } }]),
    false,
  );
  assert.equal(isFavoriteList([{ ...favorite, savedAt: "invalido" }]), false);
});

test("normalização da resposta real sem dataConsulta", async () => {
  const { normalizeDetails } = await import("../src/types/fipe.ts");
  const { dataConsulta, ...response } = favorite.details;
  assert.equal(
    normalizeDetails(response, "18/11/2026, 14:00").dataConsulta,
    "18/11/2026, 14:00",
  );
  assert.equal(
    normalizeDetails(favorite.details, "outro horário").dataConsulta,
    dataConsulta,
  );
  assert.throws(() => normalizeDetails({ valor: "R$ 1,00" }, "agora"));
});
