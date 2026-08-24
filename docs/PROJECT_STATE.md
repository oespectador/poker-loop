# Project State — V0.38.1

## V0.38.1 — inferência conservadora após all-in

Uma bet ou raise all-in imediatamente anterior só remove Raise das opções quando a mesa é explicitamente heads-up (`maxPlayers === 2`). Em pots multiway ou quando `maxPlayers` é desconhecido, os dados atuais não provam que não há adversário ativo para um side pot, portanto Raise permanece disponível. Esta é uma correção conservadora, não um legal-action engine; parser, replay, anti-hindsight e isolamento pedagógico não mudaram.

## V0.38 — rejogar uma decisão da própria mão

Uma mão salva com Quick Review reconstruível oferece **Rejogar esta decisão**. A âncora vem exatamente de `RealHandReasoningSnapshot.sourceDecision`, validada por `matchSnapshotDecisionAnchor`; snapshots ausentes, legados ou incompatíveis com um histórico editado não recebem fallback. A visualização reutiliza a Decision View e termina imediatamente antes da ação do Herói que será refeita.

As opções normalizam somente Fold/Check/Call/Bet/Raise: check/bet oferecem essas duas famílias, e fold/call/raise oferecem as três. Raise só é omitido após bet ou raise all-in imediatamente anterior quando a mesa é explicitamente heads-up. Amount, sizing e all-in do Herói não criam nova família. A comparação relata apenas mesmo/diferente tipo de ação, sem resposta correta ou avaliação estratégica.

O replay inteiro é estado React efêmero. Não cria storage, `Attempt`, `RealHandReasoningSnapshot`, investigação, launch, sessão, evidência pedagógica ou atualização de `SkillState`; a V0.37 permanece inalterada.

## V0.37 — padrão observado → sugestão de próximo treino

A ponte de episódios `completed` agora deriva de `episode.factor` um mapa editorial fixo com um caminho primário e outro secundário para `size`, `board`, `previous-actions`, `configuration` e `player-read`. `automatic` e `other` mantêm as quatro Skills como escolhas neutras. Todas as Skills permanecem acessíveis, nenhuma começa selecionada e somente o clique explícito reutiliza `/session?focus=<Skill>&investigation=<episodeId>`.

A sugestão é apresentação efêmera: não cria storage, launch, sessão ou evidência e não altera `SkillState`. Episódios `stopped` e `inconclusive` continuam inelegíveis. O motor pedagógico, thresholds, janela prospectiva e provenance V0.23–V0.26 permanecem intactos.

## V0.35 — revisão visual das situações importadas

As sugestões pendentes em Explorar agora usam as cartas visuais existentes e um resumo compacto com data e motivo factual. Uma situação aberta cresce no próprio ponto da grade, ocupa a largura útil e reúne a visualização completa, o histórico bruto, a explicação e as ações. Somente uma expansão efêmera permanece aberta; salvar e descartar conservam os contratos V0.30–V0.34. Não há board no resumo, storage novo, análise estratégica ou mudança em Quick Review, Decision View e motor pedagógico.

Atualizado para o handoff autônomo inicial.

## Repositório

Projeto atual: **Poker Loop 1.0**, separado do projeto Legacy.

Stack:

- Next.js `^16.2.0`
- React `^19.2.0`
- TypeScript `^5.9.0`
- Node `>=20.9.0`

## Versão atual

**V0.38 — Rejogar uma decisão da própria mão**

## V0.34 — Exploração por Ações no River

A exploração GG/PokerCraft mantém as seis situações V0.31 e acrescenta oito filtros factuais: ações de bet, check, call, raise e fold do Hero no river; bet ou raise adversária imediatamente enfrentada; e bet do Hero seguida de raise e nova decisão do Hero. A sequência vem exclusivamente de `ParsedGgHand.actions`, inclusive em potes multiway, sem consultar resultado financeiro.

Tags, contagens e seleção continuam derivadas e efêmeras. O pool, a ordem, os limites, os IDs surfaced e a transação V0.30/V0.31 permanecem comuns a filtros e +5/+10. Não há novo storage, interpretação de bluff/value/erro, evidência pedagógica ou mudança na Home V0.33.

## V0.33 — Próximo Passo Contextual na Home

A Home deriva uma única ação principal dos estados locais existentes. A prioridade operacional exata é: sessão ativa (continuação ou fechamento), acompanhamento ativo, sugestões pendentes, candidatas restantes do lote e, por fim, treino recomendado pelo motor existente. A retomada usa o `focus` persistido na sessão, inclusive a URL sem query quando ele é `null`.

Essa escolha não é persistida e não produz writes. A Home somente lê pelas APIs defensivas existentes e navega para `/session` ou `/hands`; criação, avanço e conclusão continuam nos fluxos responsáveis. Nenhum storage, schema, `Attempt` ou regra pedagógica mudou.

## V0.32 — Mãos Organizadas pela Intenção do Jogador

`/hands` agora mostra uma área principal por vez: **Explorar** reúne importação, lote, expansão, filtros e sugestões; **Revisar** reúne mãos salvas, Quick Review e registro manual; **Acompanhar** reúne padrões, investigações, follow-ups, histórico e comparações. A navegação é uma tablist acessível, efêmera e controlada somente por React.

A inicialização prioriza investigação ou follow-up ativo, depois sugestões pendentes ou lote com candidatas restantes e, sem estado acionável, revisão. Essa escolha ocorre uma vez no carregamento. Salvar uma sugestão ou abrir uma mão relacionada navega explicitamente para Revisar e seleciona a mão, sem mudar qualquer contrato de seleção, snapshot, evidência ou storage.

## V0.29 — Revisão Ativa no Fechamento da Sessão

Os até três itens factuais selecionados pela V0.28 agora começam com o feedback autoral oculto. Cada card convida o jogador a tentar lembrar a ideia central, oferece uma reflexão opcional de até 180 caracteres e revela exatamente o feedback já escolhido pelo recap. Reveal e texto são estados React independentes por item e desaparecem ao sair da tela.

Essa interação é estudo local, não avaliação. Escrever, revelar ou pular não cria `Attempt`, não persiste dados e não alimenta diagnóstico, scheduler, `SkillState`, recovery, retention ou transfer. Recuperação ativa na interface não é o `recovery` do modelo longitudinal. Sessões sem erro continuam sem pergunta artificial.

## V0.28 — Fechamento Didático da Sessão

Ao concluir o treino, a sessão deriva um resumo compacto exclusivamente dos próprios `Attempt[]` e da biblioteca de `Exercise[]`. Erros são agrupados por `reasoningPattern`, com `concept` e depois a Skill humana como fallbacks; o feedback específico da alternativa errada mais recente tem prioridade sobre `feedback.short`. Até três raciocínios aparecem, primeiro os que não tiveram acerto posterior na sessão.

O resumo não é persistido e não cria evidência. Um erro descreve somente uma decisão daquela sessão; um acerto posterior, em qualquer suporte, descreve somente a cronologia local. Diagnóstico recorrente, recovery, retention, transfer, scheduler, `Attempt` e `trainingEngine` permanecem inalterados.

## V0.24 — Proveniência da Conclusão de uma Sessão

`InvestigationTrainingCompletion` registra separadamente apenas que uma sessão com launch válido chegou ao fim operacional da fila persistida (`items.length > 0 && nextIndex >= items.length`). O schema exato é `{ version: 1; sessionId: string; completedAt: string }`, na chave `poker-loop-v1:investigation-training-completions`. O horário vem do Attempt mais recente da própria sessão, mas Attempts apenas datam o evento depois de a fila comprovar a conclusão.

Launch e completion são eventos distintos. Uma sessão pode possuir launch e ainda não possuir completion; uma sessão sem launch nunca recebe completion de investigação. Reload reconcilia apenas por `sessionId`, Skill/focus idênticos, fila concluída e timestamp confiável. Sessão retomada conserva a origem; **Treinar mais** não a herda. Nenhuma métrica pedagógica é copiada e os schemas protegidos e o motor permanecem inalterados.

V0.18 = descrição retrospectiva; V0.19 = hipótese; V0.20 = observação prospectiva; V0.21 = memória histórica; V0.22 = ponte voluntária; V0.23 = sessão iniciada; V0.24 = sessão operacionalmente concluída.

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

## V0.25 — Acompanhamento Pós-Treino em Mãos Reais

A cadeia exata episódio `completed` → launch → completion agora pode originar, por escolha explícita da sessão e novo clique de início, uma janela append-only de cinco Quick Reviews. O storage separado congela baseline, fatos observados e conclusão factual na quinta revisão. Apenas uma observação prospectiva (V0.20 ou V0.25) pode estar ativa. Histórico, reset e motor pedagógico permanecem separados; não há comparação pré/pós nem inferência de eficácia.

## V0.26 — Comparação Descritiva entre Janelas de Mãos Reais

Uma camada pura e derivada agora une exclusivamente episódio `completed` 5/5, follow-up concluído 5/5 do mesmo fator, launch da mesma sessão e episódio, e completion da mesma sessão. `/hands` pode expandir cada comparação elegível em dois blocos neutros com contagem de presença e, exceto para `automatic`, sustentação registrada baixa/incerta. Cada follow-up permanece uma comparação independente com o original, ordenada pela conclusão posterior e ID. A data de conclusão de cada janela corresponde à entrada factual da quinta observação; `episode.endedAt` representa o arquivamento do episódio e não substitui a conclusão da janela original. A comparação só aparece quando `janela original → episódio → sessão → follow-up` também é uma sequência temporal consistente. Não há storage, migração, delta, porcentagem, direção, interpretação causal ou entrada no motor pedagógico.

## V0.27 — Relação Observada entre Janelas

Uma camada pura recebe exclusivamente cada `RealHandWindowComparison` V0.26, exige defensivamente janelas 5/5 e classifica a ocorrência do mesmo fator como `fewer`, `same` ou `more` pela comparação dos dois `factorCount`. A UI apresenta essa relação em estilo neutro, sem porcentagem ou delta. Sustentação, Skill e motor pedagógico permanecem fora; a relação não é persistida e não indica melhora, piora, aprendizagem ou efeito do treino.

## V0.30 — exploração progressiva da importação GG/PokerCraft

A triagem inicial continua expondo no máximo cinco situações. A mesma ordenação estrutural agora produz, em rodadas pelas cinco categorias fixas, um pool determinístico limitado a 50 candidatas. Um único batch ativo persiste esse pool e os IDs já mostrados; o jogador pode acrescentar voluntariamente 5 ou 10 situações sem reler o arquivo, até o teto de 15 pendentes. Salvar ou descartar não devolve uma situação ao pool. Reload retoma o batch, e substituí-lo quando ainda restam candidatas exige encerramento explícito. Resultado financeiro, interpretação estratégica e motor pedagógico continuam fora.

## V0.31 — exploração de situações específicas no lote GG/PokerCraft

O lote ativo oferece seis filtros estruturais derivados do `rawHandText` das candidatas já limitadas pela V0.30: decisão no river, agressão enfrentada no river, showdown com cartas reveladas, alta exposição, pressão em várias streets e linha longa. Uma mão pode contar em várias categorias, mas deixa de estar disponível em todas assim que entra no fluxo. **Mostrar até 5** mantém a ordem do pool, o teto compartilhado de 15 e a mesma transação com rollback de +5/+10. Raw inválida recebe zero tags e continua disponível para exploração geral. Filtro escolhido, tags e contagens não são persistidos; schemas, storage e motor pedagógico não mudaram.
## V0.36 — revisão leve e progresso factual para padrões

O acompanhamento deriva dos snapshots um milestone explícito de três revisões: 0/3, 1/3 e 2/3 mostram quantas decisões ainda faltam apenas para começar a procurar recorrências. A partir de 3/3, a UI informa que a leitura está em andamento, separa o marco inicial do total real de decisões revisadas e não promete quantas revisões produzirão uma observação. O valor e o texto acessível do progresso nunca ultrapassam seu máximo. Os thresholds factuais V0.18 e de investigação V0.19 permanecem inalterados.

Quick Review coleta somente `ReasoningFactor` e `SelfRatedSupport` quando aplicável. Registro e edição manual mostram apenas histórico bruto e título opcional; a visualização da mão não apresenta mais reflexão detalhada. `thought` e todos os campos legados de `RealHandReview` continuam válidos e são preservados em edições, sem migration, schema ou chave de storage nova. Não há mapping `ReasoningFactor → Skill` nem alteração do motor pedagógico.
