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
provisórias do protótipo, não medidas psicométricas ou prova de domínio. Na V0.8,
`candidate` continua read-only. Somente um sinal `recurring`, depois de
todos os quatro pacotes estruturados e compatível com o foco já resolvido, pode reservar
um development por sessão. O diagnóstico não escolhe Skill; retention e transfer
mantêm prioridade, o suporte normal é reutilizado e a recuperação continua sendo
inferida pelas tentativas recentes, nunca marcada manualmente.

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

## Aplicação integrada (V0.9)

O quarto pacote estruturado reaplica conceitos existentes em novas superfícies: ações atualizam o range, objetivos definem mãos-alvo e a qualidade da evidência calibra a confiança. Seus 12 development entram em três microblocos de quatro. Enquanto a primeira apresentação estiver pendente, retenção, transferência e reforço diagnóstico permanecem bloqueados; depois, os reasoningPatterns existentes tornam os itens superfícies adaptativas e diagnósticas sem novos thresholds ou estados.

## Pistas de força do range (V0.10)

O quinto pacote estruturado ensina leitura de range por heurísticas condicionais: size é evidência, não revelação. Os 12 development avançam de pistas isoladas para empilhamento, exceções e sinais conflitantes em três microblocos. O contexto modifica o valor informativo do size; boards muito static/dry e 3-bet pots são boundary cases explícitos. Enquanto a apresentação estiver pendente, avaliação e reforço diagnóstico continuam bloqueados pela infraestrutura genérica. Depois, os três novos `reasoningPattern` podem alimentar o diagnóstico existente sem alterar seus thresholds.
