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
acertos development independentes consecutivos em pelo menos dois exercícios
marcam o padrão como **recuperado por enquanto** e criam uma fronteira de
evidência. Erros anteriores continuam no histórico, mas não sustentam um sinal
ativo novo; uma dificuldade que reaparece precisa reconstruir os mesmos
thresholds depois da fronteira. Tanto os limiares quanto essa recuperação são
heurísticas provisórias do protótipo, não medidas psicométricas ou prova de domínio. Na V0.8,
`candidate` continua read-only. Somente um sinal `recurring`, restrito a conteúdo de pacotes completamente
apresentados e compatível com o foco já resolvido, pode reservar um development
por sessão. O diagnóstico não escolhe Skill; retention e transfer
mantêm prioridade, o suporte normal é reutilizado e a recuperação continua sendo
inferida pelo histórico, nunca marcada manualmente. Somente a última janela
válida delimita a evidência ativa de cada chave. Guided, supported real, retention
e transfer não participam da recuperação ou da fronteira; nenhuma nova
inferência de domínio foi introduzida.

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

O quarto pacote estruturado reaplica conceitos existentes em novas superfícies: ações atualizam o range, objetivos definem mãos-alvo e a qualidade da evidência calibra a confiança. Seus 12 development entram em três microblocos de quatro. Enquanto a primeira apresentação estiver pendente, avaliações e reforço desse próprio pacote permanecem bloqueados; avaliações e reforço de pacotes anteriores completos podem coexistir depois do microbloco intacto. Depois, os reasoningPatterns existentes tornam os itens superfícies adaptativas e diagnósticas sem novos thresholds ou estados.

## Pistas de força do range (V0.10)

O quinto pacote estruturado ensina leitura de range por heurísticas condicionais: size é evidência, não revelação. Os 12 development avançam de pistas isoladas para empilhamento, exceções e sinais conflitantes em três microblocos. O contexto modifica o valor informativo do size; boards muito static/dry e 3-bet pots são boundary cases explícitos. Enquanto a apresentação estiver pendente, avaliação e reforço desse próprio pacote continuam bloqueados; conteúdo anterior completo não é congelado. Depois, os três novos `reasoningPattern` podem alimentar o diagnóstico existente sem alterar seus thresholds.

## Evidência local por pacote (V0.10.1)

Retention, transfer e reforço diagnóstico são liberados pela apresentação completa do pacote ao qual o conteúdo pertence. A presença de pacote posterior pendente não bloqueia conteúdo anterior. O `introBlock` permanece primeiro, sem avaliação em seu interior. A relação de evaluation para development prefere `reasoningPattern`, depois `concept` e, somente ao final, `primarySkill`. Tentativas de evaluation são resumidas separadamente e não entram em suporte, prioridade adaptativa ou estado-base da Skill. Os thresholds, a regra de recuperação e o conteúdo não mudaram.

## Integridade da sessão (V0.10.2)

Uma sessão de 12 decisões mantém a mesma identidade durante navegação e reload. Fila, suporte efetivo, papel de introdução e próxima decisão são retomados; uma resposta já registrada não reaparece após saída durante o feedback. É uma correção de integridade de `sessionId`, não nova evidência pedagógica. `Attempt`, scheduler, diagnóstico, retention e transfer não mudaram.

## V0.11 — função contextual da mão

Depois de estimar a força do range, o aluno conecta `range → mão → função → objetivo → mãos-alvo → resposta ao tamanho → decisão`. CPFS, Thick Value, Thin Value, SDV, Draw e Air organizam o raciocínio, mas não são rótulos permanentes nem tabelas de ação. A adaptação deve ser proporcional à sustentação da leitura; range forte/fraco não determina ação sozinho.

## V0.13 — verificação pós-recuperação

O ciclo observável agora é `recurring → reinforcement → recuperado por enquanto
→ transfer posterior → retention posterior`. A recuperação só é qualificada
quando o mesmo episódio já alcançou `recurring` antes da fronteira de três
acertos independentes em duas superfícies. Candidate não qualifica nem bloqueia.

A recuperação é âncora, não domínio: transfer observa nova superfície e
retention observa depois de 24 horas contadas de `recoveredAt`. Ambas se ligam
pela identidade diagnóstica exata, nunca por Skill ampla. Seus resultados não
entram em diagnóstico, suporte, fading, prioridade development ou SkillState.
Ausência de item one-shot disponível significa ausência de observação, não
sucesso ou fracasso.

## V0.14 — representação do loop longitudinal

Progresso torna o ciclo longitudinal legível sem criar evidência nova. Um
`recurring` ativo aparece como **Em reforço**; uma recovery qualificada sem
recurring atual aparece como **Recuperado por enquanto**; transfer e retention
posteriores são observações factuais, inclusive quando ainda não ocorreram.
`candidate` permanece interno por ser preliminar. Labels humanas explícitas
impedem que `reasoningPattern` ou o fallback de `concept` apareçam na interface.
A camada é derivada depois dos resumos diagnósticos e não participa do scheduler,
de `SkillState`, suporte, fading ou prioridades.
