# Backlog — Poker Loop

Este backlog é ordenado por segurança/valor, não por promessa de roadmap. Antes de executar um item, confirmar se ele continua coerente com `PROJECT_STATE.md` e `DECISIONS.md`.

## Concluído na V0.34 — Exploração por Ações no River

- oito filtros factuais derivam ações do Hero e agressão imediatamente enfrentada da ordem de `ParsedGgHand.actions`;
- state machine distingue bet de raise, preserva agressão através de ações passivas de terceiros e reconhece bet → raise → nova decisão do Hero;
- Situações e Ações no river formam dois grupos visuais com uma única seleção;
- pool, surfaced, pending, limites e transação V0.31 permanecem intactos, sem storage ou interpretação estratégica.

## Concluído na V0.33 — Próximo Passo Contextual na Home

- a Home apresenta uma única ação principal derivada, priorizando sessão, acompanhamento, exploração de mãos e fallback de treino, nessa ordem;
- sessão incompleta retoma o `focus` persistido e sessão completa abre o fechamento, sem classificação de aprendizagem;
- acompanhamento, sugestões e candidatas restantes reutilizam `/hands`, cuja escolha inicial por intenção permanece responsável pelo workspace;
- não há storage, write, schema ou mudança no motor pedagógico.

## Concluído na V0.32 — Mãos Organizadas pela Intenção do Jogador

- `/hands` apresenta somente Explorar, Revisar ou Acompanhar por vez, preservando todas as capacidades existentes;
- helper puro escolhe inicialmente acompanhamento ativo, depois exploração acionável e, por fim, revisão;
- salvar sugestão e abrir mão relacionada levam explicitamente à mão selecionada em Revisar;
- tabs acessíveis e empty states reduzem carga visual sem URL, storage, schema ou mudança pedagógica.

## Concluído na V0.31 — Explorar Situações Específicas no Lote GG/PokerCraft

- seis filtros estruturais observáveis são derivados do histórico bruto das candidatas do pool V0.30;
- uma mão pode pertencer a várias categorias, independentemente de `suggestion.reason`;
- **Mostrar até 5** compartilha ordem, `surfacedSuggestionIds`, teto de 15 e transação com +5/+10;
- filtro, tags e contagens são efêmeros; não há storage, schema, resultado financeiro, classificação estratégica ou mudança pedagógica.

## Concluído na V0.30 — Exploração Progressiva de uma Importação GG/PokerCraft

- os cinco primeiros destaques permanecem equivalentes à triagem V0.16;
- pool estrutural determinístico de até 50 candidatas, percorrido em rodadas pelas categorias fixas;
- um batch ativo permite +5/+10, reload e consumo definitivo após exposição;
- até 15 sugestões podem permanecer pendentes e um lote com candidatas restantes só é substituído após encerramento explícito;
- filtros por categoria, resultado financeiro, interpretação estratégica e mudanças pedagógicas permanecem fora.

## Concluído na V0.29 — Revisão Ativa no Fechamento da Sessão

- feedback dos até três itens V0.28 começa oculto atrás de um convite breve para lembrar;
- reflexão opcional de até 180 caracteres e reveal são controlados local e independentemente por item;
- texto, reveal e saída sem reveal não persistem, não criam `Attempt` e não produzem evidência;
- feedback autoral, fatos, seleção e ordem da V0.28 permanecem inalterados;
- nenhuma mudança em diagnóstico, `trainingEngine`, scheduler, recovery, retention, transfer ou mãos reais.

## Concluído na V0.28 — Fechamento Didático da Sessão

- recap puro e derivado dos erros da sessão, sem storage ou schema novo;
- agrupamento por identidade de raciocínio e feedback autoral específico do erro mais recente;
- acerto posterior apresentado somente como cronologia local, sem inferência longitudinal;
- até três cards, contagem factual dos demais e disclosure de separação do motor;
- `Attempt`, diagnóstico, scheduler, retention, transfer e `trainingEngine` inalterados.

## Concluído na V0.18 — Padrões nas Revisões de Mãos Reais

- resumo puro de total, fatores, sustentação percebida e streets;
- até três observações factuais, visíveis a partir de três ocorrências e sem porcentagens;
- `automatic` fora do denominador de sustentação e snapshots legados incluídos sem migração;
- seção compacta exclusiva de `/hands`, sem análise ou recomendação estratégica;
- nenhuma entrada em `Attempt`, `SkillState`, diagnóstico, scheduler ou loop pedagógico.

## Concluído na V0.15 — Ponte com Mãos Reais

- fonte local e separada para mãos reais, com criação, reflexão, edição e exclusão;
- foco amplo escolhido pelo jogador reutiliza `/session?focus=<Skill>`;
- texto bruto permanece opaco, sem parser ou análise automática;
- mãos reais não alimentam Attempt, diagnóstico, SkillState ou loop longitudinal;
- próximo passo possível: estudar contrato de interpretação antes de qualquer inferência.

## Concluído na V0.14 — Loop de Aprendizagem Visível

- Progresso mostra recurring ativo e recovery qualificada com linguagem conservadora;
- verificações posteriores mostram observações factuais, não domínio;
- candidate permanece interno e recurring atual supersede recovery da mesma identidade;
- labels humanas validadas impedem vazamento de `reasoningPattern`/`concept` na UI;
- modelo de apresentação puro combina os três resumos existentes sem alterar o scheduler.

## Concluído na V0.13 — Verificação Pós-Recuperação

- recovery qualificada deriva de recurring seguido da fronteira V0.12;
- transfer relacionada usa a recovery como readiness e retention ancora 24h em `recoveredAt`;
- recurring ativo preserva avaliações one-shot da mesma identidade;
- resumo puro descreve observações posteriores sem inferir domínio;
- candidate, Attempt, storage, SkillState e conteúdo permanecem inalterados.

## Concluído na V0.12 — Fronteira de Recuperação Diagnóstica

- recuperação confirmada cria fronteira derivada, sem apagar `Attempt`;
- evidência anterior deixa de sustentar `candidate`/`recurring` ativo;
- reaparecimento precisa reconstruir os thresholds inalterados após a fronteira;
- scheduler continua usando o mesmo resumo e candidate permanece read-only;
- retention/transfer, UI, storage, conteúdo e `SkillState` seguem separados.

## P0 — ideal para primeiro teste de agente externo

### 1. Criar uma suíte de testes automatizados do motor atual

Objetivo: transformar simulações manuais/ad hoc em testes versionados **sem alterar comportamento de produto**.

Cobrir no mínimo:

- primeira sessão com 12 fundadores;
- pacote `range-actions` em `01–04`, `05–08`, `09–12`;
- pacote `range-to-decision` bloqueado enquanto `range-actions` está pendente;
- retomada após sair no meio do microbloco;
- erro em introdução não embaralha a sequência;
- erro fora da introdução reprioriza variação relacionada alguns itens depois;
- treino manual não vaza item inédito de pacote;
- `supported` sem pista pode ser registrado como independente pela UI/fluxo existente;
- IDs de exercícios únicos;
- `correctOptionId` existente nas opções;
- itens reservados não entram no treino normal.

Critério de sucesso: testes reproduzíveis, `npm run typecheck` e `npm run build` preservados.

**Não refatorar o motor durante este primeiro item, exceto alteração mínima necessária à testabilidade.**

### 2. Validador estático da biblioteca de exercícios

Criar checagem automatizada para:

- IDs duplicados;
- respostas inexistentes;
- pacote com sequências faltando/duplicadas;
- exercício `guided/supported` sem pista quando isso quebrar a experiência;
- `purpose` incompatível com coleção ativa/reservada;
- opção duplicada dentro de uma questão.

Sem modificar conteúdo estratégico.

## P1 — após validação humana da V0.4

### 3. Consolidar feedback real da V0.4

Depende de teste humano. Não inventar problemas para justificar mudança.

Perguntas de validação:

- o usuário pensa em mãos-alvo antes do size?
- pistas ajudam sem entregar?
- distractors parecem plausíveis?
- feedback específico ao erro é perceptível?
- algum item parece artificial/óbvio/ambíguo?

### 4. Preparar pacote de Calibração

Conteúdo conceitual já explorado, mas **não implementar automaticamente sem uma tarefa explícita**.

Eixos:

- lógica × calibração;
- limites da evidência;
- atualização de crenças;
- população × jogador;
- incerteza;
- showdowns: “o que sabemos / o que ainda não sabemos?”.

Cuidado: fontes live não viram defaults de NL2.

## Entregue na V0.9

- pacote `integrated-application` com 12 development em três microblocos;
- seis itens reservados de retenção/transferência;
- novas superfícies diagnósticas pelos padrões existentes, sem novos thresholds;
- nenhuma afirmação populacional ou teoria estratégica nova.

## P2 — mais tarde

- avaliar se sinais diagnósticos devem futuramente influenciar escolha de foco ou acionar reensino explícito;
- validar longitudinalmente o piloto V0.6 de retenção e transferência com pessoas;
- somente depois, decidir se retenção precisa de intervalos adaptativos;
- somente depois, decidir se transferência contextual precisa de novas superfícies;
- hands importadas alimentando exercícios após validação estratégica;
- ranges sugeridos e personalizáveis;
- micro-solver experimental/river toy solver para validação pedagógica;
- estudos populacionais específicos do ambiente-alvo.

## Não fazer autonomamente

- reescrever arquitetura do app;
- migrar framework;
- adicionar backend/cloud apenas por conveniência;
- adicionar autenticação;
- criar marketplace/social;
- adicionar dezenas de features;
- treinar modelos;
- transformar heurísticas de vídeos em regras universais.

## Entregue na V0.10

- pacote `range-strength-signals` com 12 development e seis itens reservados;
- leitura condicional por size, board, configuração e contexto heads-up/multiway;
- boundary cases static/dry e 3-bet pot;
- claim map da fonte documentado sem promover heurísticas a regras universais.

Permanecem deliberadamente fora da biblioteca ativa: double previous size, turn/checkback, prescrições de donk e sinais/sizings de river. Qualquer ativação futura depende de auditoria e validação próprias.

## Entregue na V0.10.1

- elegibilidade de retention/transfer por completude local do próprio pacote;
- reforço diagnóstico limitado a development de pacotes completamente apresentados;
- microbloco de introdução preservado no início da sessão;
- relação evaluation → development por `reasoningPattern`, `concept` e `primarySkill`;
- evidência retention/transfer isolada do suporte, prioridade e `SkillState`;
- nenhum threshold, exercício, conteúdo, UI, storage ou schema alterado.

## Entregue na V0.10.2

- identidade persistente para a sessão pedagógica de 12 decisões;
- fila reconstruída da biblioteca atual com ordem, suporte e `sessionRole` persistidos;
- retomada na próxima decisão, inclusive após saída durante feedback;
- conclusão e `Treinar mais` encerram explicitamente a sessão ativa;
- focus diferente substitui a sessão sem apagar Attempts históricos;
- storage separado, sem migração ou mudança em `Attempt`.

## Entregue na V0.11

- sexto pacote `hand-function-vs-range`, com 12 development e seis avaliações reservadas;
- função da mão tratada contextualmente pela relação com o range, objetivo e mãos-alvo;
- calibração proporcional da adaptação, sem atalhos `range forte → fold` ou `range fraco → bet/raise`;
- claims de turn/river, donk, timing, pools e solver mantidos fora;
- nenhuma mudança em scheduler, diagnóstico, retention/transfer, `Attempt`, storage ou sessão persistente.

## Concluído na V0.16 — Importação GG/PokerCraft com Triagem de Atenção

- parser conservador do formato observado, processado localmente;
- até cinco sugestões determinísticas e estruturalmente justificadas, sem usar resultado;
- promoção explícita para `RealHandReview`, com reflexão deixada em branco;
- storage defensivo separado, bloqueio de nova sessão pendente e fingerprint do arquivo;
- nenhuma biblioteca bruta, análise estratégica ou alteração pedagógica.

Limitação deliberada: arquivos diferentes parcialmente sobrepostos não são deduplicados por uma base histórica de milhares de `sourceHandId`; somente o mesmo conteúdo integral e os IDs dentro da sessão atual são protegidos.

## Concluído na V0.17 — Revisão Rápida de uma Decisão Real

- âncoras cronológicas para todas as ações voluntárias do Herói reconhecidas pelo parser existente;
- Decision View anti-hindsight, sem pot/stacks estimados ou resultado;
- um snapshot de autorrelato por mão, editável e isolado de toda evidência pedagógica;
- fluxo compacto em `/hands`, mantendo a reflexão profunda e históricos não reconhecidos válidos.

Ficam fora: análise estratégica, agregações, hipóteses, associação ao treino, IA/solver e UI em Progresso.


## Concluído na V0.19 — Hipóteses para Investigar

- candidatos puros por fator, deduplicados por `handReviewId` e inteiramente derivados;
- threshold de 3 revisões + 2 decisões `low`/`unclear`, exceto `automatic`, que exige apenas 3 revisões;
- até três mãos recentes relacionadas, abertas pela infraestrutura existente e sem cópia de storage;
- pouca evidência apresentada sem hipótese inventada; street nunca gera candidato;
- nenhuma ponte para Skill, treino, diagnóstico ou scheduler.

## Concluído na V0.20 — Verificação Prospectiva

- uma hipótese pode ser acompanhada por vez, com substituição explícita e sem fila;
- baseline exata congelada e separada por `startedAt` das primeiras cinco novas revisões;
- resultados factuais para espera, repetição com/sem sustentação baixa/incerta, uma ocorrência, ausência e baseline indisponível;
- snapshots legados válidos participam por `handReviewId` e `createdAt`, sem matching aproximado;
- janela de cinco documentada como hipótese operacional, sem conexão ao motor pedagógico.

### Integridade append-only da V0.20 concluída

- `prospectiveReviews` congela as cinco observações e seus fatos no ingresso;
- edições/exclusões não reabrem vaga, e revisões posteriores nunca substituem a janela fechada.

## Concluído na V0.21 — Histórico de Investigações de Mãos Reais

- episódios encerrados ficam em storage V1 separado, imutável e append-only;
- `completed`, `stopped` e `inconclusive` preservam factual e exatamente baseline e janela observada;
- `/hands` lista os ciclos recentes e abre somente mãos ainda existentes, sem alterar contagens ou substituir exclusões;
- ficam fora comparação entre ciclos, tendências, scores, diagnóstico e qualquer conexão ao motor pedagógico.

## Concluído na V0.22 — Ponte Voluntária entre Investigação e Treino

- episódios históricos `completed` oferecem **Explorar em treino**; `stopped`, `inconclusive` e o acompanhamento ativo não oferecem a ponte;
- o jogador escolhe sem pré-seleção entre todas as Skills atuais, exibidas de modo neutro com os labels humanos existentes;
- nenhum `ReasoningFactor`, `factorCount` ou `lowOrUnclearCount` ordena, filtra, destaca ou sugere uma Skill;
- a navegação reutiliza exatamente `/session?focus=<Skill>` e a política normal de sessão ativa;
- nenhum storage, schema, vínculo episódio → sessão ou mudança no motor pedagógico foi criado.

## Concluído na V0.23 — Proveniência Voluntária do Início

- storage V1 separado registra somente episódio, sessão real, Skill escolhida e instante real do início;
- origem exige episódio histórico exato `completed`, focus válido e criação efetiva de uma nova sessão;
- unicidade por `sessionId` é idempotente para repetição exata e preserva o original em conflitos;
- retomada preexistente não recebe origem e **Treinar mais** não herda a investigação;
- cards contam somente sessões iniciadas; conclusão, resultado, causalidade e motor pedagógico continuam fora.

## Concluído na V0.24 — Proveniência da Conclusão de uma Sessão

- completion V1 mínimo e separado, único por `sessionId`;
- fronteira operacional baseada na fila persistida, nunca em quantidade fixa de Attempts;
- registro imediato na última decisão e reconciliação exata no reload;
- histórico distingue sessões iniciadas de sessões que chegaram ao fim planejado;
- sessões sem launch e **Treinar mais** permanecem fora desta proveniência.

## Concluído na V0.25 — Acompanhamento Pós-Treino em Mãos Reais

- sessão concluída é escolhida explicitamente dentro da cadeia exata de proveniência;
- o fator vem exclusivamente do episódio, sem mapping com Skill;
- baseline e primeiras cinco novas revisões são congeladas append-only em storage separado;
- V0.20 e V0.25 têm exclusividade de observação ativa;
- resumo e histórico são factuais, sem comparação pré/pós, eficácia ou mudança no motor pedagógico.

## Concluído na V0.26 — Comparação Descritiva entre Janelas de Mãos Reais

- join puro e defensivo da cadeia exata episódio → follow-up → launch → completion, incluindo suas fronteiras temporais;
- fatos congelados original e posterior mostrados em blocos neutros, com denominadores de sustentação registrada;
- `automatic` compara somente presença e a Skill aparece somente como foco escolhido;
- cada follow-up gera sua própria comparação com o original, sem agregação longitudinal;
- conclusão de cada janela datada pela quinta observação congelada, sem confundir a janela original com o arquivamento do episódio;
- nenhum storage, schema protegido, delta, porcentagem, direção, causalidade ou alteração pedagógica.

## Concluído na V0.27 — Relação Observada entre Janelas

- derivação pura recebe somente uma comparação V0.26 válida e exige defensivamente duas janelas 5/5;
- `factorCount` posterior menor, igual ou maior produz respectivamente `fewer`, `same` ou `more`;
- sustentação e Skill não participam da classificação, inclusive para `automatic`;
- cada follow-up produz uma relação independente e preserva a ordem da V0.26;
- UI e copy neutras não mostram porcentagem, delta, tendência, melhora/piora ou eficácia;
- nenhuma persistência, schema ou integração com o motor pedagógico foi criada.
