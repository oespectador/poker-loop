# Autonomous Log

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
