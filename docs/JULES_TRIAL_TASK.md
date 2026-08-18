# Primeiro experimento com Jules

## Por que esta tarefa

O primeiro teste do agente externo deve ser **mensurável e de baixo risco**. Não queremos avaliar a capacidade de Jules de inventar produto; queremos avaliar se ele compreende o projeto, respeita restrições e entrega engenharia confiável.

## Prompt recomendado

Copie o bloco abaixo para Jules:

---

Leia `AGENTS.md` e todos os documentos apontados por ele antes de alterar código.

Esta é uma tarefa de engenharia, não de produto: **crie uma suíte de testes automatizados para o comportamento atual do motor de treino do Poker Loop V0.4 sem mudar o comportamento do produto**.

Cubra no mínimo:

1. primeira sessão com 12 exercícios fundadores;
2. introdução do pacote `range-actions` em microblocos `01–04`, `05–08`, `09–12`;
3. `range-to-decision` não aparece enquanto `range-actions` ainda tem itens inéditos;
4. ao sair no meio de um microbloco, a próxima sessão retoma apenas os itens restantes daquele bloco antes de avançar;
5. erro em um exercício com `sessionRole: introduction` não embaralha a sequência restante;
6. erro fora de introdução pode repriorizar outra variação relacionada sem repetição imediata da mesma questão;
7. treino manual/adaptive fill não pode antecipar exercícios inéditos de pacotes estruturados;
8. exercícios reservados de retenção/transferência não entram no treino normal;
9. IDs de exercícios são únicos e `correctOptionId` existe entre as opções;
10. mantenha `npm run typecheck` e `npm run build` funcionando.

Escolha uma abordagem de testes pequena e convencional para o stack atual. Se precisar adicionar uma dependência de desenvolvimento para testes, mantenha-a mínima e explique por que escolheu essa opção.

Não refatore o scheduler nesta tarefa, salvo uma alteração mínima necessária para tornar código testável. Não altere conteúdo, copy, UI, navegação, regras pedagógicas ou storage.

Antes de terminar:

- execute os testes;
- execute `npm run typecheck`;
- execute `npm run build`;
- revise o diff procurando mudanças fora do escopo;
- atualize `docs/AUTONOMOUS_LOG.md` com o que fez, testes executados, riscos e qualquer limitação.

Se encontrar um bug real no comportamento atual, **não o corrija silenciosamente**. Escreva um teste que o reproduza, registre-o no log como `DECISÃO HUMANA NECESSÁRIA`/bug encontrado e mantenha a tarefa focada em caracterizar o comportamento, a menos que a correção seja trivial e inequivocamente compatível com `AGENTS.md`.

---

## Como avaliar o resultado

Avaliar de 0 a 2 cada item:

- leu/respeitou `AGENTS.md`;
- não mudou produto;
- testes cobrem comportamento real;
- código simples;
- typecheck passa;
- build passa;
- não criou dependências excessivas;
- log final é útil;
- diff é fácil de revisar;
- não inventou regras estratégicas.

Máximo: 20.

Interpretação inicial:

- 17–20: candidato forte para sessões maiores;
- 13–16: útil para tarefas bem especificadas;
- 9–12: usar apenas com supervisão/revisão forte;
- 0–8: macro/processo local provavelmente será mais produtivo.
