# Learning Model — Poker Loop

## Progressão conceitual

Uma representação útil do desenvolvimento é:

```text
novo / aprendendo
→ reconhecimento
→ discriminação
→ aplicação
→ transferência
→ retenção
```

A UI não precisa exibir todos esses termos.

Estados qualitativos atuais:

- Ainda observando
- Aprendendo
- Em desenvolvimento
- Consistente
- Precisa de reforço

Uma futura condição de transferência pode existir sem derrubar todo o estado-base após um único erro de contexto novo.

## Scaffolding

```text
GUIDED
→ SUPPORTED
→ INDEPENDENT
→ TRANSFER
```

- `guided`: pista visível automaticamente;
- `supported`: pista opcional;
- `supported` respondido corretamente sem abrir a pista pode contar como evidência independente;
- `independent`: sem pista;
- transferência não deve entregar a ferramenta mental que está sendo testada.

Suporte pode voltar quando a evidência deteriora.

## Feedback

Princípio:

> **feedback agora; retrieval novamente mais tarde.**

Após erro:

```text
erro
→ feedback corretivo curto
→ outros exercícios
→ mesma habilidade em nova superfície
→ sucesso: agendar recuperação posterior
→ falha repetida: parar de testar e ensinar novamente
```

Não repetir imediatamente a mesma pergunta só para produzir acerto.

## Primeira apresentação vs revisão

Conteúdo novo pode entrar em microblocos ordenados. A primeira apresentação tem uma função pedagógica e **não deve ser embaralhada por erro**.

Depois de apresentado, o item pode entrar no scheduler adaptativo e variar posição.

## Evidência

Diferenciar conceitualmente:

- correto com pista;
- correto com apoio disponível mas não usado;
- correto independente;
- correto após intervalo;
- correto em transferência.

Não tratar essas evidências como equivalentes.

## Diagnóstico

Um erro isolado não é leak.

```text
erro isolado
→ padrão de dificuldade
→ padrão recorrente em contextos variados
→ leak provável
```

Não diagnosticar “lógica”, “calibração”, “range” etc. apenas pela ação final quando múltiplas causas são plausíveis.

Exercícios diagnósticos devem ser usados apenas quando discriminam hipóteses úteis; não transformar toda mão em interrogatório.

Na V0.7, a camada diagnóstica detecta **sinais de dificuldade**, não leaks
confirmados. Somente development independente entra na análise. Exercícios são
relacionados por `reasoningPattern`, com `concept` como fallback; `primarySkill`
não é usado como hipótese causal.

O nível `candidate` requer erros em pelo menos dois exercícios e duas sessões;
`recurring` requer erros em pelo menos três exercícios e duas sessões. Três
acertos independentes recentes em pelo menos dois exercícios desativam o sinal
por enquanto. Tanto os limiares quanto essa recuperação são heurísticas
provisórias do protótipo, não medidas psicométricas ou prova de domínio. A camada
é read-only e ainda não muda o treino recomendado.

## Lógica × calibração

Lente útil, não taxonomia absoluta de todos os erros humanos.

### Lógica

> Se minhas premissas forem verdadeiras, minha ação segue delas?

### Calibração

> As premissas sobre jogador/pool são realmente justificadas?

Exemplo:

- premissa errada + ação coerente → problema de calibração;
- premissa correta + ação que não cumpre objetivo → problema de lógica.

## Interleaving

Não intercalar indiscriminadamente no primeiro contato. Primeiro construir uma representação mínima; depois misturar contextos para discriminação e transferência.

## Retenção

Não usar cronogramas universais rígidos como `1-3-7-30`. Intervalos futuros devem expandir com recuperação bem-sucedida e reduzir com falhas.

Na V0.6, o piloto usa 24 horas apenas como limiar operacional conservador para
liberar uma primeira recuperação após evidência independente em duas sessões.
Isso não é um intervalo validado. Cada item de retenção ou transferência é
apresentado no máximo uma vez, sem reagendamento adaptativo. Transferência não
espera 24 horas porque observa aplicação em uma nova superfície.

Tentativas de retenção e transferência são evidências distintas: não entram no
cálculo do estado-base da Skill. Um acerto isolado de transferência não cria
`Consistente`, e um erro isolado não derruba diretamente esse estado.

## Fluência

Velocidade vem depois de compreensão e independência. Cronômetro pode futuramente ser usado para treino de fluência, não como pressão obrigatória no aprendizado inicial.
