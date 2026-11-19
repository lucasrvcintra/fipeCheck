# fipeCheck

Projeto da disciplina de Desenvolvimento em Dispositivos Móveis do curso de Sistemas de Informação da UniAcademia.

O fipeCheck consulta preços FIPE, salva veículos favoritos e compara o custo de compra e uso de dois carros conforme o cenário informado pelo usuário.

## Integrantes

- [Lucas Cintra](https://github.com/lucasrvcintra)
- [Igor Salles Mari](https://github.com/ISallesM)

## Situação atual

A entrega principal está implementada: cinco telas, consulta FIPE, favoritos persistentes, comparação de preços, custo de uso, IPVA estimado, financiamento e aplicação hipotética do valor FIPE. A validação manual em dispositivo Android ainda está pendente.

O catálogo de consumo do Inmetro fica como evolução futura.

## Telas e navegação

| Tela | Funcionamento |
| --- | --- |
| Início | Apresentação e atalhos para Consulta, Favoritos e Comparativo. |
| Sobre | Integrantes, objetivo e link da fonte dos dados. |
| Consulta FIPE | Formulário único com tipo, marca, modelo e ano/combustível. O preço aparece na mesma tela e pode ser salvo ou atualizado nos favoritos. |
| Favoritos | Lista dos resultados salvos, disponível offline, com opção de remoção. |
| Comparativo | Seleção de dois carros favoritos distintos; diferença de preço, custo de uso, IPVA, financiamento e aplicação hipotética. |

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

O tipo selecionado carrega as marcas; a marca carrega os modelos; e o modelo carrega as opções de ano/combustível. Ano e combustível ficam em um único campo, como a FIPE os fornece; quando o modelo tem apenas uma opção, ela é selecionada automaticamente. O preço é buscado somente ao pressionar **Consultar preço**.

Alterar uma seleção limpa os campos dependentes e o resultado anterior. As requisições possuem loading, erro, nova tentativa e timeout de 20 segundos. Respostas canceladas não substituem as seleções atuais.

Favoritos guardam os identificadores da consulta, os dados FIPE e a data de salvamento, usando a chave `fipecheck_favorites_v1`. Consultar e salvar novamente a mesma combinação atualiza o registro. Quando a API não fornece `dataConsulta`, o app registra o horário de recebimento da resposta.

O comparativo usa os preços salvos e avisa sobre meses de referência diferentes. Os preços não são atualizados automaticamente. A opção **Lembrar km e preço do litro** grava essas duas preferências em `fipecheck_usage_v1`. Os demais campos de simulação ficam na sessão; trocar a dupla de carros reinicia o cenário. Inverter A e B preserva as premissas compartilhadas e mantém entrada, consumo e despesas associados ao respectivo veículo.

A leitura inicial do armazenamento precisa terminar antes de salvar. Falhas são apresentadas na interface; em caso de erro de gravação, o estado anterior é mantido.

## Cálculos

Os valores monetários são apresentados em reais. Nos campos numéricos, prefira vírgula para decimais e não use separadores de milhar.

### Compra e financiamento

O comparativo mostra a diferença de B em relação a A, em reais e percentual sobre A. Com preço-base zero, o percentual fica indisponível.

O financiamento começa desativado, representando compra à vista. Ao ativá-lo pelo interruptor, informe entrada por carro (inicia em zero), prazo inteiro positivo em meses e taxa efetiva anual compartilhada. Os resultados são recalculados automaticamente quando todos os campos estão preenchidos, assim como o custo de uso. A entrada deve estar entre zero e o preço do carro; a taxa não pode ser negativa.

Com `taxa = percentual anual / 100`:

```text
i = (1 + taxa)^(1/12) − 1
PV = FIPE − entrada
parcela = PV × i / (1 − (1 + i)^−n)
juros totais = parcela × n − PV
total da aquisição simulada = entrada + parcela × n
```

Com taxa zero, a parcela é `PV / n`. Com entrada integral, parcela e juros são zero. O cálculo utiliza funções matemáticas equivalentes para manter estabilidade com taxas muito pequenas. O arredondamento é feito na apresentação.

SELIC e CDI são consultados quando a comparação dos dois carros é aberta. A mesma resposta é compartilhada entre o financiamento e a aplicação hipotética. No financiamento, são referências informativas e não preenchem a taxa do usuário. O app informa quando as obteve; a resposta da BrasilAPI não fornece a data-base. Loading ou erro dessas referências não bloqueiam a simulação manual.

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

Consumo e preço do combustível devem ser positivos. Com km zero, as despesas fixas continuam disponíveis e o custo por km fica indisponível. O custo de uso é separado do valor de aquisição, evitando somar o preço FIPE novamente às parcelas. Quando há financiamento, o resumo compara o gasto mensal durante as parcelas, sem multiplicá-lo por 12; a linha de uso anual continua excluindo as parcelas.

### IPVA estimado

O cenário inicial usa **4% para automóvel particular em MG**, referência do exercício **2026**, verificada em **19/11/2026**. A alíquota é editável. Para outra UF, o usuário deve fornecer a alíquota manualmente.

```text
Se fabricação completar 20 anos ou mais no exercício (a partir de 2026): IPVA = 0
Caso contrário: IPVA anual estimado = preço FIPE salvo × alíquota percentual ÷ 100
```

É uma estimativa que considera a imunidade por idade de automóveis de passageiros; não infere outras isenções, descontos ou proporcionalidade. A base oficial de cálculo da Sefaz pode ser diferente da FIPE salva. Não há tabela automática das 27 UFs.

A partir do exercício de 2026, o app considera a imunidade nacional de IPVA para automóveis de passageiros com **20 anos ou mais de fabricação**, conforme a EC 137/2025. No exercício de 2026, o corte é fabricação até 2006, inclusive. O benefício é aplicado separadamente a cada carro e também zera sua provisão mensal no custo de uso. A regra de idade vale tanto no cenário de MG quanto na alíquota manual; não cobre automaticamente benefícios estaduais com prazos menores.

A FIPE fornece o ano-modelo, que pode diferir da fabricação. Os campos **Fabricação A/B** começam com uma estimativa baseada no ano-modelo e devem ser conferidos no documento do veículo. Para zero km ou ano-modelo futuro, o valor inicial é o exercício de 2026. Ajustes de fabricação ficam vinculados ao veículo e são preservados ao inverter A/B. O comparativo continua restrito ao cenário de automóveis de passageiros: a imunidade não é generalizada a todas as categorias da FIPE.

- [EC 137/2025 — fonte da imunidade por idade](https://legis.senado.leg.br/norma/41822113/publicacao/41822284)
- [Aplicação em MG no IPVA 2026 — SEF/MG](https://www.fazenda.mg.gov.br/noticias/2026/2026.02.02_IPVA/index.html)
- [Regra geral e alíquotas — SEF/MG](https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/ipva/duvidas_frequentes/index.html)
- [Base de cálculo — SEF/MG](https://www.fazenda.mg.gov.br/empresas/impostos/ipva/calculo.html)

### Aplicar em vez de comprar

No passo 5 do Comparativo, escolha SELIC ou CDI e informe o prazo da aplicação em meses inteiros positivos (inicialmente 12). O capital de cada cenário corresponde ao preço FIPE salvo do respectivo carro. A taxa anual usada é a retornada pela BrasilAPI em `/taxas/v1`, sem valor de juros fixo no código.

```text
saldo final = capital × (1 + taxa anual / 100)^(meses / 12)
rendimento bruto = saldo final − capital
```

A interface mostra capital inicial, rendimento bruto e saldo final bruto para cada carro. Assume taxa anual efetiva constante, capitalização composta, ausência de aportes ou retiradas e não desconta impostos, tarifas ou inflação. Não representa um produto financeiro específico, uma previsão ou garantia de rendimento. Não inclui parcelas nem estima o preço futuro do carro: são cenários separados de não comprar e manter o dinheiro aplicado.

A resposta da API não informa a data-base das taxas; o app identifica o momento em que as recebeu. Se a consulta falhar, a projeção fica indisponível com opção de tentar novamente, enquanto os demais cálculos locais continuam disponíveis. Taxa e prazo da aplicação são independentes dos campos do financiamento. Inverter A/B preserva essas escolhas.

## Fontes externas

[Documentação da BrasilAPI](https://brasilapi.com.br/docs#tag/FIPE), base `https://brasilapi.com.br/api`:

| Endpoint | Uso |
| --- | --- |
| `/fipe/marcas/v1/{tipo}` | Marcas por tipo de veículo. |
| `/fipe/veiculos/v1/{tipo}/{marca}` | Modelos da marca. |
| `/fipe/anos/v1/{tipo}/{marca}/{modelo}` | Anos e combustíveis. |
| `/fipe/detalhes/v1/{tipo}/{marca}/{modelo}/{ano}` | Preço e detalhes. |
| `/taxas/v1` | SELIC/CDI para referência do financiamento e cálculo da aplicação hipotética. |

Não é necessária chave de API. Consulta FIPE e referências econômicas precisam de conexão; favoritos e cálculos locais funcionam offline. A projeção de aplicação exige carregar as taxas na sessão atual; elas não são persistidas entre reinícios.

## Design

A interface segue as diretrizes do [DESIGN.md da NerdWallet](https://getdesign.md/nerdwallet/design-md) (análise independente, não oficial): verde *spruce* apenas para ações e estados ativos, superfícies *mint* para separar seções, linhas finas no lugar de sombras, botões com raio de 2px e cartões com 8px, e destaque em verde-limão sobre o verde escuro. A fonte Gotham foi substituída pela Montserrat (`@expo-google-fonts/montserrat`), e o texto corrido usa peso 400 em vez de 300 para manter a legibilidade em telas pequenas. O documento não define tema escuro; a paleta escura foi derivada. Os tokens ficam em `src/constants/theme.ts`.

No comparativo, os campos de A e B ficam lado a lado, o menor valor de cada linha é destacado em verde e um bloco de destaque resume a diferença de compra e de gasto mensal.

## Organização e tecnologias

React Native, Expo SDK 58, TypeScript, Expo Router, `fetch`, AsyncStorage, Context, `useState`, `useEffect`, `StyleSheet` e Flexbox.

- `src/app`: cinco telas e layouts de navegação.
- `src/components`: seletores com busca, resumo de veículo, feedback, campos e comparações reutilizáveis.
- `src/constants`: tokens de cor, tipografia, espaçamento e raio.
- `src/services`: comunicação com a BrasilAPI.
- `src/context` e `src/hooks`: favoritos, persistência e carregamento de opções.
- `src/utils`: funções de cálculo independentes da interface.
- `src/types` e `src/data`: contratos, validação e referência de IPVA.

## Validação

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android
```

Foram verificados lint, TypeScript, diagnóstico Expo com 20/20 verificações e geração de bundle Android. Os cenários de cálculo foram verificados durante o desenvolvimento; os arquivos de testes foram removidos desta versão, assim como o comando `npm test`. A correção da imunidade de IPVA foi conferida com sete cenários de regressão executados em arquivo temporário. Também foi percorrido o fluxo real da BrasilAPI para um Corolla: marcas, modelos, anos e detalhes retornaram HTTP 200.

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
| 15 | Documentação e roteiro da entrega principal | `c4579b9` |
| 16 | Atualização de layout e usabilidade | `75ca7bb` |
| 17 | Aplicação hipotética do valor FIPE com SELIC/CDI | `90c82c8` |
| 18 | Correções finais: inversão A/B, botões, resumo e IPVA por idade | Este commit |

## Roteiro de apresentação

1. Navegar pelo Drawer e pelas três abas de FIPE.
2. Consultar dois carros e salvar os resultados nos favoritos.
3. Escolher a dupla no Comparativo e explicar os meses de referência.
4. Informar consumo e despesas; mostrar custo mensal, anual e por km.
5. Alterar alíquota de IPVA e explicar por que o resultado é estimado.
6. Ativar financiamento e demonstrar taxa manual, parcelas e juros totais.
7. Simular a aplicação do valor FIPE: alternar SELIC/CDI e alterar o prazo, explicando as hipóteses do rendimento bruto.
8. Demonstrar taxa zero, entrada integral e quilometragem zero.
9. Desconectar e mostrar favoritos e cálculos locais; reiniciar para conferir persistência.
10. Explicar componentes reutilizáveis, estado, efeitos, serviços e funções de cálculo.

## Evoluções futuras

- Catálogo de consumo do Inmetro para reduzir digitação.

Esse item não faz parte da entrega principal implementada. A versão atual não usa IA para produzir análises durante o uso do aplicativo.

## Apoio de inteligência artificial

| Ferramenta | Modelo | Finalidade |
| --- | --- | --- |
| Codex | GPT-6 | Escolha do nome fipeCheck, elaboração e revisão do plano, redação deste README, consulta à documentação, execução de verificações (lint, TypeScript, Expo Doctor) e geração de código das funcionalidades e dos testes. |
| Claude Code | Claude Opus 5.5 | Conferência do projeto em relação aos requisitos do enunciado e revisão desta seção do README. |

A geração de código foi orientada pelos padrões e referências das entregas anteriores da disciplina (estrutura de pastas, Expo Router, `fetch`, AsyncStorage, componentes e estilização com `StyleSheet`), e não feita de forma livre. Todo o código foi revisado e ajustado pelos integrantes, que se responsabilizam por ele.
