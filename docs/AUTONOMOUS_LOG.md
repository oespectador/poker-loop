# Autonomous Log

## 2026-08-24 — Correção ARIA da V0.35

Removidos `aria-controls` e o `contentId` do controle de expansão porque o alvo só existe no DOM enquanto a sugestão está aberta. O botão mantém `aria-expanded`, e o detalhe continua condicional e imediatamente dentro do mesmo card. Apresentação, seleção única, promoção, descarte, storage e demais contratos V0.35 não mudaram. **Validação:** 573 testes, typecheck, build e `git diff --check`.

## 2026-08-24 — V0.35 Revisão Visual das Situações Importadas

**Hipótese de trabalho:** reconhecer rapidamente cartas, data e motivo e abrir o detalhe no mesmo ponto da grade reduz busca visual, especialmente no celular, sem mudar quais mãos são selecionadas nem como são interpretadas.

Extraído `HandSuggestionCard`, principalmente apresentacional. O resumo reutiliza `PokerCard`, omite board e `reasonMessage` e dá primazia a **Revisar situação**, mantendo Salvar e Descartar como ações secundárias diretas. A única seleção efêmera existente controla uma expansão inline que ocupa toda a grade e reutiliza `ParsedHandVisualization`, seguida de histórico bruto, motivo factual, disclosure e ações completas. Abrir outra sugestão substitui a anterior; abrir a mesma novamente fecha.

Persistência, promoção para Revisar, descarte, `surfacedSuggestionIds`, lote, filtros e state machine V0.34 não mudaram. Home V0.33, Quick Review, Decision View, corte anti-hindsight e motor pedagógico também permaneceram inalterados. Nenhuma chave de storage, análise de poker ou uso de resultado financeiro foi criado. **Validação:** 573 testes, typecheck, build e `git diff --check`; validação humana deve confirmar a leitura e o fluxo inline em telas pequenas.

## 2026-08-24 — Correção acessível da V0.34

- os headings dos grupos de filtros agora recebem os IDs estáveis `filter-group-situations` e `filter-group-river-actions`, separados da copy humana;
- cada `aria-labelledby` reutiliza exatamente o ID calculado para seu heading, sem whitespace em IDREFs;
- nenhuma lógica, filtro, state machine, seleção, persistência ou integração pedagógica foi alterada;
- validação: `npm test` (568 testes), `npm run typecheck`, `npm run build` e `git diff --check`.

## 2026-08-24 — V0.34: Exploração por ações no river

### Hipótese

Filtros derivados da cronologia das ações tornam intenções concretas de revisão encontráveis sem converter ações observadas em interpretação estratégica.

### Alterações e auditoria de escopo

- adicionadas cinco ações do Hero e três relações factuais de agressão no river;
- centralizada uma state machine pura que distingue bet/raise e funciona em multiway;
- agrupados filtros em Situações e Ações no river, preservando seleção única e comportamento de zero resultados;
- preservados pool, ordem, surfaced, pending, teto de 15 e transação compartilhada com +5/+10;
- confirmados sem resultado financeiro, bluff/value/erro, novo storage, Home V0.33 ou motor pedagógico.

### Validação

`npm test` (568 testes), `npm run typecheck`, `npm run build` e `git diff --check`.

## 2026-08-23 — V0.32: Mãos por intenção

### Hipótese

Separar `/hands` em Explorar, Revisar e Acompanhar reduz a carga visual e torna a próxima ação legível sem alterar seleção, revisão ou evidência.

### Alterações e auditoria de escopo

- criada navegação acessível de três áreas, com estado React efêmero;
- criada escolha inicial pura: investigação/follow-up ativo → Acompanhar; sugestão/batch restante → Explorar; caso contrário → Revisar;
- reorganizada somente a renderização existente; salvar sugestão e abrir mão relacionada selecionam a mão em Revisar;
- adicionados empty states e estilos locais alinhados à identidade atual;
- confirmados sem alteração V0.30/V0.31, Quick Review, schemas, thresholds, proveniência, comparações, storage e motor pedagógico;
- adicionados 20 testes, elevando a suíte de 516 para 536; a correção de revisão mantém os três `tabpanel` montados, usa `section` e esconde os inativos com `hidden`.

### Validação

`npm test` (536 testes), `npm run typecheck`, `npm run build` e `git diff --check`.

## 2026-08-18 — Handoff inicial

### Objetivo

Preparar Poker Loop V0.4 para ser compreendido por um agente de código externo sem depender do histórico completo da conversa original.

### Alterações

- criado `AGENTS.md`;
- documentada visão do produto;
- documentado modelo de aprendizagem;
- documentadas regras de conteúdo/terminologia;
- registrado estado técnico da V0.4;
- congeladas decisões relevantes;
- criado protocolo de desenvolvimento autônomo;
- criado protocolo de testes;
- criado backlog priorizado;
- criada política de fontes;
- criada primeira tarefa controlada para Jules.

### Código de produto

Nenhum comportamento do aplicativo foi alterado nesta etapa.

### Próximo passo recomendado

Executar o primeiro experimento com Jules usando `docs/JULES_TRIAL_TASK.md`. Avaliar o diff antes de permitir tarefas maiores ou mais abertas.

## 2026-08-19 — Suíte automatizada do motor V0.4

### Objetivo

Caracterizar os invariantes atuais do scheduler e da biblioteca com testes automatizados, sem alterar comportamento de produto.

### Hipótese trabalhada

Uma suíte pequena, determinística e executada pelo test runner nativo do Node pode proteger a ordem pedagógica, os bloqueios de conteúdo inédito e a separação entre desenvolvimento e avaliação sem exigir refatoração do motor nem nova dependência.

### Alterações

- criado `npm test`, que compila a suíte TypeScript em diretório temporário e usa `node:test`;
- adicionados testes da primeira sessão fundadora e dos três microblocos de `range-actions`;
- caracterizados bloqueio de `range-to-decision`, retomada parcial e estabilidade da introdução após erro;
- caracterizada a repriorização pós-erro fora da introdução, sem repetição imediata da mesma questão;
- cobertos treino manual, adaptive fill, exclusão de retenção/transferência e integridade básica de IDs/respostas;
- documentado o comando em `docs/TESTING.md`.

### Comportamento antes/depois

O comportamento do scheduler, conteúdo, UI, navegação e storage não foi alterado. Depois da mudança, os invariantes existentes podem ser verificados de forma reproduzível por `npm test`.

### Testes executados

- `npm test`: 10 testes aprovados;
- `npm run typecheck`: aprovado;
- `npm run build`: aprovado (Next.js 16.3.1 disponível no ambiente).

### Riscos e limitações

- A suíte testa o motor diretamente e não cobre persistência/UI ponta a ponta.
- A instalação de Vitest foi tentada, mas o registry respondeu HTTP 403. Para evitar dependência e manter compatibilidade com Node `>=20.9.0`, foi adotado `node:test` com uma compilação TypeScript temporária.
- Não foi encontrado bug de comportamento nos invariantes solicitados; não há decisão humana pendente nesta unidade.

### Auditoria de escopo

O diff foi revisado para remover artefatos gerados pelo build. Não houve refatoração do scheduler nem mudança de conteúdo, copy, regras pedagógicas, navegação ou storage.

### Próximo passo recomendado

Em unidade separada, considerar os validadores adicionais já listados no backlog (sequências de pacote, opções vazias e requisitos editoriais de pista), sem misturá-los a mudanças de produto.

## 2026-08-19 — Portabilidade do comando de testes

### Objetivo e alteração

Tornar `npm test` compatível com Windows e Linux sem dependências: a limpeza de `.test-dist` passou de `rm -rf` para `fs.rmSync`, e a execução deixou de depender de expansão de glob pelo shell ao apontar explicitamente para o único arquivo de teste compilado.

### Escopo e validação

Somente o script de teste foi funcionalmente alterado. Testes, scheduler, conteúdo, UI, navegação, storage e comportamento do produto permaneceram intactos. Foram executados com sucesso `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`. Nenhuma limitação ou decisão humana pendente foi encontrada.

## 2026-08-19 — Integração contínua no GitHub Actions

### Objetivo e hipótese trabalhada

Executar automaticamente a validação já disponível em pushes para `main` e pull requests direcionados à `main`. A hipótese é que instalar as dependências e executar testes, typecheck e build em sequência reduz o risco de integrar regressões sem ampliar o produto.

### Alterações e comportamento antes/depois

- adicionado um workflow de CI com Node 20 e permissão de leitura para o conteúdo do repositório;
- antes, as validações dependiam de execução local; depois, `npm test`, `npm run typecheck` e `npm run build` também são executados pelo GitHub Actions nos eventos definidos;
- nenhum comportamento do scheduler, exercícios, app, UI, navegação ou storage foi alterado.

### Validação, riscos e decisões pendentes

Foram executados localmente `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`. O risco residual é a primeira execução ocorrer somente após o workflow chegar ao GitHub. Não há decisão humana pendente; o próximo passo recomendado é observar a primeira execução da CI na pull request.

### Correção da configuração de cache

Como o repositório não possui `package-lock.json`, a configuração explícita de cache do npm foi removida do `actions/setup-node`. O workflow continua usando Node 20 e executando instalação, testes, typecheck e build sem alterar o produto ou adicionar um lockfile.

## 2026-08-19 — Validação estática da biblioteca e semântica de suporte

### Objetivo

Caracterizar automaticamente a integridade da biblioteca V0.4 e proteger a classificação já existente das tentativas por nível de suporte, sem alterar estratégia, conteúdo pedagógico, UI, storage ou scheduler.

### Alterações

- criado um validador puro para IDs de exercícios e opções, labels duplicados após remoção de espaços nas extremidades, resposta correta, presença de pista, purpose das coleções e composição de `allExercises`;
- explicitado o contrato atual dos pacotes estruturados `range-actions` e `range-to-decision`: 12 sequências obrigatórias, únicas e contínuas em cada pacote de desenvolvimento; `foundations` permanece fora desse contrato sequencial;
- extraída de `TrainingSession` somente a função pura que classifica o suporte efetivamente usado, mantendo o componente como consumidor da mesma lógica;
- adicionados testes positivos sobre a biblioteca real, testes negativos de cada família de validação e testes explícitos das quatro regras de suporte;
- tornado `npm test` capaz de executar todos os arquivos compilados no diretório de testes sem glob do shell.

### Invariantes protegidos

- `guided` é registrado como `guided`;
- `supported` com pista aberta é registrado como `supported`;
- `supported` sem pista aberta é registrado como `independent`;
- `independent` é registrado como `independent`;
- as coleções ativa e reservada mantêm purposes compatíveis, e `allExercises` continua sendo sua concatenação ordenada;
- os dois pacotes estruturados possuem as sequências 1–12 sem lacunas ou duplicatas;
- exercícios que exibem suporte na experiência atual (`guided` e `supported`) possuem `supportNote`.

### Testes executados

- `npm test`: 20 testes aprovados;
- `npm run typecheck`: aprovado;
- `npm run build`: aprovado;
- `git diff --check`: aprovado.

### Violações, riscos e limitações

Nenhuma inconsistência real foi encontrada na biblioteca atual. O validador caracteriza o contrato fechado da V0.4 para os dois pacotes estruturados conhecidos, inclusive a quantidade exata de 12 itens e o intervalo permitido de 1 a 12; adicionar outro pacote estruturado exigirá declarar deliberadamente sua sequência esperada. Não houve mudança em exercícios, packageSequence, prompts, respostas, feedback, pistas ou comportamento visível.

### Decisão humana pendente

Nenhuma.

## 2026-08-20 — V0.5 Lógica × Calibração

### Objetivo e hipótese trabalhada

Implementar a especificação fechada do terceiro pacote pedagógico. A hipótese é
que 12 decisões em três microblocos ajudam o aluno a separar coerência lógica de
força da evidência e, ao final, agir sob incerteza sem transformar calibração em
uma nova Skill.

### Alterações e comportamento antes/depois

- adicionados 12 exercícios de desenvolvimento `dev-calibration-01` a
  `dev-calibration-12`, usando `range-reading` e `integrated-decision`;
- adicionados três itens reservados de retenção e três de transferência, que
  permanecem fora do treino normal;
- incluído `calibration` depois de `range-to-decision` na ordem já existente,
  com foco automático em `range-reading` e sem alterar storage ou algoritmos de
  prioridade;
- ampliado o validador para exigir exatamente as sequências 1–12 do pacote;
- adicionados testes de bloqueio, microblocos, retomada, estabilidade da ordem,
  treino manual, itens reservados e integridade estática.

Antes, a biblioteca encerrava em V0.4 com 36 itens de desenvolvimento. Depois,
ela possui 48 itens de desenvolvimento e 24 reservados; os 12 novos itens só
começam depois de todos os itens de `range-to-decision` terem sido apresentados.

### Escopo, riscos e validação humana

Não foram criados Skill, UI, porcentagens de confiança, notas de jogadores,
backend ou mudanças de storage. Defaults populacionais dos exercícios são
marcados como premissas didáticas, não como tendências reais de um pool. A
existência dos seis itens reservados não valida empiricamente retenção ou
transferência; clareza, plausibilidade dos distractors e decisão sob incerteza
ainda requerem teste humano. Nenhuma ambiguidade de arquitetura ou decisão humana
pendente foi encontrada; a integração exigiu somente estender os contratos
fechados de pacote, ordem, foco e validação.

### Validação executada

- `npm test`: 27 testes aprovados;
- `npm run typecheck`: aprovado;
- `npm run build`: aprovado;
- `git diff --check`: aprovado.

## 2026-08-20 — V0.6 Piloto de Retenção e Transferência

### Objetivo e hipótese trabalhada

Usar conservadoramente os 24 itens reservados como evidências distintas do
desenvolvimento. A hipótese operacional é que duas respostas independentes em
duas sessões fornecem base mínima para uma avaliação, com espera adicional de
24 horas para retenção. As 24 horas não são um intervalo de aprendizagem
validado nem uma regra `1-3-7-30`.

### Alterações e comportamento

- nenhum item de avaliação entra enquanto qualquer pacote estruturado estiver
  incompleto;
- depois disso, a sessão de 12 inclui no máximo uma retenção e uma transferência
  elegíveis, selecionadas por foco e ordem estável da biblioteca;
- a relação usa `concept` compartilhado com development e recorre a
  `primarySkill` somente quando não existe esse conceito na biblioteca ativa;
- retenção requer duas respostas corretas independentes em duas sessões e 24
  horas desde a mais recente; transferência exige a mesma base, sem espera;
- cada avaliação já respondida é excluída permanentemente neste piloto;
- avaliações continuam independentes e não entram no cálculo do `SkillState`;
- erro de avaliação pode aproximar somente um item development relacionado.

Não houve conteúdo, UI, storage, schema, backend ou nova Skill. Retenção e
transferência ainda não têm interface própria nem reagendamento adaptativo.

### Validação, riscos e próximo passo

A suíte passou com 34 testes, além de typecheck, build e `git diff --check`. O
principal risco é pedagógico: o limiar e a utilidade das avaliações ainda não
foram validados longitudinalmente. O próximo passo depende de teste humano ao
longo do tempo; não há decisão técnica pendente para este piloto.

## 2026-08-20 — V0.6.1 Alinhamento entre progressão, Home e Progresso

### Objetivo e hipótese trabalhada

Corrigir a coerência entre a progressão já implementada na V0.6 e as superfícies
que explicam essa progressão. A hipótese é que uma única consulta pura ao pacote
pendente evita divergências entre scheduler e Home, enquanto contagens
descritivas tornam visíveis as avaliações sem confundi-las com `SkillState`.

### Alterações e comportamento

- a consulta ao primeiro pacote pendente foi exposta e `chooseFocus` passou a
  obter genericamente o foco declarado desse pacote, inclusive `calibration`;
- depois da apresentação dos três pacotes, o ranking normal de Skills volta a
  decidir o foco; treino manual, microblocos e bloqueio de inéditos não mudaram;
- “POR QUE HOJE?” agora usa a mesma consulta e explica o bloco de `calibration`;
- Progresso substituiu a mensagem obsoleta por contagens separadas de
  verificações respondidas e corretas de retenção e transferência;
- o resumo de avaliações usa o exercício relacionado ao `exerciseId`, ignora
  development e não altera schema, storage nem cálculo do estado-base.

### Validação, riscos e escopo

A suíte passou com 39 testes, incluindo ordem dos pacotes, prioridade sobre o
ranking, retorno ao ranking, introdução de `calibration 01–04`, separação das
avaliações e a cobertura preservada de `SkillState`. Typecheck, build e
`git diff --check` também passaram. Não houve mudança de CSS, conteúdo
estratégico, exercícios, regras de avaliação, tamanho de sessão ou decisões
pedagógicas. Não há decisão humana pendente.

## 2026-08-20 — V0.7 Sinais Diagnósticos Conservadores

### Objetivo e hipótese trabalhada

Criar uma camada pura, interpretável e read-only que identifique candidatos a
padrões recorrentes no histórico. A hipótese operacional é que erros
independentes repetidos em exercícios e sessões diferentes justificam um sinal
para investigação futura, sem constituir um leak confirmado.

### Alterações e comportamento

- `lib/diagnostics.ts` agrupa somente tentativas development independentes;
- a chave prioriza `reasoningPattern` e usa `concept` como fallback;
- `primarySkill`, `variantGroup` e misconceptions não são causas diagnósticas;
- `candidate` exige dois erros em dois exercícios e duas sessões;
- `recurring` exige três erros em três exercícios e pelo menos duas sessões;
- três acertos independentes mais recentes em dois exercícios desativam o sinal
  por enquanto;
- a saída traz chave, fonte, status, contagens, erros recentes e último timestamp,
  com ordenação determinística;
- 16 testes cobrem os filtros, limiares, separação, recuperação e ordenação.

### Validação, riscos e próximo passo

A suíte passou com 55 testes, além de typecheck, build e `git diff --check`.
Os limiares e a regra de recuperação são heurísticas provisórias do protótipo,
não medidas psicométricas nem prova de domínio. Scheduler, `chooseFocus`, Home,
Progresso, storage, schema de `Attempt`, exercícios, conteúdo e UI não mudaram.
O próximo passo possível é avaliar, separadamente, uma integração conservadora
dos sinais ao treino recomendado; ela não foi implementada nesta versão. Não há
decisão humana pendente.

## 2026-08-20 — V0.8 Reforço Diagnóstico Controlado

### Objetivo e hipótese trabalhada

Integrar pela primeira vez, de forma mínima, os sinais diagnósticos ao treino. A
hipótese operacional é que um padrão `recurring` pode justificar a reserva de uma
única superfície development relacionada, sem confirmar causa nem entregar ao
diagnóstico o controle do scheduler.

### Alterações e comportamento

- `candidate` continua read-only e nunca modifica a sessão;
- nenhum reforço entra enquanto qualquer pacote estruturado estiver pendente;
- depois dos três pacotes, o primeiro `recurring` compatível com o foco já
  resolvido pode reservar no máximo um development;
- `reasoningPattern` e fallback por `concept` mantêm os grupos exclusivos da V0.7;
- a seleção evita o exercício da tentativa mais recente quando existe outra
  superfície, prefere o item há mais tempo sem resposta e desempata pela ordem
  estável da biblioteca;
- retention e transfer conservam seus slots e prioridade; o reforço é removido
  do adaptive fill e a sessão permanece limitada a 12 itens;
- o suporte continua vindo de `getActualSupport`; erro, feedback, repriorização e
  evidência development seguem o fluxo normal;
- recuperação continua inferida pelas três tentativas independentes recentes,
  sem `markFixed`, descarte manual ou escalada especial.

### Validação, riscos e escopo

A suíte passou com 62 testes, além de typecheck, build e `git diff --check`. Os
limiares de recorrência e recuperação permanecem heurísticos e não validados.
Não houve mudança em UI, Home, Progresso, storage, schema de `Attempt`, exercícios,
Skills, suporte ou pacotes. `chooseFocus`, `PACKAGE_FOCUS`, ordem dos pacotes e
`SkillState` permaneceram inalterados. O próximo passo, não implementado, é
avaliar se sinais diagnósticos devem futuramente influenciar escolha de foco ou
acionar reensino explícito.

## 2026-08-20 — V0.9 Aplicação Integrada em Novas Superfícies

### Objetivo e hipótese trabalhada

Expandir a biblioteca com superfícies de aplicação, discriminação e integração dos conceitos já estabelecidos, sem ampliar o motor nem introduzir nova teoria estratégica. A hipótese é que encadear ação, range, objetivo, mãos-alvo e qualidade da evidência oferece prática integrada reutilizando a semântica diagnóstica existente.

### Alterações e comportamento

- `integrated-application` é o quarto pacote estruturado, depois de `calibration`;
- 12 development entram em `01–04`, `05–08` e `09–12`, com foco automático `integrated-decision`;
- seis itens independentes ficam reservados: três retention e três transfer;
- a biblioteca passa a 60 development e 30 itens reservados;
- retention, transfer e reforço diagnóstico ficam bloqueados durante a primeira apresentação e voltam a ser elegíveis depois;
- os novos development reutilizam `reasoningPattern`, concepts e regras diagnósticas existentes, sem alteração de thresholds;
- a Home ganhou somente a copy contextual de “POR QUE HOJE?”.

### Validação, riscos e escopo

A suíte passou com 71 testes. Typecheck, build e `git diff --check` foram executados na validação final. As respostas dependem apenas de premissas explícitas e princípios existentes; nenhuma afirmação populacional, frequência de solver ou tendência de NL2 foi adicionada. Não houve mudança de UI além da copy, nem mudança em CSS, storage, schema, `Attempt`, `SkillState`, Skills ou algoritmo de spacing. Não há decisão humana pendente.

## 2026-08-20 — V0.10 Pistas de Força do Range

- **Objetivo/hipótese:** ensinar o jogador a combinar pistas condicionais de size, board e configuração sem converter uma heurística da fonte em certeza.
- **Antes/depois:** a biblioteca tinha quatro pacotes, 60 development e 30 avaliações; agora tem cinco pacotes, 72 development e 36 avaliações, com `range-strength-signals` em três microblocos.
- **Arquivos alterados:** tipos e configuração genérica de pacote, biblioteca/validador, copy da Home, testes e documentação; criado o claim map `docs/research/HUNGRY_HORSE_RANGE_STRENGTH_SIGNALS.md`.
- **Escopo estratégico:** somente os oito claims autorizados. Size permanece evidência contextual. Static/dry e 3-bet pot são exceções explícitas. Claims de turn, river, donk e double previous size ficaram fora; nenhuma tendência foi atribuída a NL2/GGPoker.
- **Motor/persistência/schema:** scheduler, diagnóstico, thresholds, storage e formato de `Attempt` não mudaram. A união fechada de `LearningPackage`, a ordem/foco e o validador apenas registram o novo pacote.
- **Riscos conhecidos:** clareza e dificuldade dos distractors ainda requerem validação humana; a fonte continua registrada sem metadados bibliográficos não fornecidos.
- **Decisões humanas pendentes:** nenhuma para esta unidade explicitamente especificada.
- **Próximo passo recomendado:** teste humano dos três microblocos antes de auditar qualquer claim mantido fora da biblioteca ativa.

## 2026-08-20 — V0.10.1 Evidência Local por Pacote

- **Objetivo/hipótese:** liberar avaliações e reforço antigo assim que o próprio pacote estiver completo, sem esperar pacotes futuros e sem criar scheduler novo.
- **Antes:** qualquer `getPendingLearningPackage` bloqueava retention, transfer e reserva diagnóstica globalmente.
- **Depois:** a completude compara tentativas com todos os IDs development reais do pacote; o introBlock permanece primeiro e intacto, seguido por até uma retention, uma transfer e um recurring de pacote completo.
- **Relação de evidência:** evaluation prefere development de mesmo `reasoningPattern`, depois `concept` e finalmente `primarySkill`.
- **Separação:** `getActualSupport` e `exercisePriority` filtram tentativas para `purpose=development`; `SkillState` já mantinha e continua mantendo essa separação.
- **Arquivos:** `lib/trainingEngine.ts`, `tests/trainingEngine.test.ts`, `docs/PROJECT_STATE.md`, `docs/LEARNING_MODEL.md`, `docs/TESTING.md`, `docs/BACKLOG.md` e este log.
- **Validação:** `npm test` (101 testes), `npm run typecheck`, `npm run build` e `git diff --check`.
- **Riscos conhecidos:** completude depende deliberadamente da biblioteca atual e de qualquer tentativa registrada para cada ID, não da posição ordinal do pacote.
- **Decisões humanas pendentes:** nenhuma.
- **Escopo preservado:** thresholds, recuperação diagnóstica, conteúdo, UI, storage, schema, ordem dos pacotes, microblocos, limite e determinismo não mudaram.

## 2026-08-20 — V0.10.2 Persistência da Sessão Ativa

- **Objetivo/hipótese:** corrigir a integridade da unidade sessão para que mount, navegação e reload não fabriquem sessões pedagógicas distintas.
- **Estado:** `version`, `sessionId`, `startedAt`, `focus`, itens mínimos (`exerciseId`, `support`, `sessionRole`) e `nextIndex` em `poker-loop-v1:active-session`.
- **Retomada:** fila integral reconstruída da biblioteca; Attempts do mesmo `sessionId` recompõem o resumo; estado inválido é descartado sem restauração parcial.
- **Fluxos:** sair mantém a sessão; responder avança `nextIndex` durante o feedback; a 12ª resposta restaura a conclusão; `Concluir` limpa e `Treinar mais` cria identidade/fila novas usando o histórico. Focus diferente substitui a sessão ativa.
- **Escopo preservado:** schema/chave de `Attempt`, scheduler, `chooseFocus`, diagnóstico, fading, repriorização, retention e transfer não mudaram. Não é evidência pedagógica nova.

## 2026-08-20 — V0.11 Função da Mão × Força do Range

- **Hipótese:** depois de aprender a estimar força relativa do range, o aluno consegue adaptar a função da própria mão sem converter forte/fraco em comando de ação quando o exercício explicita objetivo e mãos-alvo.
- **Antes/depois:** a biblioteca tinha cinco pacotes, 72 development e 36 evaluations; agora possui seis pacotes, 84 development e 42 evaluations. `hand-function-vs-range` entra em três microblocos ordenados e reutiliza integralmente a infraestrutura V0.10.1.
- **Arquivos:** biblioteca/tipos/validador/ordem/foco e copy da Home; testes; estado, modelo, testing, backlog e novo claim map de pesquisa.
- **Política de conteúdo:** funções são contextuais, não charts. Claims A–E vêm do framework autorizado; Draw/Air usam a taxonomia da fonte e princípios internos de objetivo/alvos; calibração integra V0.5/V0.10. Turn, river, donk, timing, solver e tendências de pool ficaram fora.
- **Compatibilidade:** nenhuma alteração em `Attempt`, scheduler genérico, thresholds/recuperação diagnóstica, regras de retention/transfer, chave/versão de storage ou schema de active session. Um teste restaura uma sessão V0.10.2 composta só por IDs anteriores sem trocar `sessionId`.
- **Risco conhecido:** clareza e dificuldade dos novos distractors ainda requerem validação humana; não há decisão estrutural pendente.
- **Próximo passo recomendado:** teste humano dos três microblocos antes de qualquer pacote de turn/river.

## 2026-08-21 — revisão editorial da V0.11

- **Objetivo:** remover a ambiguidade de `dev-hand-range-04` e tornar plausíveis os distractors dos itens independent e das seis avaliações, sem alterar a resposta estratégica pretendida.
- **Antes/depois:** `dev-hand-range-04` aceitava duas leituras corretas para “qual erro evitar”; agora pede a integração entre força do range e função da mão. Distractors antes denunciados por absolutos foram substituídos por erros próximos: adaptação exagerada, inércia de função, peso excessivo a uma pista e ação desconectada das mãos-alvo.
- **Escopo preservado:** IDs, purpose, support, pacotes, sequências, conceitos, reasoningPatterns, contagens 84/42, scheduler, diagnóstico, avaliações, active session, storage e schemas não mudaram.
- **Teste:** a auditoria editorial existente agora protege especificamente a integração de `dev-hand-range-04` e exige feedback de misconception para cada alternativa incorreta, mantendo 126 testes.

## 2026-08-21 — V0.12 Fronteira de Recuperação Diagnóstica

- **Hipótese:** tratar recuperação suficiente como fronteira evita que um erro
  novo ressuscite imediatamente um episódio histórico, sem transformar
  “recuperado por enquanto” em domínio comprovado.
- **Implementação:** por chave exclusiva de `reasoningPattern` ou fallback de
  `concept`, a última janela de três acertos development independentes
  consecutivos em ao menos dois exercícios delimita a evidência ativa. Attempts
  anteriores permanecem intactas no histórico; apenas deixam de compor campos e
  thresholds do `DifficultyPattern` atual.
- **Depois da fronteira:** um erro não sinaliza; dois erros em dois exercícios e
  sessões formam `candidate`; três erros em três exercícios e ao menos duas
  sessões formam `recurring`. Os thresholds não mudaram.
- **Scheduler:** nenhum mecanismo ou prioridade foi alterado. O reforço continua
  derivado de `summarizeDifficultyPatterns()`: recuperação e um erro novo não
  reservam, candidate é read-only e recurring pós-fronteira pode reservar um.
- **Escopo preservado:** `Attempt`, storage, UI, conteúdo, Skills, `SkillState`,
  suporte e separação de retention/transfer não mudaram. Nenhuma inferência de
  domínio foi adicionada.
- **Validação:** 136 testes, typecheck, build e `git diff --check`.

## 2026-08-21 — V0.13 Verificação Pós-Recuperação

- **Hipótese:** uma recovery de dificuldade recurring pode ancorar observações
  posteriores sem ser tratada como domínio ou estado persistido.
- **Ciclo:** `recurring → reinforcement → recuperado por enquanto → transfer
  posterior → retention posterior`.
- **Qualificação:** somente recurring seguido de três acertos development
  independentes consecutivos em ao menos dois exerciseIds; candidate permanece
  read-only e três acertos sem recurring não ganham efeito novo.
- **Vínculo:** reasoningPattern exato, ou concept apenas quando é a chave fallback;
  primarySkill não afirma relação longitudinal.
- **Scheduler:** recurring ativo bloqueia evaluations relacionadas; recovery
  libera transfer e ancora as 24h de retention em recoveredAt. A recovery mais
  recente é a âncora, itens respondidos nunca reaparecem e continuam no máximo
  uma retention e uma transfer em sessões de até 12.
- **Observação:** `summarizeRecoveryVerification()` conta somente evaluations
  relacionadas respondidas depois da âncora. Zero significa ausência de
  observação disponível, não resultado pedagógico.
- **Escopo preservado:** evaluation não cria/remove diagnóstico ou recovery;
  Attempt, storage, UI, SkillState, suporte, conteúdo, pacotes e thresholds não
  mudaram. Nenhuma inferência de domínio foi introduzida.

## 2026-08-21 — V0.14 Loop de Aprendizagem Visível

- **Hipótese:** tornar visível a evidência longitudinal já derivada ajuda o
  jogador a entender o que o treino acompanha sem expor mecanismos internos nem
  transformar Progresso em dashboard.
- **Implementação:** `summarizeLearningLoop()` combina patterns, recoveries e
  verification em até três itens; recurring vem primeiro e supersede recovery
  da mesma identidade, seguido das recoveries mais recentes.
- **Linguagem:** os estados visíveis são **Em reforço** e **Recuperado por
  enquanto**. Transfer/retention mostram contagens factuais ou “ainda não
  observada”; não afirmam domínio, resolução ou falha definitiva.
- **Privacidade do modelo:** candidate continua interno. Um inventário exige
  label humana para toda identidade diagnóstica utilizável e falha explicitamente
  em desenvolvimento, sem fallback que exponha `reasoningPattern` ou `concept`.
- **Escopo preservado:** scheduler, `Attempt`, storage, active session,
  `SkillState`, conteúdo, pacotes, suporte, fading, prioridades, thresholds e os
  três resumos diagnósticos não mudaram.
- **Validação:** `npm test` (164 testes), `npm run typecheck`, `npm run build` e
  `git diff --check`.


## 2026-08-21 — V0.15 Ponte com Mãos Reais

- **Hipótese:** reflexão estruturada pode conectar uma mão jogada ao treino existente sem promover relato do jogador a evidência pedagógica.
- **Contrato:** `RealHandReview` é persistido separadamente em `poker-loop-v1:real-hands`; `rawHandText` é texto opaco e as quatro respostas permanecem contexto do jogador.
- **Fluxo:** criar abre o detalhe; editar preserva `id`/`createdAt`; excluir afeta somente a mão; o reset pedagógico não apaga mãos reais.
- **Foco:** a Skill ampla é escolha opcional do jogador e só gera `/session?focus=<Skill>`, reutilizando o treino normal.
- **Escopo preservado:** nenhuma mão cria `Attempt`, difficulty pattern, recovery, retention, transfer ou `SkillState`; scheduler, sessão ativa e limite de 12 não mudaram.
- **Fora de escopo:** parser, extração, diagnóstico e análise estratégica automática não foram criados. O próximo estudo possível é um contrato de interpretação antes de qualquer inferência.
- **Validação:** `npm test` (180 testes), `npm run typecheck`, `npm run build` e `git diff --check`.

## 2026-08-21 — V0.16 Importação GG/PokerCraft com Triagem de Atenção

- **Hipótese:** centenas de mãos podem melhorar a seleção de atenção sem gerar centenas de tarefas, mantendo parsing, sugestão e revisão separados.
- **Implementação:** parser estrutural conservador e seleção determinística de até cinco categorias; resultado financeiro não é feature nem desempate.
- **Fluxo:** o `.txt` é lido localmente; somente sugestões são persistidas. Apenas promoção explícita cria `RealHandReview` vazio de reflexão, street e foco.
- **Persistência:** sugestões têm key própria e teto de cinco; SHA-256 impede repetição exata. O reset pedagógico não apaga sugestões nem mãos reais.
- **Escopo preservado:** nenhuma criação de Attempt, SkillState, diagnóstico, candidate/recurring/recovery, retention/transfer ou mudança no scheduler.
- **Limitação deliberada:** sem deduplicação global entre arquivos diferentes parcialmente sobrepostos, evitando uma base crescente de IDs.
- **Validação:** 193 testes automatizados, typecheck, build e auditoria de diff.

### Patch de revisão — exclusividade do detalhe

- Abrir uma sugestão ou uma mão salva agora limpa explicitamente a seleção do
  outro tipo; descarte, promoção e edição também fecham o detalhe incompatível.
- A regra de seleção exclusiva e a transformação neutra de sugestão em
  `RealHandReview` foram extraídas em funções puras pequenas e cobertas por dois
  testes, sem framework de UI ou mudança de escopo.

## 2026-08-21 — V0.17 Revisão Rápida de uma Decisão Real

- **Hipótese:** uma reconstrução curta, limitada ao conhecimento disponível na decisão, facilita registrar o raciocínio sem transformar uma mão real em evidência pedagógica.
- **Implementação:** o parser GG existente alimenta âncoras cronológicas e uma Decision View que corta ações e board na decisão. A última ação é somente sugestão inicial, e todas as outras permanecem escolhíveis sem ranking.
- **Autorrelato:** pensamento e avaliação percebida são opcionais; fatores aceitam no máximo dois e `automatic` é exclusivo. Um único snapshot por mão é salvo em storage próprio e edições preservam `id`/`createdAt`.
- **Escopo preservado:** nenhuma análise estratégica, hipótese, Attempt, SkillState, diagnóstico, scheduler, sessão, recovery, retention ou transfer foi alterado. Reset pedagógico preserva snapshots; exclusão da mão remove o relacionado.
- **Validação:** suíte automatizada, typecheck, build e auditoria de diff.

### Patch de integridade — histórico editado

- Se a decisão registrada não corresponder mais ao histórico atual, a edição não seleciona outra âncora automaticamente. O autorrelato permanece intacto até o jogador escolher explicitamente uma decisão atual.
- Nova revisão ainda sugere a última decisão com a pergunta específica; escolha alternativa e edição usam copy neutra.
- `PROJECT_STATE.md` agora identifica corretamente V0.17 como baseline e versão atual.


### Patch de robustez — proveniência e all-in

- Novos snapshots guardam o `sourceHandId` do parser e `allIn`; o matching exige igualdade exata da mão, índice, street, ação, valores e all-in.
- Registros V0.17 legados sem `sourceHandId` continuam legíveis e preservados, mas nunca são vinculados automaticamente; salvar após escolha explícita completa sua proveniência sem trocar `id` ou `createdAt`.
- Decision View e labels conservam all-in fornecido pelo parser, sem qualquer cálculo ou interpretação estratégica.
- **Validação:** 218 testes, typecheck, build e `git diff --check`.

## 2026-08-21 — V0.17.1 Mão Visual e Revisão por Opções

- **Hipótese:** cartas e ações agrupadas por street reduzem o esforço de
  reconstruir a jogada, enquanto escolhas curtas tornam o autorrelato mais leve.
- **Visualização:** cabeçalho, hole cards reutilizáveis, boards e ações por
  street substituem o texto bruto como superfície principal em sugestões, mãos
  salvas e Decision View. O texto original permanece recolhido.
- **Revisão:** o fluxo principal exige somente seleção de até dois fatores e da
  sustentação percebida; a observação curta é opcional. `automatic` continua
  exclusivo e sem atribuição artificial de sustentação.
- **Anti-hindsight:** o modelo visual recebe exatamente o recorte já produzido
  por `buildHeroDecisionView`; streets e ações futuras não são reconstruídas.
- **Escopo preservado:** schemas e compatibilidade de snapshots, matching por
  `sourceHandId`, parser/triagem V0.16, `Attempt`, `SkillState`, scheduler,
  diagnóstico, recovery, retention, transfer e motor pedagógico não mudaram.
- **Validação:** 220 testes, typecheck, build e `git diff --check`.

### Patch anti-hindsight — composição da mão salva

- A visualização completa da mão salva saiu de `page.tsx`; `QuickReview` agora é
  a única proprietária da superfície visual nesse detalhe.
- Em `idle`, a Quick Review mostra a mão completa. Em `choose`, `form` e `view`,
  mostra somente a visualização cortada pela anchor atual, inclusive durante a
  troca de decisão. Sugestões pendentes continuam mostrando a mão completa.
- O histórico bruto permanece recolhido e os componentes CSS de carta não
  mudaram.
- **Escopo preservado:** parser, triagem, matching, snapshot storage, `Attempt`,
  `SkillState`, scheduler, diagnóstico e motor pedagógico não mudaram.
- **Validação:** 225 testes, typecheck, build e `git diff --check`.

## 2026-08-21 — V0.18 Padrões nas Revisões de Mãos Reais

- **Hipótese:** contagens factuais ajudam o jogador a reconhecer o que marcou sem promover o autorrelato a diagnóstico ou evidência de aprendizagem.
- **Implementação:** modelo puro resume total, fatores, sustentação e streets; `/hands` mostra o total e até três observações. O threshold de três snapshots controla somente visibilidade.
- **Sustentação:** `automatic` continua sem suporte e fora do denominador; somente `low` + `unclear` compõem a observação agregada factual.
- **Compatibilidade:** snapshots legados sem `sourceHandId` participam sem matching aproximado, mudança de storage ou migração.
- **Escopo preservado:** frequência não significa leak, erro, domínio ou evidência pedagógica. Nenhum dado alimenta `Attempt`, `SkillState`, diagnóstico, candidate/recurring/recovery, retention/transfer, scheduler, sessão ativa ou `learningLoop`.
- **Arquivos:** novo modelo e testes, UI/CSS de `/hands` e os seis documentos de handoff exigidos.
- **Validação:** 238 testes automatizados; typecheck, build e auditoria de diff executados nesta entrega.
- **Riscos conhecidos:** o threshold é regra de apresentação conservadora, não limiar validado; a clareza da seção ainda requer validação humana.
- **Decisões humanas pendentes:** nenhuma para o escopo especificado.


## 2026-08-22 — V0.19 Hipóteses para Investigar a partir das Revisões Reais

- **Hipótese:** repetição no autorrelato, combinada com sustentação percebida baixa/incerta, pode indicar um tema que vale investigar sem afirmar dificuldade ou correção estratégica.
- **Implementação:** módulo puro deduplica por `handReviewId`; fatores normais exigem 3 revisões e 2 marcações `low`/`unclear`, enquanto `automatic` exige 3 revisões. A UI compacta mostra os candidatos e abre até três mãos existentes pela identidade original.
- **Evidências:** seleção por `createdAt` decrescente e desempate por ID, sem resultado financeiro. Registros legados qualificam e só localizam uma mão pelo `handReviewId` exato.
- **Escopo preservado:** hipóteses não são persistidas, não usam street como candidato, não mapeiam fatores para Skill e não alteram `Attempt`, `SkillState`, diagnóstico, treino, scheduler ou `learningLoop`.
- **Validação:** 255 testes automatizados, typecheck, build e auditoria de diff previstos para esta entrega.
- **Decisões humanas pendentes:** qualquer ponte futura entre hipótese e motor pedagógico exige verificação e decisão explícitas.

## 2026-08-22 — V0.20 Verificação Prospectiva de uma Hipótese

- **Hipótese:** observar uma janela futura delimitada evita circularidade sem promover autorrelato a avaliação estratégica.
- **Implementação:** uma investigação ativa congela fator, instante, IDs de snapshots/mãos e contagens da baseline; a função pura seleciona, em ordem temporal estável, as primeiras cinco novas revisões distintas.
- **Persistência:** `poker-loop-v1:real-hand-investigation`, versão 1, sem conclusão textual ou histórico permanente. Substituição e encerramento são explícitos.
- **Defesas:** baseline ausente/alterada produz estado neutro; revisão antiga editada não cruza `startedAt`; mãos posteriores à quinta não mudam a janela; legados válidos participam sem matching aproximado.
- **Escopo preservado:** nenhum dado alimenta `Attempt`, `SkillState`, diagnóstico, candidate/recurring/recovery, scheduler, sessão ativa, `learningLoop` ou treino.
- **Validação:** 282 testes automatizados, typecheck, build e auditoria de diff executados.
- **Decisões humanas pendentes:** validar com jogadores se cinco revisões dão uma janela compreensível; o número é hipótese operacional, não threshold validado.

### Correção do bloqueador append-only do PR #25

- `prospectiveReviews` passou a congelar fatos observados no storage V1.
- `syncProspectiveInvestigation()` acrescenta candidatos elegíveis até cinco sem remover, substituir ou editar entradas anteriores.
- A derivação deixou de reconstruir a janela a partir dos snapshots atuais; exclusões e edições posteriores não mudam contagens nem permitem entrada da sexta revisão.
- `/hands` sincroniza no carregamento e após salvar Quick Review, persistindo somente quando há acréscimo.
- Validação final: 282 testes; typecheck, build e `git diff --check`.

## 2026-08-22 — V0.21 Histórico de Investigações de Mãos Reais

- **Hipótese:** preservar ciclos encerrados como fatos congelados permite memória longitudinal sem transformar autorrelato em evidência pedagógica.
- **Implementação:** episódios V1 append-only usam a chave separada `poker-loop-v1:real-hand-investigation-history`; conclusão, encerramento antecipado e baseline inconclusiva são arquivados como `completed`, `stopped` e `inconclusive`.
- **Imutabilidade:** baseline e `prospectiveReviews` recebem cópia profunda no arquivamento; resumos usam somente o episódio e detalhes de mãos usam exclusivamente IDs ainda existentes, sem reposição.
- **UI:** `/hands` conserva o resultado 5/5 até a ação **Concluir acompanhamento** e lista episódios por `endedAt` decrescente com desempate por ID.
- **Escopo preservado:** histórico não mapeia `ReasoningFactor` para Skill e não participa de `Attempt`, diagnóstico, scheduler, sessão ou `learningLoop`.
- **Validação:** 309 testes, typecheck, build e `git diff --check` executados na entrega.

### Correção do bloqueador de classificação na substituição

- `completionForProspectiveResult()` centraliza a precedência `inconclusive` → janela 5/5 `completed` → janela parcial `stopped`.
- Conclusão manual e substituição explícita agora chamam a mesma regra; iniciar outro acompanhamento nunca rebaixa uma janela completa para `stopped`.

## 2026-08-22 — V0.22 Ponte Voluntária entre Investigação e Treino

- **Hipótese:** depois de completar uma observação prospectiva, uma escolha explícita pode reduzir a distância até o treino sem transformar autorrelato em diagnóstico ou prioridade pedagógica.
- **Implementação:** episódios históricos `completed` agora expandem um seletor local com todas as Skills atuais, sem opção inicial, e abrem o fluxo normal `/session?focus=<Skill>` somente depois da escolha.
- **Fronteira operacional:** `stopped`, `inconclusive` e investigações ativas não exibem a ponte. A sequência 5/5 ainda exige **Concluir acompanhamento** antes de disponibilizá-la.
- **Neutralidade:** as opções não recebem o episódio como entrada; `ReasoningFactor`, `factorCount` e `lowOrUnclearCount` não ordenam, filtram, destacam ou pré-selecionam Skills.
- **Escopo preservado:** nenhum storage ou schema novo, nenhuma proveniência episódio → sessão e nenhuma mudança em `StoredRealHandInvestigationEpisode`, `Attempt`, `ActiveTrainingSession` ou `trainingEngine`.
- **Interpretação:** abrir o treino não demonstra conclusão, relevância ou eficácia; a sessão permanece pedagogicamente idêntica a uma sessão manual com o mesmo foco.
- **Validação:** 315 testes automatizados, typecheck, build e `git diff --check` previstos para esta entrega.
- **Decisões humanas pendentes:** qualquer proveniência episódio → sessão ou comparação de efeito exige decisão futura explícita.

## 2026-08-22 — V0.23 Proveniência Voluntária do Início de uma Sessão

- **Hipótese:** registrar o fato mínimo de origem torna a ponte auditável sem promover navegação a evidência pedagógica.
- **Implementação:** storage separado `poker-loop-v1:investigation-training-launches` com schema exato `{ version: 1; episodeId: string; sessionId: string; skill: Skill; launchedAt: string }`; validação defensiva, ordenação estável e unicidade por `sessionId`.
- **Momento:** o launch nasce somente depois de `createTrainingSession`, usando `sessionId`, `focus` e `startedAt` do objeto novo, e somente após localizar exatamente um episódio histórico `completed`.
- **Retomada e continuidade:** sessão compatível preexistente não recebe origem retroativa; reload encontra a origem já gravada; **Treinar mais** cria sessão normal sem herdar `investigation`.
- **Reset:** um launch pode sobreviver ao reset de Attempts; isso continua significando somente que uma sessão foi iniciada naquele momento. Attempts ou existência futura da sessão não reinterpretam esse fato.
- **Escopo preservado:** nenhuma conclusão, contagem de decisões, acerto/erro, eficácia, causalidade ou mapping `ReasoningFactor → Skill`; `StoredRealHandInvestigationEpisode`, `ActiveTrainingSession`, `Attempt` e motor pedagógico não mudaram.
- **Validação:** 329 testes, typecheck, build e `git diff --check` previstos para esta entrega.
- **Decisões humanas pendentes:** qualquer associação futura de conclusão ou efeito exige uma versão e decisão separadas.

## 2026-08-22 — V0.24 Proveniência da Conclusão de uma Sessão

- **Hipótese:** registrar separadamente o fim operacional da sessão torna a cadeia de proveniência factual sem converter conclusão em resultado de aprendizagem.
- **Implementação:** storage `poker-loop-v1:investigation-training-completions`, schema mínimo `{ version: 1; sessionId: string; completedAt: string }`, parsing defensivo e unicidade por sessão.
- **Fronteira:** somente `items.length > 0 && nextIndex >= items.length`; o Attempt mais recente da própria sessão fornece apenas o horário depois dessa verificação.
- **Momento e recovery:** persiste ao registrar a última decisão; no reload, reconcilia somente launch/session/focus exatos, fila concluída e timestamp confiável. Retomada mantém o mesmo `sessionId`; **Treinar mais** não herda launch.
- **Escopo preservado:** nenhuma métrica copiada; `InvestigationTrainingLaunch`, `StoredRealHandInvestigationEpisode`, `ActiveTrainingSession`, `Attempt`, `trainingEngine`, `diagnostics` e `learningLoop` não mudaram.
- **Validação:** 349 testes, typecheck, build e `git diff --check` executados nesta entrega.

## 2026-08-22 — V0.25 Acompanhamento Pós-Treino

**Hipótese trabalhada:** uma janela prospectiva iniciada explicitamente após uma sessão concluída pode preservar proveniência e registrar cinco novos autorrelatos sem sugerir comparação ou causalidade.

Implementado storage V1 separado, validação defensiva, criação por cadeia exata, baseline de revisões existentes, sync append-only, fechamento factual na quinta observação e resumo descritivo. `/hands` permite escolher uma das sessões concluídas, inicia somente após confirmação, sincroniza em reload/Quick Review, mostra acompanhamento ativo e contagem histórica. V0.20 e V0.25 não podem iniciar simultaneamente. Não foram alterados `Attempt`, `SkillState`, scheduler, sessão ativa ou motor pedagógico. Comparação pré/pós e interpretação de eficácia permanecem deliberadamente fora do escopo e exigem futura decisão humana/metodológica.

**Auditoria final:** o parser passou a rejeitar observações persistidas fora da ordem factual `createdAt + snapshotId`; a suíte protege também a imutabilidade referencial de janelas concluídas e a ordenação determinística do histórico. Validação prevista: 375 testes, typecheck, build e `git diff --check`.

## 2026-08-22 — V0.26 Comparação Descritiva entre Janelas

**Hipótese de trabalho:** duas janelas congeladas podem ficar legíveis lado a lado sem transformar cinco autorrelatos em métrica de desempenho nem atribuir a diferença à sessão escolhida.

Implementado um modelo derivado puro com validação defensiva da cadeia completa, resumos factuais de presença e sustentação registrada e ordenação independente de follow-ups. O histórico em `/hands` oferece expansão compacta com dois blocos visualmente equivalentes, disclosure metodológico e Skill somente como proveniência. Legado sem sustentação fica fora do denominador; `automatic` mostra apenas presença. Nenhuma chave de storage ou schema existente foi alterado, e nenhuma leitura de mãos/snapshots atuais ou integração com o motor pedagógico foi criada.

**Correção de proveniência temporal:** `originalCompletedAt` passou a ser o maior `createdAt` entre as cinco observações congeladas, enquanto `episode.endedAt` permanece exclusivamente a data de arquivamento. O join agora rejeita qualquer inversão entre conclusão da janela original, arquivamento, launch, completion, início do follow-up e conclusão posterior, aceitando igualdade nas fronteiras. A regressão acrescenta seis testes e leva a suíte a 407 testes.

## 2026-08-22 — V0.27 Relação Observada entre Janelas

**Hipótese de trabalho:** como as duas janelas V0.26 válidas possuem exatamente cinco observações do mesmo fator, sua frequência pode ser descrita categoricamente sem atribuir valor ou efeito à diferença.

Implementada uma camada derivada pura que recebe somente `RealHandWindowComparison`, valida novamente 5/5 e compara exclusivamente `factorCount`: posterior menor é `fewer`, igual é `same` e maior é `more`. A ordem V0.26 é preservada e follow-ups não são agregados. A UI acrescenta um card neutro após os dois blocos, com disclosure explícito de que as duas janelas de autorrelato não permitem concluir melhora, piora ou efeito do treino.

Sustentação, Skill, porcentagens, delta numérico, tendência, eficácia, storage, schemas e motor pedagógico permanecem fora. `automatic` segue a mesma regra de ocorrência e continua sem suporte. **Validação:** 435 testes, typecheck, build e `git diff --check`.

## 2026-08-23 — V0.28 Fechamento Didático da Sessão

**Hipótese de trabalho:** recuperar até três explicações autorais ligadas aos erros concretos da sessão torna o encerramento mais útil sem transformar evidência local em diagnóstico longitudinal.

Implementado `SessionRecap` puro, derivado por `sessionId` de `Attempt[] + Exercise[]`. A identidade prefere `reasoningPattern`, depois `concept`; identidade sem label catalogada usa a Skill humana. Erros iguais são agrupados, e o feedback da alternativa do erro mais recente tem prioridade sobre o texto genérico. Um acerto posterior, em qualquer suporte, é descrito apenas como fato cronológico.

A UI substituiu **VAMOS REFORÇAR** por um registro factual e adicionou o recap antes dos CTAs, limitado a três cards e com disclosure explícito. Nenhum storage/schema foi criado; `Attempt`, `diagnostics`, `trainingEngine`, scheduler, recovery, retention e transfer não foram alterados. Validação: 451 testes, typecheck, build e `git diff --check`.

## 2026-08-23 — V0.29 Revisão Ativa no Fechamento da Sessão

**Hipótese de trabalho:** ocultar inicialmente a explicação e convidar uma tentativa breve de lembrar torna o fechamento uma oportunidade de estudo mais ativa sem converter a interação em evidência pedagógica.

Criado `SessionRecapReview`, que recebe, sem reordenar, os até três itens factuais já selecionados pela V0.28. Cada item mantém no state React local seu reveal e uma reflexão opcional de até 180 caracteres. O feedback exibido após o clique é exatamente `item.feedback`; fatos de erro e acerto posterior continuam visíveis e não controlam o reveal. O estado desaparece ao sair, sem storage, API, analytics ou `Attempt`.

`SessionRecap`, seleção, ordenação e motor longitudinal permaneceram inalterados. Não houve mudança em `diagnostics`, `trainingEngine`, scheduler, recovery, retention, transfer ou proveniência de mãos reais. **Validação prevista:** 471 testes, typecheck, build e `git diff --check`. **Decisões humanas pendentes:** validar se o convite e o campo opcional ajudam sem acrescentar atrito ao fechamento.

## 2026-08-23 — V0.30 Exploração Progressiva de uma Importação GG/PokerCraft

**Hipótese de trabalho:** os cinco destaques estruturais iniciais podem funcionar como entrada compacta, enquanto pedidos voluntários de +5/+10 permitem explorar o mesmo arquivo sem reimportação ou inferência estratégica.

A seleção passou a percorrer rodadas na ordem fixa das cinco categorias, com deduplicação global e pool de até 50 candidatas. O primeiro resultado de cada categoria continua usando os mesmos comparadores e a regressão compara explicitamente os cinco primeiros com `selectHandReviewSuggestions`. O batch V1 em `poker-loop-v1:gg-active-import-batch` persiste fingerprint, contagens factuais, candidatas completas e IDs já mostrados. Sugestões pendentes agora têm teto explícito de 15.

`/hands` recupera o batch no reload, mostra contagens factuais, oferece +5/+10 somente com espaço e exige encerramento explícito antes de trocar um lote ainda explorável. Salvar ou descartar não remove o ID surfaced. Encerrar remove somente o batch: mãos, snapshots, fingerprint e progresso permanecem intactos. Filtros por categoria, bluff/value, EV, resultado financeiro, diagnóstico e todo o motor pedagógico ficaram fora. **Validação:** 491 testes, typecheck, build e `git diff --check`. **Validação humana pendente:** confirmar que a densidade visual de até 15 cards continua manejável no piloto.

**Correção transacional:** as transições de batch, sugestões pendentes e, na importação inicial, fingerprint agora são confirmadas por um helper isolado. Ele captura os valores anteriores, valida a coerência `surfaced → pending`, executa os writes e restaura os três valores em ordem reversa se qualquer etapa falhar. A UI só atualiza o state React depois do commit completo. Regressões com falha no N-ésimo `setItem` elevam a suíte a 497 testes e protegem +5, importação inicial, falha do fingerprint, caminho normal e reload.

## 2026-08-23 — V0.31 Explorar Situações Específicas no Lote GG/PokerCraft

**Hipótese de trabalho:** filtros voluntários por características estruturais observáveis ajudam o jogador a localizar tipos de situação dentro do pool já preservado sem converter o importador em avaliador estratégico.

Foram centralizados predicates puros usados tanto pela triagem quanto pela exploração, preservando exatamente as fronteiras V0.30. O novo módulo reparsa defensivamente o `rawHandText` de cada candidata, deriva até seis tags sobrepostas e calcula contagens somente entre IDs ainda não surfaced. `HandReviewSuggestion.reason` não limita as tags. Raw inválida recebe zero tags, mas permanece no pool geral.

`/hands` ganhou um painel compacto, com uma categoria local ativa por vez e categorias zeradas desabilitadas. **Mostrar até 5** percorre a ordem original, respeita pending já existente e o teto de 15, compartilha `surfacedSuggestionIds` com +5/+10 e confirma batch + pending pela transação V0.30 antes de avançar o state React. Falha mantém storage, state e disponibilidade anteriores. Não foram criados schema, chave de storage, classificação de bluff/value/error, uso de resultado financeiro ou integração com o motor pedagógico. **Validação:** 516 testes, typecheck, build e `git diff --check`. **Validação humana pendente:** observar se os seis chips e suas contagens tornam a exploração mais clara sem aumentar excessivamente a densidade do card.

## 2026-08-23 — V0.33 Próximo Passo Contextual na Home

**Hipótese de trabalho:** destacar um único fluxo operacional já aberto reduz a decisão necessária ao retornar à Home sem converter estado de interface em recomendação pedagógica.

Criado `HomeNextAction`, modelo puro e derivado com prioridade fixa: sessão ativa, acompanhamento, sugestões pendentes, candidatas restantes do lote e treino recomendado. Sessões incompletas e concluídas usam o `focus` persistido para retomar exatamente `/session`; investigação e follow-up compartilham `/hands`; sugestões antecedem o restante do batch. A Home lê exclusivamente pelas APIs defensivas existentes e mantém `chooseFocus`, `deriveSkillState`, `getPendingLearningPackage` e `skillLabels` no fallback atual.

A Hero possui uma única CTA principal. Quando não há sessão ativa, um card secundário compacto mantém o treino recomendado disponível sem competir com o fluxo aberto. Nenhum novo storage, write, schema, evento ou regra pedagógica foi criado; `/hands`, `/session`, `trainingEngine`, diagnóstico, scheduler, recovery, retention e transfer permaneceram inalterados. **Validação:** 557 testes, typecheck, build e `git diff --check`. **Validação humana pendente:** confirmar que a troca contextual da Hero fica clara em reload sem produzir sensação de recomendação estratégica.

### Correção de readiness da Home

A primeira renderização agora mantém uma Hero neutra — **POKER LOOP / Preparando seu próximo passo…** — sem links ou CTAs. O estado React efêmero `operationalReady` só passa a `true` depois de todas as leituras locais e da atualização dos estados derivados, evitando que o fallback de treino fique acionável antes de a Home conhecer compromissos operacionais existentes. Nenhum acesso a storage foi movido para render/server render; `deriveHomeNextAction`, prioridades e fluxos de destino permaneceram inalterados. **Validação:** 561 testes, typecheck, build e `git diff --check`.
