# Sources Policy

O repositório atual não contém necessariamente todas as transcrições usadas durante pesquisa. Portanto, um agente externo **não deve reconstruir afirmações estratégicas a partir de memória ou conhecimento geral** e apresentá-las como se fossem fonte interna do Poker Loop.

## Tipos de fonte

- `theory` — princípio/estrutura conceitual;
- `solver-reference` — referência apoiada por solver/estratégia resolvida;
- `heuristic` — atalho condicionado;
- `exploit` — hipótese dependente de população/jogador.

## Regra de escopo

Sempre registrar mentalmente:

```text
qual população?
qual stack?
heads-up ou multiway?
qual posição?
qual linha?
qual sizing?
qual street?
```

Uma observação live 2/5 não vira automaticamente regra de NL2 Rush & Cash.

## Transcrições

Transcrição → afirmação candidata → tipo → condições → exceções → exercício candidato → validação → biblioteca ativa.

Nunca:

Transcrição → regra universal.

## Solver

Solver pode validar estratégias dentro da árvore/ranges/sizings fornecidos, não “provar” automaticamente uma heurística universal.

Um futuro micro-solver do Poker Loop é possibilidade de laboratório, não prioridade imediata.
