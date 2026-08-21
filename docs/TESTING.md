# Testing Protocol

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
