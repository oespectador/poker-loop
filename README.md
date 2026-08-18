# Poker Loop 1.0 — Protótipo V0.4 · Da Leitura à Decisão

Projeto novo, separado do Poker Loop Legacy.

## Objetivo desta versão

Manter o ciclo central já validado e acrescentar apenas o próximo elo pedagógico:

**ler o range → definir o objetivo → identificar as mãos-alvo → observar como respondem ao tamanho → escolher ação/sizing.**

Não há nova navegação ou ferramenta. O produto continua sendo o treino.

## Biblioteca atual

O scheduler normal passa a ter **36 exercícios de desenvolvimento** depois que todos os pacotes já tiverem sido apresentados:

- 12 exercícios fundadores;
- 12 de **Leitura de Range pelas Ações** (V0.3);
- 12 de **Da Leitura à Decisão** (V0.4).

Há ainda **18 exercícios reservados** de transferência/retenção no código. Eles seguem fora do treino normal.

## O que a V0.4 ensina

A V0.3 perguntou:

> **Quais das mãos mais fortes ainda fazem sentido nesta linha?**

A V0.4 continua:

> **Qual parte desse range realmente importa para minha decisão?**

Depois:

> **Como essas mãos respondem quando o tamanho muda?**

Só então:

> **Qual ação/tamanho faz sentido?**

O pacote evita atalhos como:

- `capped → big`;
- `uncapped → small`;
- `mão forte → bet`;
- `mais folds → blefe melhor`;
- `size grande → mão sensível ao tamanho`;
- memorizar 75%, 125% ou 175% como respostas universais.

Os números usados nos exercícios são **premissas didáticas fornecidas pelo próprio cenário**, não afirmações sobre uma população específica.

## Microblocos sequenciais entre pacotes

O scheduler agora suporta mais de um pacote estruturado em sequência.

A ordem é:

1. **Leitura de Range pelas Ações**;
2. **Da Leitura à Decisão**.

Cada pacote possui três microblocos de quatro exercícios.

Enquanto o primeiro pacote ainda tem itens inéditos, os itens inéditos do segundo ficam bloqueados. Quando a V0.3 termina, a recomendação da Home muda para **Decisão integrada** e a V0.4 começa.

Se o usuário sair no meio de um microbloco, o app termina apenas os itens restantes daquele bloco antes de avançar. Um erro durante primeira apresentação recebe feedback, mas não embaralha a sequência.

## Os 12 exercícios da V0.4

### Bloco A — A ação precisa ter função

1. Raise contra range polar.
2. Size que contradiz o objetivo do blefe.
3. Value depende de quais mãos piores pagam.
4. A ação anterior filtra o range da street seguinte.

### Bloco B — Mãos-alvo

5. Qual parte do range determina value sizing.
6. Qual parte determina bluff sizing.
7. Mão sensível ao tamanho.
8. Mão pouco sensível ao tamanho.

### Bloco C — Da resposta ao sizing

9. Fronteira de call para value.
10. Fronteira de fold para bluff.
11. Benefício adicional versus custo adicional.
12. Integração de range, peso das mãos-alvo e sizing.

## Feedback por erro

Vários itens usam feedback diferente para alternativas erradas diferentes.

Exemplo: na integração final, escolher 50% indica uma preocupação correta em manter bluff catchers, mas falha em perceber que 75% também mantém os calls; escolher 150% indica foco excessivo no pote maior enquanto expulsa a principal região de value.

O objetivo é começar a distinguir **por que** uma resposta foi errada, não apenas registrar erro/acerto.

## Motor adaptativo preservado

Continuam valendo:

- ordem variável nas revisões;
- histórico salvo a cada resposta;
- erros aumentam prioridade de conceitos relacionados;
- `guided`, `supported` e `independent` têm funções diferentes;
- supported sem abrir pista conta como independente;
- primeira apresentação protege a ordem pedagógica;
- progresso continua qualitativo e conservador.

## O que NÃO entra

- tendências específicas de NL2 ou live;
- solver próprio ou externo;
- cálculos formais de EV;
- nova página de leaks;
- diagnóstico automático de lógica × calibração;
- ranges/charts;
- transcrições visíveis;
- gamificação pesada.

## Instalação no Windows

Extraia por cima de:

```text
C:\Users\welli\Documents\Projetos\poker-loop\
```

Permita substituir os arquivos. **Não limpe o progresso.**

Depois:

```powershell
npm run dev
```

Para validar uma build de produção:

```powershell
npm run build
```

## Teste manual sugerido

1. Se ainda houver itens inéditos da V0.3, confirme que eles continuam vindo antes da V0.4.
2. Quando a V0.3 terminar, abra **Hoje**. O foco deve passar para **Decisão integrada** enquanto a V0.4 estiver pendente.
3. Confira a sequência `01–04`, depois `05–08`, depois `09–12`.
4. Saia no meio de um bloco e confira a retomada somente dos itens restantes.
5. Erre um item de introdução: o restante do microbloco deve manter a ordem.
6. Observe se os exercícios 5–12 fazem você pensar primeiro em **mãos-alvo e resposta ao size**, em vez de buscar um número decorado.
7. No exercício final, teste respostas erradas diferentes e confira se o feedback muda conforme o erro.

## Git sugerido

```powershell
git add .
git commit -m "feat: da leitura a decisao v0.4"
```

---

## Handoff para agentes autônomos

Esta baseline inclui `AGENTS.md` e documentação em `docs/` para uso com agentes de código como Jules.

O primeiro experimento recomendado está em:

```text
docs/JULES_TRIAL_TASK.md
```

Antes de usar um agente externo para mudanças abertas, faça primeiro essa tarefa controlada de testes e avalie a qualidade do resultado.
