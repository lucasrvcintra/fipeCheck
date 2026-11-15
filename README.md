# fipeCheck

Projeto final da disciplina de Desenvolvimento em Dispositivos Móveis do curso de Sistemas de Informação da UniAcademia.

O fipeCheck permitirá consultar preços de veículos na tabela FIPE, salvar veículos favoritos no dispositivo e comparar os valores de dois favoritos.

## Integrantes

- [Lucas Cintra](https://github.com/lucasrvcintra)
- [Igor Salles Mari](https://github.com/ISallesM)

## Situação atual

O repositório já possui o commit inicial e o reset do projeto Expo. As telas e funcionalidades descritas abaixo estão planejadas e ainda serão desenvolvidas.

## Telas planejadas

| Tela | Funcionamento |
| --- | --- |
| Início | Apresentação do aplicativo e atalhos para Consulta FIPE, Favoritos e Comparativo. |
| Sobre | Objetivo do projeto, integrantes e fonte dos dados. |
| Consulta FIPE | Formulário para selecionar tipo de veículo, marca, modelo e ano/combustível. Após enviar o formulário, o preço e os dados do veículo aparecerão na própria tela, com a opção de favoritar. |
| Favoritos | Lista dos veículos salvos, com os dados da consulta, opção de remoção e acesso ao comparativo. |
| Comparativo | Seleção de dois favoritos distintos para comparar dados e preços, mostrando a diferença em reais e quanto o veículo B custa a mais ou a menos que o A, em percentual sobre o preço de A. |

### Navegação

O aplicativo utilizará dois tipos de navegadores com Expo Router:

- **Drawer:** Início, FIPE e Sobre.
- **Tabs dentro de FIPE:** Consulta, Favoritos e Comparativo.

### Consulta e dados salvos

A consulta terá campos dependentes: a escolha do tipo carregará as marcas; a marca carregará os modelos; e o modelo carregará as opções de ano e combustível. O preço será consultado ao pressionar **Consultar FIPE**, com todos os campos preenchidos.

Cada requisição terá indicação de carregamento e tratamento de erro, com opção de tentar novamente. Ao alterar um campo, as seleções dependentes e o resultado anterior serão limpos.

Os favoritos guardarão os dados da consulta no dispositivo. O comparativo utilizará esses valores salvos, permitindo seu uso sem conexão. O mês de referência será exibido para cada veículo, com aviso quando as referências forem diferentes. A atualização dos preços dependerá de uma nova consulta à API.

## Tecnologias e organização

O projeto já utiliza React Native, Expo SDK 58, TypeScript, Expo Router e `react-native-safe-area-context`.

Durante o desenvolvimento, estão previstos:

- `fetch` para comunicação com a BrasilAPI.
- `useState` e `useEffect` para estado e efeitos das telas.
- Context e AsyncStorage para compartilhar e persistir favoritos. O AsyncStorage ainda será instalado.
- `StyleSheet` e Flexbox para estilização e organização da interface.
- Tema claro e escuro acompanhando a configuração do dispositivo.
- `SafeAreaProvider` na raiz e `SafeAreaView` nas telas e modais.
- Componentes reutilizáveis para seleção de opções, resumo do veículo e mensagens de feedback.

As rotas ficarão em `src/app`. Componentes, serviços, tipos e Context ficarão em pastas próprias dentro de `src`, fora da pasta de rotas.

## API

Os dados serão consultados nos endpoints FIPE da [BrasilAPI](https://brasilapi.com.br/docs#tag/FIPE), usando a base `https://brasilapi.com.br/api`.

O formulário utilizará consultas de marcas, modelos, anos/combustíveis e detalhes de carros, motos e caminhões.

## Como executar

Com Node.js e npm instalados, execute na pasta do projeto:

```bash
npm install
npm expo start
```

O segundo comando iniciará o servidor de desenvolvimento do Expo. A validação principal do aplicativo será feita em Android.

## Etapas de desenvolvimento

Cada etapa será registrada em um commit separado, conforme sua conclusão.

| Etapa | Entrega | Commit | Situação |
| --- | --- | --- | --- |
| 1 | Estado inicial do projeto | `Initial commit` | Concluída — `c04f6f9` |
| 2 | Reset do projeto Expo | `chore: reset project` | Concluída — `8cadb25` |
| 3 | Proposta do aplicativo e descrição das telas | `docs: describe app proposal and screens` | Concluída — `efc6850` |
| 4 | Tema, componentes de tema e áreas seguras | `feat: configure theme and safe areas` | Planejada |
| 5 | Drawer, abas e telas iniciais | `feat: add drawer and fipe tabs` | Planejada |
| 6 | Formulário com tipo de veículo e marcas | `feat: start fipe form with vehicle types and brands` | Planejada |
| 7 | Seletores dependentes de modelo e ano/combustível | `feat: add dependent model and year selectors` | Planejada |
| 8 | Consulta de preço e resultado no formulário | `feat: submit fipe query and display vehicle price` | Planejada |
| 9 | Favoritos com armazenamento local | `feat: persist favorite vehicles locally` | Planejada |
| 10 | Comparação de dois favoritos | `feat: compare two favorite vehicles` | Planejada |
| 11 | Revisão de formulário, navegação, layout e feedback | `fix: refine forms and comparison layout` | Planejada |
| 12 | Documentação final e roteiro de apresentação | `docs: document setup and presentation guide` | Planejada |

## Apoio de inteligência artificial

Foi utilizado o Codex, baseado em GPT-6, como apoio na escolha do nome fipeCheck, na elaboração do plano de implementação e na redação deste README.
