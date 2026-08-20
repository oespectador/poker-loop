# Project State — baseline V0.8

Atualizado para o handoff autônomo inicial.

## Repositório

Projeto atual: **Poker Loop 1.0**, separado do projeto Legacy.

Stack:

- Next.js `^16.2.0`
- React `^19.2.0`
- TypeScript `^5.9.0`
- Node `>=20.9.0`

## Versão atual

**V0.8 — Reforço Diagnóstico Controlado**

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

Depois da apresentação completa dos três pacotes estruturados, uma sessão pode
incluir no máximo um item elegível de retenção e um de transferência, sem passar
de 12 decisões. Cada item reservado aparece no máximo uma vez neste piloto.

Retenção exige duas respostas corretas independentes relacionadas, em duas
sessões, e 24 horas desde a mais recente. Transferência exige a mesma evidência
independente, sem espera temporal. A relação usa `concept` quando há
desenvolvimento com o mesmo conceito e `primarySkill` como fallback.

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
duas sessões. Três acertos independentes mais recentes, cobrindo ao menos dois
exercícios, desativam o sinal por enquanto — uma heurística provisória de
recuperação, não prova de domínio. Esses limiares são heurísticas do protótipo,
não medidas validadas. `candidate` permanece read-only.

Somente depois da apresentação completa dos três pacotes, o primeiro sinal
`recurring` compatível com o foco já escolhido pode reservar um único exercício
development relacionado. A seleção evita a superfície da tentativa mais recente
quando existe alternativa, prefere a menos recentemente respondida e usa a ordem
da biblioteca como desempate. O diagnóstico não escolhe Skill, não desloca
retenção/transferência, reutiliza o suporte existente e não altera storage ou UI.
A recuperação continua inferida do histórico, sem marcação manual.

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
