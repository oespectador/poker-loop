# Frozen Decisions — Poker Loop

## Frozen Decision — V0.38.1

**A presença de um all-in imediatamente antes da decisão não prova, sozinha, que Raise é ilegal em pots multiway. O replay só remove Raise quando essa indisponibilidade puder ser determinada com segurança pelos dados estruturados disponíveis.**

Na V0.38.1, isso exige uma mesa explicitamente heads-up (`maxPlayers === 2`) e uma ação adversária de bet ou raise, all-in, imediatamente anterior e na mesma street. Em mesas multiway ou com `maxPlayers` desconhecido, Fold/Call/Raise permanecem como opções conservadoras. **A V0.38.1 não transforma o replay em um legal-action engine.**

## Frozen Decision — V0.38

**A V0.38 permite refazer uma decisão real usando o mesmo corte temporal do Quick Review. A nova escolha é comparada apenas com o tipo de ação realizada na mesa e não possui resposta correta.**

O replay é estado efêmero de interface. Ele não cria `Attempt`, `RealHandReasoningSnapshot`, evidência pedagógica, investigação ou atualização de `SkillState`.

**Same action family** significa apenas que o jogador escolheu novamente Fold/Check/Call/Bet/Raise. Não compara sizing e não implica equivalência estratégica. A ação histórica só aparece dentro do replay depois da escolha atual; ações e streets futuras, showdown e resultado continuam ocultos.

## Frozen Decision — V0.35

**A V0.35 torna as situações importadas visualmente reconhecíveis e permite inspecioná-las inline. A expansão é apenas estado de interface; não altera seleção, evidência, armazenamento ou classificação da mão.**

**Cards compactos priorizam reconhecimento e ação. Explicações detalhadas só aparecem sob demanda.**

O resumo mostra somente cartas do Herói, data e `reasonLabel`; o board e `reasonMessage` aparecem após a abertura explícita. Salvar diretamente e descartar continuam disponíveis, enquanto **Revisar situação** é a ação visual principal. A inspeção completa não substitui nem altera a Decision View anti-hindsight usada depois que a mão é salva.

Estas decisões foram tomadas durante exploração e testes. Agentes autônomos devem tratá-las como padrão até receberem instrução explícita para reabrir a decisão.

## Produto

> **V0.34:** A V0.34 amplia a exploração GG/PokerCraft com filtros factuais de ações no river derivados da sequência cronológica preservada pelo parser. Ações observadas não são interpretadas como bluff, value, erro ou evidência pedagógica.

> Bet, raise, call, fold e check descrevem ações observadas. Seu significado estratégico depende de contexto que a V0.34 deliberadamente não infere.

1. Exercícios são o coração do produto.
2. Teoria aparece principalmente em exemplos/feedback, não como cursos longos.
3. Home recomenda o próximo treino; `Treinar` permite escolha deliberada.
4. `Leak` deve emergir de padrões, não ser um objeto manual principal.
5. A rotina é o próprio treino recomendado; não criar gerenciador de rotina separado.
6. Gamificação deve refletir aprendizagem, não criar compulsão.
7. Uma sessão deve realmente poder terminar; não manipular “só mais uma”.
8. Ranges são importantes, mas entram depois de a fundação de aprendizagem estar convincente.
9. Importar uma hand history não estabelece sozinho qual decisão era correta.
10. Transcrição é matéria-prima para exercício candidato, não fonte automática de verdade.

## Pedagogia

1. Um exercício possui uma habilidade primária.
2. Um erro não deve penalizar todas as habilidades visíveis na mão.
3. First exposure pode ser sequencial; revisão posterior pode ser intercalada.
4. Correct with support != independent correct.
5. Retenção e transferência são evidências distintas de desenvolvimento imediato.
6. Erro repetido pode exigir reensino, não apenas mais testes.
7. Boundary cases e contraexemplos são necessários para impedir macetes.
8. Distractors devem representar concepções erradas plausíveis.
9. Não usar porcentagens exatas de mastery sem base empírica.
10. Pressão de tempo é treino de fluência tardio, não requisito inicial.

## Estratégia

1. Board não determina sozinho ação.
2. Ação não determina sozinha capped/uncapped.
3. `range advantage` e `nut advantage` são dimensões diferentes.
4. `capped/uncapped` descreve composição; não escolhe automaticamente ação/sizing.
5. Sensibilidade ao tamanho depende de contexto e das mãos relevantes do range.
6. Objetivo vem antes do sizing.
7. Mãos-alvo e fronteira de call/fold são centrais para ensinar sizing.
8. Tendências de live não devem ser transplantadas automaticamente para NL2 online.
9. Lógica e calibração devem ser separadas quando possível.
10. Premissas didáticas podem ser artificiais desde que explicitadas como premissas.

## Terminologia

1. `Herói` / `Vilão`.
2. `o range`.
3. manter `capped / uncapped`.
4. usar `range mais forte` quando a ideia é força global.
5. evitar `região mais forte`.
6. evitar `nutted`.
7. ensinar elasticidade por “essas mãos mudam de decisão se o tamanho aumentar?”.

## V0.16 — triagem de importação

1. Importações GG/PokerCraft reduzem volume a até cinco sugestões estruturais; não criam biblioteca, tarefa, diagnóstico ou interpretação estratégica.
2. Resultado financeiro não participa da triagem, e somente uma promoção explícita cria `RealHandReview`.

## V0.17 — revisão rápida sem hindsight

1. Uma mão salva possui no máximo um snapshot de autorrelato, em storage próprio; edição preserva sua identidade e criação.
2. A reconstrução corta board e ações exatamente na decisão selecionada. Não calcula pot, stacks ou resultado e não analisa estratégia.
3. `selfRatedSupport` é percepção relatada, não qualidade objetiva da evidência. `automatic` é exclusivo e remove esse campo.

## V0.18 — padrões de autorrelato

1. Padrões derivados de `RealHandReasoningSnapshot` descrevem o autorrelato do jogador e não entram no motor pedagógico sem uma etapa futura explícita de validação.
2. Três snapshots são somente o limiar de visibilidade de uma observação factual; frequência não equivale a leak, erro, domínio ou evidência pedagógica.
3. Snapshots legados sem `sourceHandId` participam do resumo sem matching aproximado ou migração de proveniência.


## V0.19 — hipóteses de investigação

1. **Frozen Decision:** uma hipótese derivada de mãos reais indica apenas que um padrão do autorrelato merece investigação. Ela não é evidência de erro e não pode alterar o motor pedagógico sem uma etapa explícita de verificação.
2. A unidade de evidência é `handReviewId` distinto. Fatores normais exigem três revisões e `low`/`unclear` em duas; `automatic` exige três revisões e não recebe sustentação implícita.
3. Evidências representativas são as três revisões mais recentes, com desempate determinístico, nunca ordenadas por resultado financeiro. Legados qualificam, mas o detalhe só é localizado por `handReviewId` exato.
4. V0.18 descreve; V0.19 propõe investigar; nenhuma diagnostica ou associa `ReasoningFactor` a Skill.

## V0.20 — verificação prospectiva

1. **Frozen Decision:** dados que originaram uma hipótese não podem ser reutilizados como evidência prospectiva da própria hipótese. A verificação V0.20 possui uma fronteira temporal explícita e continua sendo autorrelato, não validação estratégica.
2. Somente as primeiras cinco novas revisões distintas após `startedAt` formam a janela imutável; cinco é hipótese operacional do piloto, não threshold validado.
3. Há no máximo um acompanhamento ativo, sem fila ou histórico permanente. Substituição e encerramento são escolhas explícitas do jogador.
4. Ausência ou repetição do fator descreve apenas esta janela e não altera `Attempt`, `SkillState`, diagnóstico, scheduler ou treino.

5. A janela prospectiva é append-only: fatos observados são congelados no ingresso. Exclusão/edição posterior não abre vaga nem altera contagens; depois de cinco, nenhuma revisão futura pode entrar.

## Frozen Decision — episódios históricos de investigação (V0.21)

**Uma investigação prospectiva encerrada torna-se um episódio histórico imutável. O episódio preserva o autorrelato observado naquele ciclo e não é reinterpretado a partir do estado atual das mãos ou snapshots.**

V0.18 é descrição retrospectiva; V0.19 é hipótese de investigação; V0.20 é observação prospectiva; V0.21 é memória de episódios concluídos/encerrados. Histórico de investigação não é histórico pedagógico. Episódios são append-only, não são comparados automaticamente e não alimentam treino, diagnóstico ou Skills.

## Frozen Decision — ponte voluntária para treino (V0.22)

**A ponte entre uma investigação de mãos reais e o treino é voluntária. O Poker Loop não mapeia `ReasoningFactor` para `Skill`. O foco usado na sessão é uma escolha explícita do jogador e o episódio histórico continua fora da evidência pedagógica.**

A ponte aparece somente em episódios `completed`, não em acompanhamentos ativos, `stopped` ou `inconclusive`. Ela reutiliza `/session?focus=<Skill>` sem scheduler especial, não persiste relação episódio → sessão e não modifica os schemas de episódio, `Attempt` ou sessão ativa. Abrir treino a partir de um episódio não demonstra que o treino foi concluído, relevante ou eficaz.

## Frozen Decision — proveniência de início da sessão (V0.23)

**Uma provenance V0.23 registra somente que uma nova sessão foi criada a partir de um episódio `completed` e de uma Skill escolhida explicitamente pelo jogador. Ela não registra conclusão, aprendizagem, eficácia ou relação causal.**

V0.18 é descrição retrospectiva; V0.19 é hipótese; V0.20 é observação prospectiva; V0.21 é memória histórica; V0.22 é ponte voluntária; V0.23 é proveniência factual do início de uma nova sessão. Retomar uma sessão preexistente não cria retrospectivamente uma origem de investigação. **Treinar mais** não herda automaticamente a origem da sessão anterior. O `sessionId` possui no máximo uma origem, preservada diante de conflito; episódio, `ActiveTrainingSession` e `Attempt` permanecem inalterados.

## Frozen Decision — conclusão operacional de sessão (V0.24)

**Uma `InvestigationTrainingCompletion` registra somente que uma sessão com proveniência válida atingiu o fim operacional de sua fila de decisões. Conclusão de sessão não é evidência de aprendizagem, melhora, eficácia ou resolução da investigação.**

Launch e completion são dois eventos distintos. Uma sessão pode possuir launch e ainda não possuir completion. Uma sessão sem launch nunca recebe completion de investigação. A autoridade é `items.length > 0 && nextIndex >= items.length`; Attempts podem somente fornecer o instante factual da última decisão. O evento mínimo não duplica episódio, Skill, fatores ou métricas.

## Frozen Decision — V0.25

**Um acompanhamento pós-treino observa prospectivamente o mesmo ReasoningFactor do episódio original em novas revisões de mãos reais. A Skill escolhida no treino não determina o fator observado, e a nova janela não é comparada automaticamente com a anterior.**

A V0.25 produz observação posterior, não evidência causal de eficácia. Uma comparação entre a janela anterior e a posterior exige decisão metodológica própria e não faz parte da V0.25. `startedAt` é o clique explícito; `completion.completedAt` é apenas proveniência. A janela de cinco é uma hipótese operacional do piloto.

## Frozen Decision — V0.26

A V0.26 pode colocar lado a lado a janela prospectiva original e uma janela prospectiva posterior concluída quando ambas observam o mesmo `ReasoningFactor` e possuem proveniência exata. A comparação é descritiva: não calcula delta, porcentagem, direção, eficácia ou causalidade.

A Skill é somente a proveniência do foco escolhido na sessão entre as janelas. A data de conclusão de cada janela corresponde à entrada factual da quinta observação; `episode.endedAt` representa o arquivamento do episódio e não é usado como substituto da conclusão da janela original. A apresentação exige ainda uma sequência temporal consistente entre janela original, episódio, sessão e follow-up. Legado sem sustentação não recebe valor presumido; `automatic` não recebe métricas de sustentação. Cada follow-up é comparado apenas com o episódio original. Dois conjuntos autorrelatados de cinco decisões não constituem, por si sós, evidência de eficácia do treinamento.

## Frozen Decision — V0.27

A V0.27 pode descrever se o mesmo `ReasoningFactor` apareceu em menos, no mesmo número ou em mais revisões na janela posterior porque ambas as janelas comparadas possuem exatamente cinco observações. Essa relação é descritiva e não recebe valor positivo ou negativo.

`fewer` não significa melhora. `more` não significa piora. `same` não significa ausência de aprendizagem. A relação observada não demonstra efeito do treino. Sustentação e Skill não participam da classificação, e cada follow-up continua independente.

## Frozen Decision — V0.28

O fechamento V0.28 resume somente erros ocorridos na sessão recém-concluída e reutiliza o feedback autoral dos exercícios. Um erro de sessão não é promovido a dificuldade recorrente, e um acerto posterior na mesma sessão não é promovido a recovery, retenção ou aprendizagem.

Feedback específico da alternativa errada tem prioridade sobre feedback genérico. Erros da mesma identidade podem ser agrupados para reduzir carga visual. O fechamento da sessão é derivado e não cria nova evidência.

## Frozen Decision — V0.29

**A V0.29 transforma o feedback do fechamento em uma oportunidade opcional de recuperação ativa: o jogador tenta lembrar a ideia antes de revelar o feedback autoral. Revelar, escrever ou pular essa interação não produz `Attempt` nem qualquer evidência de aprendizagem.**

A reflexão escrita é efêmera e não é persistida. O feedback continua sendo exatamente o conteúdo autoral selecionado pela V0.28. Recuperação ativa na interface não é a mesma coisa que `recovery` no modelo longitudinal.

## Frozen Decision — V0.30

**A importação GG/PokerCraft continua apresentando no máximo cinco situações inicialmente, mas esse limite passa a representar apenas o primeiro lote de uma exploração progressiva. O jogador pode pedir voluntariamente mais situações do mesmo lote, sem que quantidade, resultado financeiro ou seleção estrutural sejam interpretados como erro ou evidência pedagógica.**

**O batch persiste somente um pool limitado de candidatas estruturais para permitir exploração progressiva e reload; ele não representa todas as mãos como problemas.** O teto de 50 candidatas e o teto de 15 sugestões pendentes são limites operacionais reversíveis do piloto, não thresholds científicos.

## Frozen Decision — V0.31

**A V0.31 permite explorar um lote GG/PokerCraft por características estruturais derivadas das candidatas já preservadas pela V0.30. Uma mesma mão pode pertencer a várias categorias. Os filtros não classificam erro, resultado ou intenção estratégica e não alteram evidência pedagógica.**

**`HandReviewSuggestion.reason` representa a razão pela qual a candidata entrou no pool; ele não é uma descrição exaustiva das características da mão.** Tags, contagens e filtro selecionado permanecem derivados e não são persistidos.

## Frozen Decision — V0.32

**A V0.32 organiza a página Mãos por intenção do jogador — Explorar, Revisar e Acompanhar — sem alterar seleção, revisão, investigação ou evidência. A seção ativa é apenas estado de interface e não constitui dado pedagógico.**

**Reduzir carga visual tem prioridade sobre expor simultaneamente todas as capacidades construídas.** A área inicial é derivada uma única vez dos estados já existentes; trocas posteriores são escolha do jogador ou navegação contextual explícita.

## Frozen Decision — V0.33

**A V0.33 pode priorizar na Home a continuação de fluxos operacionais já abertos — sessão, acompanhamento ou lote de mãos — antes de oferecer um novo treino. Essa prioridade organiza a experiência e não constitui diagnóstico, recomendação estratégica ou nova evidência pedagógica.**

**A Home mostra uma ação principal por vez para reduzir carga decisória.** A ação é sempre derivada dos storages existentes, não é persistida e apenas navega. Uma sessão ativa mantém seu próprio `focus` e antecede os demais fluxos; o treino recomendado continua usando exclusivamente o motor atual quando não há compromisso operacional aberto.
## Frozen Decision — V0.36

**A V0.36 torna explícito o milestone factual de três revisões necessário para começar a procurar recorrências no autorrelato. Atingir esse milestone não garante a existência de um padrão e não constitui diagnóstico.**

**A revisão padrão passa a priorizar escolhas estruturadas. Campos textuais antigos permanecem compatíveis no armazenamento, mas deixam de fazer parte da experiência principal.** Remover uma superfície de coleta não autoriza apagar dados históricos existentes.


## Frozen Decision — V0.37

**A V0.37 pode sugerir Skills relacionadas a um `ReasoningFactor` somente como atalho editorial para exploração em treino. A relação não constitui diagnóstico, inferência causal, evidência de domínio ou atualização de `SkillState`.**

**Nenhuma Skill é iniciada automaticamente. O jogador sempre confirma explicitamente o foco antes de iniciar uma sessão.** `automatic` e `other` não recebem Skill sugerida porque não apontam sozinhos para uma dimensão estratégica específica. Todas as quatro Skills continuam disponíveis, e apenas episódios `completed` atravessam a ponte existente.
