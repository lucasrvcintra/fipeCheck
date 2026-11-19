# fipeCheck

Projeto da disciplina de Desenvolvimento em Dispositivos Móveis do curso de Sistemas de Informação da UniAcademia.

O fipeCheck consulta preços FIPE, salva veículos favoritos e compara o custo de compra e uso de dois carros conforme o cenário informado pelo usuário.

## Integrantes

- [Lucas Cintra](https://github.com/lucasrvcintra)
- [Igor Salles Mari](https://github.com/ISallesM)

## Situação atual

A entrega principal está implementada: cinco telas, consulta FIPE, favoritos persistentes, comparação de preços, custo de uso, IPVA estimado e financiamento. A validação manual em dispositivo Android ainda está pendente.

As integrações de segurança com Latin NCAP e NHTSA e o catálogo de consumo do Inmetro ficam como evolução futura. Não são exibidas notas ou dados de segurança nesta versão.

## Telas e navegação

| Tela | Funcionamento |
| --- | --- |
| Início | Apresentação e atalhos para Consulta, Favoritos e Comparativo. |
| Sobre | Integrantes, objetivo e link da fonte dos dados. |
| Consulta FIPE | Formulário único com tipo, marca, modelo e ano/combustível. O preço aparece na mesma tela e pode ser salvo ou atualizado nos favoritos. |
| Favoritos | Lista dos resultados salvos, disponível offline, com opção de remoção. |
| Comparativo | Seleção de dois carros favoritos distintos; diferença de preço, custo de uso, IPVA e financiamento. |

O Drawer contém Início, FIPE e Sobre. Dentro de FIPE, as Tabs contêm Consulta, Favoritos e Comparativo. Consulta e favoritos aceitam carros, motos e caminhões; o comparativo aceita somente carros.

A interface acompanha o tema claro/escuro do sistema. Há `SafeAreaProvider` na raiz, `SafeAreaView` nas telas e modais e tratamento das bordas já protegidas pelos navegadores.

## Como executar

Utilize Node.js 22.18 ou superior e npm. Os testes utilizam a execução nativa de TypeScript do Node.

```bash
npm install
npm start
```

Use o servidor Expo para abrir em um ambiente compatível com o SDK 58. Para iniciar diretamente com destino Android:

```bash
npm run android
```

## Consulta e armazenamento

O tipo selecionado carrega as marcas; a marca carrega os modelos; e o modelo carrega as opções de ano/combustível. O preço é buscado somente ao pressionar **Consultar preço**.

Alterar uma seleção limpa os campos dependentes e o resultado anterior. As requisições possuem loading, erro, nova tentativa e timeout de 20 segundos. Respostas canceladas não substituem as seleções atuais.

Favoritos guardam os identificadores da consulta, os dados FIPE e a data de salvamento, usando a chave `fipecheck_favorites_v1`. Consultar e salvar novamente a mesma combinação atualiza o registro. Quando a API não fornece `dataConsulta`, o app registra o horário de recebimento da resposta.

O comparativo usa os preços salvos e avisa sobre meses de referência diferentes. Os preços não são atualizados automaticamente. A opção **Lembrar km e preço do litro** grava essas duas preferências em `fipecheck_usage_v1`. Os demais campos de simulação ficam na sessão; trocar a dupla de carros reinicia o cenário.

A leitura inicial do armazenamento precisa terminar antes de salvar. Falhas são apresentadas na interface; em caso de erro de gravação, o estado anterior é mantido.

## Cálculos

Os valores monetários são apresentados em reais. Nos campos numéricos, prefira vírgula para decimais e não use separadores de milhar.

### Compra e financiamento

O comparativo mostra a diferença de B em relação a A, em reais e percentual sobre A. Com preço-base zero, o percentual fica indisponível.

O financiamento começa desativado, representando compra à vista. Ao ativá-lo pelo interruptor, informe entrada por carro (inicialmente zero), prazo inteiro positivo em meses e taxa efetiva anual compartilhada. Os cálculos são atualizados automaticamente quando os campos estão completos. A entrada deve estar entre zero e o preço do carro; a taxa não pode ser negativa.

Com `taxa = percentual anual / 100`:

```text
i = (1 + taxa)^(1/12) − 1
PV = FIPE − entrada
parcela = PV × i / (1 − (1 + i)^−n)
juros totais = parcela × n − PV
total da aquisição simulada = entrada + parcela × n
```

Com taxa zero, a parcela é `PV / n`. Com entrada integral, parcela e juros são zero. O cálculo utiliza funções matemáticas equivalentes para manter estabilidade com taxas muito pequenas. O arredondamento é feito na apresentação.

SELIC e CDI são consultados somente ao abrir o financiamento. São referências informativas e não preenchem a taxa do usuário. O app informa quando as obteve; a resposta da BrasilAPI não fornece a data-base. Loading ou erro dessas referências não bloqueiam a simulação manual.

A simulação não inclui IOF, tarifas ou outros encargos e não representa o CET de uma proposta bancária. [Informações do Banco Central sobre CET](https://www.bcb.gov.br/meubc/faqs/p/cuidados-na-hora-de-contratar-uma-operacao-de-credito).

### Custo de uso

Quilometragem mensal e preço do litro são compartilhados. Consumo em km/l, manutenção mensal e seguro mensal são informados por carro. Os valores iniciais de 1.000 km e R$ 6/l são exemplos editáveis; manutenção e seguro começam em zero, como hipóteses que o usuário deve ajustar.

```text
combustível mensal = km mensal ÷ consumo × preço do litro
uso mensal = combustível + manutenção + seguro + IPVA anual ÷ 12
uso anual = uso mensal × 12
custo por km = uso mensal ÷ km mensal
desembolso mensal durante o financiamento = uso mensal + parcela
```

Consumo e preço do combustível devem ser positivos. Com km zero, as despesas fixas continuam disponíveis e o custo por km fica indisponível. O custo de uso é separado do valor de aquisição, evitando somar o preço FIPE novamente às parcelas.

### IPVA estimado

O cenário inicial usa **4% para automóvel particular em MG**, referência do exercício **2026**, verificada em **18/11/2026**. A alíquota é editável. Para outra UF, o usuário deve fornecer a alíquota manualmente.

```text
IPVA anual estimado = preço FIPE salvo × alíquota percentual ÷ 100
```

É uma estimativa, sem inferir isenções, descontos ou proporcionalidade. A base oficial de cálculo da Sefaz pode ser diferente da FIPE salva. Não há tabela automática das 27 UFs.

- [Regra geral e alíquotas — SEF/MG](https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/ipva/duvidas_frequentes/index.html)
- [Base de cálculo — SEF/MG](https://www.fazenda.mg.gov.br/empresas/impostos/ipva/calculo.html)

## Fontes externas

[Documentação da BrasilAPI](https://brasilapi.com.br/docs#tag/FIPE), base `https://brasilapi.com.br/api`:

| Endpoint | Uso |
| --- | --- |
| `/fipe/marcas/v1/{tipo}` | Marcas por tipo de veículo. |
| `/fipe/veiculos/v1/{tipo}/{marca}` | Modelos da marca. |
| `/fipe/anos/v1/{tipo}/{marca}/{modelo}` | Anos e combustíveis. |
| `/fipe/detalhes/v1/{tipo}/{marca}/{modelo}/{ano}` | Preço e detalhes. |
| `/taxas/v1` | SELIC/CDI de referência. |

Não é necessária chave de API. Consulta FIPE e referências econômicas precisam de conexão; favoritos e cálculos locais funcionam offline.

## Design

A interface segue as diretrizes do [DESIGN.md da NerdWallet](https://getdesign.md/nerdwallet/design-md) (análise independente, não oficial): verde *spruce* apenas para ações e estados ativos, superfícies *mint* para separar seções, linhas finas no lugar de sombras, botões com raio de 2px e cartões com 8px, e destaque em verde-limão sobre o verde escuro. A fonte Gotham foi substituída pela Montserrat (`@expo-google-fonts/montserrat`), e o texto corrido usa peso 400 em vez de 300 para manter a legibilidade em telas pequenas. O documento não define tema escuro; a paleta escura foi derivada. Os tokens ficam em `src/constants/theme.ts`.

No comparativo, os campos de A e B ficam lado a lado, o menor valor de cada linha é destacado em verde e um bloco de destaque resume a diferença de compra e de gasto mensal.

## Organização e tecnologias

React Native, Expo SDK 58, TypeScript, Expo Router, `fetch`, AsyncStorage, Context, `useState`, `useEffect`, `StyleSheet` e Flexbox.

- `src/app`: cinco telas e layouts de navegação.
- `src/components`: seletores com busca, resumo de veículo, feedback, campos e comparações reutilizáveis.
- `src/services`: comunicação com a BrasilAPI.
- `src/context` e `src/hooks`: favoritos, persistência e carregamento de opções.
- `src/utils`: funções de cálculo independentes da interface.
- `src/types` e `src/data`: contratos, validação e referência de IPVA.
- `tests`: cenários de cálculos e validação dos dados salvos.

## Validação

```bash
npm run lint
npx tsc --noEmit
npm test
npx expo-doctor
npx expo export --platform android
```

Foram verificados lint, TypeScript, 13 testes automatizados, diagnóstico Expo com 20/20 verificações e geração de bundle Android. Também foi percorrido o fluxo real da BrasilAPI para um Corolla: marcas, modelos, anos e detalhes retornaram HTTP 200.

Ainda é necessário validar em aparelho/emulador: navegação, tema claro/escuro, teclado, nomes longos, áreas seguras, comportamento sem conexão, reinício para verificar persistência e falhas de armazenamento. O bundle exportado não equivale a um APK instalado nem substitui essa validação.

## Histórico por etapas

| Etapa | Entrega | Commit |
| --- | --- | --- |
| 1 | Estado inicial | `c04f6f9` |
| 2 | Reset do projeto | `8cadb25` |
| 3 | Proposta original e telas | `efc6850` |
| 3.1 | Ampliação do comparativo | `01beb40` |
| 4 | Tema e áreas seguras | `957d223` |
| 5 | Drawer e Tabs | `b8763fa` |
| 6 | Tipo e marcas | `094f5a5` |
| 7 | Modelo e ano/combustível | `d3f03c5` |
| 8 | Preço FIPE | `d717526` |
| 9 | Favoritos persistentes | `73fdc7b` |
| 10 | Comparação de preços | `a163bab` |
| 11 | Custo de uso | `7a94ae7` |
| 12 | IPVA estimado | `a2db88d` |
| 13 | Financiamento e referências econômicas | `fac3f8b` |
| 14 | Revisão e validação automatizada | `9d8cd9f` |
| 15–16 | Latin NCAP e NHTSA | Evolução futura, opcional |
| 17 | Documentação e roteiro | Este documento |

## Roteiro de apresentação

1. Navegar pelo Drawer e pelas três abas de FIPE.
2. Consultar dois carros e salvar os resultados nos favoritos.
3. Escolher a dupla no Comparativo e explicar os meses de referência.
4. Informar consumo e despesas; mostrar custo mensal, anual e por km.
5. Alterar alíquota de IPVA e explicar por que o resultado é estimado.
6. Ativar financiamento e demonstrar taxa manual, parcelas e juros totais.
7. Demonstrar taxa zero, entrada integral e quilometragem zero.
8. Desconectar e mostrar favoritos e cálculos locais; reiniciar para conferir persistência.
9. Explicar componentes reutilizáveis, estado, efeitos, serviços e funções de cálculo.

## Evoluções futuras

- Catálogo local de testes Latin NCAP, com versão, equipamentos, protocolo, fonte e condições de aplicação verificadas.
- Referências NHTSA e recalls dos EUA, sem assumir equivalência com o carro brasileiro. A busca exigirá correspondência explícita e seleção de variante quando necessário.
- Catálogo de consumo do Inmetro para reduzir digitação.

Esses itens não fazem parte da entrega principal implementada. A versão atual não usa IA para produzir análises durante o uso do aplicativo.

## Apoio de inteligência artificial

Foi utilizado o Codex, baseado em GPT-6, como apoio na escolha do nome fipeCheck, na elaboração e revisão do plano e na redação deste README. Nesta implementação, o assistente também gerou código das funcionalidades e dos testes, consultou documentação e executou verificações. Os integrantes devem revisar, compreender e validar o material conforme as regras da disciplina.
