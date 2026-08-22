# Frozen Decisions — Poker Loop

Estas decisões foram tomadas durante exploração e testes. Agentes autônomos devem tratá-las como padrão até receberem instrução explícita para reabrir a decisão.

## Produto

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
