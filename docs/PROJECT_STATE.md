# Project State — baseline V0.5

Atualizado para o handoff autônomo inicial.

## Repositório

Projeto atual: **Poker Loop 1.0**, separado do projeto Legacy.

Stack:

- Next.js `^16.2.0`
- React `^19.2.0`
- TypeScript `^5.9.0`
- Node `>=20.9.0`

## Versão atual

**V0.5 — Lógica × Calibração**

### Biblioteca

- 12 exercícios fundadores;
- 12 exercícios V0.3 — Leitura de Range pelas Ações;
- 12 exercícios V0.4 — Da Leitura à Decisão;
- 12 exercícios V0.5 — Lógica × Calibração;
- 24 itens reservados de retenção/transferência fora do treino normal.

Total ativo após todos os pacotes serem apresentados: **48 exercícios de desenvolvimento**.

## Pacotes estruturados

Ordem:

1. `range-actions`
2. `range-to-decision`
3. `calibration`

Cada pacote tem 12 itens divididos em três microblocos de quatro.

Regras atuais:

- pacote seguinte não vaza antes de o anterior ter sido apresentado;
- sessão interrompida no meio retoma apenas os itens restantes do mesmo bloco;
- erro em item de introdução não embaralha a sequência;
- itens apresentados passam depois a competir no scheduler adaptativo.

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

O motor **não é** ainda um sistema completo de knowledge tracing, retenção real ou diagnóstico causal.

## Persistência

Histórico local salvo a cada resposta. Não quebrar compatibilidade do storage sem migração explícita.

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
