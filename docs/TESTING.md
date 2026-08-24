# Testing Protocol

## Correção semântica do milestone V0.36

A suíte possui 575 testes. A cobertura de `realHandReviewPatterns` verifica o marco em 0/3, 1/3, 2/3 e 3/3, casos com 4 e 10 revisões sem observação, limitação do `progress`, coerência do `aria-label` e apresentação separada do total real. Thresholds e demais contratos V0.36 permanecem cobertos pelas regressões existentes.

## V0.35 — revisão visual das situações importadas

A suíte possui 573 testes e cobre a troca/fechamento determinístico de uma única expansão e os contratos de composição do novo `HandSuggestionCard`: `PokerCard`, data, `reasonLabel`, ausência de `reasonMessage` e board no resumo, `aria-expanded`, ações diretas, `ParsedHandVisualization`, histórico bruto, motivo e ações na expansão, largura total da grade e ausência de storage ou dependências pedagógicas. As regressões existentes continuam protegendo promoção, descarte, surfaced, descarte total, os 14 filtros e a state machine V0.34, além de Home, Quick Review e Decision View. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## Estado atual

A baseline possui scripts:

```bash
npm test
npm run typecheck
npm run build
npm run dev
```

`npm test` compila os arquivos TypeScript da suíte em `.test-dist` e executa o test runner nativo do Node.js. Essa abordagem não adiciona dependências: mantém a suíte pequena e compatível com o Node `>=20.9.0` já exigido pelo projeto.

O runner recebe o diretório compilado de testes, sem depender de expansão de glob do shell, e cobre tanto o motor quanto o contrato estático da biblioteca e a classificação de suporte das tentativas.

## V0.34 — ações no river

A suíte possui 568 testes. Os testes comportamentais de `tests/ggImportExploration.test.ts` constroem históricos válidos e exercitam os predicates reais para as cinco ações do Hero, distinção bet/raise, sequência multiway, agressão supersedida e bet → raise → nova decisão. Também protegem sobreposição com V0.31, independência de motivo/resultado, contagens, ordem, pending, teto, consumo comum, parse inválido e ausência de storage ou dependências pedagógicas. `tests/handsWorkspace.test.ts` protege os dois grupos visuais. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.33 — próximo passo contextual na Home

A suíte possui 561 testes. Os 25 testes de `tests/homeNextAction.test.ts` cobrem readiness inicialmente falso, leituras e atualizações antes de liberar a interface, Hero neutra sem CTA durante a preparação, sessão incompleta e completa, todas as precedências entre sessão, investigação, follow-up, sugestões e batch, contagens factuais, singular, fallback com foco fornecido pelo motor, URLs de retomada com e sem `focus`, pureza, ausência de writes/storage e preservação das integrações de `/hands` e `/session`. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.32 — workspace de Mãos

A suíte possui 536 testes. `tests/handsWorkspace.test.ts` contém 20 verificações para as três áreas exatas, três `tabpanel` sempre montados com IDs estáveis, ausência de `<main>` aninhado, visibilidade exclusiva por `hidden`, prioridade completa do helper inicial, inicialização única, navegação contextual ao salvar ou abrir mãos relacionadas, conteúdo de cada área, tabs/teclado/ARIA, empty states, ausência de storage e preservação do uso transacional da importação. As regressões V0.30/V0.31 continuam protegendo pool, +5/+10, filtros, surfaced IDs e rollback; as suítes anteriores continuam protegendo Quick Review e todo o acompanhamento longitudinal.

Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## Invariantes do motor

Qualquer teste/refatoração deve preservar:

1. primeira sessão: 12 exercícios fundadores;
2. pacotes estruturados entram em ordem definida;
3. microbloco atual não antecipa o próximo se sessão for interrompida;
4. erro em primeira apresentação não embaralha o bloco;
5. itens inéditos de pacote não entram por treino manual/adaptive fill;
6. pacote posterior fica bloqueado enquanto anterior tem inéditos;
7. item reservado não entra antes da conclusão do próprio pacote; pacote posterior pendente não bloqueia avaliação antiga;
8. revisão pode variar ordem sem destruir prioridade pedagógica;
9. progresso não deve virar `Consistente` por um único acerto/sessão;
10. histórico deve persistir resposta a resposta.

## Validação da biblioteca

Checar automaticamente sempre que possível:

- IDs únicos;
- resposta correta presente nas opções;
- sequências de pacote válidas;
- `learningPackage` conhecido;
- `purpose` válido;
- pistas presentes quando necessárias;
- nenhuma opção vazia;
- nenhum board inválido se houver parser/validador disponível.

Na V0.9, `range-actions`, `range-to-decision`, `calibration` e `integrated-application` são os pacotes estruturados: cada um deve ter exatamente as sequências de 1 a 12 entre os exercícios de desenvolvimento. `foundations` não exige `packageSequence`.

## Teste humano atual

A V0.5 precisa ser validada principalmente nestas perguntas:

- os microblocos aparecem corretamente?
- as perguntas são claras?
- as alternativas erradas são plausíveis?
- a pista ajuda sem entregar?
- o feedback explica a concepção errada?
- depois dos exercícios, o jogador começa a perguntar espontaneamente “qual parte do range quero atingir?” e “essas mãos mudam de decisão com o size?”
- o jogador separa “a ação segue das premissas?” de “há evidência para confiar nas premissas?”;
- evidência limitada produz atualização proporcional, em vez de certeza, descarte ou inversão extrema;
- a incerteza leva a uma decisão calibrada, e não à paralisia?

A suíte automatizada possui 39 testes. Para V0.6, ela protege também o bloqueio
de `calibration` até a apresentação completa de `range-to-decision`, seus três
microblocos, retomada parcial, estabilidade após erro de introdução, ausência de
vazamento pelo treino manual e o contrato estático das sequências 1–12. O piloto
de avaliação cobre o limite de 12 itens, no máximo uma retenção e uma
transferência, elegibilidade independente em duas sessões, espera de 24 horas
somente para retenção, apresentação única, suporte independente, determinismo,
repriorização apenas para development e separação do `SkillState`.

Na V0.6.1, a suíte também protege a seleção genérica do primeiro pacote pendente,
inclusive a prioridade de `calibration` sobre o ranking normal, o retorno ao
ranking depois dos três pacotes, a introdução recomendada de `calibration 01–04`
e o resumo separado das evidências de retenção e transferência.

Na V0.7, a suíte possui 55 testes. Os 16 testes diagnósticos cobrem os limiares
de `candidate` e `recurring`, filtros de purpose e support, prioridade de
`reasoningPattern`, fallback para `concept`, ausência de fallback por
`primarySkill`, separação de chaves, recuperação recente, determinismo e
histórico vazio. A camada é exercitada com fixtures mínimas, sem acoplamento à
posição atual dos exercícios na biblioteca.

## Build

Se `npm run build` falhar por ambiente/rede, documentar a limitação. Não declarar build bem-sucedida sem tê-la executado.

Na V0.8, a suíte possui 62 testes. A cobertura adicional protege o matching
exclusivo de `reasoningPattern`/`concept`, `candidate` read-only, bloqueio durante
pacotes pendentes, compatibilidade com foco, limite de um reforço, máximo de 12
itens, coexistência com retention/transfer, ausência de duplicação, escolha da
superfície mais antiga com exclusão da tentativa mais recente, determinismo,
recuperação pelo histórico e reutilização de `getActualSupport`. Também verifica
que seleção diagnóstica não muda `chooseFocus` nem `SkillState`.

Na V0.9, a suíte possui 71 testes. A cobertura adicional protege a ordem do quarto pacote, seus três microblocos, retomada parcial, estabilidade após erro, ausência de vazamento manual, bloqueio de avaliação e diagnóstico durante a introdução, elegibilidade posterior, contrato de 12 itens, seis avaliações reservadas, contagens 60/30, determinismo e limite de 12 decisões.

Na V0.10, a suíte possui 79 testes. A cobertura adicional protege a ordem do quinto pacote (`range-strength-signals`), bloqueio até `integrated-application`, três microblocos, retomada e estabilidade de introdução, ausência de vazamento manual, bloqueio/liberação de avaliação e diagnóstico, contrato 1–12, seis itens reservados, contagens 72/36, limite de sessão e determinismo. Auditorias de conteúdo verificam `sourceKind` heurístico, ausência das regras literais “small bet = weak”/“big bet = strong” e presença dos boundary cases static/dry e 3-bet pot.

## V0.10.1

A suíte possui 101 testes. A cobertura local verifica completude pelos IDs reais (inclusive foundations), bloqueio da avaliação do pacote incompleto, liberação com pacote posterior pendente, 24h de retention, evidência em duas sessões, coexistência isolada e conjunta de retention/transfer/diagnóstico após o microbloco intacto, limite de 12, ausência de duplicação, determinismo, prioridade `reasoningPattern` → `concept` → `primarySkill` sem usar `variantGroup` e isolamento explícito de support, priority e `SkillState` contra tentativas de avaliação.

## V0.10.2

A suíte possui 116 testes. A cobertura adicional verifica criação, serialização e retomada integral; identidade, ordem, suporte, `sessionRole`, `nextIndex`, resumo por `sessionId`, conclusão, focus, nova sessão com histórico, limite de 12, ausência de duplicação, repriorização persistida, validação defensiva e limpeza conjunta de attempts e active session.

## V0.11

A suíte possui 126 testes. A cobertura adicional protege o sexto pacote `hand-function-vs-range`, seus três microblocos, retomada e ordem após erro, ausência de vazamento manual, elegibilidade local de evaluation, coexistência com evaluations e diagnóstico anteriores, contrato 1–12, seis reservados, contagens 84/42, determinismo, limite de sessão e compatibilidade de active session V0.10.2. Auditorias editoriais protegem função contextual, Thin Value/SDV dependentes do range e alvos, ausência de agressão automática com Draw/Air, calibração e exclusão dos claims proibidos e de `solver-reference`.

## V0.12

A suíte possui 136 testes. A cobertura nova verifica a fronteira após três
acertos development independentes consecutivos em dois exercícios; ausência de
sinal após um erro novo; reconstrução de `candidate` com dois erros e de
`recurring` com três; campos limitados à evidência pós-fronteira; independência
por `reasoningPattern`/fallback de `concept`; uso da fronteira mais recente; e
exclusão de guided, supported, retention e transfer. A integração confirma que
recuperação e um erro novo não reservam reforço, candidate continua read-only e
um recurring novo volta a reservar exatamente um, preservando determinismo,
`SkillState`, prioridades de avaliação e teto de 12 decisões.

## V0.13

A suíte possui 147 testes. A cobertura adicional verifica qualificação somente
após recurring, exclusão de sequências comuns e de candidate, identidade por
reasoningPattern/concept sem primarySkill, bloqueio por recurring ativo apenas
da mesma chave, liberação imediata de transfer, âncora exata de 24h para
retention, nova recurrence e recovery posterior, resumo de verificações depois
de `recoveredAt`, consumo one-shot, coexistência, limite de um item por purpose,
teto de 12 e determinismo. Evaluation permanece fora do diagnóstico e do
SkillState pelos testes de isolamento já existentes.

## V0.14

A suíte possui 164 testes. Os 17 testes novos exercitam o modelo puro do loop:
estado vazio; invisibilidade de candidate; estados reinforcement/recovered;
linguagem conservadora; contagens específicas e ausência de observação para
transfer/retention; corte em `recoveredAt`; precedência de recurring sobre a
recovery da mesma identidade; coexistência entre identidades; ordenação estável;
limite de três itens; inventário e labels humanas completos; e falha explícita
para identidade desconhecida, sem fallback de metadata. A suíte preexistente
continua protegendo `SkillState`, resumo global de evaluation, determinismo do
scheduler, teto de 12, one-shot e active session.


## V0.15

A suíte possui 180 testes. Os 16 testes novos cobrem storage vazio/corrompido, validação defensiva, persistência integral, texto opaco, IDs, edição com identidade temporal preservada, foco opcional, exclusão isolada, reset pedagógico separado, ordenação, labels humanas, link de treino e ausência de `Attempt`, diagnóstico ou mudança no resumo longitudinal. A cobertura anterior continua protegendo scheduler determinístico, sessão ativa, teto de 12 e avaliações one-shot.

## V0.16

A suíte possui 195 testes. Os 15 testes de importação cobrem fronteira por cabeçalho e CRLF, tolerância a bloco inválido, `Hero: shows` separado da section SHOWDOWN, exclusão de cashout/posts/collected, decisão real por street, agressão através de calls intermediários, raise enfrentado, accounting de raise e retorno, all-in, teto/categorias/unicidade, independência do resultado financeiro, storage defensivo, exclusividade do detalhe aberto e promoção sem inferência para `RealHandReview`.

## V0.17 — revisão rápida

A suíte possui 218 testes. `tests/realHandReasoning.test.ts` cobre extração das ações do Herói, múltiplas decisões na mesma street, corte anti-hindsight de ações/board, labels e all-in, normalização dos fatores, validação/storage defensivos e isolamento do reset pedagógico. Também protege snapshots legados sem `sourceHandId`, o matching exato por proveniência e dados observáveis, e a edição quando o histórico muda: não há fallback silencioso para outra decisão, o snapshot fica intacto até uma escolha explícita e a reassociação preserva sua identidade temporal.

## V0.17.1 — mão visual e revisão por opções

A suíte possui 225 testes. Os testes da correção de composição protegem o modelo visual sem
`rawHandText`, a organização de board e ações por street, o destaque exato da
decisão, a troca de anchor, o corte de streets/ações futuras e a propriedade
única da superfície visual pela Quick Review em mãos salvas. A cobertura V0.17 existente continua
protegendo snapshots antigos, observação opcional, limite de dois fatores,
matching exato, storage separado e isolamento de `Attempt`, `SkillState` e do
scheduler.

## V0.18 — padrões nas revisões de mãos reais

A suíte possui 238 testes. `tests/realHandReviewPatterns.test.ts` adiciona 13 testes para vazio, pouca evidência, fatores em duas ou exatamente três revisões, marcações múltiplas, `automatic`, denominador de sustentação, agregado `low` + `unclear`, streets, legado, teto e desempate, copy sem porcentagens e pureza. Também cobre deleção pela entrada atualizada e isolamento de `Attempt`, `SkillState`, diagnóstico, scheduler e `learningLoop`; a cobertura V0.17 mantém a garantia de que o reset pedagógico preserva snapshots.


## V0.19 — hipóteses para investigar

A suíte possui 255 testes. Os 17 testes de `tests/realHandInvestigations.test.ts` cobrem thresholds, `automatic`, suportes excluídos, deduplicação por `handReviewId`, fatores simultâneos, teto/recência/desempate determinístico das evidências, deleção, legado, ausência de hipótese por street, pureza, isolamento pedagógico, ausência de associação a Skill e copy cautelosa. Executar com `npm test`; typecheck e build continuam obrigatórios.

## V0.20 — observação prospectiva

A suíte possui 282 testes. Os 27 testes de `tests/prospectiveRealHandInvestigation.test.ts` cobrem criação e validação do schema, storage defensivo e unicidade, baseline congelada/inconsistente, fronteira temporal, edição antiga, deduplicação, espera, fechamento imutável em cinco, ordenação determinística, todos os resultados de fatores normais e de `automatic`, legado, encerramento/reset isolados, copy e ausência de dependência do motor pedagógico. Executar com `npm test`; `npm run typecheck`, `npm run build` e `git diff --check` continuam obrigatórios.

A correção append-only adiciona regressões para A–E imutáveis diante de F, exclusão de A sem reposição, contagem preservada, edição de fator/sustentação sem efeito retroativo, round-trip do storage, sync parcial ordenado/deduplicado, baseline excluída, idempotência após cinco e detalhe ausente sem alteração da observação.

## V0.21 — histórico de investigações

A suíte possui 309 testes. `tests/realHandInvestigationHistory.test.ts` cobre schema e chave separados, storage vazio/corrompido e validação item a item, cópia profunda de baseline/janela, conclusões `completed`/`stopped`/`inconclusive`, idempotência por ID, coexistência e ordem determinística, resumo independente de snapshots, mãos excluídas sem reposição ou redução histórica, limpeza isolada da investigação ativa, preservação pelo reset e ausência de dependência do motor pedagógico ou copy diagnóstica/comparativa.

A correção do bloqueador de substituição adiciona regressões para classificação centralizada: janela 5/5 vira `completed` tanto por conclusão direta quanto ao iniciar outra investigação; 3/5 vira `stopped`; `inconclusive` mantém precedência; a nova investigação é criada e o episódio anterior permanece único.

## V0.22 — ponte voluntária para treino

A suíte possui 315 testes. `tests/investigationTrainingBridge.test.ts` protege o estado inicial sem foco, o inventário completo e a ordem neutra de Skills, o destino exato `/session?focus=<Skill>`, a independência de fator e contagens e a imutabilidade do episódio depois da navegação. A cobertura também mantém os schemas e o motor existentes sem alteração; `npm test`, `npm run typecheck`, `npm run build` e `git diff --check` são obrigatórios.

## V0.23 — proveniência de início

A suíte possui 329 testes. `tests/investigationTrainingLaunches.test.ts` cobre storage vazio/corrompido, validação item a item, Skill e timestamps, origem exata `completed`, identidade e tempo reais da sessão, unicidade/idempotência/conflito por `sessionId`, múltiplas sessões por episódio, lookup, contagem, reload, reset isolado, schema mínimo, imutabilidade e ausência de dependências pedagógicas ou mapping de fator. `tests/investigationTrainingBridge.test.ts` protege o link com `focus` escolhido e `investigation` exato. A integração em `TrainingSession` registra somente após criação; retomada e **Treinar mais** não chamam a autorização de origem. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.24 — proveniência da conclusão

`tests/investigationTrainingCompletions.test.ts` cobre parser/storage defensivo, schema mínimo, fronteira da fila, contratos exatos de launch/session/focus, timestamp factual, idempotência/conflito, reload, retomada, **Treinar mais**, join de episódio, reset e isolamento dos schemas e módulos pedagógicos. A cobertura de V0.23 continua protegendo a criação separada do launch. A suíte completa totaliza 349 testes.

## V0.25 — acompanhamento pós-treino

A suíte possui 375 testes. Os 26 testes de `tests/postTrainingRealHandFollowUps.test.ts` cobrem parser/storage defensivo, cadeia exata episode/launch/completion, escolha temporal explícita, fator independente de Skill, baseline, ordenação cronológica validada com desempate por snapshot, deduplicação, append-only, deleção, fechamento na quinta revisão, imutabilidade concluída, `automatic`, exclusividade V0.20/V0.25, idempotência, ordem histórica, copy factual, reset e isolamento pedagógico. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.26 — comparação descritiva entre janelas

A suíte possui 407 testes. Os 32 testes de `tests/realHandWindowComparisons.test.ts` cobrem cadeia exata e todas as rupturas de elegibilidade, conclusão original derivada do maior `createdAt` congelado, fronteiras temporais inconsistentes e igualdade aceita, contagens congeladas, sustentação ausente, `automatic`, independência entre Skill e `ReasoningFactor`, ausência de campos interpretativos/storage/dependências pedagógicas, independência e ordenação de múltiplos follow-ups e copy/UI neutras. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.27 — relação observada entre janelas

A suíte possui 435 testes. Os 28 testes de `tests/realHandWindowRelations.test.ts` cobrem `fewer`/`same`/`more`, extremos 0/5 e 5/5, defesa de janelas 5/5, dependência exclusiva de `factorCount`, independência de sustentação e Skill, regra uniforme de `automatic`, copy com disclosure, linguagem e representação visual neutras, ausência de porcentagem/delta/storage/dependências pedagógicas e preservação da ordem de múltiplas comparações. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.28 — fechamento didático da sessão

A suíte possui 451 testes. `tests/sessionRecap.test.ts` cobre vazio, prioridade de misconception, fallback para feedback curto, agrupamento, identidades e labels humanas, recência, acerto posterior em todos os suportes, isolamento por sessão, IDs desconhecidos, os três purposes, ordenação determinística, limite visual, copy conservadora e ausência de storage/dependências proibidas. A suíte completa deve ser executada com `npm test`, seguida por `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.29 — revisão ativa no fechamento

A suíte possui 471 testes. Os 20 testes de `tests/sessionRecapReview.test.ts` protegem feedback inicialmente oculto, reveal exato e independente, reflexão opcional limitada a 180 caracteres, ausência de persistência/API/`Attempt`, fatos de acerto posterior, vazio sem controles artificiais, limite e ordem dos três cards, contagem restante, copy conservadora e associações acessíveis. Também verificam que o componente não importa diagnóstico, `trainingEngine` ou domínios de mãos reais e que `SessionRecap` não recebe estado de UI. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.30 — exploração progressiva GG/PokerCraft

A suíte possui 497 testes. Os testes de `tests/activeGgImportBatch.test.ts`, somados às regressões de `tests/ggHandImport.test.ts`, cobrem equivalência dos cinco primeiros, rodadas, categorias esgotadas, limites e unicidade do pool, independência de resultado, schema/fingerprint/timestamps, storage ausente ou corrompido, +5/+10, teto de 15, pedidos parciais, consumo definitivo, reload, esgotamento, encerramento isolado e ausência de dependências pedagógicas. O fake de `localStorage` também falha especificamente no primeiro, segundo ou terceiro `setItem` para verificar rollback exato de batch, pending e fingerprint, inclusive na importação inicial. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.

## V0.31 — exploração estrutural específica

A suíte possui 516 testes. Os 19 testes de `tests/ggImportExploration.test.ts` cobrem as seis tags, sobreposição e independência de `suggestion.reason`, parse inválido, independência de resultado/vencedor, contagens somente não surfaced, ordem e limites da seleção, consumo compartilhado com +5/+10, imutabilidade, rollback, reload factual, estado React local e ausência de storage/classificação estratégica/dependências pedagógicas. As regressões anteriores preservam os cinco iniciais e a exploração geral. Executar `npm test`, `npm run typecheck`, `npm run build` e `git diff --check`.
