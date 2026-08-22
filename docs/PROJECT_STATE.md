# Project State — V0.22

Atualizado para o handoff autônomo inicial.

## Repositório

Projeto atual: **Poker Loop 1.0**, separado do projeto Legacy.

Stack:

- Next.js `^16.2.0`
- React `^19.2.0`
- TypeScript `^5.9.0`
- Node `>=20.9.0`

## Versão atual

**V0.22 — Ponte Voluntária entre Investigação e Treino**

## V0.22 — Ponte Voluntária entre Investigação e Treino

Depois de concluir uma janela prospectiva, o episódio histórico `completed` oferece uma ponte compacta no próprio card. O jogador escolhe explicitamente, sem pré-seleção, uma entre todas as Skills atuais e segue pelo fluxo normal `/session?focus=<Skill>`. Episódios `stopped` e `inconclusive` e a investigação ainda ativa não exibem essa ponte.

Não existe mapeamento de `ReasoningFactor` para Skill: fator e contagens não influenciam opções, ordem ou destaque. A escolha vive apenas no estado React. Nenhum storage, schema ou proveniência episódio → sessão foi criado; `StoredRealHandInvestigationEpisode`, `Attempt`, `ActiveTrainingSession` e `trainingEngine` permanecem inalterados. Abrir o treino não demonstra conclusão, relevância ou eficácia.

V0.18 = descrição retrospectiva; V0.19 = hipótese; V0.20 = observação prospectiva; V0.21 = memória histórica; V0.22 = ponte voluntária para o treino existente.

## V0.21 — Histórico de Investigações de Mãos Reais

Investigações encerradas agora viram episódios V1 imutáveis em storage separado. Cada episódio congela baseline, janela prospectiva, início, fim e motivo factual de encerramento (`completed`, `stopped` ou `inconclusive`). `/hands` mostra os episódios recentes sem comparar ciclos; detalhes dependem apenas das mãos ainda existentes, enquanto as contagens históricas nunca são recalculadas. Histórico de investigação não é histórico pedagógico e permanece fora de Attempt, SkillState, diagnóstico, scheduler e learningLoop.

`/hands` agora resume longitudinalmente os `RealHandReasoningSnapshot` como autorrelato: total de decisões, fatores, sustentação percebida e streets. Até três observações factuais ficam visíveis somente a partir de três ocorrências. Frequência de fator não significa leak, erro, domínio ou evidência pedagógica. Snapshots legados sem `sourceHandId` participam sem matching ou migração.

O resumo puro permanece fora de `Attempt`, diagnóstico, `SkillState`, recovery, retention, transfer, scheduler e sessão ativa. Storage, thresholds pedagógicos e a seção longitudinal de Progresso não mudaram.

### Base preservada da V0.17.1

A mão reconhecida agora é apresentada como cartas, board e ações separadas por
street; o histórico bruto permanece recolhido como apoio. A revisão rápida usa
até dois fatores e uma seleção de sustentação percebida, com observação curta
opcional. A reflexão detalhada também fica recolhida. A Decision View reutiliza
essa apresentação sem mudar seu corte anti-hindsight nem o matching exato.

Uma `RealHandReview` reconhecida pelo parser GG/PokerCraft pode reconstruir uma ação voluntária do Herói sem mostrar board, ações ou desfecho posteriores. O jogador pode salvar um autorrelato curto em um único `RealHandReasoningSnapshot` por mão. Esse registro permanece separado de `Attempt`, diagnóstico, `SkillState`, recovery, retention, transfer, scheduler e sessão ativa. O vínculo usa o `sourceHandId` do parser e todos os dados observáveis da ação; snapshots V0.17 legados sem proveniência mantêm o autorrelato, mas exigem nova escolha explícita. A apresentação conserva o marcador de all-in fornecido pelo parser, sem estimar pot ou stacks.

A camada V0.16 continua responsável pela importação local de `.txt` e pela triagem determinística de no máximo cinco sugestões estruturais. Resultado financeiro não participa da seleção ou desempate, e somente **Salvar para revisão** cria um `RealHandReview`.

A evidência longitudinal já derivada pelo motor agora possui uma representação conservadora em Progresso. O scheduler, o conteúdo V0.11 e a persistência V0.10.2 permanecem compatíveis e inalterados.

A sessão pedagógica de 12 decisões tem identidade persistente. Navegação e reload retomam a mesma fila e a próxima decisão ainda não respondida. O estado usa `poker-loop-v1:active-session`, sem alterar o histórico ou o schema de `Attempt`.

### Biblioteca

- 12 exercícios fundadores;
- 12 exercícios V0.3 — Leitura de Range pelas Ações;
- 12 exercícios V0.4 — Da Leitura à Decisão;
- 12 exercícios V0.5 — Lógica × Calibração;
- 12 exercícios V0.9 — Aplicação Integrada em Novas Superfícies;
- 12 exercícios V0.10 — Pistas de Força do Range;
- 12 exercícios V0.11 — Função da Mão × Força do Range;
- 42 itens reservados de retenção/transferência fora do treino normal.

Total ativo após todos os pacotes serem apresentados: **84 exercícios de desenvolvimento**.

## Pacotes estruturados

Ordem:

1. `range-actions`
2. `range-to-decision`
3. `calibration`
4. `integrated-application`
5. `range-strength-signals`
6. `hand-function-vs-range`

Cada pacote tem 12 itens divididos em três microblocos de quatro.

Regras atuais:

- pacote seguinte não vaza antes de o anterior ter sido apresentado;
- sessão interrompida no meio retoma apenas os itens restantes do mesmo bloco;
- erro em item de introdução não embaralha a sequência;
- itens apresentados passam depois a competir no scheduler adaptativo.
- enquanto houver um pacote pendente, a recomendação usa genericamente o foco
  declarado para o primeiro pacote da ordem; depois, volta ao ranking normal de
  Skills.

`calibration` separa a coerência entre premissas e ação da força da evidência
que sustenta essas premissas. O pacote termina em decisões sob incerteza, sem
criar uma Skill nova: usa principalmente `range-reading` e
`integrated-decision`, com foco automático amplo em `range-reading`.

## Motor atual

Arquivo principal: `lib/trainingEngine.ts`.

Comportamentos já implementados:

- primeira sessão fundadora fixa;
- escolha de foco;
- pequena variação determinística entre sessões via `sessionSeed`;
- reforço após erro recente;
- espaçamento heurístico simples;
- redução/retorno de suporte;
- diversificação por habilidade/conceito;
- microblocos sequenciais;
- repriorização de variação após erro somente fora de introdução;
- progresso conservador por habilidade.

Assim que o pacote do próprio item foi completamente apresentado, uma sessão pode
incluir no máximo um item elegível de retenção e um de transferência, mesmo que
um pacote posterior esteja pendente, sem passar de 12 decisões. O microbloco de
introdução permanece inteiro e ocupa sempre o início da sessão. Cada item reservado aparece no máximo uma vez neste piloto.

Retenção exige duas respostas corretas independentes relacionadas, em duas
sessões, e 24 horas desde a mais recente. Transferência exige a mesma evidência
independente, sem espera temporal. A relação prefere `reasoningPattern`, recorre a `concept` quando necessário e usa
`primarySkill` somente como fallback final.

O limiar de 24 horas é uma hipótese operacional conservadora, não um intervalo
de aprendizagem validado nem uma regra `1-3-7-30`. O motor **não é** um sistema
completo de knowledge tracing, repetição espaçada ou diagnóstico causal.

### Diagnóstico e reforço controlado

`lib/diagnostics.ts` resume candidatos a padrões recorrentes e seleciona o
reforço controlado. A análise considera somente tentativas de desenvolvimento registradas
como independentes. A chave usa `reasoningPattern` e recorre a `concept` apenas
quando o primeiro não existe; `primarySkill`, `variantGroup` e misconceptions
não são tratados como causas.

Um sinal `candidate` exige ao menos dois erros, em dois exercícios e duas
sessões diferentes. `recurring` exige ao menos três erros, em três exercícios e
duas sessões. A última fronteira válida de três acertos development
independentes consecutivos, cobrindo ao menos dois exercícios, delimita a
evidência ativa — uma heurística provisória de recuperação, não prova de
domínio. Esses limiares são heurísticas do protótipo, não medidas validadas.
`candidate` permanece read-only.

Somente entre conteúdos de pacotes completamente apresentados, o primeiro sinal
`recurring` compatível com o foco já escolhido pode reservar um único exercício
development relacionado. A seleção evita a superfície da tentativa mais recente
quando existe alternativa, prefere a menos recentemente respondida e usa a ordem
da biblioteca como desempate. O diagnóstico não escolhe Skill, não desloca
retenção/transferência, reutiliza o suporte existente e não altera storage ou UI.
A recuperação continua inferida do histórico, sem marcação manual.

## V0.12 — fronteira longitudinal

A última janela válida de três acertos development independentes consecutivos
em pelo menos dois exercícios da mesma chave (`reasoningPattern`, ou `concept`
somente na ausência dela) define o início da evidência ativa. As Attempts e os
erros anteriores permanecem armazenados, mas deixam de sustentar sinais ativos e
de compor os campos de um novo `DifficultyPattern`. A dificuldade fica
**recuperada por enquanto** e, para reaparecer, precisa reconstruir depois da
fronteira os thresholds inalterados de `candidate` ou `recurring`.

Retention, transfer, guided e supported real não criam fronteira. Nenhuma
inferência de domínio, alteração em `SkillState`, UI, conteúdo, `Attempt` ou
storage foi introduzida. O scheduler não ganhou mecanismo novo: continua
consumindo `summarizeDifficultyPatterns()`.

## V0.13 — verificação pós-recuperação

Uma recuperação qualificada deriva somente de um episódio que atingiu
`recurring` e depois cruzou a fronteira existente de três acertos development
independentes consecutivos em ao menos dois exercícios. Ela ancora avaliações
posteriores da mesma identidade causal: `reasoningPattern` exato ou `concept`
apenas como fallback quando não há reasoningPattern. `primarySkill` não cria
esse vínculo.

Transfer relacionada pode ser liberada pela recuperação sem exigir duas novas
sessões de evidência-base. Retention relacionada conta as 24 horas a partir do
terceiro acerto (`recoveredAt`). Um `recurring` ativo bloqueia apenas avaliações
da mesma chave, preservando os itens escassos; `candidate` continua read-only.
Avaliações permanecem one-shot e no máximo uma de cada purpose por sessão. Se
não houver item ainda não usado, não há observação disponível neste piloto.

`summarizeRecoveryVerification()` descreve acertos e respostas de retention e
transfer posteriores à recuperação mais recente. Evaluation não cria nem remove
diagnóstico, recovery ou `SkillState`; nenhuma inferência de domínio foi criada.

## V0.14 — loop longitudinal visível

A página de Progresso combina, por uma função pura de apresentação,
`summarizeDifficultyPatterns()`, `summarizeDifficultyRecoveries()` e
`summarizeRecoveryVerification()`. Ela mostra no máximo três padrões: primeiro
os `recurring` ativos como **Em reforço** e depois recoveries qualificadas como
**Recuperado por enquanto**, com as mais recentes primeiro em cada grupo. Um
novo recurring substitui visualmente a recovery da mesma identidade.

Transfer e retention posteriores à recovery aparecem como contagens factuais;
quando ausentes, são descritas como ainda não observadas. Isso não é score nem
domínio. `candidate` continua interno e nenhuma key de `reasoningPattern` ou
`concept` é renderizada: o inventário de identidades utilizáveis exige labels
humanas explícitas e falha em desenvolvimento quando uma delas não possui label.
Scheduler, `Attempt`, storage, active session, `SkillState`, conteúdo, suporte e
thresholds não mudaram.

## Persistência

Histórico local salvo a cada resposta. Não quebrar compatibilidade do storage sem migração explícita.

Sugestões usam `poker-loop-v1:hand-review-suggestions` (teto de cinco) e fingerprints mínimos usam `poker-loop-v1:gg-imports`. O reset pedagógico remove somente attempts e sessão ativa: mãos reais e sugestões pertencem à área `/hands`.

## UI atual

Visual provisório aprovado para continuar testes:

- fundo navy/quase preto;
- tipografia branca;
- acentos cyan/violeta/verdes/vermelhos/âmbar;
- opções grandes arredondadas;
- boards renderizados como cartas visuais;
- `Herói` / `Vilão`;
- `Ver uma pista` antes da resposta quando aplicável;
- `Ver explicação completa` depois da resposta.

Não investir agora em refinamento visual final.

Retenção e transferência usam o fluxo de exercício existente. O Progresso mostra
contagens descritivas de verificações e acertos para cada tipo, separadas dos
cards de Skills. Suas tentativas permanecem fora da evidência-base que calcula o
`SkillState`.

## Ajuste editorial já incorporado

Evitar `região mais forte`. Para força global usar `range mais forte`; para nut advantage explicar em termos de combinações entre as mãos mais fortes possíveis.

## Hipóteses ainda não validadas

- se 12 decisões por sessão é a duração ideal;
- se microblocos de quatro são o tamanho ideal;
- se a sequência atual produz transferência real;
- se os estados qualitativos refletem aprendizagem de forma útil;
- se o scheduler atual reage bem quando a biblioteca ficar muito maior;
- se o usuário passa espontaneamente a pensar em mãos-alvo/resposta ao size após a V0.4.
- se o usuário separa lógica e calibração e ainda consegue decidir sob incerteza após a V0.5;
- se os itens reservados de calibração produzirão retenção ou transferência real quando forem futuramente agendados e testados.

## Não implementar automaticamente ainda

- solver completo;
- ranges/charts personalizados;
- importação avançada de mãos como diagnóstico estratégico;
- ML/knowledge tracing sofisticado;
- dashboard de leaks;
- gamificação pesada;
- grande redesign visual;
- tendências específicas de NL2 sem fonte/dados adequados.

## V0.10 — política de conteúdo

O quinto pacote deriva apenas das heurísticas condicionais registradas no claim map do Hungry Horse. Size é evidência, não revelação do range, e seu valor informativo muda com board e configuração. Static/dry e 3-bet pot são boundary cases explícitos. Claims de turn, river, donk e double previous size permanecem fora da biblioteca ativa; nenhuma tendência foi transplantada para NL2/GGPoker como fato. Motor, storage e schema de tentativas permanecem inalterados.

## V0.10.1 — evidência local por pacote

A trava global de avaliação foi removida. A completude é determinada pelos IDs reais de todos os development do pacote do item, inclusive `foundations`, e não pela posição na ordem. Pacotes futuros não congelam revisão antiga. Tentativas retention/transfer continuam separadas: não influenciam fading, retorno de suporte, prioridade adaptativa nem `SkillState`. Thresholds diagnósticos, conteúdo, UI, storage e schema não mudaram.

## V0.11 — política de conteúdo

O sexto pacote conecta força estimada do range à função contextual da mão. Range forte/fraco não determina ação sozinho; Thin Value e SDV dependem das mãos-alvo, e Draw/Air não determinam agressão. A adaptação é proporcional à sustentação da leitura. Claims de turn/river e tendências de pool seguem fora. Diagnóstico, scheduler, retention, transfer, `Attempt`, storage e active session não mudaram.


## V0.15 — ponte com mãos reais

A rota `/hands` mantém `RealHandReview` em `poker-loop-v1:real-hands`, separado de `Attempt` e da sessão ativa. O jogador cola `rawHandText` opaco, registra quatro reflexões e pode escolher manualmente uma Skill ampla. Esse foco apenas cria o link `/session?focus=<Skill>` para o treino normal. Criação, edição e exclusão não entram em diagnóstico, `SkillState`, recovery, retention, transfer nem no loop longitudinal. Não existe parser, extração ou análise estratégica automática. O reset de progresso pedagógico não apaga esse material do jogador.

## V0.17 — revisão rápida de uma decisão real

Mãos GG/PokerCraft salvas podem reconstruir uma ação voluntária do Herói sem revelar board, ações ou desfecho posteriores. Um autorrelato opcional é persistido em `poker-loop-v1:reasoning-snapshots`, com unicidade por mão. Ele não integra o motor pedagógico; o reset de progresso o preserva e a exclusão explícita da mão remove seu snapshot.


## V0.18 — padrões de autorrelato em mãos reais

A suíte possui 238 testes. Os 13 testes do resumo puro cobrem vazio, pouca evidência, threshold inclusivo de três snapshots, fatores múltiplos, `automatic`, sustentação, streets, legado, teto e ordem das observações, copy sem porcentagens, pureza, deleção por nova entrada e isolamento pedagógico.


## V0.19 — hipóteses cautelosas do autorrelato

`/hands` deriva hipóteses dos snapshots atuais, deduplicadas por `handReviewId`. Fatores normais exigem três revisões distintas e ao menos duas decisões com sustentação percebida `low` ou `unclear`; `automatic` exige somente três revisões. Até três mãos relacionadas são escolhidas por recência, deterministicamente e sem resultado financeiro. Snapshots legados qualificam e só abrem uma `RealHandReview` por identidade exata. Street não qualifica hipótese. A camada não persiste estado e não toca `Attempt`, `SkillState`, diagnóstico, scheduler ou treino.

## V0.20 — observação prospectiva em novas mãos

V0.18 descreve retrospectivamente o autorrelato; V0.19 deriva do passado uma hipótese cautelosa; V0.20 permite acompanhar uma delas em dados posteriores. Ao iniciar, a evidência de origem fica congelada e uma fronteira `startedAt` separa a baseline das primeiras cinco novas revisões distintas. Essa janela de cinco é uma hipótese operacional do piloto, não threshold validado, confiança ou teste estatístico. O resultado continua descritivo e não avalia estratégia.

Existe no máximo um acompanhamento em `poker-loop-v1:real-hand-investigation`. Ele pode ser substituído ou encerrado deliberadamente sem apagar mãos ou snapshots. A derivação pura não alimenta `Attempt`, `SkillState`, diagnóstico, scheduler, sessão ativa ou treino.

### Correção de integridade da janela V0.20

O schema V1 também persiste `prospectiveReviews`: até cinco observações append-only com `snapshotId`, `handReviewId`, `createdAt`, presença congelada do fator e sustentação percebida aplicável. A derivação usa somente esses fatos congelados. Exclusão ou edição posterior não reduz, substitui nem reclassifica a janela; mãos removidas apenas deixam de oferecer detalhe.

## V0.23 — Proveniência Voluntária do Início de uma Sessão

A ponte de episódios `completed` agora leva `focus` escolhido e `investigation` exato até `/session`. Somente quando não há sessão compatível para retomar e `createTrainingSession` cria uma nova sessão, o app valida o episódio no histórico e registra `{ version: 1, episodeId, sessionId, skill, launchedAt }` em `poker-loop-v1:investigation-training-launches`; `launchedAt` é o `startedAt` real. A chave é separada, defensiva e única por `sessionId`. Reload é idempotente, retomada preexistente não recebe origem e **Treinar mais** não herda o parâmetro. A UI mostra uma nota mínima na sessão originada e a quantidade factual de sessões iniciadas no card do episódio. Não há conclusão, resultado, eficácia, alteração pedagógica ou mapping `ReasoningFactor → Skill`.
